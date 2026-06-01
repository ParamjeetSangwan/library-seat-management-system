import React, { useEffect, useState, useContext } from 'react';
import Layout from '../components/Layout';
import { getAllMembers, assignSeat, getSeatMap,
         cancelMembership } from '../services/api';
import { AuthContext } from '../App';
import { toast } from 'react-toastify';

export default function Members() {
  const { user }         = useContext(AuthContext);
  const [members,  setMembers]  = useState([]);
  const [seats,    setSeats]    = useState([]);
  const [search,   setSearch]   = useState('');
  const [loading,  setLoading]  = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selMember, setSelMember] = useState(null);
  const [selSeat,   setSelSeat]   = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [m, s] = await Promise.all([
        getAllMembers(), getSeatMap()
      ]);
      setMembers(m.data);
      setSeats(s.data.filter(s => !s.is_occupied));
    } catch { toast.error('Failed to load.'); }
    setLoading(false);
  };

  const handleAssignSeat = async () => {
    if (!selSeat) return;
    setAssigning(true);
    try {
      await assignSeat({
        member_id: selMember.member_id,
        seat_id:   selSeat
      });
      toast.success('Seat assigned successfully!');
      setShowModal(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to assign seat.');
    }
    setAssigning(false);
  };

  const handleCancel = async (memberId, name) => {
    if (!window.confirm(
      `Cancel membership for ${name}? This will free their seat.`
    )) return;
    try {
      await cancelMembership(memberId);
      toast.success('Membership cancelled.');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed.');
    }
  };

  const filtered = members.filter(m =>
    m.full_name.toLowerCase().includes(search.toLowerCase()) ||
    m.mobile.includes(search)
  );

  if (loading) return (
    <Layout title="Members">
      <div style={{ textAlign: 'center', padding: '4rem',
                    color: '#6b7280' }}>Loading...</div>
    </Layout>
  );

  return (
    <Layout title="Members">

      {/* Search */}
      <div className="card" style={{ padding: '1rem',
                                     marginBottom: '1rem' }}>
        <input className="input"
          placeholder="🔍 Search by name or mobile..."
          value={search}
          onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Members table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '16px' }}>
            All Members ({filtered.length})
          </h3>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Mobile</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m.member_id}>
                <td>
                  <div style={{ fontWeight: 500 }}>{m.full_name}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    Father: {m.father_name}
                  </div>
                </td>
                <td style={{ color: '#6b7280' }}>{m.mobile}</td>
                <td style={{ color: '#6b7280', fontSize: '12px' }}>
                  {m.email}
                </td>
                <td>
                  <span className={`badge ${m.is_active
                    ? 'badge-success' : 'badge-danger'}`}>
                    {m.is_active ? '✅ Active' : '❌ Inactive'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="btn btn-primary"
                      style={{ padding: '5px 10px', fontSize: '11px' }}
                      onClick={() => {
                        setSelMember(m);
                        setShowModal(true);
                      }}>
                      🪑 Assign Seat
                    </button>
                    <button className="btn btn-danger"
                      style={{ padding: '5px 10px', fontSize: '11px' }}
                      onClick={() => handleCancel(m.member_id, m.full_name)}>
                      ❌ Cancel
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Assign Seat Modal */}
      {showModal && selMember && (
        <div className="modal-overlay"
          onClick={() => { setShowModal(false); setSelSeat(''); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">
              🪑 Assign Seat — {selMember.full_name}
            </h2>
            <div className="form-group">
              <label>Select Vacant Seat</label>
              <select className="input"
                value={selSeat}
                onChange={e => setSelSeat(e.target.value)}>
                <option value="">— Choose a seat —</option>
                {seats.map(s => (
                  <option key={s.seat_id} value={s.seat_id}>
                    Seat #{s.seat_number}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-primary"
                style={{ flex: 1 }}
                disabled={!selSeat || assigning}
                onClick={handleAssignSeat}>
                {assigning ? 'Assigning...' : '✅ Assign Seat'}
              </button>
              <button className="btn btn-outline"
                onClick={() => { setShowModal(false); setSelSeat(''); }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
}