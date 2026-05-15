const crypto = require('crypto');
const Vendor = require('../models/Vendor');

exports.getVirtualAccount = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Look up vendor by vendorId in MongoDB
    const vendor = await Vendor.findOne({ vendorId: id });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: `No vendor found with ID: ${id}. Please ensure the vendor has been verified through the Vendor Trust Engine.`
      });
    }

    res.status(200).json({
      success: true,
      data: {
        vendorId: vendor.vendorId,
        businessName: vendor.businessName,
        name: `${vendor.firstName} ${vendor.lastName}`,
        virtualAccount: vendor.virtualAccount,
        status: vendor.status
      }
    });
  } catch (error) {
    console.error('Fetch Virtual Account Error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching virtual account' });
  }
};

exports.initiateEscrow = async (req, res) => {
  try {
    const { vendorId, amount, customerId } = req.body;
    
    // Simulate debiting from customer account to virtual account
    // Simulate creating an escrow transaction that goes to vendor after verification or 24 hrs
    
    const escrowTransactionId = `ESC-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    
    res.status(200).json({
      success: true,
      message: 'Amount debited successfully and Escrow initiated. Funds will be released upon product verification or automatically after 24 hours.',
      data: {
        transactionId: escrowTransactionId,
        vendorId,
        customerId,
        amount,
        status: 'FUNDED',
        autoReleaseTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    });
  } catch (error) {
    console.error('Initiate Escrow Error:', error);
    res.status(500).json({ success: false, message: 'Server error initiating escrow' });
  }
};
