"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

/**
 * OptimizedImage component
 * A robust image component that handles different image formats including
 * base64 encoded images from Stability AI, regular URLs, and fallback scenarios
 */
const OptimizedImage = ({
  src,
  alt,
  width = 400,
  height = 300,
  className = "",
  priority = false,
  onLoad,
  onError,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState("");
  const [fallbackAttempts, setFallbackAttempts] = useState(0);
  const maxFallbackAttempts = 3;

  const fallbackImages = [
    "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg",
    "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg",
    "https://images.pexels.com/photos/1209843/pexels-photo-1209843.jpeg",
  ];

  useEffect(() => {
    // Reset state when src changes
    setIsLoading(true);
    setHasError(false);
    setFallbackAttempts(0);
    setImageSrc(src);
  }, [src]);

  // Handle successful image load
  const handleImageLoad = (e) => {
    setIsLoading(false);
    if (onLoad) onLoad(e);
  };

  // Handle image loading error
  const handleImageError = (e) => {
    console.warn("Image loading error:", src);

    if (fallbackAttempts < maxFallbackAttempts) {
      // Try a fallback image
      const nextFallbackImage =
        fallbackImages[fallbackAttempts % fallbackImages.length];
      console.log(
        `Trying fallback image #${fallbackAttempts + 1}:`,
        nextFallbackImage
      );

      setFallbackAttempts((prev) => prev + 1);
      setImageSrc(nextFallbackImage);
    } else {
      setIsLoading(false);
      setHasError(true);
      if (onError) onError(e);
    }
  };

  // Determine if we should use Next.js Image component or regular img tag
  const useNextImage = !(
    src &&
    (src.startsWith("data:") || // For base64 images
      (typeof src === "string" && src.length > 5000)) // Large strings are likely inline base64
  );

  // For base64 or very long URLs, Image component may not be optimal
  if (!useNextImage) {
    return (
      <div
        className={`relative overflow-hidden ${className}`}
        style={{ width, height }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-50 z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
          </div>
        )}

        {hasError ? (
          <div className="flex items-center justify-center w-full h-full bg-gray-200 text-gray-500">
            <div className="text-center">
              <svg
                className="w-10 h-10 mx-auto text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="mt-2 text-sm">
                {alt || "Image could not be loaded"}
              </p>
            </div>
          </div>
        ) : (
          <img
            src={imageSrc}
            alt={alt || "Image"}
            className={`w-full h-full object-cover ${className}`}
            width={width}
            height={height}
            loading={priority ? "eager" : "lazy"}
            onLoad={handleImageLoad}
            onError={handleImageError}
            {...props}
          />
        )}
      </div>
    );
  }

  // For regular images, use Next.js Image component
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-50 z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
        </div>
      )}

      {hasError ? (
        <div className="flex items-center justify-center w-full h-full bg-gray-200 text-gray-500">
          <div className="text-center">
            <svg
              className="w-10 h-10 mx-auto text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="mt-2 text-sm">{alt || "Image could not be loaded"}</p>
          </div>
        </div>
      ) : (
        <Image
          src={imageSrc}
          alt={alt || "Image"}
          width={width}
          height={height}
          className={`object-cover ${className}`}
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          onLoad={handleImageLoad}
          onError={handleImageError}
          unoptimized={
            imageSrc.startsWith("data:") || imageSrc.includes("randomuser.me")
          }
          {...props}
        />
      )}
    </div>
  );
};

export default OptimizedImage;
