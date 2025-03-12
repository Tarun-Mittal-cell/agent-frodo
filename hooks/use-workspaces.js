import { useState, useEffect } from "react";

export function useWorkspaces(userId) {
  const [workspaces, setWorkspaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get all workspaces for a user
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    async function fetchWorkspaces() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/workspaces?userId=${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch workspaces");
        }
        const data = await response.json();
        setWorkspaces(data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching workspaces:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchWorkspaces();
  }, [userId]);

  // Get a single workspace by ID
  async function getWorkspace(workspaceId) {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/workspaces/${workspaceId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch workspace");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      console.error("Error fetching workspace:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  // Create workspace
  async function createWorkspace(data) {
    try {
      setIsLoading(true);

      // Make sure we have a valid userId
      if (!userId) {
        throw new Error("User ID is required to create a workspace");
      }

      // Log what we're sending to help debug
      console.log("Creating workspace with:", {
        ...data,
        user: userId,
      });

      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          user: userId,
        }),
      });

      // Get full error message from response
      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || "Failed to create workspace";
        console.error("Server response:", errorData);
        throw new Error(errorMessage);
      }

      const newWorkspace = await response.json();
      console.log("Workspace created successfully:", newWorkspace);

      setWorkspaces((prev) => [...prev, newWorkspace]);
      return newWorkspace;
    } catch (err) {
      setError(err.message);
      console.error("Workspace creation error:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  // Update messages
  async function updateMessages(workspaceId, messages) {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/workspaces/${workspaceId}/messages`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        throw new Error("Failed to update messages");
      }

      const updatedWorkspace = await response.json();
      setWorkspaces((prev) =>
        prev.map((w) => (w._id === workspaceId ? updatedWorkspace : w))
      );
      return updatedWorkspace;
    } catch (err) {
      setError(err.message);
      console.error("Error updating messages:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  // Update files
  async function updateFiles(workspaceId, files) {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/workspaces/${workspaceId}/files`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ files }),
      });

      if (!response.ok) {
        throw new Error("Failed to update files");
      }

      const updatedWorkspace = await response.json();
      setWorkspaces((prev) =>
        prev.map((w) => (w._id === workspaceId ? updatedWorkspace : w))
      );
      return updatedWorkspace;
    } catch (err) {
      setError(err.message);
      console.error("Error updating files:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  return {
    workspaces,
    isLoading,
    error,
    getWorkspace,
    createWorkspace,
    updateMessages,
    updateFiles,
  };
}
