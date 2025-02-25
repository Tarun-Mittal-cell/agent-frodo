// lib/ImageUtils.js
// Utility functions for handling images in generated websites

// Collection of verified, working Unsplash image URLs by category
const IMAGE_LIBRARY = {
  // People and portraits
  people: [
    {
      url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600",
      alt: "Professional headshot of a woman with curly hair",
      aspectRatio: "1:1",
    },
    {
      url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600",
      alt: "Portrait of a smiling man",
      aspectRatio: "1:1",
    },
    {
      url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600",
      alt: "Young man in casual clothing",
      aspectRatio: "2:3",
    },
    {
      url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600",
      alt: "Portrait of a woman with red lipstick",
      aspectRatio: "2:3",
    },
  ],

  // Business and workplace
  business: [
    {
      url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800",
      alt: "Team working together at a desk with computers",
      aspectRatio: "16:9",
    },
    {
      url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800",
      alt: "Team collaboration around a table with laptops",
      aspectRatio: "16:9",
    },
    {
      url: "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800",
      alt: "Modern office space with workstations",
      aspectRatio: "3:2",
    },
    {
      url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
      alt: "Modern business building exterior",
      aspectRatio: "16:9",
    },
  ],

  // Nature and landscapes
  nature: [
    {
      url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800",
      alt: "Mountain landscape with lake and forest",
      aspectRatio: "16:9",
    },
    {
      url: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800",
      alt: "Scenic mountain valley at sunset",
      aspectRatio: "16:9",
    },
    {
      url: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800",
      alt: "Sunset through silhouetted forest trees",
      aspectRatio: "16:9",
    },
    {
      url: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800",
      alt: "Mountain lake with reflection at dawn",
      aspectRatio: "3:2",
    },
  ],

  // Product and e-commerce
  products: [
    {
      url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
      alt: "Modern watch on white background",
      aspectRatio: "1:1",
    },
    {
      url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600",
      alt: "Sunglasses on colorful background",
      aspectRatio: "1:1",
    },
    {
      url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
      alt: "Red sneakers on yellow background",
      aspectRatio: "1:1",
    },
    {
      url: "https://images.unsplash.com/photo-1503602642458-232111445657?w=600",
      alt: "Minimalist white ceramic plate",
      aspectRatio: "1:1",
    },
  ],

  // Food and drink
  food: [
    {
      url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600",
      alt: "Healthy food bowl with vegetables",
      aspectRatio: "1:1",
    },
    {
      url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600",
      alt: "Delicious hamburger and fries",
      aspectRatio: "4:3",
    },
    {
      url: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600",
      alt: "Vegetable salad in bowl",
      aspectRatio: "3:2",
    },
    {
      url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600",
      alt: "Fresh baked pizza with toppings",
      aspectRatio: "3:2",
    },
  ],

  // Technology
  tech: [
    {
      url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800",
      alt: "Modern laptop and smartphone on desk",
      aspectRatio: "16:9",
    },
    {
      url: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800",
      alt: "Person working on laptop with coffee",
      aspectRatio: "3:2",
    },
    {
      url: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800",
      alt: "Abstract tech background with code",
      aspectRatio: "16:9",
    },
    {
      url: "https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?w=800",
      alt: "Laptop and notebook on wooden desk",
      aspectRatio: "3:2",
    },
  ],

  // Travel and places
  travel: [
    {
      url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
      alt: "Scenic highway through mountain landscape",
      aspectRatio: "16:9",
    },
    {
      url: "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=800",
      alt: "Tropical beach with palm trees",
      aspectRatio: "3:2",
    },
    {
      url: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800",
      alt: "Ancient city streets in Europe",
      aspectRatio: "3:2",
    },
    {
      url: "https://images.unsplash.com/photo-1515238152791-8216bfdf89a7?w=800",
      alt: "Mountain hiking trail with backpacker",
      aspectRatio: "2:3",
    },
  ],

  // Architecture and interiors
  architecture: [
    {
      url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
      alt: "Modern minimalist home interior",
      aspectRatio: "16:9",
    },
    {
      url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
      alt: "Modern home exterior with pool",
      aspectRatio: "16:9",
    },
    {
      url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
      alt: "Contemporary kitchen interior design",
      aspectRatio: "4:3",
    },
    {
      url: "https://images.unsplash.com/photo-1616137466211-f939a420be84?w=800",
      alt: "Elegant living room with modern furniture",
      aspectRatio: "4:3",
    },
  ],

  // Abstract and patterns
  abstract: [
    {
      url: "https://images.unsplash.com/photo-1579546929662-711aa81148cf?w=800",
      alt: "Abstract gradient background",
      aspectRatio: "16:9",
    },
    {
      url: "https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=800",
      alt: "Abstract colorful geometrical shapes",
      aspectRatio: "1:1",
    },
    {
      url: "https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?w=800",
      alt: "Abstract fluid art background",
      aspectRatio: "16:9",
    },
    {
      url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
      alt: "Smooth sandy beach with ocean waves",
      aspectRatio: "16:9",
    },
  ],

  // Backgrounds and textures
  backgrounds: [
    {
      url: "https://images.unsplash.com/photo-1557683316-973673baf926?w=800",
      alt: "Gradient blue background",
      aspectRatio: "1:1",
    },
    {
      url: "https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?w=800",
      alt: "Minimalist white texture background",
      aspectRatio: "1:1",
    },
    {
      url: "https://images.unsplash.com/photo-1572072393749-3ca9c8ea0831?w=800",
      alt: "Abstract dark background with particles",
      aspectRatio: "16:9",
    },
    {
      url: "https://images.unsplash.com/photo-1518655048521-f130df041f66?w=800",
      alt: "Clean minimal workspace desk",
      aspectRatio: "16:9",
    },
  ],
};

