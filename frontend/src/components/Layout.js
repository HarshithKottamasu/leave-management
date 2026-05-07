import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/',          label: 'Dashboard',  icon: '⊞',  roles: [] },
  { to: '/apply',     label: 'Apply Leave',icon: '+',  roles: [] },
  { to: '/calendar',  label: 'Calendar',   icon: '⊡',  roles: [] },
  { to: '/approvals', label: 'Approvals',  icon: '✓',  roles: ['manager','hr_admin'] },
  { to: '/reports',   label: 'Reports',    icon: '⊞',  roles: ['manager','hr_admin'] },
  { to: '/team',      label: 'Team',       icon: '⊛',  roles: ['manager','hr_admin'] },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ display:'flex', height:'100vh', fontFamily:'system-ui,sans-serif' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, background: '#0f172a', display:'flex',
        flexDirection:'column', flexShrink: 0, color:'#94a3b8'
      }}>
        <div style={{ padding:'24px 20px', borderBottom:'1px solid #1e293b' }}>
          <div style={{ fontSize:18, fontWeight:700, color:'#fff' }}>LeaveHub</div>
          <div style={{ fontSize:12, color:'#475569', marginTop:2 }}>HR Management</div>
        </div>

        <nav style={{ flex:1, padding:'12px 8px', overflowY:'auto' }}>
          {NAV.filter(n => n.roles.length === 0 || n.roles.includes(user?.role)).map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              style={({ isActive }) => ({
                display:'flex', alignItems:'center', gap:10,
                padding:'10px 12px', borderRadius:8, marginBottom:2,
                textDecoration:'none', fontSize:14,
                background: isActive ? '#1e293b' : 'transparent',
                color: isActive ? '#fff' : '#94a3b8',
                fontWeight: isActive ? 500 : 400,
              })}
            >
              <span>{n.icon}</span>{n.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding:'16px 12px', borderTop:'1px solid #1e293b' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
            <div style={{
              width:32, height:32, borderRadius:'50%',
              background:'#185FA5', display:'flex', alignItems:'center',
              justifyContent:'center', fontSize:12, fontWeight:600, color:'#fff'
            }}>
              {user?.name?.split(' ').map(w=>w[0]).join('').slice(0,2)}
            </div>
            <div>
              <div style={{ fontSize:13, fontWeight:500, color:'#e2e8f0' }}>{user?.name}</div>
              <div style={{ fontSize:11, color:'#475569', textTransform:'capitalize' }}>{user?.role}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width:'100%', padding:'8px', background:'transparent',
              border:'1px solid #1e293b', borderRadius:6, color:'#64748b',
              cursor:'pointer', fontSize:13
            }}
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex:1, overflow:'auto', background:'#f8fafc' }}>
        <Outlet />
      </main>
    </div>
  );
}