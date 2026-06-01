import React, { useEffect, useState, useContext } from 'react';
import Layout from '../components/Layout';
import { getNotifications, markNotificationRead } from '../services/api';
import { AuthContext } from '../App';
import { toast } from 'react-toastify';

const typeIcon = {
  payment: '💰', expiry: '⏰',
  seat: '🪑', general: '📢'
};
const typeBadge = {
  payment: 'badge-success', expiry: 'badge-warning',
  seat: 'badge-blue', general: 'badge-blue'
};

export default function Notifications() {
  const { user }      = useContext(AuthContext);
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadNotifs(); }, []);

  const loadNotifs = async () => {
    try {
      const res = await getNotifications(user.member_id);
      setNotifs(res.data);
    } catch { toast.error('Failed to load notifications.'); }
    setLoading(false);
  };

  const handleRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifs(notifs.map(n =>
        n.notification_id === id ? { ...n, is_read: true } : n
      ));
    } catch {}
  };

  const unread = notifs.filter(n => !n.is_read).length;

  if (loading) return (
    <Layout title="Notifications">
      <div style={{ textAlign: 'center', padding: '4rem',
                    color: '#6b7280' }}>Loading...</div>
    </Layout>
  );

  return (
    <Layout title="Notifications">
      <div style={{ display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          {unread > 0
            ? `${unread} unread notification${unread > 1 ? 's' : ''}`
            : 'All caught up! ✅'}
        </div>
        {unread > 0 && (
          <button className="btn btn-outline"
            style={{ fontSize: '13px', padding: '6px 14px' }}
            onClick={() => notifs.filter(n => !n.is_read)
              .forEach(n => handleRead(n.notification_id))}>
            Mark all as read
          </button>
        )}
      </div>

      {notifs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center',
                                       padding: '4rem' }}>
          <div style={{ fontSize: '56px', marginBottom: '1rem' }}>🔔</div>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            No notifications yet.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {notifs.map(n => (
            <div key={n.notification_id}
              onClick={() => !n.is_read && handleRead(n.notification_id)}
              style={{
                background: n.is_read ? 'white' : '#eff6ff',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                borderLeft: `4px solid ${n.is_read ? '#e5e7eb' : '#2563eb'}`,
                cursor: n.is_read ? 'default' : 'pointer',
                display: 'flex', gap: '1rem', alignItems: 'flex-start'
              }}>
              <div style={{
                width: 40, height: 40, borderRadius: '10px',
                background: n.is_read ? '#f1f5f9' : '#dbeafe',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '20px',
                flexShrink: 0
              }}>
                {typeIcon[n.type] || '📢'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between',
                              alignItems: 'flex-start', gap: '8px' }}>
                  <div style={{ fontWeight: n.is_read ? 500 : 700,
                                fontSize: '14px' }}>
                    {n.title}
                  </div>
                  <div style={{ display: 'flex', gap: '6px',
                                alignItems: 'center', flexShrink: 0 }}>
                    <span className={`badge ${typeBadge[n.type]}`}>
                      {n.type}
                    </span>
                    {!n.is_read && (
                      <span style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: '#2563eb', display: 'inline-block'
                      }} />
                    )}
                  </div>
                </div>
                <div style={{ fontSize: '13px', color: '#6b7280',
                              marginTop: '4px' }}>
                  {n.message}
                </div>
                <div style={{ fontSize: '11px', color: '#9ca3af',
                              marginTop: '6px' }}>
                  {new Date(n.created_at).toLocaleString('en-IN', {
                    year: 'numeric', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}