import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  phone: string;
  name: string;
  isAdmin: boolean;
  isFirstLogin: boolean;
  sheet?: string;
}

interface AuthContextType {
  user: User | null;
  login: (phone: string, password: string, isAdmin: boolean) => Promise<boolean>;
  logout: () => void;
  changePassword: (newPassword: string) => void;
}

// Demo data - in production this would come from Supabase
const demoUsers: Record<string, { password: string; name: string; isFirstLogin: boolean; sheet: string }> = {
  '01012345678': { password: '123456', name: 'Ahmed Mohamed', isFirstLogin: true, sheet: 'cam 1' },
  '01098765432': { password: '123456', name: 'Sara Ahmed', isFirstLogin: true, sheet: 'station 1' },
  '01155555555': { password: '123456', name: 'Omar Hassan', isFirstLogin: false, sheet: 'miami west' },
};

const adminCredentials = { phone: 'admin', password: 'admin123' };

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (phone: string, password: string, isAdmin: boolean): Promise<boolean> => {
    if (isAdmin) {
      if (phone === adminCredentials.phone && password === adminCredentials.password) {
        setUser({ phone, name: 'Administrator', isAdmin: true, isFirstLogin: false });
        return true;
      }
      return false;
    }

    const userData = demoUsers[phone];
    if (userData && userData.password === password) {
      setUser({
        phone,
        name: userData.name,
        isAdmin: false,
        isFirstLogin: userData.isFirstLogin,
        sheet: userData.sheet,
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const changePassword = (newPassword: string) => {
    if (user && !user.isAdmin) {
      demoUsers[user.phone].password = newPassword;
      demoUsers[user.phone].isFirstLogin = false;
      setUser({ ...user, isFirstLogin: false });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, changePassword }}>
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
