const express = require('express');
const router = express.Router();
const multer = require('multer');
const vendorController = require('../controllers/vendorController');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/verify', upload.single('document'), (req, res, next) => {
    console.log('--- HIT /api/vendors/verify ---');
    console.log('req.body:', req.body);
    next();
}, vendorController.verifyVendor);

module.exports = router;