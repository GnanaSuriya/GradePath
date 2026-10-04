import React, { createContext, useContext, useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
  needsOnboarding: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>(null as any);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const localToken = localStorage.getItem('token');
    const sessionToken = sessionStorage.getItem('token');
    const token = localToken || sessionToken;

    if (token) {
      axios.get(`${(import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5000/api')}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        if (res.data.needsOnboarding) {
          if (localToken && !sessionToken) {
            localStorage.removeItem('token');
            setUser(null);
            return;
          }
        } else {
          if (sessionToken && !localToken) {
            localStorage.setItem('token', sessionToken);
            sessionStorage.removeItem('token');
          }
        }
        setUser(res.data);
      }).catch(() => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
      }).finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      try {
        const res = await axios.post(`${(import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5000/api')}/auth/google`, {
          access_token: codeResponse.access_token
        });
        
        if (res.data.user.needsOnboarding) {
          sessionStorage.setItem('token', res.data.token);
          localStorage.removeItem('token');
        } else {
          localStorage.setItem('token', res.data.token);
          sessionStorage.removeItem('token');
        }
        
        setUser(res.data.user);
      } catch (err) {
        console.error('Login failed', err);
        alert('Login failed');
      }
    },
    onError: (error) => console.log('Login Failed:', error)
  });

  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
