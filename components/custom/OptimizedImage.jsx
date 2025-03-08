// context/UserDetailContext.jsx
"use client"; // Mark as client-side component for React hooks

import React, { createContext, useState, useEffect, useCallback } from "react"; // Core React imports
import { useQuery, useMutation } from "convex/react"; // Convex hooks for data operations
import { api } from "../../convex/_generated/api"; // Adjusted path based on directory structure
import { toast } from "sonner"; // Notification library for user feedback
import { useAuth } from "../../hooks/useAuth"; // Adjusted path based on directory structure

/**
 * @typedef {Object} UserDetail - Defines the structure of user data
 * @property {string} _id - Unique Convex user ID
 * @property {string} name - User's full name
 * @property {string} email - User's email address
 * @property {string} picture - URL to user's profile picture
 * @property {number} token - User's token balance for app features
 * @property {string} uid - Google OAuth user ID (sub)
 * @property {number} _creationTime - Timestamp of user creation
 */
const UserDetail = {};

/**
 * UserDetailContext provides user management functionality across the app.
 * @type {React.Context<{
 *   userDetail: UserDetail | null,
 *   isLoading: boolean,
 *   setUserDetail: React.Dispatch<React.SetStateAction<UserDetail | null>>,
 *   updateToken: (newToken: number) => Promise<void>,
 *   logout: () => void,
 * }>}
 */
export const UserDetailContext = createContext({
  userDetail: null, // Default user data
  isLoading: false, // Default loading state
  setUserDetail: () => {}, // Default setter function
  updateToken: async () => {}, // Default token update function
  logout: () => {}, // Default logout function
});

/**
 * UserDetailProvider manages user state and Convex interactions.
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @returns {JSX.Element} Provider component
 */
export function UserDetailProvider({ children }) {
  const [userDetail, setUserDetail] = useState(null); // State for user details
  const [isLoading, setIsLoading] = useState(true); // Loading state for UI feedback

  // Retrieve authentication state from useAuth hook
  const { user, loading: authLoading, logout: authLogout } = useAuth();
  const uid = user?.uid || null; // Extract Google UID or null if not authenticated

  // Fetch user data from Convex
  const userData = useQuery(api.users.GetUserByUid, uid ? { uid } : "skip"); // Skip if no UID

  // Mutation to create a new user in Convex if not found
  const createUser = useMutation(api.users.CreateUser);

  // Sync user data and handle new user creation
  useEffect(() => {
    if (authLoading) {
      setIsLoading(true); // Set loading during auth check
    } else if (uid && userData) {
      // User exists in Convex, update local state
      setUserDetail({
        _id: userData._id,
        name: userData.name || "Guest",
        email: userData.email || "",
        picture: userData.picture || "https://via.placeholder.com/35?text=User",
        token: userData.token ?? 50000, // Default token if undefined
        uid: userData.uid,
        _creationTime: userData._creationTime || Date.now(),
      });
      setIsLoading(false);
    } else if (uid && userData === null) {
      // User authenticated but not in Convex, create new user
      const createNewUser = async () => {
        try {
          await createUser({
            name: user.name || "Guest",
            email: user.email || "",
            picture: user.picture || "https://via.placeholder.com/35?text=User",
            uid: uid,
          });
          toast.success("User account created successfully."); // Success feedback
        } catch (error) {
          console.error("Error creating user in Convex:", error);
          toast.error("Failed to initialize user account."); // Error feedback
          setUserDetail({
            _id: "guest",
            name: "Guest",
            email: "",
            picture: "https://via.placeholder.com/35?text=User",
            token: 50000,
            uid: uid || "",
            _creationTime: Date.now(),
          });
          setIsLoading(false);
        }
      };
      createNewUser();
    } else if (!uid) {
      // No authenticated user, clear state
      setUserDetail(null);
      setIsLoading(false);
    }
  }, [uid, userData, authLoading, user, createUser]); // Dependency array for useEffect

  // Mutation to update user token in Convex
  const updateUserToken = useMutation(api.users.UpdateToken);

  // Callback to update token with error handling
  const updateToken = useCallback(
    async (newToken) => {
      if (!userDetail?._id || userDetail._id === "guest") {
        toast.error("No user data available to update tokens.");
        return;
      }
      try {
        await updateUserToken({
          userId: userDetail._id,
          token: newToken,
        });
        setUserDetail((prev) => (prev ? { ...prev, token: newToken } : prev));
        toast.success("Tokens updated successfully.");
      } catch (error) {
        console.error("Error updating token in Convex:", error);
        toast.error("Failed to update tokens. Please try again.");
      }
    },
    [userDetail?._id, updateUserToken]
  );

  // Callback to handle logout
  const logout = useCallback(() => {
    authLogout();
    setUserDetail(null);
    setIsLoading(false);
    toast.info("Logged out successfully.");
  }, [authLogout]);

  // Render the provider with context value
  return (
    <UserDetailContext.Provider
      value={{ userDetail, isLoading, setUserDetail, updateToken, logout }}
    >
      {children}
    </UserDetailContext.Provider>
  );
}
