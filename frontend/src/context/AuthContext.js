import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API = 'http://localhost:5000';

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('lh_token');
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('lh_token');
    if (token) {
      axios.get(API + '/api/auth/me')
        .then(function(res) { setUser(res.data.user); })
        .catch(function() { localStorage.removeItem('lh_token'); })
        .finally(function() { setLoading(false); });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async function(email, password) {
    const res = await axios.post(API + '/api/auth/login', { email: email, password: password });
    localStorage.setItem('lh_token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = function() {
    localStorage.removeItem('lh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user: user, login: login, logout: logout, loading: loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);