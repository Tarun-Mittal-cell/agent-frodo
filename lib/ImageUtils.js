// lib/ImageUtils.js
// Advanced utility functions for handling images with improved reliability

// Collection of verified, working image URLs by category with fallbacks
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

  // We're using only a subset of categories for better reliability
  // These are tested and confirmed to work
};

// Advanced utility functions for working with images
const ImageUtils = {
  // Get a random image from a specific category with fallback
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

  // Get a specific image by index from a category with fallback
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

  // Get a set of images for a specific category
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

  // Create image component JSX with proper attributes and optimization
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

  // Create a responsive hero image component with advanced effects
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

  // Create a responsive 3D hero image with parallax effect (simplified for reliability)
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

  // Create a gallery of images with advanced hover effects
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

  // Replace placeholder URLs in code with working images
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

  // Export the full image library for direct access
  IMAGE_LIBRARY,
};

export default ImageUtils;
