import { useState } from 'react';

export function useUser() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to get user by email (like GetUser in Convex)
  async function getUserByEmail(email) {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/users?email=${encodeURIComponent(email)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      const data = await response.json();
      setUser(data);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  // Function to get user by UID (like GetUserByUid in Convex)
  async function getUserByUid(uid) {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/users?uid=${encodeURIComponent(uid)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      const data = await response.json();
      setUser(data);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  // Function to create user (like CreateUser in Convex)
  async function createUser(userData) {
    try {
      setIsLoading(true);
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create user');
      }
      
      const newUser = await response.json();
      if (newUser) {
        setUser(newUser);
      }
      return newUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  // Function to update user token (like UpdateToken in Convex)
  async function updateToken(userId, token) {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update token');
      }
      
      const updatedUser = await response.json();
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  return { 
    user, 
    isLoading, 
    error, 
    getUserByEmail, 
    getUserByUid,
    createUser,
    updateToken
  };
}
