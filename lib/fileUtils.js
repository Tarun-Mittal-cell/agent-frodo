/**
 * Utility functions for handling files and AI processing
 */

// Process file with appropriate AI model based on file type
export const processFileWithAI = async (
  fileUrl,
  fileType,
  customPrompt = ""
) => {
  if (fileType.startsWith("image/")) {
    return await processImageWithAI(fileUrl, customPrompt);
  } else if (fileType.startsWith("audio/")) {
    return await processAudioWithAI(fileUrl);
  } else if (
    fileType.startsWith("text/") ||
    fileType === "application/pdf" ||
    fileType.includes("document")
  ) {
    return await processDocumentWithAI(fileUrl, customPrompt);
  } else {
    throw new Error(`Unsupported file type: ${fileType}`);
  }
};

// Process image with AI
export const processImageWithAI = async (imageUrl, customPrompt = "") => {
  try {
    // Default prompt for image analysis
    const prompt =
      customPrompt ||
      "Describe and analyze what you see in this image in detail.";

    // Using Anthropic API for image analysis
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/ai-vision`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl,
          prompt,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return {
      analysis: data.analysis,
      model: data.model,
      processedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error processing image with AI:", error);
    throw error;
  }
};

// Process audio with AI (transcription)
export const processAudioWithAI = async (audioUrl) => {
  try {
    // Call your audio transcription API endpoint
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/transcribe`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          audioUrl,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return {
      transcription: data.text,
      model: data.model,
      processedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error processing audio with AI:", error);
    throw error;
  }
};

// Process document with AI
export const processDocumentWithAI = async (documentUrl, customPrompt = "") => {
  try {
    // Default prompt for document analysis
    const prompt = customPrompt || "Analyze and summarize this document.";

    // Call your document analysis API endpoint
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/analyze-document`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentUrl,
          prompt,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return {
      analysis: data.analysis,
      summary: data.summary,
      model: data.model,
      processedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error processing document with AI:", error);
    throw error;
  }
};

// Generate image with AI
export const generateImageWithAI = async (prompt) => {
  try {
    // Call your image generation API endpoint
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/generate-image`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return {
      imageUrl: data.imageUrl,
      model: data.model,
      processedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error generating image with AI:", error);
    throw error;
  }
};

// Helper function to convert base64 to Blob
export const base64ToBlob = (base64, mimeType) => {
  const byteCharacters = atob(base64.split(",")[1]);
  const byteArrays = [];

  for (let i = 0; i < byteCharacters.length; i += 512) {
    const slice = byteCharacters.slice(i, i + 512);
    const byteNumbers = new Array(slice.length);

    for (let j = 0; j < slice.length; j++) {
      byteNumbers[j] = slice.charCodeAt(j);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: mimeType });
};

// Format file size for display
export const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + " B";
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  else return (bytes / 1048576).toFixed(1) + " MB";
};

// Get file icon type
export const getFileTypeInfo = (fileType) => {
  if (fileType.startsWith("image/")) {
    return {
      type: "image",
      icon: "ImageIcon",
      color: "#3B82F6", // blue
    };
  } else if (fileType.startsWith("audio/")) {
    return {
      type: "audio",
      icon: "Mic",
      color: "#10B981", // green
    };
  } else if (fileType.startsWith("video/")) {
    return {
      type: "video",
      icon: "Film",
      color: "#EC4899", // pink
    };
  } else if (
    fileType.startsWith("text/") ||
    fileType === "application/pdf" ||
    fileType.includes("document")
  ) {
    return {
      type: "document",
      icon: "FileText",
      color: "#F59E0B", // amber
    };
  } else {
    return {
      type: "file",
      icon: "File",
      color: "#6B7280", // gray
    };
  }
};
