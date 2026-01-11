import { createContext, useContext, useState } from 'react';
import api from '@/api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      return (token && storedUser) ? JSON.parse(storedUser) : null;
    } catch (e) {
      console.error("Failed to parse user data", e);
      return null;
    }
  });

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login.php', { email, password });
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        
        return { success: true };
      }
      
      return { success: false, message: data.message };
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, message: "Server error" };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);