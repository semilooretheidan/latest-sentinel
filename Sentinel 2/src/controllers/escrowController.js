const crypto = require('crypto');

exports.getVirtualAccount = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Simulate fetching the virtual account linked to this ID from DB
    // Since this is a prototype, we will dynamically generate a mock virtual account for the ID
    const mockAccountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    
    const virtualAccount = {
      account_name: `Escrow for ${id}`,
      account_number: mockAccountNumber,
      bank_name: 'Wema Bank (Squad API)',
    };

    res.status(200).json({
      success: true,
      data: {
        vendorId: id,
        virtualAccount
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
