import React, { useEffect, useState } from 'react';
import axios from 'axios';

const COLORS = ['#eff6ff:#185FA5', '#f0fdf4:#166534', '#fff7ed:#c2410c', '#fdf4ff:#7e22ce', '#fef2f2:#b91c1c'];

export default function Team() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/api/users').then(({ data }) => setUsers(data.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding:'28px 32px' }}>
      <h1 style={{ fontSize:22, fontWeight:700, color:'#0f172a', margin:'0 0 24px' }}>Team Members</h1>

      {loading ? (
        <div style={{ color:'#94a3b8' }}>Loading…</div>
      ) : (
        <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ background:'#f8fafc' }}>
                {['Employee','Role','Department','Annual Left','Sick Left','Status'].map(h => (
                  <th key={h} style={{ padding:'11px 16px', textAlign:'left', fontWeight:500, color:'#64748b', fontSize:12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => {
                const [bg, fg] = COLORS[i % COLORS.length].split(':');
                return (
                  <tr key={u._id} style={{ borderTop:'1px solid #f1f5f9' }}>
                    <td style={{ padding:'12px 16px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{
                          width:32, height:32, borderRadius:'50%',
                          background:bg, color:fg,
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontSize:12, fontWeight:700
                        }}>
                          {u.name.split(' ').map(w=>w[0]).join('').slice(0,2)}
                        </div>
                        <div>
                          <div style={{ fontWeight:500 }}>{u.name}</div>
                          <div style={{ fontSize:11, color:'#94a3b8' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:'12px 16px', textTransform:'capitalize', color:'#475569' }}>{u.role}</td>
                    <td style={{ padding:'12px 16px', color:'#475569' }}>{u.department}</td>
                    <td style={{ padding:'12px 16px', fontWeight:600, color:'#185FA5' }}>{u.balance?.annual}</td>
                    <td style={{ padding:'12px 16px', fontWeight:600, color:'#1D9E75' }}>{u.balance?.sick}</td>
                    <td style={{ padding:'12px 16px' }}>
                      <span style={{
                        background: u.isActive ? '#f0fdf4' : '#f8fafc',
                        color: u.isActive ? '#166534' : '#94a3b8',
                        padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600
                      }}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}