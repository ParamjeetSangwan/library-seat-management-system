import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: BASE_URL,
});

// ── AUTH ──────────────────────────────────────────
export const sendOtp        = (email)       => api.post('/auth/send-otp/',     { email });
export const verifyOtp      = (email, otp)  => api.post('/auth/verify-otp/',   { email, otp });
export const registerMember = (data)        => api.post('/auth/register/',      data);
export const memberLogin    = (mobile, password) =>
  api.post('/auth/member/login/', { mobile, password });
export const adminLogin     = (mobile, password) =>
  api.post('/auth/admin/login/',  { mobile, password });

// ── SEATS ─────────────────────────────────────────
export const getSeatMap    = ()          => api.get('/seats/');
export const getSeatDetail = (seatId)   => api.get(`/seats/${seatId}/`);
export const assignSeat    = (data)     => api.post('/seats/assign/', data);

// ── SEAT CHANGE REQUESTS ──────────────────────────
export const requestSeatChange   = (data)      => api.post('/seat-requests/create/', data);
export const getPendingRequests  = ()           => api.get('/seat-requests/');
export const resolveRequest      = (id, data)  => api.post(`/seat-requests/${id}/resolve/`, data);

// ── MEMBERSHIP ────────────────────────────────────
export const addMembership    = (data)      => api.post('/memberships/add/',          data);
export const cancelMembership = (memberId)  => api.post(`/memberships/cancel/${memberId}/`);

// ── ATTENDANCE ────────────────────────────────────
export const markAttendance   = (data)      => api.post('/attendance/mark/',              data);
export const getTodayAttendance = ()        => api.get('/attendance/today/');
export const getMemberAttendance = (id)    => api.get(`/attendance/member/${id}/`);

// ── PAYMENTS ──────────────────────────────────────
export const getPendingPayments = ()       => api.get('/payments/pending/');
export const getMemberPayments  = (id)    => api.get(`/payments/member/${id}/`);

// ── NOTIFICATIONS ─────────────────────────────────
export const getNotifications    = (id)   => api.get(`/notifications/${id}/`);
export const markNotificationRead = (id)  => api.post(`/notifications/read/${id}/`);

// ── MEMBERS ───────────────────────────────────────
export const getAllMembers  = (search = '') => api.get(`/members/?search=${search}`);
export const getMemberDetail = (id)        => api.get(`/members/${id}/`);

// ── SETTINGS ──────────────────────────────────────
export const getSettings    = ()          => api.get('/settings/');
export const updateSetting  = (key, value) => api.post('/settings/update/', { key, value });

// ── ANALYTICS ─────────────────────────────────────
export const getAnalytics = () => api.get('/analytics/');