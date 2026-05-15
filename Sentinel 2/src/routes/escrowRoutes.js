const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const escrowController = require('../controllers/escrowController');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({ dest: uploadsDir });

// Get all escrow transactions (for dashboard)
router.get('/', escrowController.getAllEscrows);

// Route to get virtual account by Vendor ID
router.get('/account/:id', escrowController.getVirtualAccount);

// Route to initiate escrow
router.post('/initiate', escrowController.initiateEscrow);

// Route to verify escrow with image upload
router.post('/verify/:id', upload.single('productImage'), escrowController.verifyEscrow);

module.exports = router;
