"use client";

import React, { useState, useEffect } from "react";
import ImageUtils from "../../lib/ImageUtils";
import OptimizedImage from "./OptimizedImage";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";

const ImageGenerator = ({ initialCategory = "abstract" }) => {
  const [category, setCategory] = useState(initialCategory);
  const [selectedImage, setSelectedImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generationMethod, setGenerationMethod] = useState("ai"); // 'ai', 'api', or 'library'
  const [isGenerating, setIsGenerating] = useState(false);

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

  // Load initial images based on selected category
  useEffect(() => {
    loadCategoryImages(category);
  }, [category]);

  // Function to load images for a specific category
  const loadCategoryImages = async (category) => {
    setIsLoading(true);
    setError(null);

    try {
      const imagePromises = [];
      const useAI = generationMethod === "ai";
      const useAPI = generationMethod === "ai" || generationMethod === "api";

      // Request multiple images in parallel with the appropriate method
      for (let i = 0; i < 8; i++) {
        imagePromises.push(
          ImageUtils.getOptimizedImage(category, {
            width: 800,
            height: 600,
            useAPI,
            useAI,
          })
        );
      }

      // Wait for all image requests to complete
      const images = await Promise.all(imagePromises);

      setGalleryImages(images);

      // Select the first image as default if no image is selected
      if (images.length > 0 && !selectedImage) {
        setSelectedImage(images[0]);
      }
    } catch (error) {
      console.error("Error loading images:", error);
      setError("Failed to load images. Using fallback images instead.");

      // Fall back to library images if all methods fail
      const fallbackImages = ImageUtils.getImageSet(category, 8);
      setGalleryImages(fallbackImages);

      if (fallbackImages.length > 0 && !selectedImage) {
        setSelectedImage(fallbackImages[0]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to generate a single image using Stability AI
  const generateAIImage = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Create a descriptive prompt for better results
      const prompt = `High quality professional ${category} image. Photorealistic, detailed, well-lit, 4K resolution.`;

      const generatedImage = await ImageUtils.generateImageWithStabilityAI(
        prompt,
        {
          width: 1024,
          height: 1024,
        }
      );

      // Update selected image and add to gallery if not already there
      setSelectedImage(generatedImage);

      // Add to the beginning of the gallery if it's not a duplicate
      if (!galleryImages.some((img) => img.url === generatedImage.url)) {
        setGalleryImages([generatedImage, ...galleryImages.slice(0, 7)]);
      }

      return generatedImage;
    } catch (error) {
      console.error("Error generating AI image:", error);
      setError("Failed to generate AI image. Using fallback image sources.");

      // Try other methods as fallback
      return selectRandomImage(false);
    } finally {
      setIsGenerating(false);
    }
  };

  // Function to select a random image from the API or library
  const selectRandomImage = async (useAI = true) => {
    setIsLoading(true);
    setError(null);

    try {
      // Try to generate with AI first if requested
      if (useAI && generationMethod === "ai") {
        const aiImage = await generateAIImage();
        return aiImage;
      }

      // If AI is disabled or failed, use getOptimizedImage with appropriate settings
      const randomImage = await ImageUtils.getOptimizedImage(category, {
        width: 800,
        height: 600,
        useAPI: generationMethod !== "library",
        useAI: false, // We already tried AI above if needed
      });

      setSelectedImage(randomImage);

      // Add to gallery if not already there
      if (!galleryImages.some((img) => img.url === randomImage.url)) {
        setGalleryImages([randomImage, ...galleryImages.slice(0, 7)]);
      }

      return randomImage;
    } catch (error) {
      console.error("Error selecting random image:", error);
      setError("Failed to load random image. Using fallback image instead.");

      // Fall back to library as last resort
      const fallbackImage = ImageUtils.getRandomImage(category);
      setSelectedImage(fallbackImage);
      return fallbackImage;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle category change
  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    setSelectedImage(null); // Reset selected image when changing categories
  };

  // Function to change generation method
  const handleMethodChange = (method) => {
    setGenerationMethod(method);
    // Reload images with the new method
    loadCategoryImages(category);
  };

  // Function to retry loading images
  const handleRefresh = () => {
    loadCategoryImages(category);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-bold">Image Generator</h2>

        {/* Category selection */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={category === cat.id ? "default" : "outline"}
              onClick={() => handleCategoryChange(cat.id)}
              className="text-sm"
              disabled={isLoading || isGenerating}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Generation method selection */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => handleMethodChange("ai")}
            variant={generationMethod === "ai" ? "default" : "outline"}
            className="w-full md:w-auto"
            disabled={isLoading || isGenerating}
          >
            Use AI Generation
          </Button>

          <Button
            onClick={() => handleMethodChange("api")}
            variant={generationMethod === "api" ? "default" : "outline"}
            className="w-full md:w-auto"
            disabled={isLoading || isGenerating}
          >
            Use API Images
          </Button>

          <Button
            onClick={() => handleMethodChange("library")}
            variant={generationMethod === "library" ? "default" : "outline"}
            className="w-full md:w-auto"
            disabled={isLoading || isGenerating}
          >
            Use Library Images
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => generateAIImage()}
            className="w-full md:w-auto bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
            disabled={isLoading || isGenerating}
          >
            {isGenerating ? "Generating..." : "Generate AI Image"}
            {isGenerating && (
              <div className="ml-2 animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            )}
          </Button>

          <Button
            onClick={() => selectRandomImage(false)}
            className="w-full md:w-auto"
            disabled={isLoading || isGenerating}
          >
            Get Random Image
          </Button>

          <Button
            onClick={handleRefresh}
            variant="outline"
            className="w-full md:w-auto"
            disabled={isLoading || isGenerating}
          >
            Refresh Gallery
          </Button>
        </div>

        {error && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-yellow-700">
            <p>{error}</p>
          </div>
        )}
      </div>

      <Separator />

      {/* Selected image display */}
      {selectedImage && (
        <div className="space-y-4">
          <h3 className="text-xl font-medium">Selected Image</h3>
          <div className="relative rounded-lg overflow-hidden border border-gray-200 shadow-md">
            <div className="aspect-w-16 aspect-h-9 relative">
              {isLoading ? (
                <Skeleton className="w-full h-full absolute" />
              ) : (
                <OptimizedImage
                  src={selectedImage.url}
                  alt={selectedImage.alt}
                  width={800}
                  height={500}
                  className="object-cover"
                  priority
                />
              )}
            </div>
            <div className="p-4 bg-white">
              <p className="text-sm text-gray-700 font-medium">
                {selectedImage.alt}
              </p>
              {selectedImage.credit && (
                <p className="text-xs text-gray-500 mt-1">
                  Credit: {selectedImage.credit}
                </p>
              )}
              {selectedImage.source && (
                <p className="text-xs text-gray-500 mt-1">
                  Source: {selectedImage.source}
                </p>
              )}
              <div className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                <div className="flex items-center">
                  <span className="font-mono break-all overflow-hidden text-ellipsis max-w-full">
                    {selectedImage.url && selectedImage.url.length > 100
                      ? `${selectedImage.url.substring(0, 100)}...`
                      : selectedImage.url}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-6"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedImage.url);
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Separator />

      {/* Image gallery */}
      <div className="space-y-4">
        <h3 className="text-xl font-medium">Gallery</h3>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="aspect-w-4 aspect-h-3">
                <Skeleton className="w-full h-full" />
              </div>
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
              >
                <OptimizedImage
                  src={image.url}
                  alt={image.alt || `Image ${index + 1}`}
                  width={400}
                  height={300}
                  className="object-cover hover:scale-105 transition-transform duration-200"
                />
                {image.source && (
                  <div className="absolute bottom-0 right-0 bg-black/70 text-white text-xs px-2 py-1 m-1 rounded">
                    {image.source}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;
