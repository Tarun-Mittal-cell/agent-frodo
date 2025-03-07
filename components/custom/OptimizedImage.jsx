"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Loader2, ImageOff } from "lucide-react";

/**
 * Enhanced OptimizedImage component
 *
 * A bulletproof image component with:
 * - Progressive loading with blur-up effect
 * - Multiple fallback strategies
 * - Advanced error handling
 * - Lazy loading with intersection observer
 * - Smooth transitions and animations
 * - Support for all image formats including base64
 */
const OptimizedImage = ({
  src,
  alt,
  width = 400,
  height = 300,
  className = "",
  priority = false,
  objectFit = "cover",
  quality = 80,
  placeholder = "blur",
  blurSize = 10,
  fallbackImages = [
    "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg",
    "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg",
    "https://images.pexels.com/photos/1209843/pexels-photo-1209843.jpeg",
    "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?q=80&w=1000",
    "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1000",
  ],
  onLoad,
  onError,
  effect = "fade", // 'fade', 'zoom', 'blur', 'slide'
  hoverEffect = "", // '', 'zoom', 'brighten', 'saturate'
  useIntersectionObserver = true,
  preloadLowQuality = true,
  ...props
}) => {
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState("");
  const [lowResSrc, setLowResSrc] = useState("");
  const [isVisible, setIsVisible] = useState(!useIntersectionObserver);
  const [fallbackAttempts, setFallbackAttempts] = useState(0);
  const [showBlur, setShowBlur] = useState(placeholder === "blur");

  // Refs
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const checkIntervalRef = useRef(null);
  const maxFallbackAttempts = fallbackImages.length + 1;

  // Effect to setup visibility observer and image source
  useEffect(() => {
    // Reset state when src changes
    setIsLoading(true);
    setHasError(false);
    setFallbackAttempts(0);
    setShowBlur(placeholder === "blur");
    setImageSrc(normalizeImageSrc(src));

    // Generate a lower quality version for blur up effect
    if (preloadLowQuality && isValidUrl(src) && !src.startsWith("data:")) {
      generateLowQualitySrc(src);
    }

    // Setup intersection observer for lazy loading
    if (
      useIntersectionObserver &&
      !priority &&
      typeof window !== "undefined" &&
      "IntersectionObserver" in window
    ) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setIsVisible(true);
            if (containerRef.current) {
              observer.unobserve(containerRef.current);
            }
          }
        },
        {
          rootMargin: "200px 0px",
          threshold: 0.01,
        }
      );

      if (containerRef.current) {
        observer.observe(containerRef.current);
      }

      return () => {
        if (containerRef.current) {
          observer.unobserve(containerRef.current);
        }
      };
    }
  }, [src, placeholder, priority, useIntersectionObserver, preloadLowQuality]);

  // Effect to check image status periodically
  useEffect(() => {
    if (isVisible && imageSrc && !isLoading && !hasError) {
      // Clear any existing interval
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }

      // Check again in 2 seconds to make sure the image is still good
      // This helps catch issues where image rendering fails silently
      checkIntervalRef.current = setTimeout(() => {
        if (imageRef.current) {
          const img = imageRef.current;
          if (img.naturalWidth === 0 || img.naturalHeight === 0) {
            console.warn(
              "Image appears to have loaded but has no dimensions:",
              imageSrc
            );
            handleImageError(new Error("Image has zero dimensions"));
          }
        }
      }, 2000);
    }

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [isVisible, imageSrc, isLoading, hasError]);

  // Generate a low-quality placeholder for the blur-up effect
  const generateLowQualitySrc = (originalSrc) => {
    if (!isValidUrl(originalSrc)) return;

    // For remote images, use a resized version
    const url = new URL(originalSrc);

    // If it's an image from a known provider, use their resizing capabilities
    if (url.hostname.includes("unsplash.com")) {
      setLowResSrc(`${originalSrc.split("?")[0]}?q=10&w=${blurSize}`);
    } else if (url.hostname.includes("pexels.com")) {
      setLowResSrc(`${originalSrc.split("?")[0]}?dpr=1&h=${blurSize}&q=10`);
    } else if (url.hostname.includes("images.weserv.nl")) {
      setLowResSrc(`${originalSrc}&h=${blurSize}&q=10`);
    } else {
      // For other images, use a simple small placeholder
      setLowResSrc(
        `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"%3E%3Crect width="${width}" height="${height}" fill="%23cccccc" /%3E%3C/svg%3E`
      );
    }
  };

  // Normalize image source - ensure it's a valid URL or use placeholders for invalid ones
  const normalizeImageSrc = (src) => {
    if (!src) {
      return getPlaceholderImage();
    }

    // If it's a base64 image or data URL, return it directly
    if (
      typeof src === "string" &&
      (src.startsWith("data:") || src.length > 1000)
    ) {
      return src;
    }

    // If it starts with a slash but not double slash, it's likely a local path
    if (
      typeof src === "string" &&
      src.startsWith("/") &&
      !src.startsWith("//")
    ) {
      return src;
    }

    // Check if it's a valid URL
    if (isValidUrl(src)) {
      return src;
    }

    // If all else fails, return placeholder
    return getPlaceholderImage();
  };

  // Check if a string is a valid URL
  const isValidUrl = (str) => {
    if (!str || typeof str !== "string") return false;

    try {
      const url = new URL(str);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (e) {
      return false;
    }
  };

  // Get a placeholder image when needed
  const getPlaceholderImage = () => {
    // Randomly pick from fallback images
    return fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
  };

  // Handle successful image load
  const handleImageLoad = (e) => {
    setIsLoading(false);
    setShowBlur(false);
    if (onLoad) onLoad(e);
  };

  // Handle image loading error
  const handleImageError = (e) => {
    console.warn(`Image loading error for: ${imageSrc}`, e);

    if (fallbackAttempts < maxFallbackAttempts) {
      // Try next fallback image or generate a new placeholder
      let nextImage;

      if (fallbackAttempts < fallbackImages.length) {
        nextImage = fallbackImages[fallbackAttempts];
      } else {
        // As a last resort, try a generated SVG placeholder
        nextImage = `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"%3E%3Crect width="${width}" height="${height}" fill="%23333333" /%3E%3Ctext x="${width / 2}" y="${height / 2}" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%23ffffff"%3E${alt || "Image"}%3C/text%3E%3C/svg%3E`;
      }

      console.log(`Trying fallback image #${fallbackAttempts + 1}:`, nextImage);

      setFallbackAttempts((prev) => prev + 1);
      setImageSrc(nextImage);
      setIsLoading(true); // Reset loading state for the new image
    } else {
      // All fallbacks failed
      setIsLoading(false);
      setHasError(true);
      if (onError) onError(e);
    }
  };

  // Generate CSS classes based on effects
  const getEffectClasses = () => {
    const classes = [];

    // Loading state and transition effects
    if (isLoading) {
      classes.push("opacity-0");
    } else {
      classes.push("opacity-100");

      // Apply loading effect
      if (effect === "fade") {
        classes.push("transition-opacity duration-500 ease-in-out");
      } else if (effect === "zoom") {
        classes.push("transition-all duration-700 ease-out");
      } else if (effect === "blur") {
        classes.push("transition-all duration-500 ease-out");
      } else if (effect === "slide") {
        classes.push("transition-all duration-500 ease-out");
      }
    }

    // Hover effects
    if (hoverEffect === "zoom") {
      classes.push("hover:scale-110 transition-transform duration-300");
    } else if (hoverEffect === "brighten") {
      classes.push("hover:brightness-110 transition-all duration-300");
    } else if (hoverEffect === "saturate") {
      classes.push("hover:saturate-150 transition-all duration-300");
    }

    return classes.join(" ");
  };

  // Define images styles based on objectFit
  const imageStyles = {
    objectFit,
    ...(showBlur ? { filter: "blur(20px)" } : {}),
  };

  // For base64 or data URLs, use regular img tag
  if (
    imageSrc &&
    (imageSrc.startsWith("data:") ||
      (typeof imageSrc === "string" && imageSrc.length > 5000))
  ) {
    return (
      <div
        ref={containerRef}
        className={`relative overflow-hidden ${className}`}
        style={{ width, height }}
      >
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200/20 backdrop-blur-sm z-10 transition-opacity duration-300">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error fallback */}
        {hasError ? (
          <div className="flex items-center justify-center w-full h-full bg-gray-100 dark:bg-gray-800 text-gray-500">
            <div className="text-center">
              <ImageOff className="w-10 h-10 mx-auto text-gray-400" />
              <p className="mt-2 text-sm">
                {alt || "Image could not be loaded"}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Low-res placeholder for blur-up effect */}
            {lowResSrc && showBlur && (
              <img
                src={lowResSrc}
                alt=""
                className="absolute inset-0 w-full h-full object-cover blur-lg scale-110 opacity-70 transition-opacity duration-300"
                aria-hidden="true"
              />
            )}

            {/* Main image */}
            {isVisible && (
              <img
                ref={imageRef}
                src={imageSrc}
                alt={alt || "Image"}
                className={`w-full h-full ${getEffectClasses()}`}
                width={width}
                height={height}
                style={imageStyles}
                loading={priority ? "eager" : "lazy"}
                onLoad={handleImageLoad}
                onError={handleImageError}
                {...props}
              />
            )}
          </>
        )}
      </div>
    );
  }

  // For regular remote images, use Next.js Image component
  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200/20 backdrop-blur-sm z-10 transition-opacity duration-300">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Error fallback */}
      {hasError ? (
        <div className="flex items-center justify-center w-full h-full bg-gray-100 dark:bg-gray-800 text-gray-500">
          <div className="text-center">
            <ImageOff className="w-10 h-10 mx-auto text-gray-400" />
            <p className="mt-2 text-sm">{alt || "Image could not be loaded"}</p>
          </div>
        </div>
      ) : (
        <>
          {/* Low-res placeholder for blur-up effect */}
          {lowResSrc && showBlur && (
            <img
              src={lowResSrc}
              alt=""
              className="absolute inset-0 w-full h-full object-cover blur-lg scale-110 opacity-70 transition-opacity duration-300"
              aria-hidden="true"
            />
          )}

          {/* Main image */}
          {isVisible && (
            <Image
              ref={imageRef}
              src={imageSrc}
              alt={alt || "Image"}
              width={width}
              height={height}
              className={`object-cover ${getEffectClasses()}`}
              priority={priority}
              quality={quality}
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={imageStyles}
              unoptimized={
                imageSrc.startsWith("data:") ||
                imageSrc.includes("randomuser.me") ||
                !isValidUrl(imageSrc)
              }
              {...props}
            />
          )}
        </>
      )}
    </div>
  );
};

export default OptimizedImage;
