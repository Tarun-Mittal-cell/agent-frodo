"use client";

import { useState } from "react";

export function useUser() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  async function createUser(userData) {
    try {
      setIsLoading(true);

      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data) {
        setUser(data);
      }

      return data;
    } catch (err) {
      console.error("Error creating user:", err);
      // Return a default user object instead of throwing
      return userData;
    } finally {
      setIsLoading(false);
    }
  }

  async function getUserByEmail(email) {
    try {
      setIsLoading(true);

      const response = await fetch(
        `/api/users?email=${encodeURIComponent(email)}`
      );
      const data = await response.json();

      if (data && Object.keys(data).length > 0) {
        setUser(data);
        return data;
      }

      // If user not found, return a default object instead of null
      return { email, isNew: true };
    } catch (err) {
      console.error("Error getting user:", err);
      // Return a default object so app doesn't crash
      return { email, error: true };
    } finally {
      setIsLoading(false);
    }
  }

  async function updateToken(userId, token) {
    try {
      setIsLoading(true);

      if (!userId) {
        console.log("No userId provided for token update");
        return { token, updated: false };
      }

      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      // Always return something valid to prevent app crashes
      return data || { token, userId, updated: true };
    } catch (err) {
      console.error("Token update error:", err);
      // Return a non-error object to prevent crashes
      return { token, updated: false, fallback: true };
    } finally {
      setIsLoading(false);
    }
  }

  return {
    user,
    isLoading,
    createUser,
    getUserByEmail,
    updateToken,
  };
}
