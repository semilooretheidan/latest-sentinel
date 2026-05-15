const cron = require('node-cron');
const Shipment = require('../models/shipment');
const squadService = require('./squadService');

// Run every hour to check for shipments funded > 24 hours ago
cron.schedule('0 * * * *', async () => {
    console.log('[Cron] Running 24-hour auto-release check...');
    try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        // Find shipments that are FUNDED and were updated more than 24 hours ago
        // (Assuming updatedAt is updated when status becomes FUNDED)
        const expiredShipments = await Shipment.find({
            status: 'FUNDED',
            updatedAt: { $lte: twentyFourHoursAgo }
        }).populate('supplierId');

        for (const shipment of expiredShipments) {
            console.log(`[Cron] Releasing funds for expired shipment: ${shipment._id}`);
            try {
                // Release Payout via Squad Service
                await squadService.releasePayout({
                    amount: shipment.amount,
                    bank_code: shipment.supplierBankCode,
                    account_number: shipment.supplierAccountNumber,
                    account_name: shipment.supplierId.businessName,
                    transaction_reference: `AUTO-PAYOUT-${shipment._id}-${Date.now()}`
                });
                
                shipment.status = 'RELEASED';
                await shipment.save();
                console.log(`[Cron] Successfully released funds for ${shipment._id}`);
            } catch (error) {
                console.error(`[Cron] Error releasing funds for ${shipment._id}:`, error.message);
            }
        }
    } catch (error) {
        console.error('[Cron] Error running auto-release job:', error);
    }
});
