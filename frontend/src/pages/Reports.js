import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Reports() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year,  setYear]  = useState(now.getFullYear());
  const [data,  setData]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get(`http://localhost:5000/api/reports/monthly?month=${month}&year=${year}`)
      .then(({ data: res }) => setData(res.data))
      .finally(() => setLoading(false));
  }, [month, year]);

  const totals = data.reduce((a, r) => ({
    annual: a.annual + r.used.annual,
    sick:   a.sick   + r.used.sick,
    unpaid: a.unpaid + r.used.unpaid,
  }), { annual:0, sick:0, unpaid:0 });

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div style={{ padding:'28px 32px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, color:'#0f172a', margin:0 }}>Monthly Reports</h1>
          <p style={{ color:'#64748b', fontSize:14, margin:'4px 0 0' }}>Leave utilisation across the company</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <select value={month} onChange={e=>setMonth(+e.target.value)} style={{
            padding:'8px 12px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:13
          }}>
            {MONTHS.map((m,i) => <option key={m} value={i+1}>{m}</option>)}
          </select>
          <select value={year} onChange={e=>setYear(+e.target.value)} style={{
            padding:'8px 12px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:13
          }}>
            {[2024,2025,2026].map(y => <option key={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }}>
        {[
          { label:'Annual days used', val: totals.annual, color:'#185FA5' },
          { label:'Sick days used',   val: totals.sick,   color:'#1D9E75' },
          { label:'Unpaid days',      val: totals.unpaid, color:'#64748b' },
          { label:'Total employees',  val: data.length,   color:'#0f172a' },
        ].map(c => (
          <div key={c.label} style={{
            background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, padding:'16px 20px'
          }}>
            <div style={{ fontSize:12, color:'#64748b' }}>{c.label}</div>
            <div style={{ fontSize:26, fontWeight:700, color:c.color, marginTop:4 }}>{c.val}</div>
          </div>
        ))}
      </div>

      {/* Detail table */}
      <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead>
            <tr style={{ background:'#f8fafc' }}>
              {['Employee','Dept','Annual Used','Sick Used','Unpaid','Balance (Annual)','Utilisation'].map(h => (
                <th key={h} style={{ padding:'11px 16px', textAlign:'left', fontWeight:500, color:'#64748b', fontSize:12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding:40, textAlign:'center', color:'#94a3b8' }}>Loading…</td></tr>
            ) : data.map(r => (
              <tr key={r.id} style={{ borderTop:'1px solid #f1f5f9' }}>
                <td style={{ padding:'12px 16px', fontWeight:500 }}>{r.name}</td>
                <td style={{ padding:'12px 16px', color:'#64748b' }}>{r.department}</td>
                <td style={{ padding:'12px 16px' }}>{r.used.annual}</td>
                <td style={{ padding:'12px 16px' }}>{r.used.sick}</td>
                <td style={{ padding:'12px 16px' }}>{r.used.unpaid}</td>
                <td style={{ padding:'12px 16px' }}>{r.balance?.annual}</td>
                <td style={{ padding:'12px 16px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ flex:1, background:'#f1f5f9', borderRadius:4, height:6, overflow:'hidden' }}>
                      <div style={{
                        width:`${Math.min(r.utilisation,100)}%`, height:'100%',
                        background: r.utilisation > 75 ? '#E24B4A' : r.utilisation > 50 ? '#EF9F27' : '#1D9E75',
                        borderRadius:4
                      }}/>
                    </div>
                    <span style={{ fontSize:11, width:32, textAlign:'right' }}>{r.utilisation}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}