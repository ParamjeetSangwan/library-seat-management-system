import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getAnalytics, getTodayAttendance,
         getPendingPayments, getPendingRequests } from '../services/api';

export default function AdminDashboard() {
  const [analytics,  setAnalytics]  = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [pending,    setPending]    = useState([]);
  const [requests,   setRequests]   = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    Promise.all([
      getAnalytics(),
      getTodayAttendance(),
      getPendingPayments(),
      getPendingRequests(),
    ]).then(([a, att, pay, req]) => {
      setAnalytics(a.data);
      setAttendance(att.data);
      setPending(pay.data.members || []);
      setRequests(req.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <Layout title="Dashboard">
      <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>
        Loading...
      </div>
    </Layout>
  );

  const stats = [
    {
      icon: '🪑', label: 'Total Seats',
      value: analytics?.seats?.total || 90,
      bg: '#eff6ff', color: '#2563eb'
    },
    {
      icon: '✅', label: 'Occupied Seats',
      value: analytics?.seats?.occupied || 0,
      bg: '#f0fdf4', color: '#16a34a'
    },
    {
      icon: '🟢', label: 'Vacant Seats',
      value: analytics?.seats?.vacant || 90,
      bg: '#fefce8', color: '#ca8a04'
    },
    {
      icon: '👥', label: 'Total Members',
      value: analytics?.members?.total || 0,
      bg: '#fdf4ff', color: '#9333ea'
    },
    {
      icon: '📅', label: 'Present Today',
      value: attendance?.total_present || 0,
      bg: '#f0fdf4', color: '#16a34a'
    },
    {
      icon: '💰', label: 'Monthly Revenue',
      value: `₹${analytics?.finance?.current_month_revenue || 0}`,
      bg: '#fff7ed', color: '#ea580c'
    },
    {
      icon: '⚠️', label: 'Pending Payments',
      value: analytics?.members?.pending_payment || 0,
      bg: '#fef2f2', color: '#dc2626'
    },
    {
      icon: '🔔', label: 'Expiring Soon',
      value: analytics?.alerts?.expiring_soon || 0,
      bg: '#fef9c3', color: '#ca8a04'
    },
  ];

  return (
    <Layout title="Dashboard">

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem', marginBottom: '2rem'
      }}>
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon"
              style={{ background: s.bg, color: s.color }}>
              {s.icon}
            </div>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2">

        {/* Today's Attendance */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '16px' }}>
            📅 Today's Attendance
            <span className="badge badge-success"
              style={{ marginLeft: '8px' }}>
              {attendance?.total_present || 0} present
            </span>
          </h3>
          {attendance?.members?.length === 0 ? (
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              No attendance marked yet today.
            </p>
          ) : (
            <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Seat</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance?.members?.map(a => (
                    <tr key={a.attendance_id}>
                      <td>{a.member_name}</td>
                      <td>
                        <span className="badge badge-blue">
                          #{a.seat_number}
                        </span>
                      </td>
                      <td style={{ color: '#6b7280', fontSize: '12px' }}>
                        {new Date(a.marked_at).toLocaleTimeString('en-IN', {
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pending Payments */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '16px' }}>
            💰 Pending Payments
            <span className="badge badge-danger"
              style={{ marginLeft: '8px' }}>
              {pending.length} unpaid
            </span>
          </h3>
          {pending.length === 0 ? (
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              All members have paid! ✅
            </p>
          ) : (
            <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Mobile</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map(m => (
                    <tr key={m.member_id}>
                      <td>{m.full_name}</td>
                      <td style={{ color: '#6b7280' }}>{m.mobile}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Seat Change Requests */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '16px' }}>
            🔄 Seat Change Requests
            <span className="badge badge-warning"
              style={{ marginLeft: '8px' }}>
              {requests.length} pending
            </span>
          </h3>
          {requests.length === 0 ? (
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              No pending seat change requests.
            </p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>From</th>
                  <th>To</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r.request_id}>
                    <td>{r.member_name}</td>
                    <td>
                      <span className="badge badge-danger">
                        #{r.current_seat_number}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-success">
                        #{r.requested_seat_number}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Occupancy Card */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '16px' }}>
            🪑 Seat Occupancy
          </h3>
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{
              fontSize: '56px', fontWeight: 800,
              color: '#2563eb', lineHeight: 1
            }}>
              {analytics?.seats?.occupancy_rate || 0}%
            </div>
            <div style={{ color: '#6b7280', marginTop: '8px' }}>
              Occupancy Rate
            </div>
            <div style={{
              marginTop: '1rem', height: '12px',
              background: '#e5e7eb', borderRadius: '6px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${analytics?.seats?.occupancy_rate || 0}%`,
                background: 'linear-gradient(90deg, #2563eb, #7c3aed)',
                borderRadius: '6px', transition: 'width 1s ease'
              }} />
            </div>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              marginTop: '8px', fontSize: '13px', color: '#6b7280'
            }}>
              <span>🟢 {analytics?.seats?.occupied || 0} occupied</span>
              <span>⚪ {analytics?.seats?.vacant || 90} vacant</span>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}