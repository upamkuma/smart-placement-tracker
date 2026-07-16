import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

/**
 * Custom hook to access the auth context.
 * Must be used inside an <AuthProvider>.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

/**
 * Persists user session data to localStorage and sets the axios default header.
 * Called after both login and register.
 *
 * @param {{ token: string }} data - Response data containing the JWT token
 */
const persistSession = (data) => {
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data));
  api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
};

/**
 * Clears user session from localStorage and removes the axios default header.
 * Called on logout or when a token is found to be invalid.
 */
const clearSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  delete api.defaults.headers.common["Authorization"];
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  // On initial load, validate any stored token by calling /auth/me
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
          const res = await api.get("/auth/me");
          setUser(res.data);
          setToken(storedToken);
        } catch (error) {
          // Token is invalid or expired — clear everything
          console.error("Token validation failed:", error);
          clearSession();
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  /** Register a new user and persist the session */
  const register = async (name, email, password) => {
    const res = await api.post("/auth/register", { name, email, password });
    const data = res.data;
    persistSession(data);
    setUser(data);
    setToken(data.token);
    return data;
  };

  /** Login an existing user and persist the session */
  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const data = res.data;
    persistSession(data);
    setUser(data);
    setToken(data.token);
    return data;
  };

  /** Logout the current user and clear the session */
  const logout = () => {
    clearSession();
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
