// Simulating a Squad API interaction for Virtual Accounts
const crypto = require('crypto');
const squadService = require('../services/squadService');
console.log('vendor controller working')
exports.verifyVendor = async (req, res) => {
  try {
    console.log('req.body:', req.body);
    const { firstName, lastName, email, phone, bvn, businessName } = req.body;

    if (!firstName || !lastName || !email || !phone || !bvn || !businessName) {
      return res.status(400).json({ success: false, message: 'Missing required fields', received: req.body });
    }

    const vendorId = `VND-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    console.log("calling squad api to generate virtual account");
    const virtualAccountData = await squadService.createVirtualAccount({
      first_name: firstName,
      last_name: lastName,
      mobile_num: phone,
      email: email,
      bvn: bvn,
      business_name: businessName,
      beneficiary_account: "0123456789"
    });

    const virtualAccount = {
      account_name: virtualAccountData.account_name || `${businessName} (Sentinel Escrow)`,
      account_number: virtualAccountData.virtual_account_number,
      bank_name: virtualAccountData.bank_name || 'Squad Virtual Bank',
    };

    res.status(200).json({
      success: true,
      message: 'Vendor verified and virtual account created successfully.',
      data: { vendorId, businessName, name: `${firstName} ${lastName}`, virtualAccount, status: 'VERIFIED' }
    });
    console.log("nice work");
  } catch (error) {
    console.error('Vendor Verification Error:', error.message);
    console.error('Full error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error during vendor verification' });
  }
};