import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { ShieldCheck, LayoutDashboard, Lock, LogOut, LogIn } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Verification from './pages/Verification';
import SmartEscrow from './pages/SmartEscrow';
import Login from './pages/login';
import Register from './pages/Register';
import VendorDashboard from './pages/VendorDashboard';
import { AuthProvider, useAuth } from './context/AuthContext';

function NavLinks() {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
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

  if (!isAuthenticated) return null;

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <Link to="/" style={linkStyle('/')} onMouseOver={e => !isActive('/') && (e.currentTarget.style.color = 'var(--text-primary)')} onMouseOut={e => !isActive('/') && (e.currentTarget.style.color = 'var(--text-secondary)')}>
        <LayoutDashboard size={18} />
        Dashboard
      </Link>
      {user?.role === 'buyer' && (
        <Link to="/smart-escrow" style={linkStyle('/smart-escrow')} onMouseOver={e => !isActive('/smart-escrow') && (e.currentTarget.style.color = 'var(--text-primary)')} onMouseOut={e => !isActive('/smart-escrow') && (e.currentTarget.style.color = 'var(--text-secondary)')}>
          <Lock size={18} />
          Smart Escrow
        </Link>
      )}
    </div>
  );
}

function Header() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
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

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {isAuthenticated ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-color)', padding: '0.5rem 0.75rem', borderRadius: '50px', border: '1px solid var(--glass-border)' }}>
              <img src={`https://ui-avatars.com/api/?name=${user?.businessName}&background=6366f1&color=fff&size=32`} alt="User" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.businessName}</span>
              <span style={{ fontSize: '0.7rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', padding: '2px 8px', borderRadius: '10px', textTransform: 'capitalize' }}>{user?.role}</span>
            </div>
            <button onClick={logout} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.5rem' }} title="Logout">
              <LogOut size={18} />
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to="/login" className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LogIn size={16} /> Log In
            </Link>
            <Link to="/register" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

// Route guard: redirect to login if not authenticated
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// Route that redirects to home if already logged in
function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

// Home page router: vendors go to VendorDashboard, buyers go to Dashboard
function HomePage() {
  const { user } = useAuth();
  if (user?.role === 'vendor') return <VendorDashboard />;
  return <Dashboard />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Header />

          <main className="container animate-fade-in" style={{ paddingTop: '2rem' }}>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
              <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

              {/* Protected routes */}
              <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
              <Route path="/smart-escrow" element={<ProtectedRoute><SmartEscrow /></ProtectedRoute>} />
              <Route path="/verify/:shipmentId" element={<ProtectedRoute><Verification /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;