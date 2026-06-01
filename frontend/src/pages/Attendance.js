import React, { useEffect, useState, useContext } from 'react';
import Layout from '../components/Layout';
import { markAttendance, getTodayAttendance,
         getMemberAttendance, getAllMembers } from '../services/api';
import { AuthContext } from '../App';
import { toast } from 'react-toastify';

export default function Attendance() {
  const { user }        = useContext(AuthContext);
  const isAdmin         = user?.role === 'admin';
  const [data,    setData]    = useState(null);
  const [members, setMembers] = useState([]);
  const [search,  setSearch]  = useState('');
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      if (isAdmin) {
        const [att, mem] = await Promise.all([
          getTodayAttendance(), getAllMembers()
        ]);
        setData(att.data);
        setMembers(mem.data);
      } else {
        const res = await getMemberAttendance(user.member_id);
        setData(res.data);
      }
    } catch { toast.error('Failed to load attendance.'); }
    setLoading(false);
  };

  const handleMark = async (memberId) => {
    setMarking(memberId);
    try {
      await markAttendance({
        member_id: memberId,
        admin_id:  user.admin_id,
        date:      new Date().toISOString().split('T')[0]
      });
      toast.success('Attendance marked!');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Already marked today.');
    }
    setMarking(null);
  };

  const isMarked = (memberId) =>
    data?.members?.some(a => a.member === memberId);

  const filtered = members.filter(m =>
    m.full_name.toLowerCase().includes(search.toLowerCase()) ||
    m.mobile.includes(search)
  );

  if (loading) return (
    <Layout title="Attendance">
      <div style={{ textAlign: 'center', padding: '4rem',
                    color: '#6b7280' }}>Loading...</div>
    </Layout>
  );

  return (
    <Layout title={isAdmin ? 'Mark Attendance' : 'My Attendance'}>

      {isAdmin ? (
        <>
          {/* Today summary */}
          <div style={{
            display: 'flex', gap: '1rem',
            marginBottom: '1.5rem', flexWrap: 'wrap'
          }}>
            <div className="stat-card" style={{ flex: 1, minWidth: '180px' }}>
              <div className="stat-icon"
                style={{ background: '#f0fdf4', color: '#16a34a' }}>
                📅
              </div>
              <div>
                <div className="stat-value">
                  {data?.total_present || 0}
                </div>
                <div className="stat-label">Present Today</div>
              </div>
            </div>
            <div className="stat-card" style={{ flex: 1, minWidth: '180px' }}>
              <div className="stat-icon"
                style={{ background: '#fef2f2', color: '#dc2626' }}>
                ❌
              </div>
              <div>
                <div className="stat-value">
                  {members.length - (data?.total_present || 0)}
                </div>
                <div className="stat-label">Absent Today</div>
              </div>
            </div>
            <div className="stat-card" style={{ flex: 1, minWidth: '180px' }}>
              <div className="stat-icon"
                style={{ background: '#eff6ff', color: '#2563eb' }}>
                👥
              </div>
              <div>
                <div className="stat-value">{members.length}</div>
                <div className="stat-label">Total Members</div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="card" style={{ padding: '1rem' }}>
            <input className="input"
              placeholder="🔍 Search member by name or mobile..."
              value={search}
              onChange={e => setSearch(e.target.value)} />
          </div>

          {/* Members list */}
          <div className="card">
            <h3 style={{ marginBottom: '1rem', fontSize: '16px' }}>
              Today — {new Date().toLocaleDateString('en-IN', {
                weekday: 'long', year: 'numeric',
                month: 'long', day: 'numeric'
              })}
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
                {filtered.map(m => (
                  <tr key={m.member_id}>
                    <td style={{ fontWeight: 500 }}>{m.full_name}</td>
                    <td style={{ color: '#6b7280' }}>{m.mobile}</td>
                    <td>
                      {isMarked(m.member_id) ? (
                        <span className="badge badge-success">
                          ✅ Present
                        </span>
                      ) : (
                        <span className="badge badge-danger">
                          ❌ Absent
                        </span>
                      )}
                    </td>
                    <td>
                      {!isMarked(m.member_id) && (
                        <button className="btn btn-success"
                          style={{ padding: '5px 14px', fontSize: '12px' }}
                          disabled={marking === m.member_id}
                          onClick={() => handleMark(m.member_id)}>
                          {marking === m.member_id
                            ? 'Marking...' : 'Mark Present'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          {/* Member attendance view */}
          <div className="card" style={{
            background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
            marginBottom: '1.5rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '56px', fontWeight: 800,
                            color: '#2563eb' }}>
                {data?.total_present || 0}
              </div>
              <div style={{ color: '#6b7280', fontSize: '15px' }}>
                days present in {data?.month}
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '1rem', fontSize: '16px' }}>
              Attendance Calendar — {data?.month}
            </h3>
            {data?.records?.length === 0 ? (
              <p style={{ color: '#6b7280' }}>
                No attendance records this month.
              </p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {data?.records?.map(a => (
                  <div key={a.attendance_id} style={{
                    width: '48px', height: '48px',
                    borderRadius: '10px', background: '#dcfce7',
                    border: '2px solid #86efac',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    color: '#166534', fontWeight: 700
                  }}>
                    <div style={{ fontSize: '16px' }}>
                      {new Date(a.date).getDate()}
                    </div>
                    <div style={{ fontSize: '10px' }}>
                      {new Date(a.date).toLocaleDateString('en-IN',
                        { weekday: 'short' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </Layout>
  );
}