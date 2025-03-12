"use client";
import { createContext, useState } from "react";

// Create and export the context
export const ActionContext = createContext({
  action: null,
  setAction: () => {},
  isGenerating: false,
  setIsGenerating: () => {},
});

// Create a provider component for easier usage
export function ActionProvider({ children }) {
  const [action, setAction] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  return (
    <ActionContext.Provider
      value={{ action, setAction, isGenerating, setIsGenerating }}
    >
      {children}
    </ActionContext.Provider>
  );
}
