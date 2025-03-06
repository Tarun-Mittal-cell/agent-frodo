// lib/ImageUtils.js
// Comprehensive image utility solution to fix all image loading issues

import axios from "axios";

// Existing library as a fallback to ensure reliability
const IMAGE_LIBRARY = {
  // People and portraits
  people: [
    {
      url: "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg",
      alt: "Professional team working together",
      aspectRatio: "16:9",
    },
    {
      url: "https://images.pexels.com/photos/3182746/pexels-photo-3182746.jpeg",
      alt: "Person working with laptop",
      aspectRatio: "16:9",
    },
    {
      url: "https://images.pexels.com/photos/3184328/pexels-photo-3184328.jpeg",
      alt: "Team discussing project together",
      aspectRatio: "16:9",
    },
    {
      url: "https://images.pexels.com/photos/3182743/pexels-photo-3182743.jpeg",
      alt: "Business professional",
      aspectRatio: "16:9",
    },
  ],

  // Food and dining
  food: [
    {
      url: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg",
      alt: "Delicious meal with fresh ingredients",
      aspectRatio: "3:2",
    },
    {
      url: "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg",
      alt: "Gourmet dining plate",
      aspectRatio: "3:2",
    },
    {
      url: "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg",
      alt: "Healthy food bowl with vegetables",
      aspectRatio: "3:2",
    },
    {
      url: "https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg",
      alt: "Fresh ingredients for cooking",
      aspectRatio: "3:2",
    },
  ],

  // Tech and business
  tech: [
    {
      url: "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg",
      alt: "Modern technology workspace",
      aspectRatio: "16:9",
    },
    {
      url: "https://images.pexels.com/photos/1181275/pexels-photo-1181275.jpeg",
      alt: "Laptop and notebook on desk",
      aspectRatio: "16:9",
    },
    {
      url: "https://images.pexels.com/photos/5473301/pexels-photo-5473301.jpeg",
      alt: "Modern technology devices",
      aspectRatio: "16:9",
    },
    {
      url: "https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg",
      alt: "Business technology concept",
      aspectRatio: "16:9",
    },
  ],

  // Food delivery specific
  foodDelivery: [
    {
      url: "https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg",
      alt: "Food delivery ready meal",
      aspectRatio: "3:2",
    },
    {
      url: "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg",
      alt: "Gourmet meal delivery",
      aspectRatio: "3:2",
    },
    {
      url: "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg",
      alt: "Fresh delivered meal",
      aspectRatio: "3:2",
    },
    {
      url: "https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg",
      alt: "Food delivery ingredients",
      aspectRatio: "3:2",
    },
  ],

  // Abstract and backgrounds
  abstract: [
    {
      url: "https://images.pexels.com/photos/2310713/pexels-photo-2310713.jpeg",
      alt: "Abstract background design",
      aspectRatio: "16:9",
    },
    {
      url: "https://images.pexels.com/photos/1209843/pexels-photo-1209843.jpeg",
      alt: "Abstract art background",
      aspectRatio: "16:9",
    },
    {
      url: "https://images.pexels.com/photos/3109807/pexels-photo-3109807.jpeg",
      alt: "Colorful abstract pattern",
      aspectRatio: "16:9",
    },
    {
      url: "https://images.pexels.com/photos/2693212/pexels-photo-2693212.png",
      alt: "Modern abstract design",
      aspectRatio: "16:9",
    },
  ],

  // Fitness and gym
  fitness: [
    {
      url: "https://images.pexels.com/photos/2261485/pexels-photo-2261485.jpeg",
      alt: "Modern gym with equipment",
      aspectRatio: "16:9",
    },
    {
      url: "https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg",
      alt: "Person working out in gym",
      aspectRatio: "16:9",
    },
    {
      url: "https://images.pexels.com/photos/2247179/pexels-photo-2247179.jpeg",
      alt: "Running track in gym",
      aspectRatio: "16:9",
    },
    {
      url: "https://images.pexels.com/photos/4162451/pexels-photo-4162451.jpeg",
      alt: "Fitness workout class",
      aspectRatio: "16:9",
    },
  ],

  // Fallback category for any purpose
  default: [
    {
      url: "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg",
      alt: "Default image for display",
      aspectRatio: "16:9",
    },
    {
      url: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg",
      alt: "Default food image",
      aspectRatio: "3:2",
    },
    {
      url: "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg",
      alt: "Default people image",
      aspectRatio: "16:9",
    },
    {
      url: "https://images.pexels.com/photos/1209843/pexels-photo-1209843.jpeg",
      alt: "Default abstract background",
      aspectRatio: "16:9",
    },
  ],
};

