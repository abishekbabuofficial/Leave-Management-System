import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        // Check if token is expired
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp && decodedToken.exp > currentTime) {
          // Token is still valid
          setUser(JSON.parse(storedUser));
        } else {
          // Token is expired, log out
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      } catch (error) {
        // Invalid token, log out
        console.error("Invalid token:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }

    setLoading(false);
  }, []);

  const login = async (emp_id, password) => {
    try {
      // Replace with your API endpoint
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emp_id, password }),
      });

      const data = await response.json();
      const token = data.token;
      const userData = jwtDecode(token);

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isEmployee: user?.Role === "EMPLOYEE",
    isManager: user?.Role === "MANAGER",
    isDirector: user?.Role === "DIRECTOR",
    isHR: user?.Role === "HR",
    isAdmin: ["MANAGER", "DIRECTOR", "HR"].includes(user?.Role),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
