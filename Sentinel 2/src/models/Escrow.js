const mongoose = require('mongoose');

const escrowSchema = new mongoose.Schema({
  transactionRef: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  vendorId: {
    type: String,
    required: true
  },
  businessName: {
    type: String,
    default: ''
  },
  amount: {
    type: Number,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['FUNDED', 'VERIFIED', 'RELEASED', 'REJECTED', 'PENDING'],
    default: 'FUNDED'
  },
  aiScore: {
    type: Number,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Escrow', escrowSchema);
