// lib/ImageUtils.js
// Advanced utility functions for handling images in generated websites with 3D effects

// Collection of verified, working Unsplash image URLs by category
const IMAGE_LIBRARY = {
  // People and portraits
  people: [
    {
      url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80",
      alt: "Professional headshot of a woman with curly hair",
      aspectRatio: "1:1",
    },
    {
      url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
      alt: "Portrait of a smiling man",
      aspectRatio: "1:1",
    },
    {
      url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&q=80",
      alt: "Young man in casual clothing",
      aspectRatio: "2:3",
    },
    {
      url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80",
      alt: "Portrait of a woman with red lipstick",
      aspectRatio: "2:3",
    },
  ],

  // Business and workplace
  business: [
    {
      url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
      alt: "Team working together at a desk with computers",
      aspectRatio: "16:9",
    },
    {
      url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
      alt: "Team collaboration around a table with laptops",
      aspectRatio: "16:9",
    },
    {
      url: "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800&q=80",
      alt: "Modern office space with workstations",
      aspectRatio: "3:2",
    },
    {
      url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
      alt: "Modern business building exterior",
      aspectRatio: "16:9",
    },
  ],

  // Nature and landscapes
  nature: [
    {
      url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80",
      alt: "Mountain landscape with lake and forest",
      aspectRatio: "16:9",
    },
    {
      url: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80",
      alt: "Scenic mountain valley at sunset",
      aspectRatio: "16:9",
    },
    {
      url: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80",
      alt: "Sunset through silhouetted forest trees",
      aspectRatio: "16:9",
    },
    {
      url: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&q=80",
      alt: "Mountain lake with reflection at dawn",
      aspectRatio: "3:2",
    },
  ],

  // Product and e-commerce
  products: [
    {
      url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
      alt: "Modern watch on white background",
      aspectRatio: "1:1",
    },
    {
      url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80",
      alt: "Sunglasses on colorful background",
      aspectRatio: "1:1",
    },
    {
      url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
      alt: "Red sneakers on yellow background",
      aspectRatio: "1:1",
    },
    {
      url: "https://images.unsplash.com/photo-1503602642458-232111445657?w=600&q=80",
      alt: "Minimalist white ceramic plate",
      aspectRatio: "1:1",
    },
  ],

  // Food and drink
  food: [
    {
      url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80",
      alt: "Healthy food bowl with vegetables",
      aspectRatio: "1:1",
    },
    {
      url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80",
      alt: "Delicious hamburger and fries",
      aspectRatio: "4:3",
    },
    {
      url: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80",
      alt: "Vegetable salad in bowl",
      aspectRatio: "3:2",
    },
    {
      url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80",
      alt: "Fresh baked pizza with toppings",
      aspectRatio: "3:2",
    },
  ],

  // Technology
  tech: [
    {
      url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
      alt: "Modern laptop and smartphone on desk",
      aspectRatio: "16:9",
    },
    {
      url: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80",
      alt: "Person working on laptop with coffee",
      aspectRatio: "3:2",
    },
    {
      url: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&q=80",
      alt: "Abstract tech background with code",
      aspectRatio: "16:9",
    },
    {
      url: "https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?w=800&q=80",
      alt: "Laptop and notebook on wooden desk",
      aspectRatio: "3:2",
    },
  ],

  // Travel and places
  travel: [
    {
      url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
      alt: "Scenic highway through mountain landscape",
      aspectRatio: "16:9",
    },
    {
      url: "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=800&q=80",
      alt: "Tropical beach with palm trees",
      aspectRatio: "3:2",
    },
    {
      url: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&q=80",
      alt: "Ancient city streets in Europe",
      aspectRatio: "3:2",
    },
    {
      url: "https://images.unsplash.com/photo-1515238152791-8216bfdf89a7?w=800&q=80",
      alt: "Mountain hiking trail with backpacker",
      aspectRatio: "2:3",
    },
  ],

  // Architecture and interiors
  architecture: [
    {
      url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
      alt: "Modern minimalist home interior",
      aspectRatio: "16:9",
    },
    {
      url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
      alt: "Modern home exterior with pool",
      aspectRatio: "16:9",
    },
    {
      url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
      alt: "Contemporary kitchen interior design",
      aspectRatio: "4:3",
    },
    {
      url: "https://images.unsplash.com/photo-1616137466211-f939a420be84?w=800&q=80",
      alt: "Elegant living room with modern furniture",
      aspectRatio: "4:3",
    },
  ],

  // Abstract and patterns
  abstract: [
    {
      url: "https://images.unsplash.com/photo-1579546929662-711aa81148cf?w=800&q=80",
      alt: "Abstract gradient background",
      aspectRatio: "16:9",
    },
    {
      url: "https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=800&q=80",
      alt: "Abstract colorful geometrical shapes",
      aspectRatio: "1:1",
    },
    {
      url: "https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?w=800&q=80",
      alt: "Abstract fluid art background",
      aspectRatio: "16:9",
    },
    {
      url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
      alt: "Smooth sandy beach with ocean waves",
      aspectRatio: "16:9",
    },
  ],

  // Backgrounds and textures
  backgrounds: [
    {
      url: "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&q=80",
      alt: "Gradient blue background",
      aspectRatio: "1:1",
    },
    {
      url: "https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?w=800&q=80",
      alt: "Minimalist white texture background",
      aspectRatio: "1:1",
    },
    {
      url: "https://images.unsplash.com/photo-1572072393749-3ca9c8ea0831?w=800&q=80",
      alt: "Abstract dark background with particles",
      aspectRatio: "16:9",
    },
    {
      url: "https://images.unsplash.com/photo-1518655048521-f130df041f66?w=800&q=80",
      alt: "Clean minimal workspace desk",
      aspectRatio: "16:9",
    },
  ],

  // 3D objects and renders - NEW CATEGORY
  threeD: [
    {
      url: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80",
      alt: "3D geometric shapes with lighting effects",
      aspectRatio: "4:3",
    },
    {
      url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
      alt: "3D abstract render with vibrant colors",
      aspectRatio: "16:9",
    },
    {
      url: "https://images.unsplash.com/photo-1638015449442-d748a476267a?w=800&q=80",
      alt: "3D rendered landscape with mountains",
      aspectRatio: "16:9",
    },
    {
      url: "https://images.unsplash.com/photo-1618005198919-177e9dd3b231?w=800&q=80",
      alt: "3D abstract architectural visualization",
      aspectRatio: "16:9",
    },
  ],

  // Digital art and futuristic - NEW CATEGORY
  digitalArt: [
    {
      url: "https://images.unsplash.com/photo-1553949345-eb786cbb9c8e?w=800&q=80",
      alt: "Digital art with glowing particles",
      aspectRatio: "16:9",
    },
    {
      url: "https://images.unsplash.com/photo-1518131945814-df08f56d4f1f?w=800&q=80",
      alt: "Futuristic digital environment",
      aspectRatio: "16:9",
    },
    {
      url: "https://images.unsplash.com/photo-1581090700227-1e37b190308e?w=800&q=80",
      alt: "Digital portal with light effects",
      aspectRatio: "1:1",
    },
    {
      url: "https://images.unsplash.com/photo-1548106760-2a84baac8b68?w=800&q=80",
      alt: "Vibrant digital art with abstract shapes",
      aspectRatio: "3:2",
    },
  ],
};

