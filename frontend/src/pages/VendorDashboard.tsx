import React, { useState, useEffect } from 'react';
import { Copy, CheckCircle, ShieldCheck, Package, Clock, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const BACKEND_URL = 'http://localhost:5000';

export default function VendorDashboard() {
  const { user } = useAuth();
  const [escrows, setEscrows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    const fetchEscrows = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/escrow?vendorId=${user?.vendorId}`);
        if (response.data.success) {
          setEscrows(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching vendor escrows:', error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.vendorId) fetchEscrows();
    else setLoading(false);
  }, [user]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'FUNDED':
        return <span style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}><ShieldCheck size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />Active</span>;
      case 'VERIFIED':
      case 'RELEASED':
        return <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#059669', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}><CheckCircle size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />Verified</span>;
      case 'REJECTED':
        return <span style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>Rejected</span>;
      default:
        return <span style={{ background: 'rgba(0,0,0,0.05)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}><Clock size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />{status}</span>;
    }
  };

  const totalFunded = escrows.filter(e => e.status === 'FUNDED').reduce((sum, e) => sum + e.amount, 0);
  const totalVerified = escrows.filter(e => ['VERIFIED', 'RELEASED'].includes(e.status)).reduce((sum, e) => sum + e.amount, 0);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Vendor Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Your account details and incoming escrow transactions.</p>
      </div>

      {/* Account Details Card */}
      <div className="glass-panel" style={{ marginBottom: '2rem', background: 'rgba(99, 102, 241, 0.03)', border: '1px solid rgba(99, 102, 241, 0.15)' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={22} color="var(--accent-primary)" />
          Your Virtual Account
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Vendor ID</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-primary)', fontFamily: 'monospace' }}>{user?.vendorId}</p>
              <button onClick={() => copyToClipboard(user?.vendorId || '', 'vid')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied === 'vid' ? 'var(--success)' : 'var(--text-secondary)', padding: '4px' }}>
                {copied === 'vid' ? <CheckCircle size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Account Name</p>
            <p style={{ fontWeight: 600 }}>{user?.virtualAccount?.account_name}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Account Number</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <p style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'monospace' }}>{user?.virtualAccount?.account_number}</p>
              <button onClick={() => copyToClipboard(user?.virtualAccount?.account_number || '', 'acct')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied === 'acct' ? 'var(--success)' : 'var(--text-secondary)', padding: '4px' }}>
                {copied === 'acct' ? <CheckCircle size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Bank</p>
            <p style={{ fontWeight: 600 }}>{user?.virtualAccount?.bank_name}</p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Transactions</p>
          <p style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'Outfit' }}>{escrows.length}</p>
        </div>
        <div className="glass-panel" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Active Escrow</p>
          <p style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'Outfit', color: 'var(--accent-primary)' }}>₦{totalFunded.toLocaleString()}</p>
        </div>
        <div className="glass-panel" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Released Funds</p>
          <p style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'Outfit', color: 'var(--success)' }}>₦{totalVerified.toLocaleString()}</p>
        </div>
      </div>

      {/* Escrow Transactions */}
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Incoming Transactions</h2>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-primary)' }} />
        </div>
      ) : escrows.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
          <Package size={48} color="var(--text-secondary)" style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
          <p style={{ color: 'var(--text-secondary)' }}>No escrow transactions yet. Share your Vendor ID with buyers to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {escrows.map(escrow => (
            <div key={escrow._id} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem' }}>
              <div>
                <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>₦{escrow.amount?.toLocaleString()}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>From: {escrow.buyerEmail || escrow.email} · {new Date(escrow.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}</p>
              </div>
              {getStatusBadge(escrow.status)}
            </div>
          ))}
        </div>
      )}
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
