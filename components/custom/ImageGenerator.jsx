"use client";

import React, { useState, useEffect, useCallback } from "react";
import ImageUtils from "../../lib/ImageUtils";
import OptimizedImage from "./OptimizedImage";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { toast } from "sonner";

// Cache to store images by category, reducing redundant API calls
const imageCache = {};

const ImageGenerator = ({ initialCategory = "abstract" }) => {
  const [category, setCategory] = useState(initialCategory);
  const [selectedImage, setSelectedImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Define all available categories
  const categories = [
    { id: "abstract", label: "Abstract" },
    { id: "architecture", label: "Architecture" },
    { id: "backgrounds", label: "Backgrounds" },
    { id: "business", label: "Business" },
    { id: "digitalArt", label: "Digital Art" },
    { id: "food", label: "Food" },
    { id: "nature", label: "Nature" },
    { id: "people", label: "People" },
    { id: "products", label: "Products" },
    { id: "tech", label: "Technology" },
    { id: "threeD", label: "3D" },
    { id: "travel", label: "Travel" },
  ];

  // Load images for a category with caching
  const loadCategoryImages = useCallback(
    async (cat) => {
      setIsLoading(true);
      try {
        if (imageCache[cat]) {
          // Use cached images if available
          setGalleryImages(imageCache[cat]);
          if (imageCache[cat].length > 0 && !selectedImage) {
            setSelectedImage(imageCache[cat][0]);
          }
        } else {
          // Fetch 8 images from the API
          const images = await Promise.all(
            Array.from({ length: 8 }, () => ImageUtils.getOptimizedImage(cat))
          );
          imageCache[cat] = images; // Cache the results
          setGalleryImages(images);
          if (images.length > 0 && !selectedImage) {
            setSelectedImage(images[0]);
          }
        }
      } catch (error) {
        console.error("Error loading images from API:", error);
        toast.error("Failed to load images from API. Using fallback images.");
        // Fallback to local library
        const fallbackImages = ImageUtils.getImageSet(cat, 8);
        setGalleryImages(fallbackImages);
        if (fallbackImages.length > 0 && !selectedImage) {
          setSelectedImage(fallbackImages[0]);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [selectedImage]
  );

  // Select a random image from the current category
  const selectRandomImage = async () => {
    setIsLoading(true);
    try {
      const randomImage = await ImageUtils.getOptimizedImage(category);
      setSelectedImage(randomImage);
    } catch (error) {
      console.error("Error selecting random image from API:", error);
      toast.error("Failed to load random image. Using fallback.");
      const fallbackImage = ImageUtils.getRandomImage(category);
      setSelectedImage(fallbackImage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle category change
  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    setSelectedImage(null); // Reset selected image on category change
  };

  // Load images when category changes
  useEffect(() => {
    loadCategoryImages(category);
  }, [category, loadCategoryImages]);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-bold">Image Generator</h2>

        {/* Category Buttons */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={category === cat.id ? "default" : "outline"}
              onClick={() => handleCategoryChange(cat.id)}
              className="text-sm"
              aria-label={`Select ${cat.label} category`}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        <Button onClick={selectRandomImage} className="w-full md:w-auto">
          Generate Random Image
        </Button>
      </div>

      <Separator />

      {/* Selected Image Display */}
      {selectedImage && (
        <div className="space-y-4">
          <h3 className="text-xl font-medium">Selected Image</h3>
          <div className="relative rounded-lg overflow-hidden border border-gray-200 shadow-md">
            <div className="aspect-w-16 aspect-h-9 relative">
              <OptimizedImage
                src={selectedImage.url}
                alt={selectedImage.alt}
                width={800}
                height={500}
                className="object-cover"
                priority
              />
            </div>
            <div className="p-4 bg-white">
              <p className="text-sm text-gray-700 font-medium">
                {selectedImage.alt}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Aspect Ratio: {selectedImage.aspectRatio}
              </p>
              <code className="block mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                {selectedImage.url}
              </code>
            </div>
          </div>
        </div>
      )}

      <Separator />

      {/* Image Gallery */}
      <div className="space-y-4">
        <h3 className="text-xl font-medium">Gallery</h3>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, index) => (
              <div
                key={index}
                className="aspect-w-4 aspect-h-3 bg-gray-200 animate-pulse rounded-lg"
                aria-label="Loading image placeholder"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {galleryImages.map((image, index) => (
              <div
                key={index}
                className={`aspect-w-4 aspect-h-3 relative rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                  selectedImage && selectedImage.url === image.url
                    ? "border-blue-500 shadow-lg scale-[1.02] z-10"
                    : "border-transparent hover:border-gray-300"
                }`}
                onClick={() => setSelectedImage(image)}
                onKeyPress={(e) => e.key === "Enter" && setSelectedImage(image)}
                role="button"
                tabIndex={0}
                aria-label={`Select image: ${image.alt}`}
              >
                <OptimizedImage
                  src={image.url}
                  alt={image.alt}
                  width={400}
                  height={300}
                  className="object-cover hover:scale-105 transition-transform duration-200"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;
