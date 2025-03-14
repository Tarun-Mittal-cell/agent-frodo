// components/custom/CodePreview.jsx
import { useEffect, useRef } from "react";
import Prism from "prismjs";

// Import language support
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-css";
import "prismjs/components/prism-scss";
import "prismjs/components/prism-markup"; // HTML
import "prismjs/components/prism-json";
import "prismjs/components/prism-markdown";

// Import theme
import "prismjs/themes/prism.css";

export default function CodePreview({
  code,
  language = "javascript",
  isStreaming = false,
}) {
  const codeRef = useRef(null);

  // Highlight code when it changes
  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code, language]);

  // Handle scrolling to bottom when streaming
  useEffect(() => {
    if (isStreaming && codeRef.current) {
      const parentElement = codeRef.current.parentElement;
      if (parentElement) {
        parentElement.scrollTop = parentElement.scrollHeight;
      }
    }
  }, [code, isStreaming]);

  // Map language to Prism syntax
  const getPrismLanguage = (lang) => {
    const languageMap = {
      javascript: "javascript",
      typescript: "typescript",
      jsx: "jsx",
      tsx: "tsx",
      css: "css",
      scss: "scss",
      html: "markup",
      json: "json",
      markdown: "markdown",
      plaintext: "plaintext",
    };

    return languageMap[lang] || "plaintext";
  };

  return (
    <pre
      className={`p-4 m-0 h-full overflow-auto text-sm ${isStreaming ? "streaming" : ""}`}
    >
      <code ref={codeRef} className={`language-${getPrismLanguage(language)}`}>
        {code || ""}
      </code>

      {isStreaming && (
        <span className="cursor inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse"></span>
      )}
    </pre>
  );
}
