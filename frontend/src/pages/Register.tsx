import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, Building, Phone, CreditCard, Loader2, AlertCircle, CheckCircle, Copy, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [role, setRole] = useState<'buyer' | 'vendor'>('buyer');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [bvn, setBvn] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [vendorResult, setVendorResult] = useState<any>(null);
  const [buyerSuccess, setBuyerSuccess] = useState(false);
  const [copied, setCopied] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data: any = { businessName, email, password, role };
      if (role === 'vendor') {
        data.phone = phone;
        data.bvn = bvn;
      }

      const result = await register(data);

      if (role === 'vendor') {
        setVendorResult(result);
      } else {
        setBuyerSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  // Vendor success screen
  if (vendorResult) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem', textAlign: 'center' }}>
          <ShieldCheck size={56} color="var(--success)" style={{ margin: '0 auto 1rem auto' }} />
          <h2 style={{ color: 'var(--success)', marginBottom: '0.5rem' }}>Vendor Account Created!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Save your Vendor ID and Virtual Account details. Buyers will use these to fund escrow transactions.
          </p>

          <div style={{ background: 'rgba(99, 102, 241, 0.05)', borderRadius: '12px', padding: '1.5rem', border: '1px solid rgba(99, 102, 241, 0.15)', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Vendor ID</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-primary)', fontFamily: 'monospace' }}>{vendorResult.vendorId}</p>
              </div>
              <button onClick={() => copyToClipboard(vendorResult.vendorId, 'vendorId')} style={{ background: 'none', border: '1px solid var(--glass-border)', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', color: copied === 'vendorId' ? 'var(--success)' : 'var(--text-secondary)' }}>
                {copied === 'vendorId' ? <CheckCircle size={16} /> : <Copy size={16} />}
              </button>
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)' }} />
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Account Name</p>
              <p style={{ fontWeight: 600 }}>{vendorResult.virtualAccount?.account_name}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Account Number</p>
                <p style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'monospace' }}>{vendorResult.virtualAccount?.account_number}</p>
              </div>
              <button onClick={() => copyToClipboard(vendorResult.virtualAccount?.account_number, 'acctNo')} style={{ background: 'none', border: '1px solid var(--glass-border)', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', color: copied === 'acctNo' ? 'var(--success)' : 'var(--text-secondary)' }}>
                {copied === 'acctNo' ? <CheckCircle size={16} /> : <Copy size={16} />}
              </button>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Bank</p>
              <p style={{ fontWeight: 600 }}>{vendorResult.virtualAccount?.bank_name}</p>
            </div>
          </div>

          <button className="btn-primary" style={{ width: '100%', marginTop: '2rem', padding: '0.875rem' }} onClick={() => navigate('/login')}>
            Proceed to Login
          </button>
        </div>
      </div>
    );
  }

  // Buyer success screen
  if (buyerSuccess) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '440px', padding: '3rem', textAlign: 'center' }}>
          <CheckCircle size={56} color="var(--success)" style={{ margin: '0 auto 1rem auto' }} />
          <h2 style={{ color: 'var(--success)', marginBottom: '0.5rem' }}>Account Created!</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const inputStyle = { width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.8)', fontSize: '1rem', color: 'var(--text-primary)' };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '480px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ background: 'var(--accent-gradient)', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
            <UserPlus size={28} color="white" />
          </div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Create Account</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Register your business on Sentinel</p>
        </div>

        {/* Role Selector */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <button type="button" onClick={() => setRole('buyer')}
            style={{
              flex: 1, padding: '0.875rem', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.2s',
              border: role === 'buyer' ? '2px solid var(--accent-primary)' : '1px solid var(--glass-border)',
              background: role === 'buyer' ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255,255,255,0.8)',
              color: role === 'buyer' ? 'var(--accent-primary)' : 'var(--text-secondary)'
            }}>
            🛒 I'm a Buyer
          </button>
          <button type="button" onClick={() => setRole('vendor')}
            style={{
              flex: 1, padding: '0.875rem', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.2s',
              border: role === 'vendor' ? '2px solid var(--accent-primary)' : '1px solid var(--glass-border)',
              background: role === 'vendor' ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255,255,255,0.8)',
              color: role === 'vendor' ? 'var(--accent-primary)' : 'var(--text-secondary)'
            }}>
            📦 I'm a Vendor
          </button>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertCircle color="#dc2626" size={18} style={{ flexShrink: 0 }} />
            <p style={{ color: '#991b1b', fontWeight: 500, fontSize: '0.875rem', margin: 0 }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{role === 'vendor' ? 'Business Name' : 'Full Name'}</label>
            <div style={{ position: 'relative' }}>
              <Building size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder={role === 'vendor' ? 'Acme Logistics Ltd' : 'John Doe'} required style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} style={inputStyle} />
            </div>
          </div>

          {/* Vendor-specific fields */}
          {role === 'vendor' && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="08012345678" required style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>BVN</label>
                <div style={{ position: 'relative' }}>
                  <CreditCard size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input type="text" value={bvn} onChange={e => setBvn(e.target.value)} placeholder="12345678901" required minLength={11} maxLength={11} style={inputStyle} />
                </div>
              </div>
            </>
          )}

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '0.875rem', marginTop: '0.5rem' }}>
            {loading ? (
              <><Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Creating Account...</>
            ) : (
              <><UserPlus size={20} /> {role === 'vendor' ? 'Register & Get Vendor ID' : 'Create Account'}</>
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Sign In</Link>
        </p>
      </div>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}