"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import ImageUtils from "@/lib/ImageUtils";

/**
 * OptimizedImage - A professional Next.js Image wrapper with bullet-proof reliability
 * - Enhanced error handling with multiple fallbacks
 * - Loading states and smooth transitions
 * - Support for multiple image sources
 * - Built-in avatar support
 */
const OptimizedImage = ({
  src,
  alt = "Image",
  width,
  height,
  className = "",
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  objectFit = "cover",
  objectPosition = "center",
  style = {},
  isAvatar = false,
  avatarName = "",
  category = "",
  fallbackSrc,
  showLoadingIndicator = true,
  quality = 80,
  ...rest
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [fallbacks, setFallbacks] = useState([]);
  const [currentFallbackIndex, setCurrentFallbackIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [dimensions, setDimensions] = useState({ width, height });
  const shouldFill = !width || !height;

  // Initialize image source and fallbacks
  useEffect(() => {
    // For avatars, use the avatar generator utility
    if (isAvatar) {
      const name = avatarName || alt || "User";
      const avatarData = ImageUtils.getAvatar(name, { size: width || 200 });
      setImgSrc(avatarData.url);
      setFallbacks(avatarData.fallbacks || []);
      setDimensions({
        width: avatarData.width || 200,
        height: avatarData.height || 200,
      });
      return;
    }

    // Regular images
    if (src) {
      setImgSrc(src);

      // Set up fallbacks
      const newFallbacks = [];

      // Custom fallback is top priority
      if (fallbackSrc) {
        newFallbacks.push(fallbackSrc);
      }

      // If we have a category, add fallbacks from our library
      if (category) {
        const fallbackImage = ImageUtils.getFallbackImage(category);
        newFallbacks.push(fallbackImage.url);
      }

      // Add generic reliable fallbacks
      newFallbacks.push(
        `https://ui-avatars.com/api/?name=${encodeURIComponent(alt)}&size=256&background=random`,
        `https://picsum.photos/${width || 800}/${height || 600}?random=${Math.random()}`,
        `https://via.placeholder.com/${width || 800}x${height || 600}?text=${encodeURIComponent(alt)}`
      );

      setFallbacks(newFallbacks);
    }
  }, [src, isAvatar, avatarName, alt, category, fallbackSrc, width, height]);

  // Handle loading complete
  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  // Handle image loading error with cascading fallbacks
  const handleError = () => {
    // Mark current source as errored
    setIsError(true);
    setIsLoading(false);

    // Try the next fallback if available
    if (currentFallbackIndex < fallbacks.length) {
      setImgSrc(fallbacks[currentFallbackIndex]);
      setCurrentFallbackIndex(currentFallbackIndex + 1);
    }
  };

  // Calculate aspect ratio for the container if both dimensions provided
  const aspectRatio =
    dimensions.width && dimensions.height
      ? dimensions.width / dimensions.height
      : undefined;

  // Build image classes intelligently
  const imageClasses = [
    isError ? "opacity-80" : "",
    objectFit === "cover"
      ? "object-cover"
      : objectFit === "contain"
        ? "object-contain"
        : objectFit === "fill"
          ? "object-fill"
          : objectFit === "none"
            ? "object-none"
            : objectFit === "scale-down"
              ? "object-scale-down"
              : "",
    isLoading ? "opacity-0" : "opacity-100 transition-opacity duration-300",
    isAvatar ? "rounded-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={`relative overflow-hidden ${shouldFill ? "w-full h-full" : ""}`}
      style={{
        aspectRatio: aspectRatio,
        ...style,
      }}
    >
      {/* Loading indicator */}
      {isLoading && showLoadingIndicator && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 bg-opacity-50 dark:bg-opacity-50">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      )}

      {/* NextJS Image with proper props */}
      <Image
        src={imgSrc}
        alt={alt}
        fill={shouldFill}
        width={shouldFill ? undefined : dimensions.width}
        height={shouldFill ? undefined : dimensions.height}
        priority={priority}
        sizes={sizes}
        onLoadingComplete={handleLoadingComplete}
        onError={handleError}
        className={imageClasses}
        style={{
          objectPosition,
          ...(isError && currentFallbackIndex >= fallbacks.length
            ? { filter: "grayscale(0.5)" }
            : {}),
        }}
        quality={quality}
        loading={priority ? "eager" : "lazy"}
        {...rest}
      />
    </div>
  );
};

export default OptimizedImage;
