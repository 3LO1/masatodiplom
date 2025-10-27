import { createContext, useContext, useState } from 'react';
import { jwtDecode } from 'jwt-decode'; // Измененный импорт

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token); // Используем jwtDecode вместо jwt_decode
        return { 
          token, 
          role: decoded.role, 
          userId: decoded.userId,
          full_name: decoded.full_name 
        };
      } catch (e) {
        console.error('Token decode error:', e);
        localStorage.removeItem('token');
        return { token: null, role: null, userId: null, full_name: null };
      }
    }
    return { token: null, role: null, userId: null, full_name: null };
  });

  const login = (token) => {
    localStorage.setItem('token', token);
    const decoded = jwtDecode(token); // Используем jwtDecode
    setAuth({ 
      token, 
      role: decoded.role,
      userId: decoded.userId,
      full_name: decoded.full_name
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuth({ token: null, role: null, userId: null, full_name: null });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);