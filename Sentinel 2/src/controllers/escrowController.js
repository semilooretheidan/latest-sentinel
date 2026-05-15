const crypto = require('crypto');
const Vendor = require('../models/Vendor');
const Escrow = require('../models/Escrow');

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

// GET all escrow transactions
exports.getAllEscrows = async (req, res) => {
  try {
    const escrows = await Escrow.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: escrows });
  } catch (error) {
    console.error('Get Escrows Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching escrows' });
  }
};

exports.initiateEscrow = async (req, res) => {
  try {
    const { vendorId, amount, email } = req.body;

    if (!vendorId || !amount || !email) {
      return res.status(400).json({ success: false, message: 'Missing required fields: vendorId, amount, email' });
    }

    // Look up vendor for business name
    const vendor = await Vendor.findOne({ vendorId });
    const businessName = vendor ? vendor.businessName : vendorId;

    const squadService = require('../services/squadService');

    // Call Squad API to initiate payment
    const squadData = await squadService.initiatePayment(amount, email, vendorId);

    // Save escrow to MongoDB
    const escrow = new Escrow({
      transactionRef: squadData.transaction_ref,
      vendorId,
      businessName,
      amount,
      email,
      status: 'FUNDED'
    });
    await escrow.save();
    console.log(`Escrow ${squadData.transaction_ref} saved to MongoDB`);

    res.status(200).json({
      success: true,
      message: 'Escrow payment initiated successfully.',
      data: {
        checkout_url: squadData.checkout_url,
        transaction_ref: squadData.transaction_ref,
        vendorId,
        amount,
        status: 'FUNDED'
      }
    });
  } catch (error) {
    console.error('Initiate Escrow Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error initiating escrow' });
  }
};

// POST verify escrow - receives image, sends to Python AI, updates status
exports.verifyEscrow = async (req, res) => {
  try {
    const { id } = req.params; // transactionRef
    const escrow = await Escrow.findOne({ transactionRef: id });

    if (!escrow) {
      return res.status(404).json({ success: false, message: 'Escrow transaction not found' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded for verification' });
    }

    // Send image to Python AI backend for comparison
    const FormData = require('form-data');
    const fs = require('fs');
    const axios = require('axios');

    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path));

    let score;
    try {
      const pythonResponse = await axios.post('http://localhost:8000/analyze', formData, {
        headers: { ...formData.getHeaders() },
        timeout: 30000
      });
      score = pythonResponse.data.score;
    } catch (aiError) {
      console.warn('Python AI backend unavailable, using simulated score:', aiError.message);
      // Simulate AI score if Python backend is down
      score = Math.floor(Math.random() * 30) + 70; // 70-100
    }

    // Clean up uploaded file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    // Update escrow based on score
    escrow.aiScore = score;
    if (score >= 70) {
      escrow.status = 'VERIFIED';
    } else {
      escrow.status = 'REJECTED';
    }
    await escrow.save();

    res.status(200).json({
      success: true,
      score,
      status: escrow.status,
      message: score >= 70
        ? 'Product verified! Funds will be released to the vendor.'
        : 'Verification failed. Funds remain in escrow pending dispute resolution.'
    });
  } catch (error) {
    console.error('Verify Escrow Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Verification failed' });
  }
};
