import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { memberLogin, adminLogin } from '../services/api';
import { AuthContext } from '../App';

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate  = useNavigate();
  const [tab,      setTab]      = useState('member');
  const [mobile,   setMobile]   = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === 'member') {
        const res = await memberLogin(mobile, password);
        login({ ...res.data, role: 'member' });
        toast.success('Welcome back!');
        navigate('/member/dashboard');
      } else {
        const res = await adminLogin(mobile, password);
        login({ ...res.data, role: 'admin' });
        toast.success('Admin login successful!');
        navigate('/admin/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed.');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1e293b 0%, #2563eb 100%)'
    }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '1rem' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '16px',
            background: 'white', margin: '0 auto 1rem',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '32px'
          }}>📚</div>
          <h1 style={{ color: 'white', fontSize: '24px', fontWeight: 700 }}>
            My Library
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
            Seat Management System
          </p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          {/* Tabs */}
          <div style={{
            display: 'flex', background: '#f1f5f9',
            borderRadius: '8px', padding: '4px',
            marginBottom: '1.5rem'
          }}>
            {['member', 'admin'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{
                  flex: 1, padding: '8px', border: 'none',
                  borderRadius: '6px', cursor: 'pointer',
                  fontWeight: 500, fontSize: '14px',
                  background: tab === t ? 'white' : 'transparent',
                  color: tab === t ? '#2563eb' : '#6b7280',
                  boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s'
                }}>
                {t === 'member' ? '👤 Member' : '🛡️ Admin'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Mobile Number</label>
              <input className="input" type="tel"
                placeholder="Enter your mobile number"
                value={mobile} onChange={e => setMobile(e.target.value)}
                required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input className="input" type="password"
                placeholder="Enter your password"
                value={password} onChange={e => setPassword(e.target.value)}
                required />
            </div>
            <button className="btn btn-primary" type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '12px', fontSize: '15px' }}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {tab === 'member' && (
            <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '14px', color: '#6b7280' }}>
              New member?{' '}
              <Link to="/register" style={{ color: '#2563eb', fontWeight: 500 }}>
                Register here
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}