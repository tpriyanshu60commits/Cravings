import { useState, useEffect, useContext, createContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(sessionStorage.getItem("cravingsUser")) || null,
  );

  const [isLogin, setIsLogin] = useState(!!user);
  const [role, setRole] = useState(user ? user.userType : null);

  useEffect(() => {
    setIsLogin(!!user);
    setRole(user ? user.userType : null);
  }, [user]);

  const value = {user, setUser, isLogin, setIsLogin, setRole, role};

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
