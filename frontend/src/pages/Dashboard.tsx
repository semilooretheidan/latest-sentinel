import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

// Dummy data to simulate the node backend response since we don't have auth state setup
const DUMMY_SHIPMENTS = [
  {
    _id: '64a7b9c1d2e3f4001',
    productName: 'Air Jordan 1 Retro High OG',
    amount: 250,
    status: 'FUNDED',
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    supplierId: { businessName: 'SneakerHeadz Inc' }
  },
  {
    _id: '64a7b9c1d2e3f4002',
    productName: 'Yeezy Boost 350 V2',
    amount: 320,
    status: 'PENDING_PAYMENT',
    updatedAt: new Date().toISOString(),
    supplierId: { businessName: 'HypeKicks' }
  },
  {
    _id: '64a7b9c1d2e3f4003',
    productName: 'Nike Dunk Low Panda',
    amount: 150,
    status: 'RELEASED',
    updatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    supplierId: { businessName: 'SoleMate' }
  }
];

export default function Dashboard() {
  const [shipments, setShipments] = useState(DUMMY_SHIPMENTS);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'FUNDED':
        return <span className="status-badge status-funded"><ShieldCheck size={14} className="mr-1" style={{marginRight: '4px'}}/> Escrow Active</span>;
      case 'RELEASED':
      case 'VERIFIED':
        return <span className="status-badge status-verified"><CheckCircle2 size={14} className="mr-1" style={{marginRight: '4px'}}/> Verified & Paid</span>;
      case 'PENDING_PAYMENT':
        return <span className="status-badge status-pending"><Clock size={14} className="mr-1" style={{marginRight: '4px'}}/> Awaiting Funds</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>My Orders</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your Escrow shipments and verifications.</p>
        </div>
        <button className="btn-primary">
          <Package size={20} />
          New Order
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {shipments.map(shipment => (
          <div key={shipment._id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(0,0,0,0.05)', padding: '0.75rem', borderRadius: '12px' }}>
                <Package size={24} color="var(--accent-primary)" />
              </div>
              {getStatusBadge(shipment.status)}
            </div>
            
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{shipment.productName}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Supplier: {shipment.supplierId.businessName}</p>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Amount in Escrow</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'Outfit' }}>${shipment.amount}</p>
              </div>
              
              {shipment.status === 'FUNDED' ? (
                <Link to={`/verify/${shipment._id}`} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                  Verify Delivery <ArrowRight size={16} />
                </Link>
              ) : shipment.status === 'PENDING_PAYMENT' ? (
                <button className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                  Fund Escrow
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
