const express = require('express');
const router = express.Router();
const escrowController = require('../controllers/escrowController');

// Route to get virtual account by Vendor ID or Customer ID
router.get('/account/:id', escrowController.getVirtualAccount);

// Route to initiate escrow
router.post('/initiate', escrowController.initiateEscrow);

module.exports = router;
