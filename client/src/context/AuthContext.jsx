import { useState, useEffect, useContext, createContext } from "react";
import api from "../config/ApiConfig";

const AuthContext = createContext();

const STORAGE_KEY = "cravingUser";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || null;
    } catch {
      return null;
    }
  });

  const isLogin = !!user;
  const role = user?.userType || null;

  useEffect(() => {
    if (user) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = (userData) => {
    setUser(userData);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await api.get("/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      sessionStorage.removeItem(STORAGE_KEY);
    }
  };

  const updateUser = (userData) => {
    const updated = { ...user, ...userData };
    setUser(updated);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const value = {
    user,
    setUser,
    isLogin,
    setIsLogin: () => {},
    role,
    setRole: () => {},
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom Hook to consume AuthContext
export const useAuth = () => useContext(AuthContext);
