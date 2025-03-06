"use client";

import { useState, useCallback } from "react";
import { Toaster } from "sonner";
import AutonomousControls from "../../components/custom/AutonomousControls";

export default function AgentPage() {
  const [apiKey, setApiKey] = useState("");
  const [isKeyEntered, setIsKeyEntered] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmitApiKey = useCallback(
    (e) => {
      e.preventDefault();
      if (!apiKey.trim()) {
        return;
      }
      setIsKeyEntered(true);
    },
    [apiKey]
  );

  const handleResult = useCallback((resultData) => {
    setResult(resultData);
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      <Toaster position="top-right" />
      <h1 className="text-3xl font-bold mb-8 text-center">
        Frodo Autonomous Agent
      </h1>

      {!isKeyEntered ? (
        <div className="max-w-md mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden p-6">
          <h2 className="text-xl font-bold mb-4">Enter Your Claude API Key</h2>
          <form onSubmit={handleSubmitApiKey}>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
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
            Your API key is stored in memory only and never sent to our servers.
            You need a Claude API key with access to the computer use API and
            claude-3-5-sonnet-20241022 model.
          </p>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <AutonomousControls apiKey={apiKey} onResult={handleResult} />

          {result && result.files && result.files.length > 0 && (
            <div className="mt-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Generated Files</h2>
                <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg overflow-x-auto">
                  <ul className="space-y-2">
                    {result.files.map((file, index) => (
                      <li key={index} className="flex items-start">
                        <span className="font-mono text-sm">{file.path}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
