import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm]     = useState({ email:'', password:'' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { login }   = useAuth();
  const navigate    = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'#f1f5f9', fontFamily:'system-ui,sans-serif'
    }}>
      <div style={{
        background:'#fff', borderRadius:16, padding:'40px 36px',
        width:380, boxShadow:'0 4px 24px rgba(0,0,0,0.08)'
      }}>
        <div style={{ marginBottom:32, textAlign:'center' }}>
          <div style={{ fontSize:26, fontWeight:700, color:'#0f172a' }}>LeaveHub</div>
          <div style={{ fontSize:14, color:'#64748b', marginTop:4 }}>Sign in to your account</div>
        </div>

        {error && (
          <div style={{
            background:'#fef2f2', border:'1px solid #fecaca', borderRadius:8,
            padding:'10px 14px', color:'#dc2626', fontSize:13, marginBottom:16
          }}>{error}</div>
        )}

        <form onSubmit={submit}>
          <div style={{ marginBottom:14 }}>
            <label style={{ display:'block', fontSize:13, fontWeight:500, color:'#374151', marginBottom:6 }}>
              Email address
            </label>
            <input
              name="email" type="email" value={form.email} onChange={handle} required
              style={{
                width:'100%', padding:'10px 12px', border:'1px solid #e2e8f0',
                borderRadius:8, fontSize:14, boxSizing:'border-box'
              }}
            />
          </div>
          <div style={{ marginBottom:24 }}>
            <label style={{ display:'block', fontSize:13, fontWeight:500, color:'#374151', marginBottom:6 }}>
              Password
            </label>
            <input
              name="password" type="password" value={form.password} onChange={handle} required
              style={{
                width:'100%', padding:'10px 12px', border:'1px solid #e2e8f0',
                borderRadius:8, fontSize:14, boxSizing:'border-box'
              }}
            />
          </div>
          <button
            type="submit" disabled={loading}
            style={{
              width:'100%', padding:'12px', background: loading ? '#93c5fd' : '#185FA5',
              color:'#fff', border:'none', borderRadius:8,
              fontSize:15, fontWeight:600, cursor: loading ? 'default' : 'pointer'
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}