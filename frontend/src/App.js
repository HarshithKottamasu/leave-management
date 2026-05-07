import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login       from './pages/Login';
import Dashboard   from './pages/Dashboard';
import ApplyLeave  from './pages/ApplyLeave';
import Approvals   from './pages/Approvals';
import Calendar    from './pages/Calendar';
import Reports     from './pages/Reports';
import Team        from './pages/Team';
import Layout      from './components/Layout';

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading…</div>;
  if (!user)   return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="apply"    element={<ApplyLeave />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="approvals" element={
              <PrivateRoute roles={['manager','hr_admin']}><Approvals /></PrivateRoute>
            }/>
            <Route path="reports" element={
              <PrivateRoute roles={['hr_admin','manager']}><Reports /></PrivateRoute>
            }/>
            <Route path="team" element={
              <PrivateRoute roles={['manager','hr_admin']}><Team /></PrivateRoute>
            }/>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}