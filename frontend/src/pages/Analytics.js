import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getAnalytics } from '../services/api';
import { toast } from 'react-toastify';

export default function Analytics() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics()
      .then(res => { setData(res.data); setLoading(false); })
      .catch(() => { toast.error('Failed to load analytics.'); setLoading(false); });
  }, []);

  if (loading) return (
    <Layout title="Analytics">
      <div style={{ textAlign: 'center', padding: '4rem',
                    color: '#6b7280' }}>Loading...</div>
    </Layout>
  );

  const cards = [
    {
      title: '🪑 Seat Overview',
      items: [
        { label: 'Total Seats',     value: data?.seats?.total },
        { label: 'Occupied',        value: data?.seats?.occupied },
        { label: 'Vacant',          value: data?.seats?.vacant },
        { label: 'Occupancy Rate',  value: `${data?.seats?.occupancy_rate}%` },
      ],
      color: '#2563eb', bg: '#eff6ff'
    },
    {
      title: '👥 Member Overview',
      items: [
        { label: 'Total Members',    value: data?.members?.total },
        { label: 'Active Members',   value: data?.members?.active },
        { label: 'Pending Payment',  value: data?.members?.pending_payment },
      ],
      color: '#9333ea', bg: '#fdf4ff'
    },
    {
      title: '💰 Finance Overview',
      items: [
        { label: 'Monthly Fee',     value: `₹${data?.finance?.monthly_fee}` },
        { label: 'This Month Revenue',
          value: `₹${data?.finance?.current_month_revenue}` },
      ],
      color: '#16a34a', bg: '#f0fdf4'
    },
    {
      title: '🔔 Alerts',
      items: [
        { label: 'Expiring Soon (3 days)', value: data?.alerts?.expiring_soon },
        { label: 'Present Today',          value: data?.today?.present },
      ],
      color: '#ea580c', bg: '#fff7ed'
    },
  ];

  return (
    <Layout title="Analytics">

      {/* Occupancy bar */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #1e293b, #2563eb)',
        color: 'white', marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '14px', opacity: 0.8 }}>
              Overall Seat Occupancy Rate
            </div>
            <div style={{ fontSize: '48px', fontWeight: 800, lineHeight: 1 }}>
              {data?.seats?.occupancy_rate}%
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '13px', opacity: 0.8 }}>Today</div>
            <div style={{ fontSize: '22px', fontWeight: 700 }}>
              {new Date().toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric'
              })}
            </div>
          </div>
        </div>
        <div style={{
          marginTop: '1rem', height: '10px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '5px', overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${data?.seats?.occupancy_rate}%`,
            background: 'white', borderRadius: '5px'
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between',
                      marginTop: '6px', fontSize: '12px', opacity: 0.8 }}>
          <span>{data?.seats?.occupied} occupied</span>
          <span>{data?.seats?.vacant} vacant</span>
        </div>
      </div>

      {/* Analytics cards */}
      <div className="grid-2">
        {cards.map((card, i) => (
          <div key={i} className="card">
            <h3 style={{ fontSize: '16px', marginBottom: '1rem',
                         color: card.color }}>
              {card.title}
            </h3>
            {card.items.map((item, j) => (
              <div key={j} style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', padding: '10px 12px',
                background: j % 2 === 0 ? card.bg : 'transparent',
                borderRadius: '8px', marginBottom: '4px'
              }}>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>
                  {item.label}
                </span>
                <span style={{ fontWeight: 700, fontSize: '16px',
                               color: card.color }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Export note */}
      <div className="card" style={{
        background: '#f8fafc', border: '1.5px dashed #e2e8f0',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
        <p style={{ fontWeight: 600, marginBottom: '4px' }}>
          Export to Tableau
        </p>
        <p style={{ fontSize: '13px', color: '#6b7280' }}>
          Go to <code style={{ background: '#e2e8f0', padding: '2px 6px',
                               borderRadius: '4px' }}>
            http://127.0.0.1:8000/api/analytics/
          </code> to export data for Tableau dashboard
        </p>
      </div>

    </Layout>
  );
}