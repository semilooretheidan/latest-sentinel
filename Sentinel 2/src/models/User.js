const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    businessName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['buyer', 'vendor'], required: true },
    // Vendor-specific fields
    phone: { type: String, default: '' },
    bvn: { type: String, default: '' },
    vendorId: { type: String, default: null, sparse: true },
    virtualAccount: {
        account_name: { type: String, default: '' },
        account_number: { type: String, default: '' },
        bank_name: { type: String, default: '' }
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);