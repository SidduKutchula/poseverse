import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

const AuthContext = createContext(null);

// Pure JS JWT decoder to avoid adding dependencies
const decodeToken = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        const decoded = decodeToken(token);
        // Check if token expired (decoded.exp in seconds)
        if (decoded && decoded.exp * 1000 > Date.now()) {
          setUser({
            id: decoded.id,
            name: decoded.name,
            email: decoded.email,
            role: decoded.role,
          });
        } else {
          // Token is expired. Let Axios response interceptor try to refresh it
          try {
            const refreshResponse = await api.post("/auth/refresh");
            const { token: newAccessToken, user: userData } = refreshResponse.data;
            localStorage.setItem("token", newAccessToken);
            setUser(userData);
          } catch (error) {
            console.warn("Session refresh on mount failed:", error.message);
            localStorage.removeItem("token");
            setUser(null);
          }
        }
      }
      setLoading(false);
    };

    verifySession();
  }, []);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const { token, user: userData } = response.data;
    localStorage.setItem("token", token);
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password) => {
    const response = await api.post("/auth/register", { name, email, password });
    const { token, user: userData } = response.data;
    localStorage.setItem("token", token);
    setUser(userData);
    return userData;
  };

  const googleLogin = async (credential) => {
    const response = await api.post("/auth/google", { credential });
    const { token, user: userData } = response.data;
    localStorage.setItem("token", token);
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      console.warn("Failed to notify logout on backend:", e.message);
    }
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        googleLogin,
        logout,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
