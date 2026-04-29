import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  // On initial load, check if we have a stored token and validate it
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          // Set the token for API calls
          api.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${storedToken}`;
          // Verify token by fetching current user
          const res = await api.get("/auth/me");
          setUser(res.data);
          setToken(storedToken);
        } catch (error) {
          // Token invalid - clear everything
          console.error("Token validation failed:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
          setToken(null);
          delete api.defaults.headers.common["Authorization"];
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Register a new user
  const register = async (name, email, password) => {
    const res = await api.post("/auth/register", { name, email, password });
    const data = res.data;

    // Store token and user data
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data));
    api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

    setUser(data);
    setToken(data.token);

    return data;
  };

  // Login user
  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const data = res.data;

    // Store token and user data
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data));
    api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

    setUser(data);
    setToken(data.token);

    return data;
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
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
