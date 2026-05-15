const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const Shipment = require('../models/shipment');
const squadService = require('../services/squadService');

exports.verifyProductImage = async (req, res) => {
    try {
        const shipmentId = req.params.id;
        const shipment = await Shipment.findById(shipmentId).populate('supplierId');

        if (!shipment) return res.status(404).json({ message: 'Shipment not found' });
        
        let imagePath;
        let isTemporary = false;

        // 1. Check if we have an uploaded file or a URL
        if (req.file) {
            imagePath = req.file.path;
        } else if (req.body.imageUrl) {
            // Download the image from the URL
            const axios = require('axios');
            const path = require('path');
            const tempFileName = `temp_${Date.now()}.jpg`;
            imagePath = path.join('uploads', tempFileName);
            
            try {
                const response = await axios({
                    url: req.body.imageUrl,
                    method: 'GET',
                    responseType: 'stream'
                });
                
                const writer = fs.createWriteStream(imagePath);
                response.data.pipe(writer);
                
                await new Promise((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });
                isTemporary = true;
            } catch (downloadError) {
                console.error('Image Download Failed:', downloadError.message);
                return res.status(400).json({ message: 'Failed to download image from URL' });
            }
        } else {
            return res.status(400).json({ message: 'No image provided (upload a file or provide an imageUrl)' });
        }

        // 2. Prepare the image to send to Python AI API
        const formData = new FormData();
        formData.append('file', fs.createReadStream(imagePath));

        // 2. Forward via HTTP request to teammate's Python API
        let pythonResponse;
        try {
            pythonResponse = await axios.post(`${process.env.PYTHON_API_URL}/analyze`, formData, {
                headers: { ...formData.getHeaders() },
                timeout: 30000 // 30 second timeout for AI processing
            });
        } catch (apiError) {
            console.error('Python API Connection Failed:', apiError.message);
            return res.status(502).json({ 
                message: 'Failed to connect to verification engine', 
                error: apiError.message 
            });
        }

        const { score } = pythonResponse.data;
        
        if (typeof score !== 'number') {
            return res.status(500).json({ message: 'Invalid response from verification engine' });
        }

        shipment.aiScore = score;

        // 3. Evaluate the score and act
        if (score >= 70) {
            shipment.status = 'VERIFIED';
            
            // 4. Release Payout via Squad Service
            try {
                await squadService.releasePayout({
                    amount: shipment.amount,
                    bank_code: shipment.supplierBankCode,
                    account_number: shipment.supplierAccountNumber,
                    account_name: shipment.supplierId.businessName, // Using supplier's business name
                    transaction_reference: `PAYOUT-${shipment._id}-${Date.now()}`
                });
                
                shipment.status = 'RELEASED';
            } catch (payoutError) {
                console.error('Payout failed but shipment was verified:', payoutError.message);
                // We keep it as VERIFIED so admin can retry manually if needed
            }

            await shipment.save();

            // Clean up the temporary file
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);

            return res.status(200).json({ status: 'AUTHENTIC', score, action: 'Payment Released' });
        } else {
            shipment.status = 'REJECTED';
            await shipment.save();
            
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
            
            return res.status(400).json({ status: 'COUNTERFEIT', score, action: 'Payment Frozen' });
        }

    } catch (error) {
        console.error('Verification Error:', error.message);
        res.status(500).json({ message: 'Verification failed', error: error.message });
    }
};