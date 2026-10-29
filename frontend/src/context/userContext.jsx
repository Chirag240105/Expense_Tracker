import React, { useState, useCallback } from "react";
import { UserContext } from "./UserContext.js";

export const UserProvider = ({ children }) => {
  // accessToken stored in memory (not localStorage) — more secure than plain localStorage
  // We still mirror it to localStorage so PrivateRoute can do a synchronous first-paint check
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [user, setUser] = useState(null);
  // true while /api/auth/refresh is in-flight on app load
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const updateUser = useCallback((userData) => setUser(userData), []);

  const setAccessToken = useCallback((t) => {
    setToken(t);
    if (t) {
      localStorage.setItem("token", t);
    } else {
      localStorage.removeItem("token");
    }
  }, []);

  const clearUser = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        token,
        isAuthLoading,
        setIsAuthLoading,
        updateUser,
        setAccessToken,
        clearUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
