import React, { createContext, useContext, useState } from 'react';

export type UserRole = 'admin' | 'staff' | 'customer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  customerId?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('subflow_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('subflow_token');
  });

  const login = async (email: string, forcedRole?: UserRole) => {
    // In demo or client-side mode, or connected to FastAPI backend:
    let role: UserRole = forcedRole || 'admin';
    let name = 'Meenakshi Iyer';
    let customerId: string | undefined = undefined;

    if (email.includes('staff')) {
      role = 'staff';
      name = 'Rohan Deshmukh';
    } else if (email.includes('customer')) {
      role = 'customer';
      name = 'Aarav Patel';
      customerId = 'cust_1';
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      email,
      name,
      role,
      customerId,
    };

    const mockToken = `subflow_jwt_${Date.now()}`;
    setUser(newUser);
    setToken(mockToken);
    localStorage.setItem('subflow_user', JSON.stringify(newUser));
    localStorage.setItem('subflow_token', mockToken);
    return true;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('subflow_user');
    localStorage.removeItem('subflow_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: Boolean(user && token),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
