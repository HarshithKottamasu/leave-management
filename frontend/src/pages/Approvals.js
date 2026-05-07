import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const API = 'http://localhost:5000';

export default function Approvals() {
  const [leaves,  setLeaves]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [note,    setNote]    = useState({});

  const load = () => {
    axios.get(API + '/api/leaves').then(({ data }) => {
      setLeaves(data.data.filter(l => l.status === 'pending'));
    }).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const review = async (id, status) => {
    await axios.patch(API + '/api/leaves/' + id + '/status', { status, reviewNote: note[id] || '' });
    setLeaves(prev => prev.filter(l => l._id !== id));
  };

  return (
    <div style={{ padding:'28px 32px' }}>
      <h1 style={{ fontSize:22, fontWeight:700, color:'#0f172a', margin:'0 0 6px' }}>Approvals</h1>
      <p style={{ color:'#64748b', margin:'0 0 24px', fontSize:14 }}>
        Review pending leave requests from your team.
      </p>

      {loading ? (
        <div style={{ color:'#94a3b8' }}>Loading…</div>
      ) : leaves.length === 0 ? (
        <div style={{
          background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:12,
          padding:'32px', textAlign:'center', color:'#166534'
        }}>
          ✓ All caught up — no pending requests
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {leaves.map(l => (
            <div key={l._id} style={{
              background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, padding:'20px'
            }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:14, flexWrap:'wrap', gap:10 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{
                    width:40, height:40, borderRadius:'50%', background:'#eff6ff',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:14, fontWeight:700, color:'#185FA5'
                  }}>
                    {l.employee?.name?.split(' ').map(w=>w[0]).join('').slice(0,2)}
                  </div>
                  <div>
                    <div style={{ fontWeight:600, fontSize:15 }}>{l.employee?.name}</div>
                    <div style={{ fontSize:12, color:'#64748b' }}>{l.employee?.department}</div>
                  </div>
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:14 }}>
                {[
                  { label:'Type',  val: l.leaveType },
                  { label:'From',  val: format(new Date(l.fromDate),'MMM d, yyyy') },
                  { label:'To',    val: format(new Date(l.toDate),'MMM d, yyyy') },
                  { label:'Days',  val: l.totalDays },
                ].map(item => (
                  <div key={item.label} style={{ background:'#f8fafc', borderRadius:8, padding:'10px 12px' }}>
                    <div style={{ fontSize:11, color:'#94a3b8' }}>{item.label}</div>
                    <div style={{ fontSize:14, fontWeight:500, textTransform:'capitalize', marginTop:2 }}>{item.val}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:12, color:'#64748b', marginBottom:4 }}>Reason</div>
                <div style={{ fontSize:14, color:'#374151' }}>{l.reason}</div>
              </div>

              <div style={{ display:'flex', gap:10, alignItems:'flex-end' }}>
                <div style={{ flex:1 }}>
                  <input
                    placeholder="Add a comment (optional)…"
                    value={note[l._id] || ''}
                    onChange={e => setNote({ ...note, [l._id]: e.target.value })}
                    style={{
                      width:'100%', padding:'9px 12px', border:'1px solid #e2e8f0',
                      borderRadius:8, fontSize:13, boxSizing:'border-box'
                    }}
                  />
                </div>
                <button onClick={() => review(l._id, 'approved')} style={{
                  padding:'9px 20px', background:'#166534', color:'#fff',
                  border:'none', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:600
                }}>Approve</button>
                <button onClick={() => review(l._id, 'rejected')} style={{
                  padding:'9px 20px', background:'#fff', color:'#dc2626',
                  border:'1px solid #fecaca', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:600
                }}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}