import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ShieldCheck, LayoutDashboard, Building, Lock } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Verification from './pages/Verification';
import VendorTrust from './pages/VendorTrust';
import SmartEscrow from './pages/SmartEscrow';

function NavLinks() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const linkStyle = (path: string) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: 500,
    transition: 'all 0.2s',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    background: isActive(path) ? 'var(--accent-primary)' : 'transparent',
    color: isActive(path) ? 'white' : 'var(--text-secondary)',
  });

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <Link to="/" style={linkStyle('/')} onMouseOver={e => !isActive('/') && (e.currentTarget.style.color = 'var(--text-primary)')} onMouseOut={e => !isActive('/') && (e.currentTarget.style.color = 'var(--text-secondary)')}>
        <LayoutDashboard size={18} />
        Dashboard
      </Link>
      <Link to="/vendor-trust" style={linkStyle('/vendor-trust')} onMouseOver={e => !isActive('/vendor-trust') && (e.currentTarget.style.color = 'var(--text-primary)')} onMouseOut={e => !isActive('/vendor-trust') && (e.currentTarget.style.color = 'var(--text-secondary)')}>
        <Building size={18} />
        Vendor Trust
      </Link>
      <Link to="/smart-escrow" style={linkStyle('/smart-escrow')} onMouseOver={e => !isActive('/smart-escrow') && (e.currentTarget.style.color = 'var(--text-primary)')} onMouseOut={e => !isActive('/smart-escrow') && (e.currentTarget.style.color = 'var(--text-secondary)')}>
        <Lock size={18} />
        Smart Escrow
      </Link>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <nav style={{ padding: '1rem 2rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: 'var(--accent-gradient)', padding: '0.5rem', borderRadius: '12px' }}>
                <ShieldCheck size={24} color="white" />
              </div>
              <h2 style={{ margin: 0 }}><span className="text-gradient">Sentinel</span></h2>
            </Link>
            
            <NavLinks />
          </div>
          
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-color)', padding: '0.5rem', borderRadius: '50px', border: '1px solid var(--glass-border)' }}>
              <img src="https://i.pravatar.cc/150?img=11" alt="User" style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid var(--accent-primary)' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, paddingRight: '0.5rem', color: 'var(--text-primary)' }}>Alex M.</span>
            </div>
          </div>
        </nav>
        
        <main className="container animate-fade-in" style={{ paddingTop: '2rem' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/verify/:shipmentId" element={<Verification />} />
            <Route path="/vendor-trust" element={<VendorTrust />} />
            <Route path="/smart-escrow" element={<SmartEscrow />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;