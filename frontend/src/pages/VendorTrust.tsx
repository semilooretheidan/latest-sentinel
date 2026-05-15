import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, Loader2, User, Building, ShieldCheck, AlertCircle, Mail, Phone, Lock } from 'lucide-react';
import axios from 'axios';
import Tesseract from 'tesseract.js';

export default function VendorTrust() {
  // 1. UPDATED STATE: Added all required KYC fields for Squad API
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bvn: '',
    businessName: ''
  });

  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'testing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 2. BASIC VALIDATION
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.bvn || !formData.businessName || !file) {
      setStatus('error');
      setErrorMessage("Please fill out all fields and upload a document.");
      return;
    }

    if (formData.bvn.length !== 11) {
      setStatus('error');
      setErrorMessage("BVN must be exactly 11 digits.");
      return;
    }

    setStatus('scanning');
setErrorMessage('');

try {
  setStatus('testing');
      console.log(formData.email, "Appending fromdata")
      // 3. UPDATED FORMDATA: Append all new fields so Node.js can read them
      const submitData = new FormData();
      submitData.append('firstName', formData.firstName);
      submitData.append('lastName', formData.lastName);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      submitData.append('bvn', formData.bvn);
      submitData.append('businessName', formData.businessName);
      submitData.append('document', file);

      // Send to your Node.js backend
      const response = await axios.post('http://localhost:5000/api/vendors/verify', submitData, {});
      setResult(response.data.data);
      setStatus('success');

    } catch (error) {
      console.error('Error in verification flow:', error);
      setStatus('error');
      setErrorMessage("An error occurred during verification. Please try again.");
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Vendor Trust Engine</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Automated KYC onboarding and virtual account generation.</p>
      </div>

      {status === 'error' && errorMessage && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <AlertCircle color="#dc2626" />
          <p style={{ color: '#991b1b', fontWeight: 500 }}>{errorMessage}</p>
        </div>
      )}

      {status === 'success' && result ? (
        <div className="glass-panel animate-fade-in" style={{ padding: '3rem', textAlign: 'center', background: 'rgba(5, 150, 105, 0.05)', border: '1px solid rgba(5, 150, 105, 0.2)' }}>
          <ShieldCheck size={64} color="var(--success)" style={{ margin: '0 auto 1.5rem auto' }} />
          <h2 style={{ color: 'var(--success)', marginBottom: '0.5rem' }}>Verification Successful</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>KYC verified. A live B2B virtual account has been created via Squad API.</p>

          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', textAlign: 'left', marginBottom: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Vendor ID</span>
              <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>{result?.vendorId}</p>
            </div>

            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Squad Virtual Account Details</h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Account Name</span>
                  <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{result?.virtualAccount?.account_name}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Account Number</span>
                  <p style={{ fontWeight: 700, fontFamily: 'Outfit', fontSize: '1.125rem', color: 'var(--accent-primary)' }}>{result?.virtualAccount?.account_number}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Bank Name</span>
                  <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{result?.virtualAccount?.bank_name}</p>
                </div>
              </div>
            </div>
          </div>

          <button className="btn-primary" onClick={() => { setStatus('idle'); setFile(null); setFormData({ firstName: '', lastName: '', email: '', phone: '', bvn: '', businessName: '' }) }}>Register Another Vendor</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* --- PERSONAL DETAILS SECTION --- */}
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Personal Details (KYC)</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>

              {/* First Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>First Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input
                    type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="John" required
                    style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.8)', fontSize: '1rem', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              {/* Last Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Last Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input
                    type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Doe" required
                    style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.8)', fontSize: '1rem', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* Email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input
                    type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="john@example.com" required
                    style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.8)', fontSize: '1rem', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              {/* Phone */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input
                    type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="08012345678" required
                    style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.8)', fontSize: '1rem', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>
            </div>

            {/* BVN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Bank Verification Number (BVN)</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  type="text" name="bvn" value={formData.bvn} onChange={handleInputChange} placeholder="11-digit BVN" required maxLength={11}
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.8)', fontSize: '1rem', color: 'var(--text-primary)' }}
                />
              </div>
            </div>
          </div>

          {/* --- BUSINESS DETAILS SECTION --- */}
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Business Details</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Registered Business Name</label>
              <div style={{ position: 'relative' }}>
                <Building size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  type="text" name="businessName" value={formData.businessName} onChange={handleInputChange} placeholder="Acme Logistics Ltd" required
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.8)', fontSize: '1rem', color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            {/* Document Upload */}
            <h3 style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Business Document (CAC or Valid ID)</h3>
            <input
              type="file" accept=".jpg,.jpeg,.png" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange}
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{ border: '2px dashed var(--glass-border)', borderRadius: '16px', padding: '2rem', textAlign: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.5)', transition: 'background 0.2s ease' }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.8)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.5)'}
            >
              {file ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={32} color="var(--success)" />
                  <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{file.name}</span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Click to replace file</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                  <FileText size={32} />
                  <span style={{ fontWeight: 500 }}>Upload Document for AI Verification</span>
                  <span style={{ fontSize: '0.875rem' }}>JPG or PNG up to 10MB</span>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit" className="btn-primary"
              disabled={status === 'scanning' || status === 'testing' || !file}
              style={{ width: '100%', padding: '1rem' }}
            >
              {status === 'scanning' ? (
                <><Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> AI OCR Scanning...</>
              ) : status === 'testing' ? (
                <><Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Connecting to Squad...</>
              ) : (
                <><Upload size={20} /> Verify & Generate Account</>
              )}
            </button>
          </div>
        </form>
      )}
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}