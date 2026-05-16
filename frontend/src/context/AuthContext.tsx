import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

const BACKEND_URL = 'http://localhost:5000';

interface VirtualAccount {
  account_name: string;
  account_number: string;
  bank_name: string;
}

interface User {
  id: string;
  businessName: string;
  email: string;
  role: 'buyer' | 'vendor';
  vendorId?: string;
  virtualAccount?: VirtualAccount;
}

interface RegisterData {
  businessName: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
  bvn?: string;
}

interface RegisterResponse {
  message: string;
  vendorId?: string;
  virtualAccount?: VirtualAccount;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<RegisterResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('sentinel_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('sentinel_token');
    const savedUser = localStorage.getItem('sentinel_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await axios.post(`${BACKEND_URL}/api/auth/login`, { email, password });
    const { token: newToken, user: userData } = response.data;

    localStorage.setItem('sentinel_token', newToken);
    localStorage.setItem('sentinel_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const register = async (data: RegisterData): Promise<RegisterResponse> => {
    const response = await axios.post(`${BACKEND_URL}/api/auth/register`, data);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('sentinel_token');
    localStorage.removeItem('sentinel_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
