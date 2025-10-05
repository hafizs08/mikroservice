import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const UserContext = createContext();
const API_URL = import.meta.env.VITE_API_URL;

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async ({ username, password }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { username, password });
      const { token, idPengguna } = response.data;

      const newUser = { username, token, idPengguna };

      localStorage.setItem("user", JSON.stringify(newUser));
      setUser(newUser);
    } catch (error) {
      console.error("Login gagal:", error);
      throw new Error("Login gagal. Periksa username dan password.");
    }
  };

  const logout = async () => {
    try {
      if (user?.token) {
        await axios.post(`${API_URL}/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
      }
    } catch (error) {
      console.warn("Logout gagal, mungkin server tidak mendukung:", error);
    } finally {
      // Hapus dari state & localStorage
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