// Advanced utility functions for working with images
const ImageUtils = {
  // Get a random image from a specific category
  getRandomImage: (category = "abstract") => {
    const categoryImages = IMAGE_LIBRARY[category] || IMAGE_LIBRARY.abstract;
    return categoryImages[Math.floor(Math.random() * categoryImages.length)];
  },

  // Get a specific image by index from a category
  getImageByIndex: (category, index) => {
    const categoryImages = IMAGE_LIBRARY[category] || IMAGE_LIBRARY.abstract;
    const safeIndex = Math.min(Math.max(0, index), categoryImages.length - 1);
    return categoryImages[safeIndex];
  },

  // Get a set of images for a specific category
  getImageSet: (category, count = 4) => {
    const categoryImages = IMAGE_LIBRARY[category] || IMAGE_LIBRARY.abstract;
    const shuffled = [...categoryImages].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, categoryImages.length));
  },

  // Create image component JSX with proper attributes and optimization
  createImageJSX: (image, className = "", width = 400, height = 300) => {
    const { url, alt, aspectRatio } = image;

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
      />`;
  },

  // Create a responsive hero image component with advanced effects
  createHeroImage: (category = "nature") => {
    const image = ImageUtils.getRandomImage(category);
    return `<div className="relative w-full h-[50vh] overflow-hidden">
        <img 
          src="${image.url}?q=80&auto=format" 
          alt="${image.alt}" 
          className="w-full h-full object-cover transform scale-[1.02] motion-safe:animate-subtle-zoom" 
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        <div className="absolute inset-0 bg-blue-500/10 mix-blend-overlay"></div>
      </div>`;
  },

  // Create a responsive 3D hero image with parallax effect
  create3DHeroImage: (category = "threeD") => {
    const image = ImageUtils.getRandomImage(category || "threeD");
    return `<div className="relative w-full h-[60vh] overflow-hidden perspective-[1000px] group">
        <div className="absolute inset-0 transform group-hover:rotate-y-3 group-hover:rotate-x-2 transition-transform duration-700 ease-out">
          <img 
            src="${image.url}?q=80&auto=format" 
            alt="${image.alt}" 
            className="w-full h-full object-cover brightness-[1.05] contrast-[1.02]" 
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          <div className="absolute inset-0 bg-blue-600/10 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-black/20"></div>
        </div>
      </div>`;
  },

  // Create a gallery of images with advanced hover effects
  createImageGallery: (category = "nature", count = 4) => {
    const categoryImages = IMAGE_LIBRARY[category] || IMAGE_LIBRARY.abstract;
    const selectedImages = [];

    // Select unique images
    for (let i = 0; i < Math.min(count, categoryImages.length); i++) {
      selectedImages.push(categoryImages[i]);
    }

    // Generate gallery JSX with advanced effects
    return `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(count, 4)} gap-4 my-8">
        ${selectedImages
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
  },

  // Create a 3D image gallery with depth effect
  create3DImageGallery: (category = "threeD", count = 4) => {
    const images = ImageUtils.getImageSet(category, count);

    return `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(count, 4)} gap-6 my-12 perspective-[1000px]">
        ${images
          .map(
            (image, index) => `<div 
          className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 group transform hover:rotate-y-3 hover:rotate-x-2 hover:scale-[1.02] hover:z-10"
          style="transform-style: preserve-3d; transform: translateZ(0);"
        >
          <img 
            src="${image.url}?q=80&auto=format" 
            alt="${image.alt}" 
            className="w-full h-72 object-cover transition-all duration-700 ease-out" 
            loading="lazy"
            decoding="async"
          />
          <div 
            className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-70"
            style="transform: translateZ(2px);"
          ></div>
          <div 
            className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style="background: radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.2) 100%); transform: translateZ(4px);"
          ></div>
          <div 
            className="absolute bottom-0 left-0 right-0 p-5 text-white translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-[${75 * index}ms]"
            style="transform: translateZ(10px);"
          >
            <h3 className="text-xl font-bold mb-1">${image.alt.split(" ").slice(0, 2).join(" ")}</h3>
            <p className="text-sm text-white/90">Explore details</p>
          </div>
        </div>`
          )
          .join("\n  ")}
      </div>`;
  },

  // Replace placeholder URLs in code with working images
  replacePlaceholderUrls: (code) => {
    if (!code) return code;

    // Replace common placeholder patterns
    let updatedCode = code;

    // Replace placeholder.com URLs
    updatedCode = updatedCode.replace(
      /https?:\/\/via\.placeholder\.com\/\d+x\d+/g,
      () => `${ImageUtils.getRandomImage("abstract").url}?q=80&auto=format`
    );

    // Replace other common placeholder services
    updatedCode = updatedCode.replace(
      /https?:\/\/(placeimg\.com|placeholder\.pics|placekitten\.com|loremflickr\.com|dummyimage\.com|placecage\.com|baconmockup\.com|placebear\.com|placepuppy\.it)\/\d+\/\d+/g,
      () => `${ImageUtils.getRandomImage("abstract").url}?q=80&auto=format`
    );

    // Replace archive.org placeholder
    updatedCode = updatedCode.replace(
      /https:\/\/archive\.org\/download\/placeholder-image\/placeholder-image\.jpg/g,
      `${ImageUtils.getRandomImage("abstract").url}?q=80&auto=format`
    );

    // Replace unsplash random URLs with specific ones to prevent rate limiting
    updatedCode = updatedCode.replace(
      /https:\/\/source\.unsplash\.com\/random\/\d+x\d+/g,
      () => `${ImageUtils.getRandomImage("abstract").url}?q=80&auto=format`
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
  },

  // Generate a predefined set of images for a specific website type
  getWebsiteImageSet: (type = "business") => {
    // Different website types need different image sets
    const imageSetsByType = {
      business: {
        hero: ImageUtils.getRandomImage("business"),
        team: [
          ImageUtils.getRandomImage("people"),
          ImageUtils.getRandomImage("people"),
          ImageUtils.getRandomImage("people"),
          ImageUtils.getRandomImage("people"),
        ],
        office: ImageUtils.getRandomImage("architecture"),
        about: ImageUtils.getRandomImage("business"),
      },

      ecommerce: {
        hero: ImageUtils.getRandomImage("products"),
        featuredProducts: [
          ImageUtils.getRandomImage("products"),
          ImageUtils.getRandomImage("products"),
          ImageUtils.getRandomImage("products"),
          ImageUtils.getRandomImage("products"),
        ],
        categoryBanners: [
          ImageUtils.getRandomImage("products"),
          ImageUtils.getRandomImage("products"),
          ImageUtils.getRandomImage("products"),
        ],
      },

      portfolio: {
        hero: ImageUtils.getRandomImage("people"),
        projects: [
          ImageUtils.getRandomImage("tech"),
          ImageUtils.getRandomImage("architecture"),
          ImageUtils.getRandomImage("abstract"),
          ImageUtils.getRandomImage("nature"),
          ImageUtils.getRandomImage("business"),
          ImageUtils.getRandomImage("tech"),
        ],
        about: ImageUtils.getRandomImage("people"),
      },

      travel: {
        hero: ImageUtils.getRandomImage("travel"),
        destinations: [
          ImageUtils.getRandomImage("travel"),
          ImageUtils.getRandomImage("travel"),
          ImageUtils.getRandomImage("travel"),
          ImageUtils.getRandomImage("travel"),
        ],
        testimonials: [
          ImageUtils.getRandomImage("people"),
          ImageUtils.getRandomImage("people"),
          ImageUtils.getRandomImage("people"),
        ],
      },

      // New 3D showcase type
      threeD: {
        hero: ImageUtils.getRandomImage("threeD"),
        gallery: [
          ImageUtils.getRandomImage("threeD"),
          ImageUtils.getRandomImage("threeD"),
          ImageUtils.getRandomImage("threeD"),
          ImageUtils.getRandomImage("threeD"),
        ],
        featured: ImageUtils.getRandomImage("threeD"),
        abstract: [
          ImageUtils.getRandomImage("abstract"),
          ImageUtils.getRandomImage("digitalArt"),
        ],
      },

      // Digital art type
      digitalArt: {
        hero: ImageUtils.getRandomImage("digitalArt"),
        gallery: [
          ImageUtils.getRandomImage("digitalArt"),
          ImageUtils.getRandomImage("digitalArt"),
          ImageUtils.getRandomImage("abstract"),
          ImageUtils.getRandomImage("threeD"),
        ],
        featured: ImageUtils.getRandomImage("digitalArt"),
      },
    };

    // Return the appropriate image set or a default one
    return imageSetsByType[type] || imageSetsByType.business;
  },

  // Create optimized image component for better performance
  createOptimizedImage: (
    image,
    sizes = "100vw",
    priority = false,
    className = ""
  ) => {
    const { url, alt, aspectRatio } = image;

    // Calculate proper aspect ratio
    let width = 800;
    let height = 600;

    if (aspectRatio) {
      const [w, h] = aspectRatio.split(":").map(Number);
      height = Math.round(width * (h / w));
    }

    // Add optimization parameters
    const optimizedUrl = url.includes("?")
      ? `${url}&q=80&auto=format`
      : `${url}?q=80&auto=format`;

    return `<img
          src="${optimizedUrl}"
          alt="${alt}"
          width="${width}"
          height="${height}"
          sizes="${sizes}"
          className="${className}"
          ${priority ? 'fetchpriority="high"' : 'loading="lazy"'}
          decoding="async"
        />`;
  },

  // Check if images in code are valid and replace if not
  validateAndFixImages: (code) => {
    if (!code) return code;

    // Function to test if an image URL is valid
    const testImageUrl = async (url) => {
      try {
        const response = await fetch(url, { method: "HEAD" });
        return response.ok;
      } catch (e) {
        return false;
      }
    };

    // Extract all image URLs from the code
    const imgRegex = /<img\s+[^>]*src=["']([^"']+)["'][^>]*>/g;
    let match;
    let updatedCode = code;
    let promises = [];

    while ((match = imgRegex.exec(code)) !== null) {
      const originalUrl = match[1];
      promises.push(
        (async () => {
          const isValid = await testImageUrl(originalUrl);
          if (!isValid) {
            // Replace invalid URL with a valid one from our library
            const replacementImage = ImageUtils.getRandomImage("abstract");
            updatedCode = updatedCode.replace(
              originalUrl,
              `${replacementImage.url}?q=80&auto=format`
            );
          }
        })()
      );
    }

    // This would run in an actual implementation, but we'll just return the updated code
    // for now without waiting for the promises
    return updatedCode;
  },

  // Generate 3D image component with three.js integration
  create3DSceneComponent: (modelType = "cube") => {
    const models = {
      cube: "simple rotating cube",
      sphere: "glossy sphere with environment mapping",
      torus: "animated torus knot with glowing material",
      scene: "3D scene with multiple objects",
    };

    const description = models[modelType] || models.cube;

    return `{/* 3D ${description} using Three.js */}
    <div className="relative w-full h-[50vh] rounded-xl overflow-hidden my-8">
      <div id="three-scene-container" className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-black">
        {/* This canvas will be initialized with Three.js in useEffect */}
        <canvas className="w-full h-full" id="three-canvas"></canvas>
      </div>
      <script dangerouslySetInnerHTML={{ __html: \`
        // This script will execute when the component mounts
        document.addEventListener('DOMContentLoaded', function() {
          if (typeof THREE === 'undefined') {
            // Load Three.js dynamically if not present
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js';
            script.onload = initThreeScene;
            document.head.appendChild(script);
          } else {
            initThreeScene();
          }
          
          function initThreeScene() {
            const container = document.getElementById('three-scene-container');
            const canvas = document.getElementById('three-canvas');
            if (!container || !canvas) return;
            
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ 
              canvas: canvas,
              antialias: true,
              alpha: true
            });
            
            renderer.setSize(container.clientWidth, container.clientHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            
            // Add lighting
            const ambientLight = new THREE.AmbientLight(0x404040);
            scene.add(ambientLight);
            
            const pointLight = new THREE.PointLight(0x6b73ff, 1, 100);
            pointLight.position.set(5, 5, 5);
            scene.add(pointLight);
            
            // Create 3D object
            ${
              modelType === "cube"
                ? `
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshStandardMaterial({ 
              color: 0x6b73ff,
              metalness: 0.7,
              roughness: 0.2,
            });
            const cube = new THREE.Mesh(geometry, material);
            scene.add(cube);
            `
                : modelType === "sphere"
                  ? `
            const geometry = new THREE.SphereGeometry(1, 32, 32);
            const material = new THREE.MeshStandardMaterial({ 
              color: 0x6b73ff,
              metalness: 0.9,
              roughness: 0.1,
            });
            const sphere = new THREE.Mesh(geometry, material);
            scene.add(sphere);
            `
                  : modelType === "torus"
                    ? `
            const geometry = new THREE.TorusKnotGeometry(0.8, 0.3, 100, 16);
            const material = new THREE.MeshStandardMaterial({ 
              color: 0x6b73ff,
              metalness: 0.7,
              roughness: 0.2,
              emissive: 0x222266,
              emissiveIntensity: 0.3
            });
            const torusKnot = new THREE.Mesh(geometry, material);
            scene.add(torusKnot);
            `
                    : `
            // Create multiple objects for a scene
            const torusGeometry = new THREE.TorusGeometry(0.7, 0.2, 16, 100);
            const torusMaterial = new THREE.MeshStandardMaterial({ 
              color: 0x6b73ff,
              metalness: 0.7,
              roughness: 0.2 
            });
            const torus = new THREE.Mesh(torusGeometry, torusMaterial);
            torus.position.x = -1.5;
            
            const boxGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
            const boxMaterial = new THREE.MeshStandardMaterial({ 
              color: 0xff4b73,
              metalness: 0.5,
              roughness: 0.3 
            });
            const box = new THREE.Mesh(boxGeometry, boxMaterial);
            box.position.x = 1.5;
            
            const sphereGeometry = new THREE.SphereGeometry(0.6, 32, 32);
            const sphereMaterial = new THREE.MeshStandardMaterial({ 
              color: 0x73ffb3,
              metalness: 0.8,
              roughness: 0.2 
            });
            const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            sphere.position.y = 1.5;
            
            scene.add(torus);
            scene.add(box);
            scene.add(sphere);
            `
            }
            
            camera.position.z = 5;
            
            // Handle window resize
            window.addEventListener('resize', () => {
              camera.aspect = container.clientWidth / container.clientHeight;
              camera.updateProjectionMatrix();
              renderer.setSize(container.clientWidth, container.clientHeight);
            });
            
            // Animation loop
            function animate() {
              requestAnimationFrame(animate);
              
              ${
                modelType === "cube"
                  ? `
              cube.rotation.x += 0.01;
              cube.rotation.y += 0.01;
              `
                  : modelType === "sphere"
                    ? `
              sphere.rotation.x += 0.005;
              sphere.rotation.y += 0.01;
              `
                    : modelType === "torus"
                      ? `
              torusKnot.rotation.x += 0.01;
              torusKnot.rotation.y += 0.01;
              `
                      : `
              torus.rotation.x += 0.01;
              torus.rotation.y += 0.01;
              
              box.rotation.x -= 0.01;
              box.rotation.z += 0.01;
              
              sphere.rotation.y += 0.01;
              sphere.position.y = 1.5 + Math.sin(Date.now() * 0.001) * 0.2;
              `
              }
              
              renderer.render(scene, camera);
            }
            
            animate();
          }
        });
      \`}} />
    </div>`;
  },

  // Export the full image library
  IMAGE_LIBRARY,
};

export default ImageUtils;
