import React, { useEffect, useState, useContext } from 'react';
import Layout from '../components/Layout';
import { getSeatMap, getSeatDetail, assignSeat,
         resolveRequest, getPendingRequests,
         addMembership } from '../services/api';
import { AuthContext } from '../App';
import { toast } from 'react-toastify';

export default function AdminSeatMap() {
  const { user }    = useContext(AuthContext);
  const [seats,     setSeats]     = useState([]);
  const [selected,  setSelected]  = useState(null);
  const [detail,    setDetail]    = useState(null);
  const [requests,  setRequests]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [s, r] = await Promise.all([
        getSeatMap(), getPendingRequests()
      ]);
      setSeats(s.data);
      setRequests(r.data);
    } catch { toast.error('Failed to load data.'); }
    setLoading(false);
  };

  const handleSeatClick = async (seat) => {
    setSelected(seat);
    setShowModal(true);
    setDetail(null);
    if (seat.is_occupied) {
      setDetailLoading(true);
      try {
        const res = await getSeatDetail(seat.seat_id);
        setDetail(res.data);
      } catch { toast.error('Failed to load member details.'); }
      setDetailLoading(false);
    }
  };

  const handleResolve = async (requestId, action) => {
    try {
      await resolveRequest(requestId, {
        action, admin_id: user.admin_id
      });
      toast.success(`Request ${action}d!`);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed.');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelected(null);
    setDetail(null);
  };

  return (
    <Layout title="Seat Map">

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: '1rem',
                    marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{
          padding: '8px 16px', background: '#dcfce7',
          borderRadius: '8px', fontSize: '13px',
          fontWeight: 600, color: '#166534'
        }}>
          🟢 Vacant: {seats.filter(s => !s.is_occupied).length}
        </div>
        <div style={{
          padding: '8px 16px', background: '#fee2e2',
          borderRadius: '8px', fontSize: '13px',
          fontWeight: 600, color: '#991b1b'
        }}>
          🔴 Occupied: {seats.filter(s => s.is_occupied).length}
        </div>
        <div style={{
          padding: '8px 16px', background: '#fef9c3',
          borderRadius: '8px', fontSize: '13px',
          fontWeight: 600, color: '#854d0e'
        }}>
          🔄 Pending Requests: {requests.length}
        </div>
      </div>

      {/* Seat grid */}
      <div className="card">
        <div style={{ marginBottom: '1rem', fontSize: '14px',
                      color: '#6b7280' }}>
          💡 Click any seat to view details or manage
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem',
                        color: '#6b7280' }}>
            Loading seats...
          </div>
        ) : (
          <div className="seat-grid">
            {seats.map(seat => (
              <div key={seat.seat_id}
                className="seat-box"
                onClick={() => handleSeatClick(seat)}
                title={seat.is_occupied
                  ? seat.member_name : 'Vacant'}
                style={{
                  background: seat.is_occupied ? '#fee2e2' : '#dcfce7',
                  border: `2px solid ${seat.is_occupied
                    ? '#fca5a5' : '#86efac'}`,
                  color: seat.is_occupied ? '#991b1b' : '#166534',
                }}>
                {seat.seat_number}
                {seat.is_occupied && (
                  <span style={{ fontSize: '8px',
                                 display: 'block',
                                 overflow: 'hidden',
                                 textOverflow: 'ellipsis',
                                 whiteSpace: 'nowrap',
                                 maxWidth: '100%',
                                 padding: '0 2px' }}>
                    {seat.member_name?.split(' ')[0]}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Seat Change Requests */}
      {requests.length > 0 && (
        <div className="card" style={{ marginTop: '1rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '16px' }}>
            🔄 Pending Seat Change Requests
          </h3>
          <table className="table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Current Seat</th>
                <th>Requested Seat</th>
                <th>Action</th>
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
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-success"
                        style={{ padding: '5px 12px', fontSize: '12px' }}
                        onClick={() => handleResolve(r.request_id, 'approve')}>
                        ✅ Approve
                      </button>
                      <button className="btn btn-danger"
                        style={{ padding: '5px 12px', fontSize: '12px' }}
                        onClick={() => handleResolve(r.request_id, 'reject')}>
                        ❌ Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal — seat detail */}
      {showModal && selected && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}
            style={{ maxWidth: '560px' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between',
                          alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 className="modal-title" style={{ margin: 0 }}>
                Seat #{selected.seat_number}
                {selected.is_occupied
                  ? <span className="badge badge-danger"
                      style={{ marginLeft: '8px' }}>Occupied</span>
                  : <span className="badge badge-success"
                      style={{ marginLeft: '8px' }}>Vacant</span>
                }
              </h2>
              <button onClick={closeModal}
                style={{ background: 'none', border: 'none',
                         fontSize: '20px', cursor: 'pointer',
                         color: '#6b7280' }}>✕</button>
            </div>

            {!selected.is_occupied ? (
              <div style={{ textAlign: 'center', padding: '2rem',
                            color: '#6b7280' }}>
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>🟢</div>
                <p style={{ fontWeight: 500 }}>This seat is vacant</p>
                <p style={{ fontSize: '13px', marginTop: '4px' }}>
                  Assign a member to this seat from the Members page
                </p>
              </div>
            ) : detailLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem',
                            color: '#6b7280' }}>
                Loading member details...
              </div>
            ) : detail?.member ? (
              <div>
                {/* Member info */}
                <div style={{
                  background: '#f8fafc', borderRadius: '10px',
                  padding: '1rem', marginBottom: '1rem'
                }}>
                  <div style={{ display: 'flex', gap: '1rem',
                                alignItems: 'flex-start' }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: '50%',
                      background: '#dbeafe', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontSize: '24px', flexShrink: 0
                    }}>
                      {detail.member.profile_photo ? (
                        <img src={detail.member.profile_photo}
                          alt="" style={{ width: '100%',
                                         height: '100%',
                                         borderRadius: '50%',
                                         objectFit: 'cover' }} />
                      ) : '👤'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '16px' }}>
                        {detail.member.full_name}
                      </div>
                      <div style={{ color: '#6b7280', fontSize: '13px' }}>
                        Father: {detail.member.father_name}
                      </div>
                      <div style={{ color: '#6b7280', fontSize: '13px' }}>
                        📱 {detail.member.mobile}
                      </div>
                      <div style={{ color: '#6b7280', fontSize: '13px' }}>
                        ✉️ {detail.member.email}
                      </div>
                      <div style={{ color: '#6b7280', fontSize: '13px' }}>
                        📍 {detail.member.address}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Membership */}
                <div style={{
                  background: detail.active_membership
                    ? '#f0fdf4' : '#fef2f2',
                  borderRadius: '10px', padding: '1rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{ fontWeight: 600, fontSize: '14px',
                                marginBottom: '6px' }}>
                    📋 Membership
                  </div>
                  {detail.active_membership ? (
                    <div style={{ fontSize: '13px' }}>
                      <div>Status:
                        <span className="badge badge-success"
                          style={{ marginLeft: '6px' }}>
                          Active
                        </span>
                      </div>
                      <div style={{ marginTop: '4px' }}>
                        Valid: {detail.active_membership.start_date}
                        {' → '}
                        {detail.active_membership.end_date}
                      </div>
                      <div style={{ marginTop: '4px',
                                    color: detail.active_membership.days_remaining <= 3
                                      ? '#dc2626' : '#16a34a',
                                    fontWeight: 600 }}>
                        {detail.active_membership.days_remaining} days remaining
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '13px', color: '#dc2626' }}>
                      ❌ No active membership
                    </div>
                  )}
                </div>

                {/* Attendance */}
                <div style={{
                  background: '#eff6ff', borderRadius: '10px',
                  padding: '1rem', marginBottom: '1rem'
                }}>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>
                    📅 Attendance This Month:
                    <span style={{ fontWeight: 800, color: '#2563eb',
                                   marginLeft: '6px' }}>
                      {detail.attendance_this_month} days
                    </span>
                  </div>
                </div>

                {/* Recent payments */}
                {detail.payment_history?.length > 0 && (
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px',
                                  marginBottom: '6px' }}>
                      💰 Recent Payments
                    </div>
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Amount</th>
                          <th>Mode</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.payment_history.slice(0, 3).map(p => (
                          <tr key={p.payment_id}>
                            <td style={{ fontWeight: 600 }}>
                              ₹{p.amount}
                            </td>
                            <td>
                              <span className={`badge ${
                                p.payment_mode === 'cash'
                                  ? 'badge-warning' : 'badge-blue'}`}>
                                {p.payment_mode}
                              </span>
                            </td>
                            <td style={{ color: '#6b7280',
                                         fontSize: '12px' }}>
                              {new Date(p.payment_date)
                                .toLocaleDateString('en-IN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

    </Layout>
  );
}