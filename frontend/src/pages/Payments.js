import React, { useEffect, useState, useContext } from 'react';
import Layout from '../components/Layout';
import { getMemberPayments, getPendingPayments,
         addMembership, getAllMembers } from '../services/api';
import { AuthContext } from '../App';
import { toast } from 'react-toastify';

export default function Payments() {
  const { user }          = useContext(AuthContext);
  const isAdmin           = user?.role === 'admin';
  const [payments,  setPayments]  = useState([]);
  const [pending,   setPending]   = useState([]);
  const [members,   setMembers]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selMember, setSelMember] = useState(null);
  const [adding,    setAdding]    = useState(false);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      if (isAdmin) {
        const [pen, mem] = await Promise.all([
          getPendingPayments(), getAllMembers()
        ]);
        setPending(pen.data.members || []);
        setMembers(mem.data);
      } else {
        const res = await getMemberPayments(user.member_id);
        setPayments(res.data);
      }
    } catch { toast.error('Failed to load payments.'); }
    setLoading(false);
  };

  const handleAddMembership = async () => {
    if (!selMember) return;
    setAdding(true);
    try {
      await addMembership({
        member_id:  selMember.member_id,
        admin_id:   user.admin_id,
        start_date: startDate,
      });
      toast.success(`Membership added for ${selMember.full_name}!`);
      setShowModal(false);
      setSelMember(null);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add membership.');
    }
    setAdding(false);
  };

  if (loading) return (
    <Layout title="Payments">
      <div style={{ textAlign: 'center', padding: '4rem',
                    color: '#6b7280' }}>Loading...</div>
    </Layout>
  );

  return (
    <Layout title={isAdmin ? 'Payment Management' : 'My Payments'}>

      {isAdmin ? (
        <>
          {/* Summary */}
          <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
            <div className="stat-card">
              <div className="stat-icon"
                style={{ background: '#fef2f2', color: '#dc2626' }}>
                ⚠️
              </div>
              <div>
                <div className="stat-value">{pending.length}</div>
                <div className="stat-label">Pending Payments</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"
                style={{ background: '#f0fdf4', color: '#16a34a' }}>
                ✅
              </div>
              <div>
                <div className="stat-value">
                  {members.length - pending.length}
                </div>
                <div className="stat-label">Paid Members</div>
              </div>
            </div>
          </div>

          {/* Pending payments */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between',
                          alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '16px' }}>
                ⚠️ Members with Pending Payment
              </h3>
            </div>
            {pending.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem',
                            color: '#16a34a' }}>
                <div style={{ fontSize: '40px' }}>✅</div>
                <p style={{ fontWeight: 500, marginTop: '8px' }}>
                  All members have paid!
                </p>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Mobile</th>
                    <th>Email</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map(m => (
                    <tr key={m.member_id}>
                      <td style={{ fontWeight: 500 }}>{m.full_name}</td>
                      <td style={{ color: '#6b7280' }}>{m.mobile}</td>
                      <td style={{ color: '#6b7280', fontSize: '12px' }}>
                        {m.email}
                      </td>
                      <td>
                        <button className="btn btn-success"
                          style={{ padding: '5px 12px', fontSize: '12px' }}
                          onClick={() => {
                            setSelMember(m);
                            setShowModal(true);
                          }}>
                          + Add Payment
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* All members */}
          <div className="card">
            <h3 style={{ marginBottom: '1rem', fontSize: '16px' }}>
              👥 All Members
            </h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Mobile</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {members.map(m => {
                  const isPending = pending.some(
                    p => p.member_id === m.member_id
                  );
                  return (
                    <tr key={m.member_id}>
                      <td style={{ fontWeight: 500 }}>{m.full_name}</td>
                      <td style={{ color: '#6b7280' }}>{m.mobile}</td>
                      <td>
                        <span className={`badge ${isPending
                          ? 'badge-danger' : 'badge-success'}`}>
                          {isPending ? '⚠️ Pending' : '✅ Paid'}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-primary"
                          style={{ padding: '5px 12px', fontSize: '12px' }}
                          onClick={() => {
                            setSelMember(m);
                            setShowModal(true);
                          }}>
                          Renew
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          {/* Member payment history */}
          <div className="card">
            <h3 style={{ marginBottom: '1rem', fontSize: '16px' }}>
              💰 Payment History
            </h3>
            {payments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem',
                            color: '#6b7280' }}>
                <div style={{ fontSize: '40px' }}>💳</div>
                <p style={{ marginTop: '8px' }}>No payments yet.</p>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Amount</th>
                    <th>Mode</th>
                    <th>Date</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p, i) => (
                    <tr key={p.payment_id}>
                      <td style={{ color: '#6b7280' }}>{i + 1}</td>
                      <td style={{ fontWeight: 700, color: '#16a34a' }}>
                        ₹{p.amount}
                      </td>
                      <td>
                        <span className={`badge ${p.payment_mode === 'cash'
                          ? 'badge-warning' : 'badge-blue'}`}>
                          {p.payment_mode === 'cash' ? '💵 Cash' : '💳 Online'}
                        </span>
                      </td>
                      <td style={{ color: '#6b7280' }}>
                        {new Date(p.payment_date).toLocaleDateString('en-IN', {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </td>
                      <td style={{ color: '#6b7280', fontSize: '12px' }}>
                        {p.notes || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* Add Membership Modal */}
      {showModal && selMember && (
        <div className="modal-overlay"
          onClick={() => { setShowModal(false); setSelMember(null); }}>
          <div className="modal"
            onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">
              💰 Add Membership — {selMember.full_name}
            </h2>
            <div className="form-group">
              <label>Start Date</label>
              <input className="input" type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)} />
            </div>
            <div style={{
              background: '#f0fdf4', borderRadius: '8px',
              padding: '12px', marginBottom: '1rem',
              fontSize: '14px', color: '#166534'
            }}>
              ✅ Monthly membership will be recorded as cash payment.
              Member will be notified automatically.
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-success"
                style={{ flex: 1 }}
                disabled={adding}
                onClick={handleAddMembership}>
                {adding ? 'Adding...' : '✅ Confirm Payment'}
              </button>
              <button className="btn btn-outline"
                onClick={() => { setShowModal(false); setSelMember(null); }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
}