// Utility functions for working with images
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

  // Create image component JSX with proper attributes
  createImageJSX: (image, className = "", width = 400, height = 300) => {
    const { url, alt, aspectRatio } = image;

    // Set appropriate dimensions based on aspect ratio
    let imgWidth = width;
    let imgHeight = height;

    if (aspectRatio) {
      const [w, h] = aspectRatio.split(":").map(Number);
      imgHeight = Math.round(imgWidth * (h / w));
    }

    return `<img 
    src="${url}" 
    alt="${alt}" 
    width="${imgWidth}" 
    height="${imgHeight}" 
    className="${className}" 
    loading="lazy"
  />`;
  },

  // Create a responsive hero image component
  createHeroImage: (category = "nature") => {
    const image = ImageUtils.getRandomImage(category);
    return `<div className="relative w-full h-[50vh] overflow-hidden">
    <img 
      src="${image.url}" 
      alt="${image.alt}" 
      className="w-full h-full object-cover" 
      loading="lazy"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
  </div>`;
  },

  // Create a gallery of images
  createImageGallery: (category = "nature", count = 4) => {
    const categoryImages = IMAGE_LIBRARY[category] || IMAGE_LIBRARY.abstract;
    const selectedImages = [];

    // Select unique images
    for (let i = 0; i < Math.min(count, categoryImages.length); i++) {
      selectedImages.push(categoryImages[i]);
    }

    // Generate gallery JSX
    return `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(count, 4)} gap-4 my-8">
    ${selectedImages
      .map(
        (
          image
        ) => `<div className="overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
      <img 
        src="${image.url}" 
        alt="${image.alt}" 
        className="w-full h-64 object-cover hover:scale-105 transition-transform duration-500" 
        loading="lazy"
      />
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
      () => ImageUtils.getRandomImage("abstract").url
    );

    // Replace other common placeholder services
    updatedCode = updatedCode.replace(
      /https?:\/\/(placeimg\.com|placeholder\.pics|placekitten\.com|loremflickr\.com|dummyimage\.com|placecage\.com|baconmockup\.com|placebear\.com|placepuppy\.it)\/\d+\/\d+/g,
      () => ImageUtils.getRandomImage("abstract").url
    );

    // Replace archive.org placeholder
    updatedCode = updatedCode.replace(
      /https:\/\/archive\.org\/download\/placeholder-image\/placeholder-image\.jpg/g,
      ImageUtils.getRandomImage("abstract").url
    );

    // Add loading="lazy" to all img tags that don't have it
    updatedCode = updatedCode.replace(
      /<img([^>]*)(?!loading=)([^>]*)>/g,
      '<img$1 loading="lazy"$2>'
    );

    // Add alt text to all img tags that don't have it
    updatedCode = updatedCode.replace(
      /<img([^>]*)(?!alt=)([^>]*)>/g,
      '<img$1 alt="Image"$2>'
    );

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
    };

    // Return the appropriate image set or a default one
    return imageSetsByType[type] || imageSetsByType.business;
  },

  // Export the full image library
  IMAGE_LIBRARY,
};

export default ImageUtils;
