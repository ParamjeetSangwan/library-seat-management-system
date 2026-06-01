import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { sendOtp, verifyOtp, registerMember } from '../services/api';

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep]         = useState(1); // 1=form, 2=otp, 3=done
  const [loading, setLoading]   = useState(false);
  const [form, setForm] = useState({
    full_name: '', father_name: '', mobile: '',
    email: '', password: '', address: ''
  });
  const [otp, setOtp] = useState('');

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendOtp(form.email);
      toast.success('OTP sent to your email!');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send OTP.');
    }
    setLoading(false);
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyOtp(form.email, otp);
      const formData = new FormData();
      Object.keys(form).forEach(k => formData.append(k, form[k]));
      await registerMember(formData);
      toast.success('Registration successful! Please login.');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed.');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1e293b 0%, #2563eb 100%)',
      padding: '1rem'
    }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '14px',
            background: 'white', margin: '0 auto 0.75rem',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '28px'
          }}>📚</div>
          <h1 style={{ color: 'white', fontSize: '22px', fontWeight: 700 }}>
            Create Account
          </h1>
        </div>

        <div className="card" style={{ padding: '2rem' }}>

          {/* Step indicator */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
            {['Details', 'Verify Email'].map((s, i) => (
              <div key={i} style={{ flex: 1 }}>
                <div style={{
                  height: '4px', borderRadius: '2px',
                  background: step > i ? '#2563eb' : '#e5e7eb'
                }} />
                <div style={{
                  fontSize: '11px', marginTop: '4px',
                  color: step > i ? '#2563eb' : '#9ca3af',
                  fontWeight: step > i ? 600 : 400
                }}>{s}</div>
              </div>
            ))}
          </div>

          {step === 1 && (
            <form onSubmit={handleSendOtp}>
              <div className="grid-2">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input className="input" name="full_name"
                    placeholder="Your full name"
                    value={form.full_name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Father's Name *</label>
                  <input className="input" name="father_name"
                    placeholder="Father's name"
                    value={form.father_name} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label>Mobile Number *</label>
                <input className="input" name="mobile" type="tel"
                  placeholder="10-digit mobile number"
                  value={form.mobile} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input className="input" name="email" type="email"
                  placeholder="your@email.com"
                  value={form.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input className="input" name="password" type="password"
                  placeholder="Minimum 6 characters"
                  value={form.password} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Address *</label>
                <textarea className="input" name="address"
                  placeholder="Your full address"
                  rows={3}
                  value={form.address} onChange={handleChange} required />
              </div>
              <button className="btn btn-primary" type="submit"
                disabled={loading}
                style={{ width: '100%', padding: '12px' }}>
                {loading ? 'Sending OTP...' : 'Send OTP to Email →'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyAndRegister}>
              <div style={{
                textAlign: 'center', padding: '1rem',
                background: '#eff6ff', borderRadius: '8px',
                marginBottom: '1.5rem'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📧</div>
                <p style={{ fontSize: '14px', color: '#1e40af', fontWeight: 500 }}>
                  OTP sent to
                </p>
                <p style={{ fontSize: '15px', fontWeight: 700, color: '#1e40af' }}>
                  {form.email}
                </p>
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  Valid for 10 minutes
                </p>
              </div>
              <div className="form-group">
                <label>Enter OTP</label>
                <input className="input" type="text"
                  placeholder="6-digit OTP"
                  value={otp} onChange={e => setOtp(e.target.value)}
                  maxLength={6} required
                  style={{ fontSize: '24px', textAlign: 'center',
                           letterSpacing: '8px', fontWeight: 700 }} />
              </div>
              <button className="btn btn-primary" type="submit"
                disabled={loading}
                style={{ width: '100%', padding: '12px' }}>
                {loading ? 'Verifying...' : 'Verify & Register'}
              </button>
              <button type="button"
                onClick={() => setStep(1)}
                style={{
                  width: '100%', marginTop: '8px', padding: '10px',
                  background: 'transparent', border: 'none',
                  color: '#6b7280', cursor: 'pointer', fontSize: '14px'
                }}>
                ← Back to form
              </button>
            </form>
          )}

          <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '14px', color: '#6b7280' }}>
            Already registered?{' '}
            <Link to="/" style={{ color: '#2563eb', fontWeight: 500 }}>Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}