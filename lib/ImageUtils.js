// lib/ImageUtils.js
// Comprehensive image utility module for fetching, caching, and optimizing images
// Built for production use with Frodo's AI-generated websites

import axios from "axios";

/**
 * @typedef {Object} ImageData
 * @property {string} url - The image URL
 * @property {string} alt - The alt text for accessibility
 * @property {number} width - The image width
 * @property {number} height - The image height
 * @property {string} [credit] - Photographer or source credit
 * @property {string} [source] - Source of the image (e.g., "unsplash", "pexels", "library")
 * @property {string[]} [fallbacks] - Array of fallback URLs
 */

/**
 * Local image library as a fallback
 * @type {Object<string, ImageData[]>}
 */
const IMAGE_LIBRARY = {
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

/**
 * Cache for API-fetched images with expiration (5 minutes)
 * @type {Object<string, { data: ImageData, expiry: number }>}
 */
const imageCache = {
  unsplash: {},
  pexels: {},
  pixabay: {},
  avatars: {},
};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Image Utility Class for fetching, caching, and optimizing images
 */
class ImageUtils {
  static UNSPLASH_ACCESS_KEY =
    process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY ||
    "6t-w6HN2jFWSlFr3lsj8_LyTqAn0WfnsaG2iVieersk";
  static PEXELS_API_KEY =
    process.env.NEXT_PUBLIC_PEXELS_API_KEY ||
    "AdBOVsYUXDyeCDHfGkkDiZeFSrPspf1b5X4tsZS8GygU9vnVffSWzwOV";
  static PIXABAY_API_KEY =
    process.env.NEXT_PUBLIC_PIXABAY_API_KEY ||
    "49203385-b41a0f017478a3369f5e85015";

  /**
   * Get a random image from the local library
   * @param {string} category - Image category
   * @returns {ImageData} Random image data
   */
  static getRandomImage(category = "default") {
    const categoryImages = IMAGE_LIBRARY[category] || IMAGE_LIBRARY.default;
    return categoryImages[Math.floor(Math.random() * categoryImages.length)];
  }

  /**
   * Get an image by index from the local library
   * @param {string} category - Image category
   * @param {number} index - Index of the image
   * @returns {ImageData} Image data at the specified index
   */
  static getImageByIndex(category, index) {
    const categoryImages = IMAGE_LIBRARY[category] || IMAGE_LIBRARY.default;
    const safeIndex = Math.max(0, Math.min(index, categoryImages.length - 1));
    return categoryImages[safeIndex];
  }

  /**
   * Get a set of images from the local library
   * @param {string} category - Image category
   * @param {number} count - Number of images to return
   * @returns {ImageData[]} Array of image data
   */
  static getImageSet(category, count = 4) {
    const categoryImages = IMAGE_LIBRARY[category] || IMAGE_LIBRARY.default;
    const shuffled = [...categoryImages].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, categoryImages.length));
  }

  /**
   * Fetch an image from Unsplash API with retry logic
   * @param {string} query - Search term
   * @param {Object} options - { width, height, retries }
   * @returns {Promise<ImageData>} Image data
   */
  static async fetchUnsplashImage(query = "business", options = {}) {
    const { width = 800, height = 600, retries = 2 } = options;
    const cacheKey = `${query}-${width}x${height}`;

    // Check cache
    const cached = imageCache.unsplash[cacheKey];
    if (cached && Date.now() < cached.expiry) return cached.data;

    const fetchWithRetry = async (attempt) => {
      try {
        const response = await axios.get(
          `https://api.unsplash.com/search/photos`,
          {
            params: {
              query,
              per_page: 1,
              orientation: width > height ? "landscape" : "portrait",
            },
            headers: { Authorization: `Client-ID ${this.UNSPLASH_ACCESS_KEY}` },
          }
        );
        if (response.data.results?.length) {
          const imageData = {
            url: response.data.results[0].urls.regular,
            alt: response.data.results[0].alt_description || `${query} image`,
            width: response.data.results[0].width,
            height: response.data.results[0].height,
            credit: response.data.results[0].user.name,
            source: "unsplash",
          };
          imageCache.unsplash[cacheKey] = {
            data: imageData,
            expiry: Date.now() + CACHE_TTL,
          };
          return imageData;
        }
        throw new Error("No results from Unsplash");
      } catch (error) {
        if (attempt > 0) return fetchWithRetry(attempt - 1);
        console.warn(`Unsplash fetch failed for ${query}:`, error.message);
        throw error;
      }
    };

    return fetchWithRetry(retries).catch(() => this.getFallbackImage(query));
  }

  /**
   * Fetch an image from Pexels API with retry logic
   * @param {string} query - Search term
   * @param {Object} options - { width, height, retries }
   * @returns {Promise<ImageData>} Image data
   */
  static async fetchPexelsImage(query = "business", options = {}) {
    const { width = 800, height = 600, retries = 2 } = options;
    const cacheKey = `${query}-${width}x${height}`;

    // Check cache
    const cached = imageCache.pexels[cacheKey];
    if (cached && Date.now() < cached.expiry) return cached.data;

    const fetchWithRetry = async (attempt) => {
      try {
        const response = await axios.get(`https://api.pexels.com/v1/search`, {
          params: { query, per_page: 1, size: "medium" },
          headers: { Authorization: this.PEXELS_API_KEY },
        });
        if (response.data.photos?.length) {
          const photo = response.data.photos[0];
          const imageData = {
            url: photo.src.large,
            alt: `${query} image from Pexels`,
            width: photo.width,
            height: photo.height,
            credit: photo.photographer,
            source: "pexels",
          };
          imageCache.pexels[cacheKey] = {
            data: imageData,
            expiry: Date.now() + CACHE_TTL,
          };
          return imageData;
        }
        throw new Error("No results from Pexels");
      } catch (error) {
        if (attempt > 0) return fetchWithRetry(attempt - 1);
        console.warn(`Pexels fetch failed for ${query}:`, error.message);
        throw error;
      }
    };

    return fetchWithRetry(retries).catch(() =>
      this.fetchUnsplashImage(query, options).catch(() =>
        this.getFallbackImage(query)
      )
    );
  }

  /**
   * Fetch an image from Pixabay API with retry logic
   * @param {string} query - Search term
   * @param {Object} options - { width, height, retries }
   * @returns {Promise<ImageData>} Image data
   */
  static async fetchPixabayImage(query = "business", options = {}) {
    const { width = 800, height = 600, retries = 2 } = options;
    const cacheKey = `${query}-${width}x${height}`;

    // Check cache
    const cached = imageCache.pixabay[cacheKey];
    if (cached && Date.now() < cached.expiry) return cached.data;

    const fetchWithRetry = async (attempt) => {
      try {
        const response = await axios.get(`https://pixabay.com/api/`, {
          params: {
            key: this.PIXABAY_API_KEY,
            q: query,
            per_page: 1,
            image_type: "photo",
          },
        });
        if (response.data.hits?.length) {
          const hit = response.data.hits[0];
          const imageData = {
            url: hit.largeImageURL,
            alt: hit.tags || `${query} image from Pixabay`,
            width: hit.imageWidth,
            height: hit.imageHeight,
            credit: hit.user,
            source: "pixabay",
          };
          imageCache.pixabay[cacheKey] = {
            data: imageData,
            expiry: Date.now() + CACHE_TTL,
          };
          return imageData;
        }
        throw new Error("No results from Pixabay");
      } catch (error) {
        if (attempt > 0) return fetchWithRetry(attempt - 1);
        console.warn(`Pixabay fetch failed for ${query}:`, error.message);
        throw error;
      }
    };

    return fetchWithRetry(retries).catch(() => this.getFallbackImage(query));
  }

  /**
   * Generate avatar image data
   * @param {string} name - Person's name
   * @param {Object} options - { size, variant, bgColor }
   * @returns {ImageData} Avatar image data
   */
  static getAvatar(name = "User", options = {}) {
    const { size = 200, variant = "beam", bgColor = "4f46e5" } = options;
    const cacheKey = `${name}-${size}-${variant}`;

    // Return from cache if available and not expired
    const cached = imageCache.avatars[cacheKey];
    if (cached && Date.now() < cached.expiry) return cached.data;

    const avatarOptions = [
      {
        url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=${size}&background=${bgColor}&color=ffffff&bold=true`,
        alt: `Avatar for ${name}`,
        width: size,
        height: size,
        source: "ui-avatars",
      },
      {
        url: `https://source.boringavatars.com/${variant}/${size}/${encodeURIComponent(name)}?colors=264653,2a9d8f,e9c46a,f4a261,e76f51`,
        alt: `Avatar for ${name}`,
        width: size,
        height: size,
        source: "boring-avatars",
      },
      {
        url: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? "men" : "women"}/${Math.floor(Math.random() * 99)}.jpg`,
        alt: `Avatar for ${name}`,
        width: size,
        height: size,
        source: "randomuser",
      },
    ];

    const imageData = {
      ...avatarOptions[0],
      fallbacks: avatarOptions.slice(1).map((o) => o.url),
    };
    imageCache.avatars[cacheKey] = {
      data: imageData,
      expiry: Date.now() + CACHE_TTL,
    };
    return imageData;
  }

  /**
   * Fetch an optimized image using multiple API sources
   * @param {string} category - Image category or search term
   * @param {Object} options - { width, height, useAPI, retries }
   * @returns {Promise<ImageData>} Optimized image data
   */
  static async getOptimizedImage(category = "business", options = {}) {
    const { width = 800, height = 600, useAPI = true, retries = 2 } = options;

    if (!useAPI) return this.getFallbackImage(category);

    // Parallel API requests to improve speed
    const [pexelsPromise, unsplashPromise, pixabayPromise] = [
      this.fetchPexelsImage(category, { width, height, retries }),
      this.fetchUnsplashImage(category, { width, height, retries }),
      this.fetchPixabayImage(category, { width, height, retries }),
    ];

    try {
      const [pexelsResult, unsplashResult, pixabayResult] =
        await Promise.allSettled([
          pexelsPromise,
          unsplashPromise,
          pixabayPromise,
        ]);

      const successfulResult = [
        pexelsResult,
        unsplashResult,
        pixabayResult,
      ].find((result) => result.status === "fulfilled" && result.value)?.value;

      if (successfulResult) return successfulResult;
      throw new Error("All API fetches failed");
    } catch (error) {
      console.warn(
        `Optimized image fetch failed for ${category}:`,
        error.message
      );
      return this.getFallbackImage(category);
    }
  }

  /**
   * Get a fallback image from the local library
   * @param {string} category - Image category or search term
   * @returns {ImageData} Fallback image data
   */
  static getFallbackImage(category) {
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
      exercise: "fitness",
    };

    const categoryKey =
      categoryMap[category.toLowerCase()] ||
      (IMAGE_LIBRARY[category] ? category : "default");
    const categoryImages = IMAGE_LIBRARY[categoryKey] || IMAGE_LIBRARY.default;
    return {
      ...categoryImages[Math.floor(Math.random() * categoryImages.length)],
      source: "library",
    };
  }

  /**
   * Calculate dimensions based on aspect ratio
   * @param {number} width - Base width
   * @param {string} aspectRatio - Aspect ratio (e.g., "16:9")
   * @returns {Object} { width, height }
   */
  static getDimensionsFromAspectRatio(width, aspectRatio = "16:9") {
    if (!width || !aspectRatio)
      return { width, height: Math.round(width * 0.75) };
    const [w, h] = aspectRatio.split(":").map(Number);
    return { width, height: Math.round(width * (h / w)) };
  }

  /**
   * Expose the image library for direct access
   * @type {Object<string, ImageData[]>}
   */
  static IMAGE_LIBRARY = IMAGE_LIBRARY;
}

export default ImageUtils;
