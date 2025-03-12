"use client";

import { createContext, useContext, useState, useEffect } from "react";

const MongoDBContext = createContext(null);

export function MongoDBProvider({ children }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check connection status on mount
    async function checkConnection() {
      try {
        const response = await fetch("/api/mongodb/status");
        const data = await response.json();
        setIsConnected(data.isConnected);
      } catch (error) {
        console.error("Failed to check MongoDB connection:", error);
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkConnection();
  }, []);

  return (
    <MongoDBContext.Provider value={{ isConnected, isLoading }}>
      {children}
    </MongoDBContext.Provider>
  );
}

export function useMongoDBContext() {
  const context = useContext(MongoDBContext);
  if (!context) {
    throw new Error("useMongoDBContext must be used within a MongoDBProvider");
  }
  return context;
}
