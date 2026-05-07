import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

const BADGE = {
  pending:  { bg:'#FAEEDA', color:'#854F0B', label:'Pending' },
  approved: { bg:'#EAF3DE', color:'#27500A', label:'Approved' },
  rejected: { bg:'#FCEBEB', color:'#A32D2D', label:'Rejected' },
};

export default function Dashboard() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/api/leaves').then(({ data }) => {
      setLeaves(data.data);
    }).finally(() => setLoading(false));
  }, []);

  const recent = leaves.slice(0, 5);
  const bal = user?.balance || {};

  const StatCard = ({ label, value, sub, color }) => (
    <div style={{
      background:'#fff', border:'1px solid #e2e8f0', borderRadius:12,
      padding:'16px 20px', flex:1
    }}>
      <div style={{ fontSize:12, color:'#64748b', marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:28, fontWeight:700, color: color || '#0f172a' }}>{value}</div>
      {sub && <div style={{ fontSize:12, color:'#94a3b8', marginTop:2 }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ padding:'28px 32px' }}>
      <h1 style={{ fontSize:22, fontWeight:700, color:'#0f172a', margin:'0 0 6px' }}>
        Good day, {user?.name?.split(' ')[0]} 👋
      </h1>
      <p style={{ color:'#64748b', margin:'0 0 28px', fontSize:14 }}>
        {format(new Date(), 'EEEE, MMMM d yyyy')}
      </p>

      {/* Balance cards */}
      <div style={{ display:'flex', gap:12, marginBottom:24 }}>
        <StatCard label="Annual Leave"  value={bal.annual ?? '—'} sub="days remaining" color="#185FA5" />
        <StatCard label="Sick Leave"    value={bal.sick ?? '—'}   sub="days remaining" color="#1D9E75" />
        <StatCard label="Pending"       value={leaves.filter(l=>l.status==='pending').length} sub="awaiting approval" color="#EF9F27" />
        <StatCard label="Taken this year" value={leaves.filter(l=>l.status==='approved').reduce((s,l)=>s+l.totalDays,0)} sub="days used" />
      </div>

      {/* Recent requests table */}
      <div style={{
        background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, overflow:'hidden'
      }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid #f1f5f9' }}>
          <div style={{ fontSize:15, fontWeight:600, color:'#0f172a' }}>Recent Requests</div>
        </div>
        {loading ? (
          <div style={{ padding:40, textAlign:'center', color:'#94a3b8' }}>Loading…</div>
        ) : recent.length === 0 ? (
          <div style={{ padding:40, textAlign:'center', color:'#94a3b8' }}>No leave requests yet</div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ background:'#f8fafc' }}>
                {['Type','From','To','Days','Status','Reason'].map(h => (
                  <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontWeight:500, color:'#64748b', fontSize:12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map(l => {
                const badge = BADGE[l.status];
                return (
                  <tr key={l._id} style={{ borderTop:'1px solid #f1f5f9' }}>
                    <td style={{ padding:'12px 16px', textTransform:'capitalize', fontWeight:500 }}>{l.leaveType}</td>
                    <td style={{ padding:'12px 16px', color:'#475569' }}>{format(new Date(l.fromDate),'MMM d')}</td>
                    <td style={{ padding:'12px 16px', color:'#475569' }}>{format(new Date(l.toDate),'MMM d')}</td>
                    <td style={{ padding:'12px 16px' }}>{l.totalDays}</td>
                    <td style={{ padding:'12px 16px' }}>
                      <span style={{
                        background: badge.bg, color: badge.color,
                        padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600
                      }}>{badge.label}</span>
                    </td>
                    <td style={{ padding:'12px 16px', color:'#94a3b8' }}>{l.reason}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}