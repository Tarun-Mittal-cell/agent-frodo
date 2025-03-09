"use client";

import { useState } from "react";

export default function ApiKeyInput({ setApiKey }) {
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [isKeyEntered, setIsKeyEntered] = useState(false);

  const handleSubmitApiKey = async (e) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) {
      alert("Please enter a valid API key");
      return;
    }
    try {
      setApiKey(apiKeyInput);
      setIsKeyEntered(true);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden p-6 mb-8">
      {!isKeyEntered ? (
        <>
          <h2 className="text-xl font-bold mb-4">
            Enter Your Claude API Key (Optional)
          </h2>
          <form onSubmit={handleSubmitApiKey}>
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg mb-4"
              placeholder="sk-ant-api03-..."
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Set API Key
            </button>
          </form>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Your API key is stored securely and never logged. Leave blank to use
            the default from .env.local.
          </p>
        </>
      ) : (
        <p className="text-green-600 dark:text-green-400">
          API Key set successfully!
        </p>
      )}
    </div>
  );
}
