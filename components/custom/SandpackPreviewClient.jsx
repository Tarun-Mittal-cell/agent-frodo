"use client";
import React, { useContext, useEffect, useRef, useState } from "react";
import { SandpackPreview, useSandpack } from "@codesandbox/sandpack-react";
import { ActionContext } from "@/context/ActionContext";

/**
 * SandpackPreviewClient
 * A production-ready component that renders a Sandpack preview with enhancements:
 * - Ensures full visibility of the preview content
 * - Injects scripts to fix broken image references and adjust iframe height
 * - Handles "deploy" or "export" actions from ActionContext
 * - Includes retry logic with exponential backoff for initialization
 * - Provides accessibility features and detailed error logging
 */
function SandpackPreviewClient() {
  const previewRef = useRef(null);
  const { sandpack } = useSandpack();
  const { action, setAction } = useContext(ActionContext);
  const [isReady, setIsReady] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Initialize Sandpack client with retry logic
  useEffect(() => {
    let mounted = true;
    let readyTimeout;

    const initializeSandpackClient = async () => {
      if (!previewRef.current) return;

      // Exponential backoff for retries (2s, 4s, 8s)
      const delay = Math.min(2000 * Math.pow(2, retryCount), 8000);
      readyTimeout = setTimeout(() => {
        if (mounted) {
          if (retryCount < maxRetries) {
            console.log(
              `Retrying Sandpack initialization (Attempt ${retryCount + 1}/${maxRetries})...`
            );
            setRetryCount((prev) => prev + 1);
            if (previewRef.current) {
              try {
                const client = previewRef.current.getClient();
                client.refresh();
              } catch (e) {
                console.warn("Could not refresh client:", e);
              }
            }
          } else {
            console.log("Max retries reached, setting as ready anyway");
            setIsReady(true);
          }
        }
      }, delay);

      try {
        const client = previewRef.current.getClient();

        if (client) {
          console.log("Sandpack client initialized successfully");
          clearTimeout(readyTimeout);

          if (client.iframe) {
            client.iframe.addEventListener("load", () => {
              console.log("Sandpack iframe fully loaded");
              if (mounted) setIsReady(true);
              injectImageFixScript(client);
            });
          }

          // Fallback to ensure readiness
          setTimeout(() => {
            if (mounted && !isReady) setIsReady(true);
          }, 1000);

          if (action?.actionType) {
            handleAction(client);
          }
        }
      } catch (error) {
        console.error(
          "Error initializing Sandpack client:",
          error.message,
          error.stack
        );
        if (retryCount >= maxRetries && mounted) {
          setIsReady(true);
        }
      }
    };

    if (sandpack) {
      initializeSandpackClient();
    }

    return () => {
      mounted = false;
      clearTimeout(readyTimeout);
    };
  }, [sandpack, action, retryCount, isReady]);

  /**
   * Injects a script into the Sandpack iframe to:
   * - Fix broken image references
   * - Adjust iframe height dynamically
   * - Ensure full content visibility
   */
  const injectImageFixScript = (client) => {
    try {
      if (!client.iframe?.contentDocument) {
        console.warn(
          "Iframe or contentDocument unavailable for script injection"
        );
        return;
      }

      const script = client.iframe.contentDocument.createElement("script");
      script.textContent = `
        (function() {
          console.log("Enhanced preview fixer initialized");

          // Adjust iframe height dynamically
          function adjustFrameHeight() {
            try {
              const body = document.body;
              const html = document.documentElement;
              const height = Math.max(
                body.scrollHeight, body.offsetHeight,
                html.clientHeight, html.scrollHeight, html.offsetHeight
              );
              if (height > window.innerHeight) {
                window.parent.postMessage(
                  { type: "resize", height: height + 50 },
                  window.location.origin
                );
              }
              document.body.style.minHeight = "100vh";
              document.documentElement.style.minHeight = "100vh";
              document.body.style.overflow = "auto";
            } catch (err) {
              console.warn("Height adjustment error:", err);
            }
          }

          // Debounced height adjustment
          let debounceTimeout;
          function debouncedAdjustFrameHeight() {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(adjustFrameHeight, 100);
          }

          // Run height adjustment on load and DOM changes
          window.addEventListener("load", adjustFrameHeight);
          setTimeout(adjustFrameHeight, 1000);
          const observer = new MutationObserver(debouncedAdjustFrameHeight);
          observer.observe(document.documentElement, { childList: true, subtree: true });

          // Fix broken <img> elements
          function tryFixImageSrc(img) {
            if (img.dataset.fixAttempts) return;
            img.dataset.fixAttempts = "1";
            const originalSrc = img.src;
            const fileName = originalSrc.split("/").pop();
            const altPaths = [
              "images/" + fileName,
              "/images/" + fileName,
              "./images/" + fileName,
              "assets/" + fileName,
              "/assets/" + fileName,
              "./assets/" + fileName,
              "img/" + fileName,
              "/img/" + fileName,
              "./img/" + fileName,
            ];
            console.log("Broken image:", originalSrc, "trying alt paths");
            let idx = 0;
            function next() {
              if (idx >= altPaths.length) {
                img.src = "https://via.placeholder.com/300x200?text=Image";
                return;
              }
              const candidate = altPaths[idx++];
              img.onerror = next;
              img.src = candidate;
            }
            next();
          }

          // Listen for <img> errors
          document.addEventListener("error", (e) => {
            if (e.target.tagName === "IMG") tryFixImageSrc(e.target);
          }, true);

          // Check existing images
          setTimeout(() => {
            document.querySelectorAll("img").forEach((img) => {
              if (!img.complete || img.naturalHeight === 0) tryFixImageSrc(img);
            });
          }, 500);

          // Fix CSS background images
          function fixCSSBackgrounds() {
            try {
              for (const sheet of document.styleSheets) {
                try {
                  const rules = sheet?.cssRules || sheet?.rules;
                  if (!rules) continue;
                  for (const rule of rules) {
                    if (rule.style?.backgroundImage?.includes("/images/")) {
                      const original = rule.style.backgroundImage;
                      rule.style.backgroundImage = original.replace("/images/", "images/");
                    }
                  }
                } catch (e) {
                  console.warn("Could not access CSS rules:", e);
                }
              }
            } catch (err) {
              console.warn("CSS fix error:", err);
            }
          }
          fixCSSBackgrounds();
          setTimeout(() => {
            fixCSSBackgrounds();
            adjustFrameHeight();
          }, 2000);

          console.log("Enhanced preview fixer complete");
        })();
      `;
      client.iframe.contentDocument.head.appendChild(script);
      console.log("Enhanced preview fix script injected");
    } catch (err) {
      console.error(
        "Error injecting preview fix script:",
        err.message,
        err.stack
      );
    }
  };

  /**
   * Handles "deploy" or "export" actions from ActionContext
   */
  const handleAction = async (client) => {
    try {
      if (action.actionType === "deploy" || action.actionType === "export") {
        console.log(`Handling ${action.actionType} action...`);
        const result = await client.getCodeSandboxURL();
        console.log("CodeSandbox URL result:", result);

        if (action.actionType === "deploy" && result?.sandboxId) {
          window.open(`https://${result.sandboxId}.csb.app/`, "_blank");
        } else if (action.actionType === "export" && result?.editorUrl) {
          window.open(result.editorUrl, "_blank");
        } else {
          console.warn("Missing required data in result:", result);
        }
      }
    } catch (error) {
      console.error("Error handling action:", error.message, error.stack);
    } finally {
      setAction(null);
    }
  };

  // Listen for resize messages from the iframe
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === "resize" && previewRef.current) {
        try {
          const container = previewRef.current.closest(".sp-preview-container");
          if (container) {
            container.style.height = `${event.data.height}px`;
          }
        } catch (e) {
          console.warn("Could not resize container:", e);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div className="relative w-full h-full">
      <SandpackPreview
        ref={previewRef}
        style={{
          height: "calc(100vh - 200px)",
          minHeight: "600px",
          width: "100%",
        }}
        showNavigator={true}
        showOpenInCodeSandbox={true}
        showRefreshButton={true}
      />
      {!isReady && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 bg-opacity-70 z-10"
          role="status"
          aria-label="Loading Sandpack preview"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4" />
          <p className="text-white text-sm">
            {retryCount > 0
              ? `Loading preview... (Attempt ${retryCount}/${maxRetries})`
              : "Loading preview..."}
          </p>
        </div>
      )}
    </div>
  );
}

export default SandpackPreviewClient;
