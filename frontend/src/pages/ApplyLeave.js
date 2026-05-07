import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { differenceInDays } from 'date-fns';

export default function ApplyLeave() {
  const { user } = useAuth();
  const [form, setForm] = useState({ leaveType:'annual', fromDate:'', toDate:'', reason:'' });
  const [status, setStatus] = useState(null); // 'success' | 'error'
  const [msg, setMsg]       = useState('');
  const [loading, setLoading] = useState(false);

  const days = form.fromDate && form.toDate
    ? differenceInDays(new Date(form.toDate), new Date(form.fromDate)) + 1
    : 0;

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (days < 1) { setStatus('error'); setMsg('End date must be after start date'); return; }
    setLoading(true); setStatus(null);
    try {
      await axios.post('http://localhost:5000/api/leaves', form);
      setStatus('success');
      setMsg('Leave request submitted! Your manager has been notified via email.');
      setForm({ leaveType:'annual', fromDate:'', toDate:'', reason:'' });
    } catch (err) {
      setStatus('error');
      setMsg(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width:'100%', padding:'10px 12px', border:'1px solid #e2e8f0',
    borderRadius:8, fontSize:14, boxSizing:'border-box', background:'#fff'
  };
  const labelStyle = { display:'block', fontSize:13, fontWeight:500, color:'#374151', marginBottom:6 };

  return (
    <div style={{ padding:'28px 32px', maxWidth:640 }}>
      <h1 style={{ fontSize:22, fontWeight:700, color:'#0f172a', margin:'0 0 24px' }}>Apply for Leave</h1>

      {status && (
        <div style={{
          background: status==='success' ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${status==='success' ? '#bbf7d0' : '#fecaca'}`,
          color: status==='success' ? '#166534' : '#dc2626',
          borderRadius:8, padding:'12px 16px', fontSize:13, marginBottom:20
        }}>{msg}</div>
      )}

      {/* Balance banner */}
      <div style={{
        display:'flex', gap:12, marginBottom:24
      }}>
        {[
          { type:'annual', label:'Annual', val: user?.balance?.annual },
          { type:'sick',   label:'Sick',   val: user?.balance?.sick },
          { type:'unpaid', label:'Unpaid', val: '∞' },
        ].map(b => (
          <div key={b.type} style={{
            flex:1, background: form.leaveType===b.type ? '#EFF6FF' : '#f8fafc',
            border: `1px solid ${form.leaveType===b.type ? '#93c5fd' : '#e2e8f0'}`,
            borderRadius:10, padding:'12px 14px', cursor:'pointer'
          }} onClick={() => setForm({...form, leaveType: b.type})}>
            <div style={{ fontSize:11, color:'#64748b' }}>{b.label}</div>
            <div style={{ fontSize:20, fontWeight:700, color:'#185FA5', marginTop:2 }}>{b.val}</div>
            <div style={{ fontSize:11, color:'#94a3b8' }}>days left</div>
          </div>
        ))}
      </div>

      <form onSubmit={submit} style={{
        background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, padding:'24px'
      }}>
        <div style={{ marginBottom:16 }}>
          <label style={labelStyle}>Leave type</label>
          <select name="leaveType" value={form.leaveType} onChange={handle} style={inputStyle}>
            <option value="annual">Annual Leave</option>
            <option value="sick">Sick Leave</option>
            <option value="unpaid">Unpaid Leave</option>
          </select>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
          <div>
            <label style={labelStyle}>From date</label>
            <input type="date" name="fromDate" value={form.fromDate} onChange={handle} required style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>To date</label>
            <input type="date" name="toDate" value={form.toDate} onChange={handle} required style={inputStyle} />
          </div>
        </div>

        {days > 0 && (
          <div style={{
            background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:8,
            padding:'10px 14px', fontSize:13, color:'#1d4ed8', marginBottom:16
          }}>
            📅 <strong>{days} working day{days > 1 ? 's' : ''}</strong> selected
            {form.leaveType !== 'unpaid' && user?.balance?.[form.leaveType] < days && (
              <span style={{ color:'#dc2626', marginLeft:8 }}>⚠ Insufficient balance</span>
            )}
          </div>
        )}

        <div style={{ marginBottom:20 }}>
          <label style={labelStyle}>Reason</label>
          <textarea
            name="reason" value={form.reason} onChange={handle} required rows={4}
            placeholder="Briefly describe the reason for your leave…"
            style={{ ...inputStyle, resize:'vertical' }}
          />
        </div>

        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <button type="button" onClick={() => setForm({ leaveType:'annual', fromDate:'', toDate:'', reason:'' })}
            style={{ padding:'10px 20px', border:'1px solid #e2e8f0', borderRadius:8, background:'#fff', cursor:'pointer', fontSize:14 }}>
            Clear
          </button>
          <button type="submit" disabled={loading} style={{
            padding:'10px 24px', background: loading ? '#93c5fd' : '#185FA5',
            color:'#fff', border:'none', borderRadius:8, fontSize:14, fontWeight:600, cursor:'pointer'
          }}>
            {loading ? 'Submitting…' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
}