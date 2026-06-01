import React, { useEffect, useState, useContext } from 'react';
import Layout from '../components/Layout';
import { getSettings, updateSetting } from '../services/api';
import { AuthContext } from '../App';
import { toast } from 'react-toastify';

export default function AdminSettings() {
  const { user }        = useContext(AuthContext);
  const [fee,     setFee]     = useState('');
  const [libName, setLibName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  // Total seats
  const [totalSeats,    setTotalSeats]    = useState('90');
  const [updatingSeats, setUpdatingSeats] = useState(false);

  // Admin profile
  const [adminName,     setAdminName]     = useState(user?.name || '');
  const [adminMobile,   setAdminMobile]   = useState(user?.mobile || '');
  const [newPassword,   setNewPassword]   = useState('');
  const [confirmPass,   setConfirmPass]   = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    getSettings().then(res => {
      const s = res.data;
      setFee(s.find(x => x.key === 'monthly_fee')?.value || '500');
      setLibName(s.find(x => x.key === 'library_name')?.value || 'My Library');
      setTotalSeats(s.find(x => x.key === 'total_seats')?.value || '90');
      setLoading(false);
    });
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await updateSetting('monthly_fee', fee);
      await updateSetting('library_name', libName);
      toast.success('Settings saved successfully!');
    } catch {
      toast.error('Failed to save settings.');
    }
    setSaving(false);
  };

  const handleUpdateSeats = async () => {
    const newTotal = parseInt(totalSeats);
    if (isNaN(newTotal) || newTotal < 1 || newTotal > 500) {
      toast.error('Please enter a valid number between 1 and 500.');
      return;
    }
    if (!window.confirm(`Change total seats to ${newTotal}? This cannot be undone easily.`)) return;
    setUpdatingSeats(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/seats/update-total/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ total_seats: newTotal })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        await updateSetting('total_seats', newTotal);
      } else {
        toast.error(data.error || 'Failed to update seats.');
      }
    } catch {
      toast.error('Failed to update seats.');
    }
    setUpdatingSeats(false);
  };

  const handleSaveProfile = async () => {
    if (newPassword && newPassword !== confirmPass) {
      toast.error('Passwords do not match!');
      return;
    }
    if (newPassword && newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    setSavingProfile(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/admin/update/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            admin_id: user.admin_id,
            name:     adminName,
            mobile:   adminMobile,
            password: newPassword || null,
          })
        }
      );
      if (response.ok) {
        toast.success('Profile updated successfully!');
        setNewPassword('');
        setConfirmPass('');
      } else {
        toast.error('Failed to update profile.');
      }
    } catch {
      toast.error('Failed to update profile.');
    }
    setSavingProfile(false);
  };

  if (loading) return (
    <Layout title="Settings">
      <div style={{ textAlign: 'center', padding: '4rem',
                    color: '#6b7280' }}>Loading...</div>
    </Layout>
  );

  return (
    <Layout title="Settings">

      <div className="grid-2">

        {/* Library Settings */}
        <div className="card">
          <h3 style={{ fontSize: '16px', marginBottom: '1.5rem' }}>
            🏛️ Library Settings
          </h3>

          <div className="form-group">
            <label>Library Name</label>
            <input className="input"
              value={libName}
              onChange={e => setLibName(e.target.value)}
              placeholder="My Library" />
          </div>

          <div className="form-group">
            <label>Monthly Membership Fee (₹)</label>
            <input className="input" type="number"
              value={fee}
              onChange={e => setFee(e.target.value)}
              placeholder="500" />
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
              This applies to all new memberships from next renewal
            </div>
          </div>

          <div style={{
            background: '#f0fdf4', borderRadius: '8px',
            padding: '10px 12px', marginBottom: '1rem',
            fontSize: '13px', color: '#166534'
          }}>
            💡 Current fee: <strong>₹{fee}/month</strong>
          </div>

          <button className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={saving}
            onClick={handleSaveSettings}>
            {saving ? 'Saving...' : '💾 Save Settings'}
          </button>
        </div>

        {/* Admin Profile */}
        <div className="card">
          <h3 style={{ fontSize: '16px', marginBottom: '1.5rem' }}>
            🛡️ Admin Profile
          </h3>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            background: '#f8fafc', borderRadius: '10px',
            padding: '1rem', marginBottom: '1.5rem'
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: '#dbeafe', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: '24px'
            }}>🛡️</div>
            <div>
              <div style={{ fontWeight: 700 }}>{user?.name}</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>
                Admin • Library Owner
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Full Name</label>
            <input className="input"
              value={adminName}
              onChange={e => setAdminName(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Mobile Number</label>
            <input className="input" type="tel"
              value={adminMobile}
              onChange={e => setAdminMobile(e.target.value)} />
          </div>

          <div className="form-group">
            <label>New Password
              <span style={{ color: '#9ca3af', fontWeight: 400, marginLeft: '4px' }}>
                (leave blank to keep current)
              </span>
            </label>
            <input className="input" type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)} />
          </div>

          {newPassword && (
            <div className="form-group">
              <label>Confirm New Password</label>
              <input className="input" type="password"
                placeholder="Confirm new password"
                value={confirmPass}
                onChange={e => setConfirmPass(e.target.value)} />
            </div>
          )}

          <button className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={savingProfile}
            onClick={handleSaveProfile}>
            {savingProfile ? 'Saving...' : '💾 Update Profile'}
          </button>
        </div>

        {/* Total Seats */}
        <div className="card">
          <h3 style={{ fontSize: '16px', marginBottom: '1.5rem' }}>
            🪑 Manage Total Seats
          </h3>

          <div style={{
            display: 'flex', gap: '1rem',
            alignItems: 'center', marginBottom: '1rem',
            background: '#f8fafc', borderRadius: '10px',
            padding: '1rem'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#2563eb' }}>
                {totalSeats}
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>
                Current total seats
              </div>
            </div>
            <div style={{ fontSize: '32px' }}>🪑</div>
          </div>

          <div className="form-group">
            <label>New Total Seats</label>
            <input className="input" type="number"
              value={totalSeats}
              min="1" max="500"
              onChange={e => setTotalSeats(e.target.value)}
              placeholder="90" />
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
              ⚠️ Cannot remove seats that are currently occupied
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-success"
              style={{ flex: 1 }}
              disabled={updatingSeats}
              onClick={handleUpdateSeats}>
              {updatingSeats ? 'Updating...' : '✅ Update Seats'}
            </button>
          </div>
        </div>

      </div>

      {/* Export Section */}
      <div className="card" style={{ marginTop: '1rem' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '1.5rem' }}>
          📥 Export Records to Excel
        </h3>
        <div className="grid-3">
          <div style={{
            background: '#eff6ff', borderRadius: '12px',
            padding: '1.25rem', textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>👥</div>
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>All Members</div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '1rem' }}>
              Names, contacts, seats, membership status
            </div>
            <a href="http://127.0.0.1:8000/api/export/members/"
              download="members.xlsx"
              style={{
                display: 'block', padding: '8px 16px',
                background: '#2563eb', color: 'white',
                borderRadius: '8px', textDecoration: 'none',
                fontSize: '13px', fontWeight: 500
              }}>
              ⬇️ Download Excel
            </a>
          </div>

          <div style={{
            background: '#f0fdf4', borderRadius: '12px',
            padding: '1.25rem', textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>💰</div>
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>All Payments</div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '1rem' }}>
              Complete payment history with amounts
            </div>
            <a href="http://127.0.0.1:8000/api/export/payments/"
              download="payments.xlsx"
              style={{
                display: 'block', padding: '8px 16px',
                background: '#16a34a', color: 'white',
                borderRadius: '8px', textDecoration: 'none',
                fontSize: '13px', fontWeight: 500
              }}>
              ⬇️ Download Excel
            </a>
          </div>

          <div style={{
            background: '#fdf4ff', borderRadius: '12px',
            padding: '1.25rem', textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📅</div>
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>
              This Month Attendance
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '1rem' }}>
              All attendance records for current month
            </div>
            <a href="http://127.0.0.1:8000/api/export/attendance/"
              download="attendance.xlsx"
              style={{
                display: 'block', padding: '8px 16px',
                background: '#9333ea', color: 'white',
                borderRadius: '8px', textDecoration: 'none',
                fontSize: '13px', fontWeight: 500
              }}>
              ⬇️ Download Excel
            </a>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="card" style={{
        border: '1.5px solid #fca5a5',
        background: '#fff5f5', marginTop: '1rem'
      }}>
        <h3 style={{ fontSize: '16px', color: '#dc2626', marginBottom: '1rem' }}>
          ⚠️ System Information
        </h3>
        <div style={{ display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '1rem' }}>
          {[
            { label: 'Backend API', value: 'http://127.0.0.1:8000/api/' },
            { label: 'Frontend', value: 'http://localhost:3000' },
            { label: 'Database', value: 'MySQL — library_db' },
            { label: 'Version', value: 'v1.0.0' },
          ].map((item, i) => (
            <div key={i} style={{ fontSize: '13px' }}>
              <div style={{ color: '#9ca3af', marginBottom: '2px' }}>
                {item.label}
              </div>
              <div style={{ fontWeight: 500, color: '#374151', fontFamily: 'monospace' }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

    </Layout>
  );
}