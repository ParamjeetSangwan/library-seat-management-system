import React, { useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../App';

const memberNav = [
  { path: '/member/dashboard',     icon: '🏠', label: 'Dashboard'     },
  { path: '/member/seats',         icon: '🪑', label: 'Seat Map'      },
  { path: '/member/attendance',    icon: '📅', label: 'Attendance'    },
  { path: '/member/payments',      icon: '💰', label: 'Payments'      },
  { path: '/member/notifications', icon: '🔔', label: 'Notifications' },
];

const adminNav = [
  { path: '/admin/dashboard',  icon: '🏠', label: 'Dashboard'  },
  { path: '/admin/seats',      icon: '🪑', label: 'Seat Map'   },
  { path: '/admin/members',    icon: '👥', label: 'Members'    },
  { path: '/admin/attendance', icon: '📅', label: 'Attendance' },
  { path: '/admin/payments',   icon: '💰', label: 'Payments'   },
  { path: '/admin/analytics',  icon: '📊', label: 'Analytics'  },
  { path: '/admin/settings',   icon: '⚙️', label: 'Settings'   },
];

export default function Layout({ children, title }) {
  const { user, logout, darkMode, setDarkMode } = useContext(AuthContext);
  const navigate  = useNavigate();
  const location  = useLocation();
  const nav       = user?.role === 'admin' ? adminNav : memberNav;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={{ display: 'flex' }}>
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-logo">
          📚 My Library
          <div style={{ fontSize: '12px', fontWeight: 400,
                        color: '#64748b', marginTop: '4px' }}>
            {user?.role === 'admin' ? '🛡️ Admin Panel' : '👤 Member Portal'}
          </div>
        </div>

        <nav className="sidebar-nav">
          {nav.map(item => (
            <Link key={item.path} to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}>
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User info + buttons */}
        <div style={{ padding: '1rem 1.5rem',
                      borderTop: '1px solid #334155' }}>
          <div style={{ fontSize: '13px', color: '#94a3b8',
                        marginBottom: '8px' }}>
            {user?.full_name || user?.name || 'User'}
          </div>

          {/* Dark mode toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              width: '100%', padding: '8px', border: 'none',
              borderRadius: '8px', marginBottom: '8px',
              background: darkMode ? '#334155' : '#e2e8f0',
              color: darkMode ? '#f1f5f9' : '#1e293b',
              cursor: 'pointer', fontSize: '13px', fontWeight: 500,
              transition: 'all 0.2s'
            }}>
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>

          {/* Logout */}
          <button onClick={handleLogout}
            style={{
              width: '100%', padding: '8px', border: 'none',
              borderRadius: '8px', background: '#dc2626',
              color: 'white', cursor: 'pointer', fontSize: '13px',
              fontWeight: 500
            }}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="main-content">
        <div className="topbar">
          <h1 className="page-title" style={{ margin: 0 }}>{title}</h1>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long', year: 'numeric',
              month: 'long', day: 'numeric'
            })}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}