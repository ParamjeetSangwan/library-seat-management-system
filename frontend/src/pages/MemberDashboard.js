import React, { useEffect, useState, useContext } from 'react';
import Layout from '../components/Layout';
import { getMemberAttendance, getMemberPayments,
         getNotifications } from '../services/api';
import { AuthContext } from '../App';

export default function MemberDashboard() {
  const { user }        = useContext(AuthContext);
  const [attendance, setAttendance] = useState(null);
  const [payments,   setPayments]   = useState([]);
  const [notifs,     setNotifs]     = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    if (!user?.member_id) return;
    Promise.all([
      getMemberAttendance(user.member_id),
      getMemberPayments(user.member_id),
      getNotifications(user.member_id),
    ]).then(([att, pay, notif]) => {
      setAttendance(att.data);
      setPayments(pay.data);
      setNotifs(notif.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  if (loading) return (
    <Layout title="My Dashboard">
      <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>
        Loading...
      </div>
    </Layout>
  );

  const membership  = user?.membership;
  const unreadCount = notifs.filter(n => !n.is_read).length;

  return (
    <Layout title="My Dashboard">

      {/* Welcome banner */}
      <div style={{
        background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
        borderRadius: '16px', padding: '1.5rem 2rem',
        color: 'white', marginBottom: '1.5rem',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: '1rem'
      }}>
        <div>
          <h2 style={{ fontSize: '20px', marginBottom: '4px' }}>
            Welcome back, {user?.full_name?.split(' ')[0]}! 👋
          </h2>
          <p style={{ opacity: 0.85, fontSize: '14px' }}>
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long', year: 'numeric',
              month: 'long', day: 'numeric'
            })}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '32px', fontWeight: 800 }}>
            Seat #{user?.seat_number || '—'}
          </div>
          <div style={{ fontSize: '13px', opacity: 0.85 }}>
            Your assigned seat
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
            🪑
          </div>
          <div>
            <div className="stat-value">#{user?.seat_number || '—'}</div>
            <div className="stat-label">My Seat</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
            📅
          </div>
          <div>
            <div className="stat-value">{attendance?.total_present || 0}</div>
            <div className="stat-label">Days This Month</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fdf4ff', color: '#9333ea' }}>
            📋
          </div>
          <div>
            <div className="stat-value">
              {membership ? (
                <span className="badge badge-success">Active</span>
              ) : (
                <span className="badge badge-danger">Inactive</span>
              )}
            </div>
            <div className="stat-label">Membership</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef9c3', color: '#ca8a04' }}>
            🔔
          </div>
          <div>
            <div className="stat-value">{unreadCount}</div>
            <div className="stat-label">Unread Alerts</div>
          </div>
        </div>
      </div>

      <div className="grid-2">

        {/* Membership card */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '16px' }}>
            📋 Membership Status
          </h3>
          {membership ? (
            <div>
              <div style={{
                background: '#f0fdf4', borderRadius: '10px',
                padding: '1rem', marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between',
                              marginBottom: '8px' }}>
                  <span style={{ color: '#6b7280', fontSize: '13px' }}>Status</span>
                  <span className="badge badge-success">Active ✅</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between',
                              marginBottom: '8px' }}>
                  <span style={{ color: '#6b7280', fontSize: '13px' }}>Valid Until</span>
                  <span style={{ fontWeight: 600 }}>{membership.end_date}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between',
                              marginBottom: '8px' }}>
                  <span style={{ color: '#6b7280', fontSize: '13px' }}>Days Left</span>
                  <span style={{
                    fontWeight: 700,
                    color: membership.days_remaining <= 3 ? '#dc2626' : '#16a34a'
                  }}>
                    {membership.days_remaining} days
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280', fontSize: '13px' }}>Fee Paid</span>
                  <span style={{ fontWeight: 600 }}>₹{membership.fee_paid}</span>
                </div>
              </div>
              {membership.days_remaining <= 3 && (
                <div style={{
                  background: '#fef2f2', border: '1px solid #fca5a5',
                  borderRadius: '8px', padding: '10px',
                  fontSize: '13px', color: '#dc2626'
                }}>
                  ⚠️ Your membership expires in {membership.days_remaining} days!
                  Please contact admin to renew.
                </div>
              )}
            </div>
          ) : (
            <div style={{
              textAlign: 'center', padding: '2rem',
              color: '#6b7280'
            }}>
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>❌</div>
              <p>No active membership.</p>
              <p style={{ fontSize: '13px' }}>Contact admin to activate.</p>
            </div>
          )}
        </div>

        {/* Recent notifications */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '16px' }}>
            🔔 Recent Notifications
          </h3>
          {notifs.length === 0 ? (
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              No notifications yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {notifs.slice(0, 5).map(n => (
                <div key={n.notification_id} style={{
                  padding: '10px 12px',
                  background: n.is_read ? '#f9fafb' : '#eff6ff',
                  borderRadius: '8px',
                  borderLeft: `3px solid ${n.is_read ? '#e5e7eb' : '#2563eb'}`
                }}>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280',
                                marginTop: '2px' }}>
                    {n.message}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent payments */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '16px' }}>
            💰 Recent Payments
          </h3>
          {payments.length === 0 ? (
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              No payments yet.
            </p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Amount</th>
                  <th>Mode</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.slice(0, 5).map(p => (
                  <tr key={p.payment_id}>
                    <td style={{ fontWeight: 600 }}>₹{p.amount}</td>
                    <td>
                      <span className={`badge ${p.payment_mode === 'cash'
                        ? 'badge-warning' : 'badge-blue'}`}>
                        {p.payment_mode}
                      </span>
                    </td>
                    <td style={{ color: '#6b7280', fontSize: '12px' }}>
                      {new Date(p.payment_date).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Attendance this month */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '16px' }}>
            📅 Attendance — {attendance?.month}
          </h3>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <div style={{ fontSize: '48px', fontWeight: 800,
                          color: '#2563eb' }}>
              {attendance?.total_present || 0}
            </div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>
              days present this month
            </div>
          </div>
          {attendance?.records?.length > 0 && (
            <div style={{
              display: 'flex', flexWrap: 'wrap',
              gap: '4px', justifyContent: 'center'
            }}>
              {attendance.records.map(a => (
                <span key={a.attendance_id}
                  className="badge badge-success"
                  style={{ fontSize: '11px' }}>
                  {new Date(a.date).getDate()}
                </span>
              ))}
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
}