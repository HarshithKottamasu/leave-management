import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';

export default function Calendar() {
  const [current,  setCurrent]  = useState(new Date());
  const [calendar, setCalendar] = useState([]);

  useEffect(() => {
    const m = current.getMonth() + 1;
    const y = current.getFullYear();
   axios.get(`http://localhost:5000/api/users/calendar?month=${m}&year=${y}`)
      .then(({ data }) => setCalendar(data.data))
      .catch(() => {});
  }, [current]);

  const days = eachDayOfInterval({ start: startOfMonth(current), end: endOfMonth(current) });
  const startPad = getDay(startOfMonth(current));

  const leavesOnDay = (d) =>
    calendar.filter(l =>
      new Date(l.fromDate) <= d && new Date(l.toDate) >= d
    );

  const today = new Date();
  today.setHours(0,0,0,0);

  return (
    <div style={{ padding:'28px 32px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:700, color:'#0f172a', margin:0 }}>
          {format(current, 'MMMM yyyy')}
        </h1>
        <button onClick={() => setCurrent(new Date(current.getFullYear(), current.getMonth()-1,1))}
          style={{ padding:'6px 12px', border:'1px solid #e2e8f0', borderRadius:8, background:'#fff', cursor:'pointer' }}>
          ‹ Prev
        </button>
        <button onClick={() => setCurrent(new Date(current.getFullYear(), current.getMonth()+1,1))}
          style={{ padding:'6px 12px', border:'1px solid #e2e8f0', borderRadius:8, background:'#fff', cursor:'pointer' }}>
          Next ›
        </button>
      </div>

      <div style={{
        background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, overflow:'hidden'
      }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', background:'#f8fafc' }}>
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
            <div key={d} style={{ padding:'10px', textAlign:'center', fontSize:12, fontWeight:600, color:'#64748b' }}>{d}</div>
          ))}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)' }}>
          {Array(startPad).fill(null).map((_, i) => (
            <div key={'p'+i} style={{ minHeight:80, border:'0.5px solid #f1f5f9' }} />
          ))}
          {days.map(d => {
            const on = leavesOnDay(d);
            const isToday = d.getTime() === today.getTime();
            return (
              <div key={d} style={{
                minHeight:80, border:'0.5px solid #f1f5f9', padding:'6px 8px',
                background: isToday ? '#eff6ff' : '#fff'
              }}>
                <div style={{
                  fontSize:13, fontWeight: isToday ? 700 : 400,
                  color: isToday ? '#185FA5' : '#374151',
                  marginBottom:4
                }}>{format(d,'d')}</div>
                {on.slice(0,2).map((l,i) => (
                  <div key={i} style={{
                    background:'#EAF3DE', color:'#27500A',
                    borderRadius:4, padding:'2px 5px', fontSize:10,
                    fontWeight:500, marginBottom:2, overflow:'hidden',
                    whiteSpace:'nowrap', textOverflow:'ellipsis'
                  }}>
                    {l.employee?.name?.split(' ')[0]}
                  </div>
                ))}
                {on.length > 2 && (
                  <div style={{ fontSize:10, color:'#94a3b8' }}>+{on.length-2} more</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display:'flex', gap:16, marginTop:16 }}>
        {[
          { color:'#eff6ff', border:'#185FA5', label:'Today' },
          { color:'#EAF3DE', border:'#639922', label:'On Leave (Approved)' },
        ].map(l => (
          <div key={l.label} style={{ display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ width:14, height:14, borderRadius:3, background:l.color, border:`1px solid ${l.border}` }} />
            <span style={{ fontSize:12, color:'#64748b' }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}