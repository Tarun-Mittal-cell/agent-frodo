import React, { createContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

/**
 * @typedef {Object} Message
 * @property {string} role - The role of the message (e.g., "user", "ai")
 * @property {string} content - The message text or content
 * @property {string} [imageBase64] - Optional base64-encoded image data
 * @property {string} [imageAlt] - Optional alt text for the image
 */

/**
 * MessagesContext provides a centralized state for managing chat messages,
 * including support for image generation and error handling.
 * @type {React.Context<{
 *   messages: Message[],
 *   isLoading: boolean,
 *   addMessage: (message: Message) => void,
 *   setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
 *   generateImage: (prompt: string) => Promise<void>,
 * }>}
 */
export const MessagesContext = createContext({
  messages: [],
  isLoading: false,
  addMessage: () => {},
  setMessages: () => {},
  generateImage: async () => {},
});

/**
 * MessagesProvider wraps the app or components to provide message state.
 * @param {Object} props
 * @param {React.ReactNode} props.children - The child components
 */
export function MessagesProvider({ children }) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch initial messages (e.g., from an API or local storage)
  useEffect(() => {
    const initializeMessages = async () => {
      try {
        // Example: Fetch initial messages from a Convex API
        // Replace with your actual data source
        // const initialMessages = await yourDataSource.getMessages();
        // setMessages(initialMessages || []);
      } catch (error) {
        console.error("Error initializing messages:", error);
        toast.error("Failed to load initial messages.");
      }
    };
    initializeMessages();
  }, []);

  // Add a new message to the context
  const addMessage = useCallback((message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  // Generate an image using the generate-image API
  const generateImage = useCallback(
    async (prompt) => {
      if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
        toast.error("Please provide a valid prompt for image generation.");
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: prompt.trim() }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.imageBase64) {
          addMessage({
            role: "ai",
            content: "Generated image for your prompt:",
            imageBase64: data.imageBase64,
            imageAlt: `Generated image for ${prompt}`,
          });
        } else {
          throw new Error("No image data received");
        }
      } catch (error) {
        console.error("Error generating image:", error.message, error.stack);
        toast.error("Failed to generate image. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [addMessage]
  );

  return (
    <MessagesContext.Provider
      value={{ messages, isLoading, addMessage, setMessages, generateImage }}
    >
      {children}
    </MessagesContext.Provider>
  );
}
