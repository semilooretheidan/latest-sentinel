import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, ShieldCheck, ArrowRight, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = 'http://localhost:5000';

export default function Dashboard() {
  const [escrows, setEscrows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEscrows = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/escrow`);
        if (response.data.success) {
          setEscrows(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching escrows:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEscrows();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'FUNDED':
        return <span className="status-badge status-funded"><ShieldCheck size={14} style={{marginRight: '4px'}}/> Escrow Active</span>;
      case 'VERIFIED':
      case 'RELEASED':
        return <span className="status-badge status-verified"><CheckCircle2 size={14} style={{marginRight: '4px'}}/> Verified & Paid</span>;
      case 'REJECTED':
        return <span className="status-badge status-rejected" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626' }}><AlertTriangle size={14} style={{marginRight: '4px'}}/> Rejected</span>;
      case 'PENDING':
        return <span className="status-badge status-pending"><Clock size={14} style={{marginRight: '4px'}}/> Pending Payment</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-primary)' }} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Escrow Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track your funded escrow transactions and verify deliveries.</p>
        </div>
        <Link to="/smart-escrow" className="btn-primary">
          <Package size={20} />
          New Escrow
        </Link>
      </div>

      {escrows.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Package size={48} color="var(--text-secondary)" style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
          <h2 style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>No Escrow Transactions Yet</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Fund your first escrow via the Smart Escrow page.</p>
          <Link to="/smart-escrow" className="btn-primary">Go to Smart Escrow</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {escrows.map(escrow => (
            <div key={escrow._id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(0,0,0,0.05)', padding: '0.75rem', borderRadius: '12px' }}>
                  <Package size={24} color="var(--accent-primary)" />
                </div>
                {getStatusBadge(escrow.status)}
              </div>
              
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{escrow.businessName || escrow.vendorId}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Vendor: {escrow.vendorId}</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{formatDate(escrow.createdAt)}</p>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Amount in Escrow</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'Outfit' }}>₦{escrow.amount?.toLocaleString()}</p>
                </div>
                
                {escrow.status === 'FUNDED' ? (
                  <Link to={`/verify/${escrow.transactionRef}`} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                    Verify Delivery <ArrowRight size={16} />
                  </Link>
                ) : escrow.status === 'VERIFIED' && escrow.aiScore ? (
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--success)' }}>
                    Score: {escrow.aiScore.toFixed(1)}%
                  </span>
                ) : escrow.status === 'REJECTED' && escrow.aiScore ? (
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#dc2626' }}>
                    Score: {escrow.aiScore.toFixed(1)}%
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}