// Cache successful image URLs to avoid repeated API calls
const imageCache = {
  unsplash: {},
  pexels: {},
  pixabay: {},
  avatars: {},
};

/**
 * Core Image Utilities - Optimized for production use with your APIs
 */
const ImageUtils = {
  // API keys loaded from environment variables
  UNSPLASH_ACCESS_KEY:
    process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY ||
    "6t-w6HN2jFWSlFr3lsj8_LyTqAn0WfnsaG2iVieersk",
  PEXELS_API_KEY:
    process.env.NEXT_PUBLIC_PEXELS_API_KEY ||
    "AdBOVsYUXDyeCDHfGkkDiZeFSrPspf1b5X4tsZS8GygU9vnVffSWzwOV",
  PIXABAY_API_KEY:
    process.env.NEXT_PUBLIC_PIXABAY_API_KEY ||
    "49203385-b41a0f017478a3369f5e85015",

  /**
   * Get a random image from a specific category with fallback
   * Maintained for backward compatibility with existing components
   */
  getRandomImage: (category = "default") => {
    try {
      const categoryImages = IMAGE_LIBRARY[category] || IMAGE_LIBRARY.default;
      return categoryImages[Math.floor(Math.random() * categoryImages.length)];
    } catch (error) {
      console.error(`Error getting random image for ${category}:`, error);
      // Return first default image as ultimate fallback
      return IMAGE_LIBRARY.default[0];
    }
  },

  /**
   * Get a specific image by index from a category with fallback
   * Maintained for backward compatibility
   */
  getImageByIndex: (category, index) => {
    try {
      const categoryImages = IMAGE_LIBRARY[category] || IMAGE_LIBRARY.default;
      const safeIndex = Math.min(Math.max(0, index), categoryImages.length - 1);
      return categoryImages[safeIndex];
    } catch (error) {
      console.error(`Error getting image by index for ${category}:`, error);
      return IMAGE_LIBRARY.default[0];
    }
  },

  /**
   * Get a set of images for a specific category
   * Maintained for backward compatibility
   */
  getImageSet: (category, count = 4) => {
    try {
      const categoryImages = IMAGE_LIBRARY[category] || IMAGE_LIBRARY.default;
      const shuffled = [...categoryImages].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, Math.min(count, categoryImages.length));
    } catch (error) {
      console.error(`Error getting image set for ${category}:`, error);
      return IMAGE_LIBRARY.default.slice(0, count);
    }
  },

  /**
   * Create image component JSX with proper attributes and optimization
   * Maintained for backward compatibility
   */
  createImageJSX: (image, className = "", width = 400, height = 300) => {
    try {
      // Default to first default image if image is invalid
      const safeImage = image || IMAGE_LIBRARY.default[0];
      const { url, alt, aspectRatio } = safeImage;

      // Set appropriate dimensions based on aspect ratio
      let imgWidth = width;
      let imgHeight = height;

      if (aspectRatio) {
        const [w, h] = aspectRatio.split(":").map(Number);
        imgHeight = Math.round(imgWidth * (h / w));
      }

      // Add quality and format parameters for optimization
      const optimizedUrl = url.includes("?")
        ? `${url}&q=80&auto=format`
        : `${url}?q=80&auto=format`;

      return `<img 
          src="${optimizedUrl}" 
          alt="${alt}" 
          width="${imgWidth}" 
          height="${imgHeight}" 
          className="${className}" 
          loading="lazy"
          decoding="async"
          onError="this.onerror=null; this.src='https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg';"
        />`;
    } catch (error) {
      console.error("Error creating image JSX:", error);
      // Return a failsafe image tag with error handling
      return `<img 
          src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg" 
          alt="Image" 
          width="${width}" 
          height="${height}" 
          className="${className}" 
          loading="lazy"
          decoding="async"
        />`;
    }
  },

  /**
   * Create a responsive hero image component with advanced effects
   * Maintained for backward compatibility
   */
  createHeroImage: (category = "food") => {
    try {
      const image = ImageUtils.getRandomImage(category);

      return `<div className="relative w-full h-[50vh] overflow-hidden">
          <img 
            src="${image.url}?q=80&auto=format" 
            alt="${image.alt}" 
            className="w-full h-full object-cover transform scale-[1.02] motion-safe:animate-subtle-zoom" 
            loading="eager"
            fetchpriority="high"
            decoding="async"
            onError="this.onerror=null; this.src='https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg';"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
          <div className="absolute inset-0 bg-blue-500/10 mix-blend-overlay"></div>
        </div>`;
    } catch (error) {
      console.error("Error creating hero image:", error);
      // Return a failsafe hero component
      return `<div className="relative w-full h-[50vh] overflow-hidden">
          <img 
            src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg" 
            alt="Hero image" 
            className="w-full h-full object-cover" 
            loading="eager"
            fetchpriority="high"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        </div>`;
    }
  },

  /**
   * Create a responsive 3D hero image with parallax effect
   * Maintained for backward compatibility
   */
  create3DHeroImage: (category = "food") => {
    try {
      const image = ImageUtils.getRandomImage(category || "food");

      return `<div className="relative w-full h-[60vh] overflow-hidden perspective-[1000px] group">
          <div className="absolute inset-0 transform group-hover:scale-105 transition-transform duration-700 ease-out">
            <img 
              src="${image.url}?q=80&auto=format" 
              alt="${image.alt}" 
              className="w-full h-full object-cover brightness-[1.05] contrast-[1.02]" 
              loading="eager"
              fetchpriority="high"
              decoding="async"
              onError="this.onerror=null; this.src='https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg';"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            <div className="absolute inset-0 bg-blue-600/10 mix-blend-overlay"></div>
          </div>
        </div>`;
    } catch (error) {
      console.error("Error creating 3D hero image:", error);
      // Return a failsafe hero component
      return `<div className="relative w-full h-[60vh] overflow-hidden">
          <img 
            src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg" 
            alt="Hero image" 
            className="w-full h-full object-cover" 
            loading="eager"
            fetchpriority="high"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        </div>`;
    }
  },

  /**
   * Create a gallery of images with advanced hover effects
   * Maintained for backward compatibility
   */
  createImageGallery: (category = "food", count = 4) => {
    try {
      const images = ImageUtils.getImageSet(category, count);

      return `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(count, 4)} gap-4 my-8">
          ${images
            .map(
              (
                image,
                index
              ) => `<div className="group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 relative">
            <img 
              src="${image.url}?q=80&auto=format" 
              alt="${image.alt}" 
              className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
              loading="lazy"
              decoding="async"
              onError="this.onerror=null; this.src='https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg';"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-[${50 * index}ms]">
              <h3 className="text-lg font-semibold">${image.alt.split(" ").slice(0, 3).join(" ")}</h3>
              <p className="text-sm text-white/80">View details</p>
            </div>
          </div>`
            )
            .join("\n  ")}
        </div>`;
    } catch (error) {
      console.error("Error creating image gallery:", error);
      // Return a failsafe gallery with default images
      return `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 my-8">
          ${IMAGE_LIBRARY.default
            .slice(0, 2)
            .map(
              (image) => `<div className="overflow-hidden rounded-lg shadow-md">
            <img 
              src="${image.url}" 
              alt="${image.alt}" 
              className="w-full h-64 object-cover" 
              loading="lazy"
              decoding="async"
            />
          </div>`
            )
            .join("\n  ")}
        </div>`;
    }
  },

  /**
   * Replace placeholder URLs in code with working images
   * Maintained for backward compatibility
   */
  replacePlaceholderUrls: (code) => {
    if (!code) return code;

    try {
      // Replace common placeholder patterns
      let updatedCode = code;

      // Replace placeholder.com URLs
      updatedCode = updatedCode.replace(
        /https?:\/\/via\.placeholder\.com\/\d+x\d+/g,
        () => `${ImageUtils.getRandomImage("default").url}?q=80&auto=format`
      );

      // Replace other common placeholder services
      updatedCode = updatedCode.replace(
        /https?:\/\/(placeimg\.com|placeholder\.pics|placekitten\.com|loremflickr\.com|dummyimage\.com|placecage\.com|baconmockup\.com|placebear\.com|placepuppy\.it)\/\d+\/\d+/g,
        () => `${ImageUtils.getRandomImage("default").url}?q=80&auto=format`
      );

      // Replace archive.org placeholder
      updatedCode = updatedCode.replace(
        /https:\/\/archive\.org\/download\/placeholder-image\/placeholder-image\.jpg/g,
        `${ImageUtils.getRandomImage("default").url}?q=80&auto=format`
      );

      // Replace unsplash random URLs with specific ones to prevent rate limiting
      updatedCode = updatedCode.replace(
        /https:\/\/source\.unsplash\.com\/random\/\d+x\d+/g,
        () => `${ImageUtils.getRandomImage("default").url}?q=80&auto=format`
      );

      // Add error handling to all img tags
      updatedCode = updatedCode.replace(
        /<img([^>]*)\s+src=(['"])([^'"]+)\2([^>]*)>/g,
        (match, before, quote, src, after) => {
          // Skip if there's already an error handler
          if (match.includes("onerror=")) {
            return match;
          }
          return `<img${before} src=${quote}${src}${quote} onerror="this.onerror=null; this.src='https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg';"${after}>`;
        }
      );

      // Add loading="lazy" and decoding="async" to all img tags that don't have them
      updatedCode = updatedCode.replace(
        /<img([^>]*)(?!loading=)([^>]*)>/g,
        '<img$1 loading="lazy"$2>'
      );

      updatedCode = updatedCode.replace(
        /<img([^>]*)(?!decoding=)([^>]*)>/g,
        '<img$1 decoding="async"$2>'
      );

      // Add alt text to all img tags that don't have it
      updatedCode = updatedCode.replace(
        /<img([^>]*)(?!alt=)([^>]*)>/g,
        '<img$1 alt="Image"$2>'
      );

      // Add fetchpriority="high" to the first image in the document (likely the hero)
      const firstImgMatch = updatedCode.match(/<img([^>]*)>/);
      if (firstImgMatch && !firstImgMatch[0].includes("fetchpriority")) {
        updatedCode = updatedCode.replace(
          firstImgMatch[0],
          firstImgMatch[0].replace("<img", '<img fetchpriority="high"')
        );
      }

      return updatedCode;
    } catch (error) {
      console.error("Error replacing placeholder URLs:", error);
      return code; // Return original code if replacement fails
    }
  },

  /**
   * Fetch a verified image from Unsplash API
   * @param {string} query - Search term
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Image data object
   */
  async fetchUnsplashImage(query = "business", options = {}) {
    const { width = 800, height = 600 } = options;
    const cacheKey = `${query}-${width}x${height}`;

    // Check cache first
    if (imageCache.unsplash[cacheKey]) {
      return imageCache.unsplash[cacheKey];
    }

    try {
      // Use the search API for more control and to avoid rate limits
      const response = await axios.get(
        `https://api.unsplash.com/search/photos`,
        {
          params: {
            query,
            per_page: 1,
            orientation: width > height ? "landscape" : "portrait",
          },
          headers: {
            Authorization: `Client-ID ${this.UNSPLASH_ACCESS_KEY}`,
          },
        }
      );

      if (response.data.results && response.data.results.length > 0) {
        const imageData = {
          url: response.data.results[0].urls.regular,
          alt: response.data.results[0].alt_description || `${query} image`,
          width: response.data.results[0].width,
          height: response.data.results[0].height,
          credit: response.data.results[0].user.name,
          source: "unsplash",
        };

        // Cache the result
        imageCache.unsplash[cacheKey] = imageData;
        return imageData;
      }
    } catch (error) {
      console.error("Error fetching from Unsplash:", error);
    }

    // Use fallback from library
    return this.getFallbackImage(query);
  },

  /**
   * Fetch a verified image from Pexels API
   * @param {string} query - Search term
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Image data object
   */
  async fetchPexelsImage(query = "business", options = {}) {
    const { width = 800, height = 600 } = options;
    const cacheKey = `${query}-${width}x${height}`;

    // Check cache first
    if (imageCache.pexels[cacheKey]) {
      return imageCache.pexels[cacheKey];
    }

    try {
      const response = await axios.get(`https://api.pexels.com/v1/search`, {
        params: {
          query,
          per_page: 1,
          size: "medium",
        },
        headers: {
          Authorization: this.PEXELS_API_KEY,
        },
      });

      if (response.data.photos && response.data.photos.length > 0) {
        const photo = response.data.photos[0];
        const imageData = {
          url: photo.src.large,
          alt: `${query} image from Pexels`,
          width: photo.width,
          height: photo.height,
          credit: photo.photographer,
          source: "pexels",
        };

        // Cache the result
        imageCache.pexels[cacheKey] = imageData;
        return imageData;
      }
    } catch (error) {
      console.error("Error fetching from Pexels:", error);
    }

    // If Pexels fails, try Unsplash next, then fall back to library
    try {
      return await this.fetchUnsplashImage(query, options);
    } catch {
      return this.getFallbackImage(query);
    }
  },

  /**
   * Generate a reliable avatar URL that always works
   * @param {string} name - Person's name
   * @param {Object} options - Avatar options
   * @returns {Object} Avatar image data
   */
  getAvatar(name = "User", options = {}) {
    const { size = 200, variant = "beam", bgColor = "4f46e5" } = options;
    const cacheKey = `${name}-${size}-${variant}`;

    // Return from cache if available
    if (imageCache.avatars[cacheKey]) {
      return imageCache.avatars[cacheKey];
    }

    // Create multiple fallback options
    const avatarOptions = [
      // UI Avatars - most reliable
      {
        url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=${size}&background=${bgColor}&color=ffffff&bold=true`,
        alt: `Avatar for ${name}`,
        width: size,
        height: size,
        source: "ui-avatars",
      },
      // Boring Avatars - good design
      {
        url: `https://source.boringavatars.com/${variant}/${size}/${encodeURIComponent(name)}?colors=264653,2a9d8f,e9c46a,f4a261,e76f51`,
        alt: `Avatar for ${name}`,
        width: size,
        height: size,
        source: "boring-avatars",
      },
      // Random User API - fallback for realistic avatars
      {
        url: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? "men" : "women"}/${Math.floor(Math.random() * 99)}.jpg`,
        alt: `Avatar for ${name}`,
        width: size,
        height: size,
        source: "randomuser",
      },
    ];

    // Store in cache
    imageCache.avatars[cacheKey] = avatarOptions[0];

    // Return the primary option with fallbacks
    return {
      ...avatarOptions[0],
      fallbacks: [avatarOptions[1].url, avatarOptions[2].url],
    };
  },

  /**
   * Get a reliable and optimized image for any purpose using active API calls when needed
   * @param {string} category - The type of image needed
   * @param {Object} options - Configuration options
   * @returns {Promise<Object>} Image data with fallbacks
   */
  async getOptimizedImage(category = "business", options = {}) {
    const { width = 800, height = 600, useAPI = true } = options;

    // If APIs are enabled, try fetching fresh images
    if (useAPI) {
      try {
        // Alternate between Pexels and Unsplash to avoid rate limits
        const randomChoice = Math.random();

        if (randomChoice < 0.5) {
          return await this.fetchPexelsImage(category, options);
        } else {
          return await this.fetchUnsplashImage(category, options);
        }
      } catch (error) {
        console.error("Error fetching optimized image:", error);
        // Fall back to library if APIs fail
      }
    }

    // Use the static library as fallback
    return this.getFallbackImage(category);
  },

  /**
   * Get a fallback image from our reliable library
   * @param {string} category - Image category
   * @returns {Object} Image data
   */
  getFallbackImage(category) {
    let categoryKey = category;

    // Map search terms to our library categories
    const categoryMap = {
      business: "people",
      team: "people",
      person: "people",
      profile: "people",
      work: "people",
      office: "people",
      professional: "people",
      meal: "food",
      restaurant: "food",
      dining: "food",
      recipe: "food",
      cooking: "food",
      computer: "tech",
      digital: "tech",
      device: "tech",
      software: "tech",
      app: "tech",
      delivery: "foodDelivery",
      order: "foodDelivery",
      gym: "fitness",
      workout: "fitness",
      fitness: "fitness",
      exercise: "fitness",
    };

    // Try to match the category to our library
    if (categoryMap[category.toLowerCase()]) {
      categoryKey = categoryMap[category.toLowerCase()];
    } else if (!IMAGE_LIBRARY[category]) {
      categoryKey = "default";
    }

    // Get a random image from the appropriate category
    const categoryImages = IMAGE_LIBRARY[categoryKey] || IMAGE_LIBRARY.default;
    const randomImage =
      categoryImages[Math.floor(Math.random() * categoryImages.length)];

    return {
      ...randomImage,
      source: "library",
    };
  },

  /**
   * Create dimensions based on aspect ratio
   * @param {number} width - Base width
   * @param {string} aspectRatio - Desired aspect ratio (e.g., "16:9")
   * @returns {Object} Width and height
   */
  getDimensionsFromAspectRatio(width, aspectRatio = "16:9") {
    if (!aspectRatio || !width) {
      return { width, height: Math.round(width * 0.75) }; // Default to 4:3
    }

    try {
      const [w, h] = aspectRatio.split(":").map(Number);
      const height = Math.round(width * (h / w));
      return { width, height };
    } catch (error) {
      return { width, height: Math.round(width * 0.75) };
    }
  },

  // Export the library for direct access if needed
  IMAGE_LIBRARY,
};

export default ImageUtils;
