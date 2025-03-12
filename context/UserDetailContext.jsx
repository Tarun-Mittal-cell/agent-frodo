"use client";

import { createContext, useState, useEffect } from "react";

export const UserDetailContext = createContext();

export function UserDetailProvider({ children }) {
  const [userDetail, setUserDetail] = useState(null);

  useEffect(() => {
    // Load user from localStorage on client side
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem("userDetails");
        if (storedUser) {
          setUserDetail(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error loading user from localStorage:", error);
      }
    };

    // Only run in browser environment
    if (typeof window !== "undefined") {
      loadUser();
    }
  }, []);

  return (
    <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
      {children}
    </UserDetailContext.Provider>
  );
}
