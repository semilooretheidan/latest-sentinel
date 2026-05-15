const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  vendorId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  bvn: {
    type: String,
    required: true
  },
  businessName: {
    type: String,
    required: true
  },
  virtualAccount: {
    account_name: String,
    account_number: String,
    bank_name: String
  },
  status: {
    type: String,
    enum: ['VERIFIED', 'PENDING', 'REJECTED'],
    default: 'VERIFIED'
  }
}, { timestamps: true });

module.exports = mongoose.model('Vendor', vendorSchema);
