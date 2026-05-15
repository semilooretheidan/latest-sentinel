import React, { useState } from 'react';
import { Search, Loader2, ArrowRight, ShieldCheck, DollarSign, Lock, Mail, AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function SmartEscrow() {
  const [vendorId, setVendorId] = useState('');
  const [amount, setAmount] = useState('');
  const [email, setEmail] = useState(''); // ADDED: Squad requires an email
  const [status, setStatus] = useState<'idle' | 'searching' | 'found' | 'funding' | 'success' | 'error'>('idle');
  const [virtualAccount, setVirtualAccount] = useState<any>(null);
  const [transaction, setTransaction] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Note: Adjust this port to match wherever your Node.js server is running (3000 or 5000)
  const BACKEND_URL = 'http://localhost:5000';

  const searchVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId) return;

    setStatus('searching');
    setErrorMessage('');

    try {
      const response = await axios.get(`${BACKEND_URL}/api/escrow/account/${vendorId}`);

      setVirtualAccount(response.data.data.virtualAccount);
      setStatus('found');
    } catch (error: any) {
      console.error('Error finding vendor account:', error);
      const msg = error.response?.data?.message || 'An error occurred while searching for the vendor.';
      setErrorMessage(msg);
      setStatus('error');
    }
  };

  const fundEscrow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !virtualAccount || !email) return;

    setStatus('funding');

    try {
      // 1. Send the data to your Node.js Backend
      const response = await axios.post(`${BACKEND_URL}/api/payments/initiate`, {
        amount: parseFloat(amount),
        email: email,
        shipmentId: vendorId // Using vendorId as the reference for now
      });

      // 2. Check if Squad successfully generated a payment link
      if (response.data.success && response.data.data.checkout_url) {

        // 3. Redirect the user to the Squad Checkout Page!
        window.location.href = response.data.data.checkout_url;

      } else {
        console.error("Squad did not return a checkout URL");
        setStatus('error');
      }
    } catch (error) {
      console.error('Error funding escrow:', error);
      setStatus('error');
    }
  };

  return (

    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Initiate Smart Escrow</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Securely fund a transaction. Funds are released automatically after 24hrs or upon delivery verification.</p>
      </div>

      {status === 'success' && transaction ? (
        <div className="glass-panel animate-fade-in" style={{ padding: '3rem', textAlign: 'center', background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
          <ShieldCheck size={64} color="var(--accent-primary)" style={{ margin: '0 auto 1.5rem auto' }} />
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Escrow Successfully Funded</h2>
          {/* FIXED: Added Optional Chaining to safely access the amount number */}
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            ₦{transaction?.amount || '0.00'} has been secured in the Squad API Virtual Account.
          </p>
          <button
            className="btn-primary"
            onClick={() => {
              setStatus('idle');
              setVendorId('');
              setAmount('');
              setEmail('');
              setVirtualAccount(null);
              setTransaction(null); // Added this to clear the object safely
            }}
          >
            Start New Escrow
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Step 1: Find Vendor */}
          <div className="glass-panel" style={{ opacity: status === 'idle' || status === 'searching' || status === 'error' ? 1 : 0.6, pointerEvents: status === 'idle' || status === 'searching' || status === 'error' ? 'auto' : 'none' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ background: 'var(--accent-primary)', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem' }}>1</span>
              Locate Vendor Account
            </h2>

            <form onSubmit={searchVendor} style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  value={vendorId}
                  onChange={(e) => setVendorId(e.target.value)}
                  placeholder="Enter Vendor ID (e.g. VND-A1B2C3D4)"
                  required
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.8)', fontSize: '1rem', color: 'var(--text-primary)' }}
                />
              </div>
              <button type="submit" className="btn-secondary" disabled={status === 'searching' || !vendorId}>
                {status === 'searching' ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : 'Retrieve Details'}
              </button>
            </form>

            {status === 'error' && errorMessage && (
              <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', padding: '1rem', borderRadius: '8px', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <AlertCircle color="#dc2626" size={20} style={{ flexShrink: 0 }} />
                <p style={{ color: '#991b1b', fontWeight: 500, fontSize: '0.875rem', margin: 0 }}>{errorMessage}</p>
              </div>
            )}
          </div>

          {/* Step 2: Fund Escrow */}
          {virtualAccount && (
            <div className="glass-panel animate-fade-in">
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ background: 'var(--accent-primary)', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem' }}>2</span>
                Fund Virtual Account
              </h2>

              <div style={{ background: 'rgba(255,255,255,0.5)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Recipient</p>
                {/* FIXED: Added Optional Chaining here as well just in case */}
                <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{virtualAccount?.account_name}</p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Acc: <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{virtualAccount?.account_number}</span></p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Bank: <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{virtualAccount?.bank_name}</span></p>
                </div>
              </div>

              <form onSubmit={fundEscrow}>

                {/* Email Input for Squad API */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Buyer Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-primary)' }} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="buyer@example.com"
                      required
                      style={{ width: '100%', padding: '1rem 1rem 1rem 2.5rem', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'white', fontSize: '1rem', color: 'var(--text-primary)', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Payment Amount (NGN)</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 600 }}>₦</span>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      required
                      style={{ width: '100%', padding: '1rem 1rem 1rem 2.5rem', borderRadius: '10px', border: '2px solid var(--accent-primary)', background: 'white', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', outline: 'none' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={status === 'funding' || !amount || !email}
                  style={{ width: '100%', padding: '1rem' }}
                >
                  {status === 'funding' ? (
                    <>
                      <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                      Redirecting to Secure Payment...
                    </>
                  ) : (
                    <>
                      Secure ₦{amount || '0.00'} in Escrow
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}