"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import ImageUtils from "@/lib/ImageUtils";

/**
 * OptimizedImage - A professional Next.js Image wrapper with bullet-proof reliability
 * - Enhanced error handling with multiple fallbacks
 * - Loading states with smooth transitions
 * - Support for regular images, avatars, and category-based images
 * - Built-in accessibility and performance optimizations
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
  // Consolidated state for image data
  const [imageData, setImageData] = useState({
    src: src || "",
    fallbacks: [],
    currentFallbackIndex: 0,
    isLoading: true,
    isError: false,
    dimensions: { width, height },
  });

  const shouldFill = !width || !height;

  // Initialize image source and fallbacks
  useEffect(() => {
    let isMounted = true;

    const initializeImage = async () => {
      let initialSrc = src;
      let initialFallbacks = [];
      let updatedDimensions = { width, height };

      try {
        if (isAvatar) {
          const name = avatarName || alt || "User";
          const avatarData = ImageUtils.getAvatar(name, { size: width || 200 });
          initialSrc = avatarData.url;
          initialFallbacks = avatarData.fallbacks || [];
          updatedDimensions = {
            width: avatarData.width || 200,
            height: avatarData.height || 200,
          };
        } else if (category) {
          const imageData = await ImageUtils.getOptimizedImage(category, {
            width,
            height,
          });
          initialSrc = imageData.url;
          initialFallbacks = imageData.fallbacks || [
            ImageUtils.getFallbackImage(category).url,
          ];
        } else if (src) {
          initialSrc = src;
          initialFallbacks = fallbackSrc ? [fallbackSrc] : [];
        } else {
          const defaultImage = ImageUtils.getFallbackImage("default");
          initialSrc = defaultImage.url;
          initialFallbacks = [defaultImage.url];
        }

        // Add robust generic fallbacks
        initialFallbacks.push(
          `https://ui-avatars.com/api/?name=${encodeURIComponent(alt)}&size=256&background=random`,
          `https://picsum.photos/${width || 800}/${height || 600}?random=${Math.random()}`,
          `https://via.placeholder.com/${width || 800}x${height || 600}?text=${encodeURIComponent(alt)}`,
          "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" // Transparent pixel
        );
      } catch (error) {
        console.error("Error initializing image:", error);
        initialSrc =
          "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
        initialFallbacks = [];
      }

      if (isMounted) {
        setImageData({
          src: initialSrc,
          fallbacks: initialFallbacks,
          currentFallbackIndex: 0,
          isLoading: true,
          isError: false,
          dimensions: updatedDimensions,
        });
      }
    };

    initializeImage();

    return () => {
      isMounted = false;
    };
  }, [src, isAvatar, avatarName, alt, category, fallbackSrc, width, height]);

  // Handle successful image load
  const handleLoadingComplete = () => {
    setImageData((prev) => ({ ...prev, isLoading: false }));
  };

  // Handle image loading error with cascading fallbacks
  const handleError = () => {
    setImageData((prev) => {
      const nextIndex = prev.currentFallbackIndex + 1;
      if (nextIndex < prev.fallbacks.length) {
        return {
          ...prev,
          src: prev.fallbacks[nextIndex],
          currentFallbackIndex: nextIndex,
          isError: true,
        };
      }
      return {
        ...prev,
        src: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
        isError: true,
        isLoading: false,
      };
    });
  };

  // Calculate aspect ratio for responsive layout
  const aspectRatio =
    imageData.dimensions.width && imageData.dimensions.height
      ? imageData.dimensions.width / imageData.dimensions.height
      : undefined;

  // Build image classes dynamically
  const imageClasses = [
    imageData.isError ? "opacity-80" : "",
    `object-${objectFit}`,
    imageData.isLoading
      ? "opacity-0"
      : "opacity-100 transition-opacity duration-300",
    isAvatar ? "rounded-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={`relative overflow-hidden ${shouldFill ? "w-full h-full" : ""}`}
      style={{
        aspectRatio,
        ...style,
      }}
    >
      {/* Loading indicator */}
      {imageData.isLoading && showLoadingIndicator && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 bg-opacity-50 dark:bg-opacity-50">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      )}

      {/* Next.js Image component */}
      <Image
        src={imageData.src}
        alt={alt}
        fill={shouldFill}
        width={shouldFill ? undefined : imageData.dimensions.width}
        height={shouldFill ? undefined : imageData.dimensions.height}
        priority={priority}
        sizes={sizes}
        onLoadingComplete={handleLoadingComplete}
        onError={handleError}
        className={imageClasses}
        style={{
          objectPosition,
          ...(imageData.isError &&
          imageData.currentFallbackIndex >= imageData.fallbacks.length
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
