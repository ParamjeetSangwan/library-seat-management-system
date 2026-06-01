import React, { useEffect, useState, useContext } from 'react';
import Layout from '../components/Layout';
import { getSeatMap, requestSeatChange } from '../services/api';
import { AuthContext } from '../App';
import { toast } from 'react-toastify';

export default function SeatMap() {
  const { user }      = useContext(AuthContext);
  const [seats,       setSeats]       = useState([]);
  const [selected,    setSelected]    = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [requesting,  setRequesting]  = useState(false);

  useEffect(() => { loadSeats(); }, []);

  const loadSeats = async () => {
    try {
      const res = await getSeatMap();
      setSeats(res.data);
    } catch { toast.error('Failed to load seats.'); }
    setLoading(false);
  };

  const handleSeatClick = (seat) => {
    if (seat.is_occupied && seat.member_id !== user?.member_id) return;
    if (!seat.is_occupied) setSelected(seat);
  };

  const handleRequestChange = async () => {
    if (!selected) return;
    setRequesting(true);
    try {
      await requestSeatChange({
        member_id: user.member_id,
        requested_seat_id: selected.seat_id
      });
      toast.success('Seat change request submitted!');
      setSelected(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Request failed.');
    }
    setRequesting(false);
  };

  const mySeat = seats.find(s => s.member_id === user?.member_id);

  return (
    <Layout title="Seat Map">

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1rem',
                    flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {[
          { color: '#dcfce7', border: '#86efac',
            text: '#166534', label: '🟢 Vacant' },
          { color: '#fee2e2', border: '#fca5a5',
            text: '#991b1b', label: '🔴 Occupied' },
          { color: '#dbeafe', border: '#93c5fd',
            text: '#1e40af', label: '🔵 Selected' },
          { color: '#fef9c3', border: '#fde047',
            text: '#854d0e', label: '⭐ My Seat' },
        ].map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 12px', background: item.color,
            borderRadius: '8px', border: `1.5px solid ${item.border}`,
            fontSize: '13px', fontWeight: 500, color: item.text
          }}>
            {item.label}
          </div>
        ))}
      </div>

      {/* My seat info */}
      {mySeat && (
        <div className="card" style={{
          background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
          marginBottom: '1.5rem', padding: '1rem 1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '16px' }}>
                ⭐ Your Assigned Seat: #{mySeat.seat_number}
              </div>
              <div style={{ color: '#6b7280', fontSize: '13px',
                            marginTop: '2px' }}>
                Click any vacant seat to request a change
              </div>
            </div>
            {selected && (
              <button className="btn btn-primary"
                onClick={handleRequestChange} disabled={requesting}>
                {requesting ? 'Requesting...'
                  : `Request Seat #${selected.seat_number}`}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Seat grid */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '16px' }}>All 90 Seats</h3>
          <div style={{ fontSize: '13px', color: '#6b7280' }}>
            {seats.filter(s => s.is_occupied).length} occupied ·{' '}
            {seats.filter(s => !s.is_occupied).length} vacant
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem',
                        color: '#6b7280' }}>
            Loading seats...
          </div>
        ) : (
          <div className="seat-grid">
            {seats.map(seat => {
              const isMine    = seat.member_id === user?.member_id;
              const isSelected = selected?.seat_id === seat.seat_id;

              let cls = 'seat-box ';
              if (isMine)       cls += 'seat-selected';
              else if (isSelected) cls += 'seat-selected';
              else if (seat.is_occupied) cls += 'seat-occupied';
              else              cls += 'seat-vacant';

              return (
                <div key={seat.seat_id}
                  className={cls}
                  onClick={() => handleSeatClick(seat)}
                  title={seat.is_occupied
                    ? (isMine ? 'Your seat' : 'Occupied')
                    : 'Click to request'}
                  style={{
                    background: isMine ? '#fef9c3'
                      : isSelected ? '#dbeafe'
                      : seat.is_occupied ? '#fee2e2' : '#dcfce7',
                    border: `2px solid ${isMine ? '#fde047'
                      : isSelected ? '#93c5fd'
                      : seat.is_occupied ? '#fca5a5' : '#86efac'}`,
                    color: isMine ? '#854d0e'
                      : isSelected ? '#1e40af'
                      : seat.is_occupied ? '#991b1b' : '#166534',
                    cursor: seat.is_occupied && !isMine
                      ? 'not-allowed' : 'pointer',
                  }}>
                  <span style={{ fontSize: '10px' }}>
                    {isMine ? '⭐' : ''}
                  </span>
                  {seat.seat_number}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected seat info */}
      {selected && (
        <div className="card" style={{
          background: '#eff6ff', marginTop: '1rem',
          border: '1.5px solid #bfdbfe'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600 }}>
                Selected: Seat #{selected.seat_number}
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>
                This seat is currently vacant
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-primary"
                onClick={handleRequestChange} disabled={requesting}>
                {requesting ? 'Submitting...' : 'Confirm Request'}
              </button>
              <button className="btn btn-outline"
                onClick={() => setSelected(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
}