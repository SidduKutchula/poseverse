import React, { createContext, useContext, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setUser, setLoading, logoutUser } from "../store/slices/authSlice";
import api from "../utils/api";

const AuthContext = createContext(null);

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
  const dispatch = useDispatch();
  const { user, loading, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        const decoded = decodeToken(token);
        if (decoded && decoded.exp * 1000 > Date.now()) {
          dispatch(
            setUser({
              id: decoded.id,
              name: decoded.name,
              email: decoded.email,
              role: decoded.role,
            })
          );
        } else {
          try {
            const refreshResponse = await api.post("/auth/refresh");
            const { token: newAccessToken, user: userData } = refreshResponse.data;
            localStorage.setItem("token", newAccessToken);
            dispatch(setUser(userData));
          } catch (error) {
            console.warn("Session refresh on mount failed:", error.message);
            dispatch(logoutUser());
          }
        }
      }
      dispatch(setLoading(false));
    };

    verifySession();
  }, [dispatch]);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const { token, user: userData } = response.data;
    localStorage.setItem("token", token);
    dispatch(setUser(userData));
    return userData;
  };

  const register = async (name, email, password) => {
    const response = await api.post("/auth/register", { name, email, password });
    const { token, user: userData } = response.data;
    localStorage.setItem("token", token);
    dispatch(setUser(userData));
    return userData;
  };

  const googleLogin = async (credential) => {
    const response = await api.post("/auth/google", { credential });
    const { token, user: userData } = response.data;
    localStorage.setItem("token", token);
    dispatch(setUser(userData));
    return userData;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      console.warn("Failed to notify logout on backend:", e.message);
    }
    dispatch(logoutUser());
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
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

