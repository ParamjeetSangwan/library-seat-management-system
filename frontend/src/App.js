import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import MemberDashboard from './pages/MemberDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SeatMap from './pages/SeatMap';
import AdminSeatMap from './pages/AdminSeatMap';
import Attendance from './pages/Attendance';
import Payments from './pages/Payments';
import Members from './pages/Members';
import Analytics from './pages/Analytics';
import AdminSettings from './pages/AdminSettings';
import Notifications from './pages/Notifications';

// Context
export const AuthContext = React.createContext();

function App() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user')) || null
  );

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true'
  );

  useEffect(() => {
    document.documentElement.setAttribute(
      'data-theme', darkMode ? 'dark' : 'light'
    );
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const login = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, darkMode, setDarkMode }}>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          {/* Public */}
          <Route path="/"         element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Member Routes */}
          <Route path="/member/dashboard"     element={user?.role === 'member' ? <MemberDashboard /> : <Navigate to="/" />} />
          <Route path="/member/seats"         element={user?.role === 'member' ? <SeatMap />         : <Navigate to="/" />} />
          <Route path="/member/notifications" element={user?.role === 'member' ? <Notifications />   : <Navigate to="/" />} />
          <Route path="/member/payments"      element={user?.role === 'member' ? <Payments />        : <Navigate to="/" />} />
          <Route path="/member/attendance"    element={user?.role === 'member' ? <Attendance />      : <Navigate to="/" />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard"  element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
          <Route path="/admin/seats"      element={user?.role === 'admin' ? <AdminSeatMap />   : <Navigate to="/" />} />
          <Route path="/admin/members"    element={user?.role === 'admin' ? <Members />        : <Navigate to="/" />} />
          <Route path="/admin/attendance" element={user?.role === 'admin' ? <Attendance />     : <Navigate to="/" />} />
          <Route path="/admin/payments"   element={user?.role === 'admin' ? <Payments />       : <Navigate to="/" />} />
          <Route path="/admin/analytics"  element={user?.role === 'admin' ? <Analytics />      : <Navigate to="/" />} />
          <Route path="/admin/settings"   element={user?.role === 'admin' ? <AdminSettings />  : <Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;