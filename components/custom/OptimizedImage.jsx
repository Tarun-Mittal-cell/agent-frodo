'use client';

import React from 'react';
import Image from 'next/image';

/**
 * OptimizedImage - A wrapper around Next.js Image component with better defaults
 * 
 * @param {Object} props - Component props
 * @param {string} props.src - Image source URL
 * @param {string} props.alt - Image alt text
 * @param {number} props.width - Image width
 * @param {number} props.height - Image height
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.priority - Whether to prioritize loading
 * @param {string} props.sizes - Responsive size definitions
 * @param {string} props.objectFit - How the image should fit (cover, contain, etc.)
 * @param {string} props.objectPosition - Positioning within container
 * @param {Object} props.style - Additional styles
 * @returns {React.Component} Optimized image component
 */
const OptimizedImage = ({
  src,
  alt = 'Image',
  width = 800,
  height = 600,
  className = '',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  objectFit = 'cover',
  objectPosition = 'center',
  style = {},
  ...rest
}) => {
  // Handle errors by displaying a fallback image
  const [imgSrc, setImgSrc] = React.useState(src);
  const [isError, setIsError] = React.useState(false);

  // Fallback to a reliable placeholder if the image fails to load
  const handleError = () => {
    setIsError(true);
    // Use a reliable placeholder service
    setImgSrc(`https://via.placeholder.com/${width}x${height}?text=Image+Unavailable`);
  };

  // Calculate aspect ratio if both width and height are provided
  const aspectRatio = width && height ? width / height : undefined;

  return (
    <div 
      className={`relative ${className}`}
      style={{ 
        aspectRatio: aspectRatio,
        ...style 
      }}
    >
      <Image
        src={imgSrc}
        alt={alt}
        fill={!width || !height}
        width={width || undefined}
        height={height || undefined}
        priority={priority}
        sizes={sizes}
        onError={handleError}
        className={`${isError ? 'opacity-80' : ''} ${objectFit ? `object-${objectFit}` : ''}`}
        style={{
          objectPosition,
          ...(!fill ? { width: '100%', height: 'auto' } : {})
        }}
        quality={80}
        {...rest}
      />
    </div>
  );
};

export default OptimizedImage;
