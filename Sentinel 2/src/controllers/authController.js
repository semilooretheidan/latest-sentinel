const User = require('../models/User');
const Vendor = require('../models/Vendor');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// POST: Register a new account (Buyer or Vendor)
exports.registerUser = async (req, res) => {
    try {
        const { businessName, email, password, role, phone, bvn } = req.body;
        
        // 1. Check if the account already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'An account with this email already exists' });
        }

        // 2. Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Build user object
        const userData = { 
            businessName, 
            email, 
            password: hashedPassword, 
            role 
        };

        // 4. If vendor, generate vendorId and virtual account
        if (role === 'vendor') {
            if (!phone || !bvn) {
                return res.status(400).json({ message: 'Phone and BVN are required for vendor registration' });
            }

            const vendorId = `VND-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
            userData.phone = phone;
            userData.bvn = bvn;
            userData.vendorId = vendorId;
            userData.virtualAccount = {
                account_name: `${businessName} (Sentinel Escrow)`,
                account_number: `0${Math.floor(100000000 + Math.random() * 900000000)}`,
                bank_name: 'GTBank (Demo)'
            };

            // Also save to the Vendor collection for escrow search
            const vendorRecord = new Vendor({
                vendorId,
                firstName: businessName.split(' ')[0] || businessName,
                lastName: businessName.split(' ').slice(1).join(' ') || '-',
                email,
                phone,
                bvn,
                businessName,
                virtualAccount: userData.virtualAccount,
                status: 'VERIFIED'
            });
            await vendorRecord.save();
            console.log(`Vendor ${vendorId} created and saved to Vendor collection`);
        }

        // 5. Save user
        const newUser = new User(userData);
        await newUser.save();

        // 6. Return response with vendor details if applicable
        const response = { message: 'Account registered successfully' };
        if (role === 'vendor') {
            response.vendorId = userData.vendorId;
            response.virtualAccount = userData.virtualAccount;
        }

        res.status(201).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration', error: error.message });
    }
};

// POST: Login to an existing account
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // 1. Find the user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Invalid credentials' });
        }

        // 2. Check the password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // 3. Generate the JWT Token
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        // 4. Send token and profile data back to React
        const userData = { 
            id: user._id, 
            businessName: user.businessName, 
            email: user.email,
            role: user.role 
        };

        // Include vendor-specific fields if vendor
        if (user.role === 'vendor') {
            userData.vendorId = user.vendorId;
            userData.virtualAccount = user.virtualAccount;
        }

        res.status(200).json({ token, user: userData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login', error: error.message });
    }
};

// GET: Get current user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching profile', error: error.message });
    }
};