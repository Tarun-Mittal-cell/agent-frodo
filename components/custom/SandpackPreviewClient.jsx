"use client";
import React, { useContext, useEffect, useRef, useState } from "react";
import { SandpackPreview, useSandpack } from "@codesandbox/sandpack-react";
import { ActionContext } from "@/context/ActionContext";

/**
 * SandpackPreviewClient
 * - Enhanced version that ensures full preview visibility
 * - Initializes the Sandpack client and injects image fix scripts
 * - Handles "deploy" or "export" actions from ActionContext
 */
function SandpackPreviewClient() {
  const previewRef = useRef(null);
  const { sandpack } = useSandpack();
  const { action, setAction } = useContext(ActionContext);
  const [isReady, setIsReady] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    let mounted = true;
    let readyTimeout;

    const initializeSandpackClient = async () => {
      if (!previewRef.current) return;

      // Use a timeout in case the preview doesn't become ready quickly
      readyTimeout = setTimeout(() => {
        if (mounted) {
          if (retryCount < maxRetries) {
            console.log(
              `Retrying Sandpack initialization (${retryCount + 1}/${maxRetries})...`
            );
            setRetryCount((prev) => prev + 1);
            // Force refresh the iframe
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
      }, 2000);

      try {
        const client = previewRef.current.getClient();

        if (client) {
          console.log("Sandpack client initialized successfully");
          clearTimeout(readyTimeout);

          // Listen for iframe load event to ensure content is fully rendered
          if (client.iframe) {
            client.iframe.addEventListener("load", () => {
              console.log("Sandpack iframe fully loaded");
              if (mounted) setIsReady(true);

              // Inject scripts after iframe is fully loaded
              injectImageFixScript(client);
            });
          }

          // Set ready after a short delay if load event doesn't fire
          setTimeout(() => {
            if (mounted && !isReady) setIsReady(true);
          }, 1000);

          // If there's an action (deploy/export), handle it
          if (action?.actionType) {
            handleAction(client);
          }
        }
      } catch (error) {
        console.error("Error initializing Sandpack client:", error);
        if (retryCount >= maxRetries && mounted) {
          setIsReady(true);
        }
      }
    };

    // Initialize client whenever sandpack or action changes
    if (sandpack) {
      initializeSandpackClient();
    }

    return () => {
      mounted = false;
      clearTimeout(readyTimeout);
    };
  }, [sandpack, action, retryCount, isReady]);

  /**
   * Injects a script into the Sandpack iframe to fix broken image references
   * and ensure all content is properly displayed
   */
  const injectImageFixScript = (client) => {
    try {
      if (client.iframe?.contentDocument) {
        const script = client.iframe.contentDocument.createElement("script");
        script.textContent = `
          (function() {
            console.log("Enhanced preview fixer initialized");

            // Force iframe to take full height
            function adjustFrameHeight() {
              try {
                const body = document.body;
                const html = document.documentElement;
                
                // Get the maximum height of the content
                const height = Math.max(
                  body.scrollHeight, body.offsetHeight,
                  html.clientHeight, html.scrollHeight, html.offsetHeight
                );
                
                // Send message to parent to resize if needed
                if (height > window.innerHeight) {
                  window.parent.postMessage({ type: 'resize', height: height + 50 }, '*');
                }
                
                // Make sure all content is visible
                document.body.style.minHeight = '100vh';
                document.documentElement.style.minHeight = '100vh';
                document.body.style.overflow = 'auto';
              } catch (err) {
                console.warn("Height adjustment error:", err);
              }
            }
            
            // Run height adjustment after load and after any DOM changes
            window.addEventListener('load', adjustFrameHeight);
            setTimeout(adjustFrameHeight, 1000);
            
            // Create observer to watch for DOM changes
            const observer = new MutationObserver(function(mutations) {
              setTimeout(adjustFrameHeight, 100);
            });
            
            // Observe the entire document for changes
            observer.observe(document.documentElement, {
              childList: true,
              subtree: true
            });

            // Attempt to fix <img> elements whose src fails to load
            function tryFixImageSrc(img) {
              if (img.dataset.fixAttempts) return;
              img.dataset.fixAttempts = "1";

              const originalSrc = img.src;
              const fileName = originalSrc.split("/").pop();
              
              // Different path combinations to try
              const altPaths = [
                "images/" + fileName,
                "/images/" + fileName,
                "./images/" + fileName,
                "assets/" + fileName,
                "/assets/" + fileName,
                "./assets/" + fileName,
                "img/" + fileName,
                "/img/" + fileName,
                "./img/" + fileName
              ];

              console.log("Broken image:", originalSrc, "trying alt paths");
              let idx = 0;
              function next() {
                if (idx >= altPaths.length) {
                  // If all attempts fail, try a placeholder
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
              if (e.target.tagName === "IMG") {
                tryFixImageSrc(e.target);
              }
            }, true);

            // Find all existing images and check if they need fixing
            setTimeout(() => {
              document.querySelectorAll('img').forEach(img => {
                if (!img.complete || img.naturalHeight === 0) {
                  tryFixImageSrc(img);
                }
              });
            }, 500);

            // Fix CSS backgrounds
            function fixCSSBackgrounds() {
              try {
                for (const sheet of document.styleSheets) {
                  try {
                    const rules = sheet?.cssRules || sheet?.rules;
                    if (!rules) continue;

                    for (const rule of rules) {
                      if (rule.style?.backgroundImage?.includes("/images/")) {
                        const original = rule.style.backgroundImage;
                        // Try different path variations
                        rule.style.backgroundImage = original.replace("/images/", "images/");
                      }
                    }
                  } catch (e) {
                    // CORS errors can happen when accessing cssRules
                    console.warn("Could not access CSS rules:", e);
                  }
                }
              } catch (err) {
                console.warn("CSS fix error:", err);
              }
            }
            fixCSSBackgrounds();
            
            // Run fixes again after a short delay to catch late-loading content
            setTimeout(() => {
              fixCSSBackgrounds();
              adjustFrameHeight();
            }, 2000);

            console.log("Enhanced preview fixer complete");
          })();
        `;
        client.iframe.contentDocument.head.appendChild(script);
        console.log("Enhanced preview fix script injected");
      }
    } catch (err) {
      console.error("Error injecting preview fix script:", err);
    }
  };

  /**
   * Handle "deploy" or "export" actions from ActionContext
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
      console.error("Error handling action:", error);
    } finally {
      // Reset action after we attempt it
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
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 bg-opacity-70 z-10">
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
