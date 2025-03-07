/**
 * CodeGenerationModule.js
 * Production-ready module for generating world-class frontend code with beautiful UI.
 * Features reliable image loading, pre-built templates, 3D elements, and error-free code generation.
 */

const path = require("path");
const fs = require("fs-extra"); // Using fs-extra for more robust file operations
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const os = require("os");

// Premium UI libraries and design systems we'll integrate
const DESIGN_SYSTEMS = {
  MATERIAL_UI: "material-ui",
  TAILWIND_CSS: "tailwind",
  CHAKRA_UI: "chakra-ui",
  FRAMER_MOTION: "framer-motion",
  STYLED_COMPONENTS: "styled-components",
  THREE_JS: "three.js",
  GSAP: "gsap",
  LOTTIE: "lottie",
  SPLINE_3D: "spline-3d",
};

// Available template sources with built-in premium designs
const TEMPLATE_SOURCES = {
  // Open source templates that don't require attribution
  TAILWIND_UI: "tailwind-ui",
  CHAKRA_TEMPLATES: "chakra-templates",
  MATERIAL_UI_TEMPLATES: "material-ui-templates",
  SHADCN_UI: "shadcn-ui",
  MANTINE_UI: "mantine-ui",
  NEXTUI: "nextui",
  DAISYUI: "daisyui",
  TREMOR: "tremor",
  // Free design collections
  CRUIP: "cruip",
  LANDING_FOLIO: "landing-folio",
  UI_STORE_DESIGN: "ui-store-design",
};

// Create local cache directory for templates and images
const CACHE_DIR = path.join(os.tmpdir(), "dumpling-website-generator");
fs.ensureDirSync(CACHE_DIR);
fs.ensureDirSync(path.join(CACHE_DIR, "images"));
fs.ensureDirSync(path.join(CACHE_DIR, "templates"));

// Enhanced premium-quality image sources that always work
const PREMIUM_IMAGE_APIS = {
  // Pexels API - high quality professional photos (free API)
  pexels: {
    baseUrl: "https://api.pexels.com/v1/search",
    headers: {
      Authorization: process.env.PEXELS_API_KEY || "YOUR_PEXELS_API_KEY",
    },
    searchParams: (query, page = 1, perPage = 10) =>
      `query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`,
    getUrl: (data) =>
      data.photos[Math.floor(Math.random() * data.photos.length)]?.src.large,
  },

  // Unsplash API - high quality professional photos (free API)
  unsplash: {
    baseUrl: "https://api.unsplash.com/search/photos",
    headers: {
      Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY || "YOUR_UNSPLASH_KEY"}`,
    },
    searchParams: (query, page = 1, perPage = 10) =>
      `query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`,
    getUrl: (data) =>
      data.results[Math.floor(Math.random() * data.results.length)]?.urls
        .regular,
  },

  // Pixabay API - high quality professional photos (free API)
  pixabay: {
    baseUrl: "https://pixabay.com/api/",
    searchParams: (query, page = 1, perPage = 10) =>
      `key=${process.env.PIXABAY_API_KEY || "YOUR_PIXABAY_KEY"}&q=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`,
    getUrl: (data) =>
      data.hits[Math.floor(Math.random() * data.hits.length)]?.largeImageURL,
  },

  // 100% reliable free image sources that don't require API keys

  // Picsum Photos - high quality photography
  picsum: {
    noApiCall: true,
    getDirectUrl: (seed, width = 1200, height = 800) =>
      `https://picsum.photos/seed/${seed}/${width}/${height}`,
  },

  // Lorem Space - customizable placeholders with categories
  loremSpace: {
    noApiCall: true,
    getDirectUrl: (category, width = 1200, height = 800) =>
      `https://lorem.space/api/img/${category}/${width}/${height}`,
    categories: [
      "movie",
      "game",
      "album",
      "book",
      "face",
      "fashion",
      "shoes",
      "watch",
      "furniture",
      "car",
      "house",
      "mountain",
      "city",
      "food",
      "drink",
    ],
  },

  // UI Faces - realistic people photos for testimonials
  uiFaces: {
    noApiCall: true,
    getDirectUrl: () => {
      const gender = Math.random() > 0.5 ? "men" : "women";
      const num = Math.floor(Math.random() * 100);
      return `https://randomuser.me/api/portraits/${gender}/${num}.jpg`;
    },
  },

  // Local static images repository - fastest, most reliable option
  staticImages: {
    noApiCall: true,
    baseCategories: [
      "food",
      "business",
      "tech",
      "people",
      "product",
      "nature",
      "interior",
      "fashion",
      "travel",
      "health",
      "abstract",
      "luxury",
    ],
    getDirectUrl: (category) => {
      // Premium quality images for each category, always accessible
      const imagesByCategory = {
        food: [
          "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg",
          "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg",
          "https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg",
          "https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg",
          "https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg",
        ],
        business: [
          "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg",
          "https://images.pexels.com/photos/3182759/pexels-photo-3182759.jpeg",
          "https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg",
          "https://images.pexels.com/photos/3182781/pexels-photo-3182781.jpeg",
          "https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg",
        ],
        tech: [
          "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg",
          "https://images.pexels.com/photos/1181275/pexels-photo-1181275.jpeg",
          "https://images.pexels.com/photos/5473301/pexels-photo-5473301.jpeg",
          "https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg",
          "https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg",
        ],
        people: [
          "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg",
          "https://images.pexels.com/photos/3182746/pexels-photo-3182746.jpeg",
          "https://images.pexels.com/photos/3184328/pexels-photo-3184328.jpeg",
          "https://images.pexels.com/photos/3182743/pexels-photo-3182743.jpeg",
          "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg",
        ],
        product: [
          "https://images.pexels.com/photos/1667071/pexels-photo-1667071.jpeg",
          "https://images.pexels.com/photos/3184430/pexels-photo-3184430.jpeg",
          "https://images.pexels.com/photos/5615/coffee-flatlay-blog-magazine.jpg",
          "https://images.pexels.com/photos/2536965/pexels-photo-2536965.jpeg",
          "https://images.pexels.com/photos/1667088/pexels-photo-1667088.jpeg",
        ],
        nature: [
          "https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg",
          "https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg",
          "https://images.pexels.com/photos/3225529/pexels-photo-3225529.jpeg",
          "https://images.pexels.com/photos/1166209/pexels-photo-1166209.jpeg",
          "https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg",
        ],
        interior: [
          "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg",
          "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg",
          "https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg",
          "https://images.pexels.com/photos/1571458/pexels-photo-1571458.jpeg",
          "https://images.pexels.com/photos/1643385/pexels-photo-1643385.jpeg",
        ],
        fashion: [
          "https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg",
          "https://images.pexels.com/photos/837140/pexels-photo-837140.jpeg",
          "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg",
          "https://images.pexels.com/photos/2043590/pexels-photo-2043590.jpeg",
          "https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg",
        ],
        travel: [
          "https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg",
          "https://images.pexels.com/photos/3278212/pexels-photo-3278212.jpeg",
          "https://images.pexels.com/photos/2325446/pexels-photo-2325446.jpeg",
          "https://images.pexels.com/photos/2356045/pexels-photo-2356045.jpeg",
          "https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg",
        ],
        health: [
          "https://images.pexels.com/photos/3822711/pexels-photo-3822711.jpeg",
          "https://images.pexels.com/photos/3823207/pexels-photo-3823207.jpeg",
          "https://images.pexels.com/photos/3822714/pexels-photo-3822714.jpeg",
          "https://images.pexels.com/photos/3822716/pexels-photo-3822716.jpeg",
          "https://images.pexels.com/photos/3822719/pexels-photo-3822719.jpeg",
        ],
        abstract: [
          "https://images.pexels.com/photos/2110951/pexels-photo-2110951.jpeg",
          "https://images.pexels.com/photos/2693212/pexels-photo-2693212.jpeg",
          "https://images.pexels.com/photos/1209843/pexels-photo-1209843.jpeg",
          "https://images.pexels.com/photos/1766838/pexels-photo-1766838.jpeg",
          "https://images.pexels.com/photos/2088170/pexels-photo-2088170.jpeg",
        ],
        luxury: [
          "https://images.pexels.com/photos/1579739/pexels-photo-1579739.jpeg",
          "https://images.pexels.com/photos/2466756/pexels-photo-2466756.jpeg",
          "https://images.pexels.com/photos/775219/pexels-photo-775219.jpeg",
          "https://images.pexels.com/photos/3098847/pexels-photo-3098847.jpeg",
          "https://images.pexels.com/photos/2994650/pexels-photo-2994650.jpeg",
        ],
        // Food delivery-specific images like shown in the screenshots
        foodDelivery: [
          "https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg",
          "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg",
          "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg",
          "https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg",
          "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg",
        ],
        chef: [
          "https://images.pexels.com/photos/887827/pexels-photo-887827.jpeg",
          "https://images.pexels.com/photos/3814446/pexels-photo-3814446.jpeg",
          "https://images.pexels.com/photos/5907626/pexels-photo-5907626.jpeg",
          "https://images.pexels.com/photos/3814448/pexels-photo-3814448.jpeg",
          "https://images.pexels.com/photos/4252137/pexels-photo-4252137.jpeg",
        ],
        // Default fallback images
        default: [
          "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg",
          "https://images.pexels.com/photos/3182759/pexels-photo-3182759.jpeg",
          "https://images.pexels.com/photos/1181275/pexels-photo-1181275.jpeg",
          "https://images.pexels.com/photos/1209843/pexels-photo-1209843.jpeg",
          "https://images.pexels.com/photos/1166209/pexels-photo-1166209.jpeg",
        ],
      };

      // Return a random image from the appropriate category
      const mappedCategory =
        category in imagesByCategory ? category : "default";
      const categoryImages = imagesByCategory[mappedCategory];
      return categoryImages[Math.floor(Math.random() * categoryImages.length)];
    },
  },
};

// Enhanced premium color schemes for different industries
const PREMIUM_COLOR_SCHEMES = {
  food: {
    primary: "#E4572E", // Orange-red
    secondary: "#29335C", // Dark blue
    accent: "#F3A712", // Gold/amber
    text: "#111111",
    background: "#FFFFFF",
    gradient: "linear-gradient(135deg, #E4572E 0%, #F3A712 100%)",
    dark: {
      primary: "#F05D23", // Brighter orange
      secondary: "#29335C", // Dark blue
      accent: "#F8C537", // Brighter gold
      text: "#F8F8F8",
      background: "#111111",
      gradient: "linear-gradient(135deg, #F05D23 0%, #F8C537 100%)",
    },
  },
  technology: {
    primary: "#3A506B", // Blue-gray
    secondary: "#1C2541", // Dark blue
    accent: "#5BC0BE", // Teal
    text: "#0B132B",
    background: "#F5F5F5",
    gradient: "linear-gradient(135deg, #3A506B 0%, #5BC0BE 100%)",
    dark: {
      primary: "#5BC0BE", // Teal
      secondary: "#3A506B", // Blue-gray
      accent: "#6FFFE9", // Light teal
      text: "#FFFFFF",
      background: "#0B132B",
      gradient: "linear-gradient(135deg, #5BC0BE 0%, #6FFFE9 100%)",
    },
  },
  fashion: {
    primary: "#D1345B", // Ruby
    secondary: "#000000", // Black
    accent: "#F9E9EC", // Light pink
    text: "#1A1A1A",
    background: "#FFFFFF",
    gradient: "linear-gradient(135deg, #D1345B 0%, #000000 100%)",
    dark: {
      primary: "#FF3E6C", // Brighter pink
      secondary: "#1A1A1A", // Dark gray
      accent: "#D4AF37", // Gold
      text: "#F8F8F8",
      background: "#0A0A0A",
      gradient: "linear-gradient(135deg, #FF3E6C 0%, #D4AF37 100%)",
    },
  },
  luxury: {
    primary: "#D4AF37", // Gold
    secondary: "#1A1A1A", // Near black
    accent: "#FFFFFF", // White
    text: "#1A1A1A",
    background: "#FFFFFF",
    gradient: "linear-gradient(135deg, #D4AF37 0%, #1A1A1A 100%)",
    dark: {
      primary: "#D4AF37", // Gold
      secondary: "#1A1A1A", // Near black
      accent: "#FFFFFF", // White
      text: "#FFFFFF",
      background: "#0A0A0A",
      gradient: "linear-gradient(135deg, #D4AF37 0%, #1A1A1A 100%)",
    },
  },
  foodDelivery: {
    primary: "#D4AF37", // Gold
    secondary: "#1A1A1A", // Near black
    accent: "#E4572E", // Orange-red
    text: "#1A1A1A",
    background: "#FFFFFF",
    gradient: "linear-gradient(135deg, #D4AF37 0%, #E4572E 100%)",
    dark: {
      primary: "#D4AF37", // Gold
      secondary: "#1A1A1A", // Near black
      accent: "#E4572E", // Orange-red
      text: "#FFFFFF",
      background: "#0A0A0A",
      gradient: "linear-gradient(135deg, #D4AF37 0%, #E4572E 100%)",
    },
  },
  // Default elegant scheme with gold accents (like in the screenshots)
  default: {
    primary: "#D4AF37", // Gold
    secondary: "#1A1A1A", // Near black
    accent: "#E4572E", // Orange-red accent
    text: "#1A1A1A",
    background: "#FFFFFF",
    gradient: "linear-gradient(135deg, #D4AF37 0%, #1A1A1A 100%)",
    dark: {
      primary: "#D4AF37", // Gold
      secondary: "#1A1A1A", // Near black
      accent: "#FFFFFF", // White
      text: "#FFFFFF",
      background: "#0A0A0A",
      gradient: "linear-gradient(135deg, #D4AF37 0%, #1A1A1A 100%)",
    },
  },
};

// Dynamic template paths with fetch mechanism
const TEMPLATE_PATHS = {
  // React templates
  react: {
    landingPage: "templates/react/landingPage",
    ecommerce: "templates/react/ecommerce",
    portfolio: "templates/react/portfolio",
    blog: "templates/react/blog",
    dashboard: "templates/react/dashboard",
    foodDelivery: "templates/react/foodDelivery",
  },
  // Next.js templates
  next: {
    landingPage: "templates/next/landingPage",
    ecommerce: "templates/next/ecommerce",
    portfolio: "templates/next/portfolio",
    blog: "templates/next/blog",
    dashboard: "templates/next/dashboard",
    foodDelivery: "templates/next/foodDelivery",
  },
  // Vue templates
  vue: {
    landingPage: "templates/vue/landingPage",
    ecommerce: "templates/vue/ecommerce",
  },
  // Common components
  components: {
    headers: "templates/components/headers",
    footers: "templates/components/footers",
    heroes: "templates/components/heroes",
    features: "templates/components/features",
    pricing: "templates/components/pricing",
    testimonials: "templates/components/testimonials",
    contact: "templates/components/contact",
  },
  // Fallbacks
  fallbacks: {
    basicHTML: "templates/fallbacks/basicHTML",
    reactBasic: "templates/fallbacks/reactBasic",
    nextBasic: "templates/fallbacks/nextBasic",
  },
};

/**
 * Code Generation Module - Creates beautiful frontend websites using advanced templates and AI
 */
class CodeGenerationModule {
  constructor(llmService, config = {}) {
    this.llm = llmService;
    this.logger = config.logger || console;

    // Setup workspace
    this.workspaceDir =
      config.workspaceDir || path.join(process.cwd(), "workspace");
    this.publicDir = path.join(this.workspaceDir, "public");
    this.imagesDir = path.join(this.publicDir, "images");
    this.srcDir = path.join(this.workspaceDir, "src");

    // Setup services
    this.fileSystem = config.fileSystem || this._createDefaultFileSystem();
    this.templateCache = new Map();
    this.imageCache = new Map();

    // Configuration
    this.maxRetries = config.maxRetries || 3;
    this.requestTimeout = config.requestTimeout || 30000;
    this.useLocalImages = config.useLocalImages !== false;

    // Register framework generators
    this.frameworkGenerators = new Map();
    this._registerFrameworkGenerators();

    // Error tracking
    this.errorCounts = {
      api: 0,
      parsing: 0,
      filesystem: 0,
      imageLoading: 0,
      timeout: 0,
    };
    this.maxErrorCount = config.maxErrorCount || 5;

    // Default templates
    this.bootstrapTemplates();

    // Ensure workspace exists
    this._ensureWorkspaceExists();
  }

  /**
   * Initialize template directories and fetch default templates
   */
  bootstrapTemplates() {
    try {
      const templatesDir = path.join(__dirname, "..", "templates");
      if (!fs.existsSync(templatesDir)) {
        fs.mkdirSync(templatesDir, { recursive: true });

        // Create subdirectories for each framework and type
        ["react", "next", "vue"].forEach((framework) => {
          const frameworkDir = path.join(templatesDir, framework);
          fs.mkdirSync(frameworkDir, { recursive: true });
        });

        // Create components directory
        const componentsDir = path.join(templatesDir, "components");
        fs.mkdirSync(componentsDir, { recursive: true });

        // Create fallbacks directory
        const fallbacksDir = path.join(templatesDir, "fallbacks");
        fs.mkdirSync(fallbacksDir, { recursive: true });

        // Add basic fallback templates
        this._createBasicFallbackTemplates(templatesDir);
      }
    } catch (error) {
      this.logger.warn("Failed to bootstrap templates:", error.message);
    }
  }

  /**
   * Create basic fallback templates for reliability
   */
  _createBasicFallbackTemplates(templatesDir) {
    try {
      // Create basic React template
      const reactBasicPath = path.join(
        templatesDir,
        "fallbacks",
        "reactBasic.js"
      );
      fs.writeFileSync(
        reactBasicPath,
        `
module.exports = {
  "src/App.jsx": \`import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to Chronos Luxury Timepieces</h1>
        <p>Your premium destination for elegant watches.</p>
      </header>
    </div>
  );
}

export default App;\`,

  "src/App.css": \`.App {
  text-align: center;
}

.App-header {
  background-color: #1A1A1A;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: #ECF0F1;
}

.App-header h1 {
  color: #D4AF37;
  margin-bottom: 1rem;
}\`,

  "src/index.jsx": \`import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);\`,

  "src/index.css": \`body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}\`
};`
      );

      // Create basic Next.js template
      const nextBasicPath = path.join(
        templatesDir,
        "fallbacks",
        "nextBasic.js"
      );
      fs.writeFileSync(
        nextBasicPath,
        `
module.exports = {
  "src/pages/index.jsx": \`import Head from 'next/head';
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Chronos Luxury Timepieces</title>
        <meta name="description" content="Premium timepieces for the discerning collector" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <span>Chronos Luxury Timepieces</span>
        </h1>
        <p className={styles.description}>
          Your premium destination for elegant watches.
        </p>
      </main>
    </div>
  );
}\`,

  "src/pages/_app.jsx": \`import '../styles/globals.css';

export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}\`,

  "src/styles/globals.css": \`html,
body {
  padding: 0;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
    Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
  background-color: #1A1A1A;
  color: #ECF0F1;
}

a {
  color: inherit;
  text-decoration: none;
}

* {
  box-sizing: border-box;
}\`,

  "src/styles/Home.module.css": \`.container {
  min-height: 100vh;
  padding: 0 2rem;
}

.main {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.title {
  margin: 0;
  line-height: 1.15;
  font-size: 4rem;
  text-align: center;
}

.title span {
  color: #D4AF37;
}

.description {
  text-align: center;
  line-height: 1.5;
  font-size: 1.5rem;
  margin-top: 2rem;
}\`
};`
      );

      // Create basic HTML template
      const htmlBasicPath = path.join(
        templatesDir,
        "fallbacks",
        "basicHTML.js"
      );
      fs.writeFileSync(
        htmlBasicPath,
        `
module.exports = {
  "index.html": \`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chronos Luxury Timepieces</title>
  <style>
    :root {
      --color-primary: #D4AF37;
      --color-dark: #1A1A1A;
      --color-light: #ECF0F1;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: var(--color-dark);
      color: var(--color-light);
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    header {
      text-align: center;
      padding: 4rem 0;
    }
    
    h1 {
      font-size: 3rem;
      color: var(--color-primary);
      margin-bottom: 1rem;
    }
    
    p {
      font-size: 1.2rem;
      line-height: 1.6;
      opacity: 0.9;
    }
    
    .card {
      background-color: rgba(255, 255, 255, 0.05);
      border-radius: 0.5rem;
      padding: 2rem;
      margin: 2rem 0;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .btn {
      display: inline-block;
      background-color: var(--color-primary);
      color: var(--color-dark);
      font-weight: bold;
      padding: 0.75rem 1.5rem;
      border-radius: 0.25rem;
      text-decoration: none;
      transition: all 0.3s ease;
    }
    
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    
    footer {
      text-align: center;
      padding: 2rem 0;
      opacity: 0.7;
      font-size: 0.9rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Chronos Luxury Timepieces</h1>
      <p>Your premium destination for elegant watches</p>
    </header>
    
    <main>
      <div class="card">
        <h2 style="color: var(--color-primary);">Exquisite Collection</h2>
        <p>Discover our handpicked selection of luxury timepieces from the world's most prestigious watchmakers.</p>
        <a href="#" class="btn">Explore Collection</a>
      </div>
      
      <div class="card">
        <h2 style="color: var(--color-primary);">Expert Craftsmanship</h2>
        <p>Each timepiece in our collection represents the pinnacle of horological craftsmanship and design.</p>
        <a href="#" class="btn">Our Story</a>
      </div>
    </main>
    
    <footer>
      <p>&copy; 2023 Chronos Luxury Timepieces. All rights reserved.</p>
    </footer>
  </div>
</body>
</html>\`
};`
      );
    } catch (error) {
      this.logger.error("Failed to create fallback templates:", error.message);
    }
  }

  /**
   * Create a default file system implementation
   * @private
   */
  _createDefaultFileSystem() {
    return {
      writeFile: async (filePath, content) => {
        try {
          const fullPath = path.resolve(this.workspaceDir, filePath);
          const directory = path.dirname(fullPath);

          // Create directory if it doesn't exist
          if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
          }

          fs.writeFileSync(fullPath, content);
          return true;
        } catch (error) {
          this.logger.error(`File system error writing ${filePath}:`, error);
          this.errorCounts.filesystem++;
          throw error;
        }
      },

      readFile: async (filePath) => {
        try {
          const fullPath = path.resolve(this.workspaceDir, filePath);
          if (!fs.existsSync(fullPath)) {
            throw new Error(`File not found: ${filePath}`);
          }

          return fs.readFileSync(fullPath, "utf8");
        } catch (error) {
          this.logger.error(`File system error reading ${filePath}:`, error);
          this.errorCounts.filesystem++;
          throw error;
        }
      },

      fileExists: async (filePath) => {
        try {
          const fullPath = path.resolve(this.workspaceDir, filePath);
          return fs.existsSync(fullPath);
        } catch (error) {
          this.logger.error(`File system error checking ${filePath}:`, error);
          this.errorCounts.filesystem++;
          return false;
        }
      },

      saveImage: async (url, targetPath) => {
        try {
          const fullPath = path.resolve(this.workspaceDir, targetPath);
          const directory = path.dirname(fullPath);

          if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
          }

          // Try to get the image from cache first
          const cacheKey = url.split("?")[0]; // Remove query params for caching
          const cachedImagePath = path.join(
            CACHE_DIR,
            "images",
            `${uuidv4()}.jpg`
          );

          // Download image from URL
          const response = await axios({
            method: "GET",
            url: url,
            responseType: "stream",
            timeout: 15000,
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
          });

          // Save to file
          const writer = fs.createWriteStream(fullPath);
          response.data.pipe(writer);

          // Also save to cache
          const cacheWriter = fs.createWriteStream(cachedImagePath);
          response.data.pipe(cacheWriter);

          return new Promise((resolve, reject) => {
            writer.on("finish", resolve);
            writer.on("error", (err) => {
              this.logger.error(`Error writing image to ${fullPath}:`, err);
              reject(err);
            });
          });
        } catch (error) {
          this.logger.error(
            `Error saving image from ${url} to ${targetPath}:`,
            error
          );
          this.errorCounts.imageLoading++;

          // Try to use a cached image as fallback
          try {
            const cachedImages = fs.readdirSync(path.join(CACHE_DIR, "images"));
            if (cachedImages.length > 0) {
              const randomCachedImage =
                cachedImages[Math.floor(Math.random() * cachedImages.length)];
              const cachedImagePath = path.join(
                CACHE_DIR,
                "images",
                randomCachedImage
              );
              const fullPath = path.resolve(this.workspaceDir, targetPath);
              fs.copyFileSync(cachedImagePath, fullPath);
              return true;
            }
          } catch (cacheError) {
            this.logger.error(
              "Failed to use cached image as fallback:",
              cacheError
            );
          }

          throw error;
        }
      },
    };
  }

  /**
   * Register framework-specific code generators
   * @private
   */
  _registerFrameworkGenerators() {
    this.frameworkGenerators.set("react", this._generateReactCode.bind(this));
    this.frameworkGenerators.set("next", this._generateNextCode.bind(this));
    this.frameworkGenerators.set("nextjs", this._generateNextCode.bind(this));
    this.frameworkGenerators.set("vue", this._generateVueCode.bind(this));
    this.frameworkGenerators.set("html", this._generateHTMLCode.bind(this));
    this.frameworkGenerators.set(
      "default",
      this._generateDefaultCode.bind(this)
    );
  }

  /**
   * Ensure workspace directories exist
   * @private
   */
  _ensureWorkspaceExists() {
    try {
      // Create all necessary directories
      [
        this.workspaceDir,
        this.publicDir,
        this.imagesDir,
        this.srcDir,
        path.join(this.srcDir, "components"),
        path.join(this.srcDir, "pages"),
        path.join(this.srcDir, "styles"),
        path.join(this.srcDir, "utils"),
        path.join(this.srcDir, "assets"),
      ].forEach((dir) => {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
      });

      // Create base package.json if it doesn't exist
      const packageJsonPath = path.join(this.workspaceDir, "package.json");
      if (!fs.existsSync(packageJsonPath)) {
        const packageJson = {
          name: "stunning-website",
          version: "1.0.0",
          private: true,
          scripts: {
            dev: "next dev",
            build: "next build",
            start: "next start",
          },
          dependencies: {
            react: "^18.2.0",
            "react-dom": "^18.2.0",
            next: "^13.4.19",
            "framer-motion": "^10.15.1",
            tailwindcss: "^3.3.3",
            "@headlessui/react": "^1.7.15",
            "react-intersection-observer": "^9.5.2",
            gsap: "^3.12.2",
            "@chakra-ui/react": "^2.8.0",
            "@emotion/react": "^11.11.1",
            "@emotion/styled": "^11.11.0",
            three: "^0.155.0",
            "@react-three/fiber": "^8.13.6",
            "@react-three/drei": "^9.80.1",
          },
          devDependencies: {
            autoprefixer: "^10.4.14",
            postcss: "^8.4.27",
          },
        };

        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      }

      // Create tailwind.config.js with the premium color palette if it doesn't exist
      const tailwindConfigPath = path.join(
        this.workspaceDir,
        "tailwind.config.js"
      );
      if (!fs.existsSync(tailwindConfigPath)) {
        const tailwindConfig = `
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/pages/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/app/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#D4AF37",
          50: "#F9F4E3",
          100: "#F4EAC7",
          200: "#EDD68F",
          300: "#E6C257",
          400: "#DFAE1F",
          500: "#D4AF37", // Base gold
          600: "#B38D25",
          700: "#8F6B1D",
          800: "#6B4E15",
          900: "#47320D",
        },
        secondary: {
          DEFAULT: "#1A1A1A",
          50: "#F5F5F5",
          100: "#E6E6E6",
          200: "#CCCCCC",
          300: "#B3B3B3",
          400: "#999999",
          500: "#808080",
          600: "#666666",
          700: "#4D4D4D",
          800: "#333333",
          900: "#1A1A1A", // Base dark
        },
        accent: {
          DEFAULT: "#E4572E",
          50: "#FCECE8",
          100: "#F9D9D1",
          200: "#F3B3A2",
          300: "#EE8D74",
          400: "#E86745",
          500: "#E4572E", // Base orange-red
          600: "#C93C13",
          700: "#972D0E",
          800: "#651E09",
          900: "#320F05",
        },
      },
      fontFamily: {
        sans: ['Inter var', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'slide-down': 'slideDown 0.5s ease-out forwards',
        'slide-left': 'slideLeft 0.5s ease-out forwards',
        'slide-right': 'slideRight 0.5s ease-out forwards',
        'scale-in': 'scaleIn 0.5s ease-out forwards',
        'bounce-slow': 'bounce 3s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 5s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-gold': 'linear-gradient(to right, #D4AF37, #F4EAC7, #D4AF37)',
      },
      boxShadow: {
        'gold-sm': '0 1px 2px 0 rgba(212, 175, 55, 0.05)',
        'gold': '0 4px 6px -1px rgba(212, 175, 55, 0.1), 0 2px 4px -1px rgba(212, 175, 55, 0.06)',
        'gold-md': '0 6px 10px -1px rgba(212, 175, 55, 0.1), 0 2px 4px -1px rgba(212, 175, 55, 0.06)',
        'gold-lg': '0 10px 15px -3px rgba(212, 175, 55, 0.1), 0 4px 6px -2px rgba(212, 175, 55, 0.05)',
        'gold-xl': '0 20px 25px -5px rgba(212, 175, 55, 0.1), 0 10px 10px -5px rgba(212, 175, 55, 0.04)',
        'gold-2xl': '0 25px 50px -12px rgba(212, 175, 55, 0.25)',
        'gold-inner': 'inset 0 2px 4px 0 rgba(212, 175, 55, 0.06)',
      },
      textShadow: {
        'gold-sm': '0 1px 2px rgba(212, 175, 55, 0.2)',
        'gold': '0 2px 4px rgba(212, 175, 55, 0.2)',
        'gold-lg': '0 8px 16px rgba(212, 175, 55, 0.2)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        '.text-shadow-gold-sm': {
          textShadow: '0 1px 2px rgba(212, 175, 55, 0.2)',
        },
        '.text-shadow-gold': {
          textShadow: '0 2px 4px rgba(212, 175, 55, 0.2)',
        },
        '.text-shadow-gold-lg': {
          textShadow: '0 8px 16px rgba(212, 175, 55, 0.2)',
        },
        '.bg-blur': {
          backdropFilter: 'blur(8px)',
        },
        '.glass': {
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(8px)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.dark-glass': {
          background: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(8px)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        },
      };

      addUtilities(newUtilities);
    },
  ],
};
`;
        fs.writeFileSync(tailwindConfigPath, tailwindConfig);
      }

      // Create postcss.config.js if it doesn't exist
      const postcssConfigPath = path.join(
        this.workspaceDir,
        "postcss.config.js"
      );
      if (!fs.existsSync(postcssConfigPath)) {
        const postcssConfig = `
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;
        fs.writeFileSync(postcssConfigPath, postcssConfig);
      }

      this.logger.info(`Workspace created at ${this.workspaceDir}`);
    } catch (error) {
      this.logger.error("Failed to create workspace:", error);
      throw error;
    }
  }

  /**
   * Main method to generate code based on requirements
   * @param {Object} requirements - The requirements for code generation
   * @param {Object} projectContext - Additional context for the project
   * @returns {Object} Generated code files
   */
  async generateCode(requirements, projectContext = {}) {
    try {
      // Determine website type, industry and framework
      const websiteType = this._determineWebsiteType(
        requirements,
        projectContext
      );
      const industry = this._determineIndustry(requirements, projectContext);
      const framework = this._determineFramework(requirements, projectContext);

      // Get color scheme based on industry with a preference for dark mode with gold accents (like in the screenshots)
      const colorScheme =
        projectContext.colorScheme ||
        PREMIUM_COLOR_SCHEMES[industry]?.dark ||
        PREMIUM_COLOR_SCHEMES.default.dark;

      // Enhanced project context with all the premium settings
      const enhancedContext = {
        ...projectContext,
        websiteType,
        industry,
        framework,
        colorScheme,
        useDarkMode: true, // Default to dark mode like in the screenshots
        useGoldAccents: true,
        useResponsiveDesign: true,
        useAnimations: true,
        use3DElements:
          websiteType === "luxuryBrand" ||
          industry === "luxury" ||
          projectContext.use3DElements,
        usePremiumUI: true,
        websiteName:
          projectContext.websiteName ||
          this._generateWebsiteName(industry, websiteType),
        designSystem:
          projectContext.designSystem || DESIGN_SYSTEMS.TAILWIND_CSS,
        useGradients: true,
        useGlassmorphism: true,
        useSmoothScrolling: true,
      };

      this.logger.info("Generating premium website code", {
        framework,
        websiteType,
        industry,
        darkMode: enhancedContext.useDarkMode,
      });

      // Get appropriate generator for the framework
      const generator =
        this.frameworkGenerators.get(framework) ||
        this.frameworkGenerators.get("default");

      // Generate the code with retries for reliability
      const generatedCode = await this._executeWithRetries(() =>
        generator(requirements, enhancedContext)
      );

      // Process and enhance the generated code
      return await this._processGeneratedCode(generatedCode, enhancedContext);
    } catch (error) {
      this.logger.error("Error generating code:", error);

      // Fall back to a simple but reliable template
      return this._generateFallbackCode(requirements);
    }
  }

  /**
   * Generate a website name based on industry and type
   * @private
   */
  _generateWebsiteName(industry, websiteType) {
    const industryNames = {
      food: ["Gourmet", "Savory", "Delicious", "Culinary", "Epicurean"],
      foodDelivery: [
        "FeastBox",
        "MealRunner",
        "Delicart",
        "QuickBite",
        "FoodFlex",
      ],
      luxury: ["Opulence", "Prestige", "Luxuria", "Elite", "Grandeur"],
      technology: [
        "TechFusion",
        "InnovateTech",
        "ByteWorks",
        "DigitalPulse",
        "TechNexus",
      ],
      fashion: [
        "Elegance",
        "Couture",
        "StyleSphere",
        "FashionFlex",
        "TrendSet",
      ],
      healthBeauty: ["Radiance", "Wellness", "GlowUp", "Revive", "Serenity"],
      default: ["Premium", "Stellar", "Optimal", "Elevate", "Summit"],
    };

    const typeNames = {
      ecommerce: ["Store", "Shop", "Market", "Emporium", "Boutique"],
      foodDelivery: ["Eats", "Delivery", "Express", "Kitchen", "Meals"],
      portfolio: ["Works", "Portfolio", "Showcase", "Studio", "Creations"],
      blog: ["Journal", "Blog", "Chronicles", "Insights", "Perspectives"],
      landingPage: ["Solutions", "Group", "Hub", "Central", "Platform"],
      dashboard: ["Dashboard", "Analytics", "Metrics", "Insights", "Monitor"],
    };

    const industryOptions = industryNames[industry] || industryNames.default;
    const typeOptions = typeNames[websiteType] || typeNames.landingPage;

    const industryName =
      industryOptions[Math.floor(Math.random() * industryOptions.length)];
    const typeName =
      typeOptions[Math.floor(Math.random() * typeOptions.length)];

    return `${industryName} ${typeName}`;
  }

  /**
   * Process generated code, adding enhancements and writing files
   * @private
   */
  async _processGeneratedCode(generatedCode, projectContext) {
    try {
      if (
        !generatedCode ||
        !generatedCode.files ||
        !Array.isArray(generatedCode.files)
      ) {
        throw new Error("Invalid code generation result, missing files array");
      }

      // Process all files to replace image placeholders and enhance code
      const processedFiles = await Promise.all(
        generatedCode.files.map(async (file) => {
          // Ensure code property exists and is a string
          const code = file.code || file.content || "";

          // Process image placeholders
          let processedCode = await this._processImagePlaceholders(
            code,
            projectContext
          );

          // Apply any additional enhancements
          processedCode = this._enhanceCode(
            processedCode,
            file.path,
            projectContext
          );

          return {
            path: file.path,
            code: processedCode,
            description: file.description || "",
          };
        })
      );

      // Add missing utility files if needed
      const allFiles = [
        ...processedFiles,
        ...this._addMissingUtilityFiles(processedFiles, projectContext),
      ];

      // Write all files to the workspace
      if (this.fileSystem) {
        for (const file of allFiles) {
          try {
            await this.fileSystem.writeFile(file.path, file.code);
            this.logger.info(`File written: ${file.path}`);
          } catch (error) {
            this.logger.warn(`Failed to write file ${file.path}:`, error);
          }
        }
      }

      return {
        files: allFiles,
        framework: projectContext.framework,
        explanation:
          generatedCode.explanation ||
          "Premium website code generated successfully",
      };
    } catch (error) {
      this.logger.error("Error processing generated code:", error);
      throw error;
    }
  }

  /**
   * Process image placeholders in the code
   * @private
   */
  async _processImagePlaceholders(code, projectContext) {
    if (typeof code !== "string") return code;

    try {
      // Replace standard image placeholder patterns
      let processedCode = code;

      // Fix for the broken regex - look for actual placeholders, not just 'h'
      // Look for placeholder:{category} pattern
      const placeholderRegex = /placeholder:([a-zA-Z0-9_-]+)/g;
      const placeholders = Array.from(processedCode.matchAll(placeholderRegex));

      for (const placeholder of placeholders) {
        const fullMatch = placeholder[0];
        const category = placeholder[1];

        // Get an appropriate image URL for this category
        const imageUrl = await this._getImageUrl(category, projectContext);

        // If using local images, download and use a local path
        if (this.useLocalImages) {
          const extension = this._getImageExtension(imageUrl);
          const imageName = `${category}-${uuidv4().substring(0, 8)}${extension}`;
          const localPath = `public/images/${imageName}`;

          try {
            await this.fileSystem.saveImage(imageUrl, localPath);
            processedCode = processedCode.replace(
              fullMatch,
              `/images/${imageName}`
            );
          } catch (error) {
            // Fallback to remote URL if saving fails
            this.logger.warn(
              `Failed to save image locally, using remote URL: ${error.message}`
            );
            processedCode = processedCode.replace(fullMatch, imageUrl);
          }
        } else {
          // Use remote URL directly
          processedCode = processedCode.replace(fullMatch, imageUrl);
        }
      }

      // Replace TailwindCSS background image patterns
      const bgImageRegex = /bg-\[url\((['"])placeholder:([^'"]+)\1\)\]/g;
      const bgMatches = Array.from(processedCode.matchAll(bgImageRegex));

      for (const match of bgMatches) {
        const fullMatch = match[0];
        const quote = match[1];
        const category = match[2];

        const imageUrl = await this._getImageUrl(category, projectContext);

        if (this.useLocalImages) {
          const extension = this._getImageExtension(imageUrl);
          const imageName = `${category}-${uuidv4().substring(0, 8)}${extension}`;
          const localPath = `public/images/${imageName}`;

          try {
            await this.fileSystem.saveImage(imageUrl, localPath);
            processedCode = processedCode.replace(
              fullMatch,
              `bg-[url(${quote}/images/${imageName}${quote})]`
            );
          } catch (error) {
            processedCode = processedCode.replace(
              fullMatch,
              `bg-[url(${quote}${imageUrl}${quote})]`
            );
          }
        } else {
          processedCode = processedCode.replace(
            fullMatch,
            `bg-[url(${quote}${imageUrl}${quote})]`
          );
        }
      }

      // Replace Next.js Image src placeholders
      const nextImageRegex = /src\s*=\s*(['"])placeholder:([^'"]+)\1/g;
      const nextMatches = Array.from(processedCode.matchAll(nextImageRegex));

      for (const match of nextMatches) {
        const fullMatch = match[0];
        const quote = match[1];
        const category = match[2];

        const imageUrl = await this._getImageUrl(category, projectContext);

        if (this.useLocalImages) {
          const extension = this._getImageExtension(imageUrl);
          const imageName = `${category}-${uuidv4().substring(0, 8)}${extension}`;
          const localPath = `public/images/${imageName}`;

          try {
            await this.fileSystem.saveImage(imageUrl, localPath);
            processedCode = processedCode.replace(
              fullMatch,
              `src=${quote}/images/${imageName}${quote}`
            );
          } catch (error) {
            processedCode = processedCode.replace(
              fullMatch,
              `src=${quote}${imageUrl}${quote}`
            );
          }
        } else {
          processedCode = processedCode.replace(
            fullMatch,
            `src=${quote}${imageUrl}${quote}`
          );
        }
      }

      // Replace CSS background image URL placeholders
      const cssImageRegex = /url\((['"])?placeholder:([^'"]+)\1?\)/g;
      const cssMatches = Array.from(processedCode.matchAll(cssImageRegex));

      for (const match of cssMatches) {
        const fullMatch = match[0];
        const quote = match[1] || "";
        const category = match[2];

        const imageUrl = await this._getImageUrl(category, projectContext);

        if (this.useLocalImages) {
          const extension = this._getImageExtension(imageUrl);
          const imageName = `${category}-${uuidv4().substring(0, 8)}${extension}`;
          const localPath = `public/images/${imageName}`;

          try {
            await this.fileSystem.saveImage(imageUrl, localPath);
            processedCode = processedCode.replace(
              fullMatch,
              `url(${quote}/images/${imageName}${quote})`
            );
          } catch (error) {
            processedCode = processedCode.replace(
              fullMatch,
              `url(${quote}${imageUrl}${quote})`
            );
          }
        } else {
          processedCode = processedCode.replace(
            fullMatch,
            `url(${quote}${imageUrl}${quote})`
          );
        }
      }

      return processedCode;
    } catch (error) {
      this.logger.error("Error processing image placeholders:", error);
      this.errorCounts.imageLoading++;

      // Return original code if processing fails
      return code;
    }
  }

  /**
   * Get an image URL for a specific category - Enhanced Version
   * To be placed inside CodeGenerationModule.js to replace existing _getImageUrl method
   * @private
   */
  async _getImageUrl(category, projectContext) {
    try {
      // Check cache first
      const cacheKey = `${category}-${projectContext.industry}`;
      if (this.imageCache.has(cacheKey)) {
        return this.imageCache.get(cacheKey);
      }

      // Map category to a broader search term if needed
      let searchTerm = category;
      if (category === "hero")
        searchTerm = projectContext.industry || "business";
      if (category === "profile") searchTerm = "person portrait";
      if (category === "product" && projectContext.industry === "food")
        searchTerm = "food dish meal";

      // Create a more detailed prompt for Stability AI
      const enhancedPrompt = `High quality professional ${searchTerm} image. Photorealistic ${projectContext.industry || "business"} imagery, detailed, well-lit, 4K resolution.`;

      // First try to generate with Stability AI
      try {
        // Call the generate-image API endpoint
        const response = await fetch("/api/generate-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: enhancedPrompt.substring(0, 1900) }),
          timeout: 20000, // 20 second timeout
        });

        if (response.ok) {
          const data = await response.json();
          if (data.imageBase64) {
            // Cache and return the base64 URL
            this.imageCache.set(cacheKey, data.imageBase64);
            return data.imageBase64;
          }
        }
      } catch (error) {
        // Silently continue to other methods
        console.warn(
          `Failed to generate image with Stability AI for ${category}:`,
          error.message
        );
      }

      // Start with the static images for reliability
      try {
        const mappedCategory = this._mapCategoryToStaticImage(
          category,
          projectContext.industry
        );
        const imageUrl =
          PREMIUM_IMAGE_APIS.staticImages.getDirectUrl(mappedCategory);

        if (imageUrl) {
          // Cache and return the URL
          this.imageCache.set(cacheKey, imageUrl);
          return imageUrl;
        }
      } catch (error) {
        // Continue to other APIs
        console.warn(
          `Failed to get static image for ${category}:`,
          error.message
        );
      }

      // Try Picsum Photos as a reliable fallback
      try {
        const seed = this._generateSeedFromCategory(category);
        const imageUrl = PREMIUM_IMAGE_APIS.picsum.getDirectUrl(seed);

        // Cache and return the URL
        this.imageCache.set(cacheKey, imageUrl);
        return imageUrl;
      } catch (error) {
        // Continue to other APIs
        console.warn(
          `Failed to get Picsum image for ${category}:`,
          error.message
        );
      }

      // Try face images for people/profile categories
      if (
        category === "people" ||
        category === "profile" ||
        category === "person" ||
        category === "testimonial"
      ) {
        try {
          const imageUrl = PREMIUM_IMAGE_APIS.uiFaces.getDirectUrl();
          this.imageCache.set(cacheKey, imageUrl);
          return imageUrl;
        } catch (error) {
          // Continue to other APIs
          console.warn(`Failed to get UI Faces image:`, error.message);
        }
      }

      // Try the API-based image services
      const apiNames = Object.keys(PREMIUM_IMAGE_APIS).filter(
        (name) => !PREMIUM_IMAGE_APIS[name].noApiCall
      );

      for (const apiName of apiNames) {
        const api = PREMIUM_IMAGE_APIS[apiName];

        try {
          // Construct API request
          let url = api.baseUrl;

          // Add search parameters
          if (api.searchParams) {
            const params = api.searchParams(searchTerm);
            url += url.includes("?") ? `&${params}` : `?${params}`;
          }

          // Make API request
          const response = await axios.get(url, {
            headers: api.headers || {},
            timeout: 10000,
          });

          // Get image URL from response using the API's specific method
          if (response.data && api.getUrl) {
            const imageUrl = api.getUrl(response.data);

            if (imageUrl) {
              // Cache and return the URL
              this.imageCache.set(cacheKey, imageUrl);
              return imageUrl;
            }
          }
        } catch (error) {
          // Continue to next API
          console.warn(
            `Failed to get image from ${apiName} for ${category}:`,
            error.message
          );
        }
      }

      // All APIs failed, use static images as last resort
      const imageUrl = PREMIUM_IMAGE_APIS.staticImages.getDirectUrl("default");
      this.imageCache.set(cacheKey, imageUrl);
      return imageUrl;
    } catch (error) {
      console.error(`Error getting image URL for ${category}:`, error);
      this.errorCounts.imageLoading++;

      // Use a hardcoded fallback image URL for reliability
      return "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg";
    }
  }

  /**
   * Map category to Lorem Space category
   * @private
   */
  _mapCategoryToLoremSpace(category) {
    const mapping = {
      food: "food",
      meal: "food",
      dish: "food",
      drink: "drink",
      beverage: "drink",
      movie: "movie",
      film: "movie",
      game: "game",
      album: "album",
      music: "album",
      book: "book",
      person: "face",
      profile: "face",
      people: "face",
      fashion: "fashion",
      clothing: "fashion",
      apparel: "fashion",
      shoes: "shoes",
      footwear: "shoes",
      watch: "watch",
      timepiece: "watch",
      furniture: "furniture",
      car: "car",
      automobile: "car",
      vehicle: "car",
      house: "house",
      home: "house",
      property: "house",
      mountain: "mountain",
      nature: "mountain",
      city: "city",
      urban: "city",
      skyline: "city",
    };

    return mapping[category] || "movie"; // default to movie
  }

  /**
   * Map a category to a static image category
   * @private
   */
  _mapCategoryToStaticImage(category, industry) {
    // Direct mappings
    if (category === "food" || category === "meal" || category === "dish")
      return "food";
    if (category === "business" || category === "office") return "business";
    if (category === "tech" || category === "technology") return "tech";
    if (
      category === "people" ||
      category === "person" ||
      category === "profile"
    )
      return "people";
    if (category === "product") return "product";

    // Try to find in base categories
    if (PREMIUM_IMAGE_APIS.staticImages.baseCategories.includes(category)) {
      return category;
    }

    // Industry-based mappings
    if (industry === "food" || industry === "restaurant") return "food";
    if (industry === "foodDelivery") return "foodDelivery";
    if (industry === "technology" || industry === "tech") return "tech";
    if (industry === "fashion" || industry === "retail") return "fashion";
    if (industry === "luxury") return "luxury";

    // Hero image mapping based on industry
    if (category === "hero") {
      if (industry === "food" || industry === "restaurant") return "food";
      if (industry === "foodDelivery") return "foodDelivery";
      if (industry === "technology" || industry === "tech") return "tech";
      if (industry === "fashion" || industry === "retail") return "fashion";
      if (industry === "luxury") return "luxury";
      return "business";
    }

    // Special mappings for food delivery
    if (category === "chef" || category === "cooking") return "chef";

    // Default
    return "default";
  }

  /**
   * Generate a seed number from a category string
   * @private
   */
  _generateSeedFromCategory(category) {
    // Simple hash function to convert string to number
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      hash = (hash << 5) - hash + category.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }

    // Use absolute value and make sure it's a reasonable number
    return Math.abs(hash % 1000);
  }

  /**
   * Get file extension from image URL
   * @private
   */
  _getImageExtension(url) {
    // Extract extension from URL
    const match = url.match(/\.([a-zA-Z0-9]+)(?:\?.*)?$/);
    if (match && match[1]) {
      const ext = match[1].toLowerCase();

      // Validate it's an image extension
      if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) {
        return `.${ext}`;
      }
    }

    // Default extension
    return ".jpg";
  }

  /**
   * Apply code enhancements to improve quality
   * @private
   */
  _enhanceCode(code, filePath, projectContext) {
    if (typeof code !== "string") return code;

    // Skip binary files and non-code files
    if (
      filePath.match(/\.(jpg|jpeg|png|gif|svg|webp|ico|pdf|ttf|woff|woff2)$/i)
    ) {
      return code;
    }

    try {
      let enhancedCode = code;

      // JSX/TSX file enhancements
      if (filePath.match(/\.(jsx|tsx)$/)) {
        // Replace missing alt attributes on images
        enhancedCode = enhancedCode.replace(
          /<img\s+([^>]*?)src=(['"])([^'"]+)\2([^>]*?)>/g,
          (match, before, quote, src, after) => {
            if (!(before + after).includes("alt=")) {
              const altText = this._generateAltText(src);
              return `<img ${before}src=${quote}${src}${quote} alt=${quote}${altText}${quote}${after}>`;
            }
            return match;
          }
        );

        // Add loading="lazy" to images for performance
        enhancedCode = enhancedCode.replace(
          /<img\s+([^>]*?)>/g,
          (match, attrs) => {
            if (!attrs.includes("loading=")) {
              return `<img ${attrs} loading="lazy">`;
            }
            return match;
          }
        );

        // Add rel="noopener noreferrer" to external links
        enhancedCode = enhancedCode.replace(
          /<a\s+([^>]*?)href=(['"])https?:\/\/([^'"]+)\2([^>]*?)>/g,
          (match, before, quote, url, after) => {
            if (!(before + after).includes("rel=")) {
              return `<a ${before}href=${quote}https://${url}${quote} rel=${quote}noopener noreferrer${quote}${after}>`;
            }
            return match;
          }
        );
      }

      // Tailwind CSS optimizations in JSX/TSX/HTML files
      if (filePath.match(/\.(jsx|tsx|html)$/)) {
        // Combine duplicate Tailwind classes
        enhancedCode = this._optimizeTailwindClasses(enhancedCode);
      }

      // CSS file enhancements
      if (filePath.match(/\.css$/)) {
        // Add prefixes for better browser compatibility
        enhancedCode = enhancedCode.replace(
          /(transform|transition|animation|user-select|box-shadow):/g,
          "-webkit-$1:$2; -moz-$1:$2; -ms-$1:$2; $1:"
        );
      }

      return enhancedCode;
    } catch (error) {
      this.logger.warn(`Error enhancing code for ${filePath}:`, error);
      return code;
    }
  }

  /**
   * Generate alt text for an image based on its source URL
   * @private
   */
  _generateAltText(src) {
    // Extract meaningful parts from URL or path
    const nameParts = src
      .split("/")
      .pop()
      .split("?")[0]
      .split("#")[0]
      .split(".");
    nameParts.pop(); // Remove extension

    if (nameParts.length > 0) {
      // Clean up the name
      const name = nameParts[0]
        .replace(/[-_]/g, " ")
        .replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase to spaces
        .replace(/\d+/g, "") // Remove numbers
        .trim();

      if (name) {
        // Capitalize first letter of each word
        return name
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      }
    }

    // Fallback to descriptive text based on URL parts
    if (src.includes("food") || src.includes("meal")) return "Delicious Food";
    if (src.includes("person") || src.includes("profile"))
      return "Person Portrait";
    if (src.includes("product")) return "Product Image";
    if (src.includes("hero")) return "Hero Image";

    // Generic fallback
    return "Website Image";
  }

  /**
   * Optimize Tailwind CSS classes to avoid duplication
   * @private
   */
  _optimizeTailwindClasses(code) {
    return code.replace(
      /className=(['"])([^'"]+)\1/g,
      (match, quote, classes) => {
        // Split by space and remove duplicates while preserving order
        const uniqueClasses = [...new Set(classes.split(/\s+/))].join(" ");
        return `className=${quote}${uniqueClasses}${quote}`;
      }
    );
  }

  /**
   * Add missing utility files based on the generated code
   * @private
   */
  _addMissingUtilityFiles(files, projectContext) {
    const filePaths = files.map((f) => f.path);
    const additionalFiles = [];

    // Check if we need image utilities
    const needsImageUtils = files.some(
      (file) =>
        typeof file.code === "string" &&
        (file.code.includes("placeholder:") ||
          file.code.includes("background-image") ||
          file.code.includes("<img") ||
          file.code.includes("<Image"))
    );

    if (
      needsImageUtils &&
      !filePaths.some(
        (p) => p.includes("ImageLoader") || p.includes("imageUtils")
      )
    ) {
      // Add image loader utility based on framework
      if (projectContext.framework === "next") {
        additionalFiles.push({
          path: "src/utils/imageLoader.js",
          code: `/**
 * Advanced image loading utilities for Next.js
 * Provides optimized image components with blur-up loading and error handling
 */

import Image from 'next/image';
import { useState, useEffect } from 'react';

/**
 * Generate a blurhash placeholder for images
 * This creates a lightweight blurred version for faster perceived loading
 */
export const getBlurDataURL = (width = 100, height = 100, blurhash = true) => {
  if (!blurhash) {
    // Return a transparent pixel if blurhash not needed
    return 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
  }
  
  // Create a gold-tinted blurred placeholder
  return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/4QAiRXhpZgAATU0AKgAAAAgAAQESAAMAAAABAAEAAAAAAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAGAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAhEAACAQIGAwAAAAAAAAAAAAABAwIRBAUSITFRBhOh8P/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCW5zxP1Vae0zLAQhLM7rGtNyTdbJLXb3wdADpAB//Z';
};

/**
 * Optimized image component with progressive loading and error states
 */
export const OptimizedImage = ({ 
  src, 
  alt, 
  width = 1200, 
  height = 800, 
  className = '', 
  priority = false,
  quality = 80,
  objectFit = "cover",
  objectPosition = "center",
  ...props 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [blurDataURL, setBlurDataURL] = useState(getBlurDataURL());
  
  // Preload the image for better performance
  useEffect(() => {
    if (priority) {
      const img = new Image();
      img.src = src;
      img.onload = () => setIsLoading(false);
      img.onerror = () => setError(true);
      
      return () => {
        img.onload = null;
        img.onerror = null;
      };
    }
  }, [src, priority]);
  
  // Handle image load complete
  const handleLoadComplete = () => {
    setIsLoading(false);
  };
  
  // Handle image load error
  const handleError = () => {
    setError(true);
    setIsLoading(false);
  };
  
  // Combine classes
  const imageClasses = \`\${className} transition-opacity duration-500 \${isLoading ? 'opacity-0' : 'opacity-100'}\`;
  
  // Wrapper classes including shimmer effect while loading
  const wrapperClasses = \`relative overflow-hidden \${className} \${
    isLoading 
      ? 'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:animate-shimmer'
      : ''
  }\`;
  
  return (
    <div className={wrapperClasses} style={{ background: isLoading ? '#1a1a1a' : 'transparent' }}>
      {/* Show loading indicator while loading */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-sm">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Show fallback for error */}
      {error ? (
        <div className={\`flex items-center justify-center \${className || 'h-48 bg-gray-900'}\`}>
          <div className="text-center p-4">
            <svg className="w-10 h-10 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-2 text-sm text-gray-300">{alt || "Image not available"}</p>
          </div>
        </div>
      ) : (
        <Image
          src={src}
          alt={alt || "Image"}
          width={width || 1200}
          height={height || 800}
          className={imageClasses}
          style={{ objectFit, objectPosition }}
          onLoadingComplete={handleLoadComplete}
          onError={handleError}
          priority={priority}
          quality={quality}
          placeholder="blur"
          blurDataURL={blurDataURL}
          {...props}
        />
      )}
    </div>
  );
};

/**
 * Create a responsive image URL with given parameters
 */
export const responsiveImageUrl = (url, width, height, quality = 80) => {
  // For external URLs, we can't modify them
  if (url.startsWith('http')) {
    return url;
  }
  
  // For local URLs, add width, height and quality
  return \`\${url}?w=\${width}&h=\${height}&q=\${quality}\`;
};

/**
 * Gallery image component with advanced hover effects
 */
export const GalleryImage = ({ 
  src, 
  alt,
  width = 400,
  height = 300,
  hoverEffect = 'zoom',
  className = '',
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const hoverStyles = {
    zoom: {
      transform: isHovered ? 'scale(1.05)' : 'scale(1)',
      transition: 'transform 0.5s ease',
    },
    fade: {
      filter: isHovered ? 'brightness(1.1)' : 'brightness(1)',
      transition: 'filter 0.5s ease',
    },
    tilt: {
      transform: isHovered ? 'perspective(1000px) rotateY(5deg)' : 'perspective(1000px) rotateY(0)',
      transition: 'transform 0.5s ease',
    },
    glow: {
      boxShadow: isHovered ? '0 0 20px rgba(212, 175, 55, 0.5)' : 'none',
      transition: 'box-shadow 0.5s ease',
    }
  };
  
  const effectStyle = hoverStyles[hoverEffect] || hoverStyles.zoom;
  
  return (
    <div 
      className={\`overflow-hidden \${className}\`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <OptimizedImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        style={effectStyle}
        {...props}
      />
    </div>
  );
};

/**
 * Hero banner component with automatic height calculation
 */
export const HeroBanner = ({
  src,
  alt,
  title,
  subtitle,
  overlay = true,
  overlayOpacity = 0.5,
  minHeight = "70vh",
  textPosition = "center",
  children,
  ...props
}) => {
  // Position classes based on the textPosition prop
  const positionClasses = {
    center: "items-center justify-center text-center",
    left: "items-center justify-start text-left pl-8 md:pl-16",
    right: "items-center justify-end text-right pr-8 md:pr-16",
    "bottom-left": "items-end justify-start text-left p-8 md:p-16",
    "bottom-right": "items-end justify-end text-right p-8 md:p-16",
    "top-left": "items-start justify-start text-left p-8 md:p-16",
    "top-right": "items-start justify-end text-right p-8 md:p-16",
    bottom: "items-end justify-center text-center pb-8 md:pb-16",
    top: "items-start justify-center text-center pt-8 md:pt-16",
  };
  
  const positionClass = positionClasses[textPosition] || positionClasses.center;
  
  return (
    <div className="relative w-full" style={{ minHeight }}>
      <div className="absolute inset-0 w-full h-full">
        <OptimizedImage
          src={src}
          alt={alt || "Hero banner"}
          layout="fill"
          objectFit="cover"
          priority={true}
          {...props}
        />
      </div>
      
      {overlay && (
        <div 
          className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/10 to-black/80"
          style={{ opacity: overlayOpacity }}
        ></div>
      )}
      
      <div className={\`relative w-full h-full flex flex-col \${positionClass} z-10\`}>
        {title && (
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
            {title}
          </h1>
        )}
        
        {subtitle && (
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl drop-shadow-md">
            {subtitle}
          </p>
        )}
        
        {children}
      </div>
    </div>
  );
};

export default {
  OptimizedImage,
  GalleryImage,
  HeroBanner,
  getBlurDataURL,
  responsiveImageUrl
};`,
          description:
            "Advanced Next.js image loading and optimization utilities with premium effects",
        });
      } else {
        additionalFiles.push({
          path: "src/utils/imageUtils.js",
          code: `/**
 * Premium image loading utilities for React
 * Features advanced loading animations and fallbacks
 */

import { useState, useEffect, useRef } from 'react';

/**
 * Lazy image loading hook with sophisticated loading states
 */
export const useProgressiveImage = (lowResSrc, highResSrc) => {
  const [src, setSrc] = useState(lowResSrc || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [blur, setBlur] = useState(true);

  useEffect(() => {
    // Reset states when src changes
    setLoading(true);
    setError(false);
    setSrc(lowResSrc);
    setBlur(true);
    
    // Start with low resolution source if available
    if (lowResSrc) {
      const lowResImg = new Image();
      lowResImg.src = lowResSrc;
      lowResImg.onload = () => {
        setSrc(lowResSrc);
        setLoading(false);
      };
      lowResImg.onerror = () => setError(true);
    }
    
    // Then load high resolution source
    const highResImg = new Image();
    highResImg.src = highResSrc;
    
    highResImg.onload = () => {
      setSrc(highResSrc);
      setLoading(false);
      
      // Remove blur after a short delay for smooth transition
      setTimeout(() => {
        setBlur(false);
      }, 100);
    };
    
    highResImg.onerror = () => setError(true);
    
    return () => {
      lowResSrc && (lowResImg.onload = null);
      lowResSrc && (lowResImg.onerror = null);
      highResImg.onload = null;
      highResImg.onerror = null;
    };
  }, [lowResSrc, highResSrc]);

  return { src, loading, error, blur };
};

/**
 * Create a low-resolution placeholder for an image
 */
export const createPlaceholderSrc = (color = "#1a1a1a") => {
  // Create a 1x1 pixel data URI with the specified color
  return \`data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect width='1' height='1' fill='\${color.replace('#', '%23')}' /%3E%3C/svg%3E\`;
};

/**
 * Check if an element is in viewport with IntersectionObserver
 */
export const useInView = (options = {}) => {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, {
      threshold: options.threshold || 0,
      rootMargin: options.rootMargin || '0px',
      root: options.root || null
    });
    
    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [options.threshold, options.rootMargin, options.root]);

  return { ref, isInView };
};

/**
 * Premium image component with advanced loading effects
 */
export const PremiumImage = ({ 
  src,
  lowResSrc,
  placeholderColor = "#1a1a1a",
  alt,
  width,
  height,
  className = "",
  loadingClassName = "",
  errorClassName = "",
  fadeIn = true,
  lazyLoad = true,
  hoverEffect = null,
  rounded = false,
  shadow = false,
  grayscale = false,
  ...props 
}) => {
  // Create default low-res placeholder if not provided
  const placeholderSrc = lowResSrc || createPlaceholderSrc(placeholderColor);
  
  // Use intersection observer for lazy loading
  const { ref, isInView } = useInView({
    threshold: 0.1,
    rootMargin: '200px 0px'
  });
  
  // Only start loading when in view if lazyLoad is true
  const shouldStartLoading = lazyLoad ? isInView : true;
  
  // Use progressive image loading
  const { src: currentSrc, loading, error, blur } = useProgressiveImage(
    placeholderSrc,
    shouldStartLoading ? src : null
  );
  
  // Combine all the dynamic classes
  const imageClasses = [
    className,
    rounded ? \`rounded-\${typeof rounded === 'string' ? rounded : 'lg'}\` : '',
    shadow ? \`shadow-\${typeof shadow === 'string' ? shadow : 'lg'}\` : '',
    grayscale ? 'grayscale' : '',
    blur ? 'blur-sm' : '',
    fadeIn && !loading && !error ? 'animate-fade-in' : '',
    loading ? loadingClassName || 'opacity-60' : '',
    error ? errorClassName || '' : '',
    hoverEffect === 'zoom' ? 'transition-transform duration-300 hover:scale-105' : '',
    hoverEffect === 'brighten' ? 'transition-filter duration-300 hover:brightness-110' : '',
    hoverEffect === 'saturate' ? 'transition-filter duration-300 hover:saturate-150' : '',
    hoverEffect === 'glow' ? 'transition-shadow duration-300 hover:shadow-gold' : '',
  ].filter(Boolean).join(' ');
  
  const containerStyle = {
    width: width ? \`\${width}px\` : '100%',
    height: height ? \`\${height}px\` : 'auto',
    position: 'relative',
    overflow: 'hidden',
  };
  
  const imgStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'filter 0.3s ease, transform 0.3s ease, opacity 0.5s ease',
  };

  return (
    <div ref={ref} style={containerStyle} className={rounded ? \`rounded-\${typeof rounded === 'string' ? rounded : 'lg'}\` : ''}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-sm z-10">
          <div className="w-8 h-8 border-4 border-gray-300/30 border-t-primary rounded-full animate-spin"></div>
        </div>
      )}
      
      {error ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-900 text-center p-4">
          <div>
            <svg className="w-10 h-10 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-2 text-sm text-gray-300">{alt || "Image not available"}</p>
          </div>
        </div>
      ) : (
        <img
          src={currentSrc || placeholderSrc}
          alt={alt || "Image"}
          className={imageClasses}
          style={imgStyle}
          loading={lazyLoad ? "lazy" : "eager"}
          {...props}
        />
      )}
    </div>
  );
};

/**
 * Image gallery with masonry layout
 */
export const ImageGallery = ({ 
  images,
  columns = 3,
  gap = 4,
  rounded = 'md',
  onClick,
  className = '',
}) => {
  const [columnImages, setColumnImages] = useState([]);
  
  useEffect(() => {
    // Distribute images across columns
    const cols = Array.from({ length: columns }, () => []);
    
    images.forEach((image, index) => {
      cols[index % columns].push(image);
    });
    
    setColumnImages(cols);
  }, [images, columns]);

  return (
    <div className={\`grid grid-cols-1 md:grid-cols-\${columns} gap-\${gap} \${className}\`}>
      {columnImages.map((column, colIndex) => (
        <div key={colIndex} className="flex flex-col gap-4">
          {column.map((image, imgIndex) => (
            <div 
              key={imgIndex} 
              className={\`overflow-hidden rounded-\${rounded} \${onClick ? 'cursor-pointer transform transition-transform hover:scale-[1.02]' : ''}\`}
              onClick={() => onClick && onClick(image, colIndex * images.length / columns + imgIndex)}
            >
              <PremiumImage 
                src={image.src || image.url || image}
                alt={image.alt || \`Gallery image \${colIndex * images.length / columns + imgIndex + 1}\`}
                height={image.height}
                width="100%"
                rounded={rounded}
                fadeIn
                lazyLoad
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

/**
 * Background image component with parallax effect
 */
export const ParallaxBackground = ({
  src,
  speed = 0.5,
  height = '60vh',
  overlayColor = 'rgba(0,0,0,0.4)',
  children,
  className = '',
}) => {
  const [offsetY, setOffsetY] = useState(0);
  const [windowHeight, setWindowHeight] = useState(0);
  const elementRef = useRef(null);
  
  useEffect(() => {
    setWindowHeight(window.innerHeight);
    
    const handleScroll = () => {
      if (elementRef.current) {
        const { top } = elementRef.current.getBoundingClientRect();
        const offset = window.pageYOffset;
        const elementPositionY = offset + top;
        
        if (top < windowHeight && top > -elementRef.current.offsetHeight) {
          const newOffsetY = (elementPositionY - offset) * speed;
          setOffsetY(newOffsetY);
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed, windowHeight]);
  
  return (
    <div 
      ref={elementRef}
      className={\`relative overflow-hidden \${className}\`}
      style={{ height }}
    >
      <div 
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: \`url(\${src})\`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: \`translateY(\${offsetY}px)\`,
        }}
      />
      {overlayColor && (
        <div 
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: overlayColor,
          }}
        />
      )}
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
};

/**
 * Optimize image URL for different scenarios
 */
export const optimizeImageUrl = (url, width = 800, height = 600, quality = 80) => {
  if (!url) return '';
  
  // For data URLs, return as is
  if (url.startsWith('data:')) return url;
  
  // For image provider URLs, add appropriate parameters
  if (url.includes('unsplash.com')) {
    return \`\${url.split('?')[0]}?w=\${width}&h=\${height}&q=\${quality}&fit=crop\`;
  }
  
  if (url.includes('images.pexels.com')) {
    return \`\${url.split('?')[0]}?auto=compress&cs=tinysrgb&w=\${width}&h=\${height}&dpr=2\`;
  }
  
  if (url.includes('picsum.photos')) {
    return \`\${url.split('?')[0].replace(/\\d+\\/\\d+$/, '')}\${width}/\${height}\`;
  }
  
  // General case, return original URL
  return url;
};

export default {
  useProgressiveImage,
  PremiumImage,
  ImageGallery,
  ParallaxBackground,
  optimizeImageUrl,
  useInView,
  createPlaceholderSrc,
};`,
          description:
            "Premium React image loading and effects utilities with advanced features",
        });
      }
    }

    // Check if we need 3D utilities
    const needs3DUtils = files.some(
      (file) =>
        typeof file.code === "string" &&
        (file.code.includes("Three") ||
          file.code.includes("three") ||
          file.code.includes("useThree") ||
          file.code.includes("Canvas") ||
          (projectContext.use3DElements && !file.path.includes("3d")))
    );

    if (
      needs3DUtils &&
      !filePaths.some((p) => p.includes("3d") || p.includes("three"))
    ) {
      additionalFiles.push({
        path: "src/utils/3dUtils.js",
        code: `/**
 * 3D utilities for creating premium interactive elements
 * Compatible with React Three Fiber
 */

import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Create a smooth floating animation for 3D objects
 */
export const useFloatAnimation = (speedFactor = 1, amplitude = 0.1) => {
  const meshRef = useRef();
  const initialY = useRef(0);
  
  useEffect(() => {
    if (meshRef.current) {
      initialY.current = meshRef.current.position.y;
    }
  }, []);
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const time = clock.getElapsedTime();
      meshRef.current.position.y = initialY.current + Math.sin(time * speedFactor) * amplitude;
    }
  });
  
  return meshRef;
};

/**
 * Create a rotating animation for 3D objects
 */
export const useRotateAnimation = (
  axis = 'y',
  speed = 0.5,
  autoRotate = true,
  dragControl = false
) => {
  const meshRef = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const rotationSpeed = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0, y: 0 });
  
  useEffect(() => {
    if (!dragControl) return;
    
    const handleMouseDown = (e) => {
      setIsDragging(true);
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    const handleMouseMove = (e) => {
      if (isDragging && meshRef.current) {
        const deltaX = e.clientX - previousMousePosition.current.x;
        const deltaY = e.clientY - previousMousePosition.current.y;
        
        rotationSpeed.current.y = deltaX * 0.01;
        rotationSpeed.current.x = deltaY * 0.01;
        
        targetRotation.current.y += rotationSpeed.current.y;
        targetRotation.current.x += rotationSpeed.current.x;
        
        previousMousePosition.current = { x: e.clientX, y: e.clientY };
      }
    };
    
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isDragging, dragControl]);
  
  useFrame(() => {
    if (meshRef.current) {
      if (dragControl) {
        // Apply smooth interpolation to rotation
        meshRef.current.rotation.x += (targetRotation.current.x - meshRef.current.rotation.x) * 0.1;
        meshRef.current.rotation.y += (targetRotation.current.y - meshRef.current.rotation.y) * 0.1;
        
        // Apply damping to rotation speed
        rotationSpeed.current.x *= 0.95;
        rotationSpeed.current.y *= 0.95;
      } else if (autoRotate) {
        // Simple auto-rotation
        if (axis === 'y' || axis === 'all') {
          meshRef.current.rotation.y += speed * 0.01;
        }
        if (axis === 'x' || axis === 'all') {
          meshRef.current.rotation.x += speed * 0.01;
        }
        if (axis === 'z' || axis === 'all') {
          meshRef.current.rotation.z += speed * 0.01;
        }
      }
    }
  });
  
  return meshRef;
};

/**
 * Create a hover effect for 3D objects
 */
export const useHoverEffect = (
  hoverScale = 1.1,
  hoverColor = null,
  onHover = null,
  onHoverExit = null
) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const originalScale = useRef(null);
  const originalColor = useRef(null);
  const originalPosition = useRef(null);
  
  useEffect(() => {
    if (meshRef.current && !originalScale.current) {
      originalScale.current = meshRef.current.scale.clone();
      originalPosition.current = meshRef.current.position.clone();
      
      if (meshRef.current.material && hoverColor) {
        originalColor.current = meshRef.current.material.color.clone();
      }
    }
  }, [hoverColor]);
  
  useEffect(() => {
    if (meshRef.current) {
      if (hovered) {
        // Apply hover effects
        meshRef.current.scale.set(
          originalScale.current.x * hoverScale,
          originalScale.current.y * hoverScale,
          originalScale.current.z * hoverScale
        );
        
        if (hoverColor && meshRef.current.material) {
          meshRef.current.material.color.set(hoverColor);
        }
        
        onHover && onHover(meshRef.current);
      } else {
        // Restore original state
        meshRef.current.scale.copy(originalScale.current);
        
        if (originalColor.current && meshRef.current.material) {
          meshRef.current.material.color.copy(originalColor.current);
        }
        
        onHoverExit && onHoverExit(meshRef.current);
      }
    }
  }, [hovered, hoverScale, hoverColor, onHover, onHoverExit]);
  
  const hoverHandlers = {
    onPointerOver: () => setHovered(true),
    onPointerOut: () => setHovered(false),
  };
  
  return { meshRef, hovered, hoverHandlers };
};

/**
 * Create a gold material for 3D objects
 */
export const createGoldMaterial = (roughness = 0.1, metalness = 1) => {
  return new THREE.MeshStandardMaterial({
    color: 0xD4AF37,
    roughness,
    metalness,
  });
};

/**
 * Animated 3D text component for React Three Fiber
 */
export const AnimatedText3D = ({ 
  text,
  size = 1,
  height = 0.2,
  color = '#D4AF37',
  bevelEnabled = true,
  bevelThickness = 0.01,
  bevelSize = 0.01,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) => {
  const textRef = useRef();
  const [textGeometry, setTextGeometry] = useState(null);
  
  useEffect(() => {
    // Load font and create geometry
    const loader = new THREE.FontLoader();
    loader.load('/fonts/helvetiker_regular.typeface.json', (font) => {
      const geometry = new THREE.TextGeometry(text, {
        font,
        size,
        height,
        curveSegments: 12,
        bevelEnabled,
        bevelThickness,
        bevelSize,
        bevelOffset: 0,
        bevelSegments: 5,
      });
      
      geometry.computeBoundingBox();
      geometry.center();
      
      setTextGeometry(geometry);
    });
  }, [text, size, height, bevelEnabled, bevelThickness, bevelSize]);
  
  // Use floating animation
  const floatRef = useFloatAnimation(0.5, 0.05);
  
  // Combine refs
  const combinedRef = (node) => {
    textRef.current = node;
    floatRef.current = node;
  };
  
  if (!textGeometry) return null;
  
  return (
    <mesh
      ref={combinedRef}
      position={position}
      rotation={rotation}
    >
      <primitive object={textGeometry} attach="geometry" />
      <meshStandardMaterial 
        color={color} 
        roughness={0.1} 
        metalness={0.8}
      />
    </mesh>
  );
};

/**
 * Create a parallax effect based on mouse movement
 */
export const useMouseParallax = (strength = 0.1) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const targetRef = useRef();
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      // Calculate normalized coordinates (-1 to 1)
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      
      setMousePosition({ x, y });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  useFrame(() => {
    if (targetRef.current) {
      targetRef.current.rotation.x = mousePosition.y * strength;
      targetRef.current.rotation.y = mousePosition.x * strength;
    }
  });
  
  return targetRef;
};

export default {
  useFloatAnimation,
  useRotateAnimation,
  useHoverEffect,
  createGoldMaterial,
  AnimatedText3D,
  useMouseParallax,
};`,
        description:
          "Advanced 3D utilities for creating interactive premium elements",
      });
    }

    // Check if we need animation utilities
    const needsAnimationUtils = files.some(
      (file) =>
        typeof file.code === "string" &&
        (file.code.includes("animation") ||
          file.code.includes("transition") ||
          file.code.includes("motion") ||
          file.code.includes("fade") ||
          file.code.includes("slide"))
    );

    if (
      needsAnimationUtils &&
      !filePaths.some((p) => p.includes("animation") || p.includes("motion"))
    ) {
      additionalFiles.push({
        path: "src/utils/animations.js",
        code: `/**
 * Premium animation utilities with framer-motion and GSAP integration
 * Creates stunning, smooth animations for a luxury feel
 */

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Basic animation variants for framer-motion
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } }
};

// Elegant slide up animation
export const slideUp = {
  hidden: { y: 50, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { 
      duration: 0.6, 
      ease: [0.25, 0.1, 0.25, 1.0] 
    } 
  }
};

// Subtle slide down animation
export const slideDown = {
  hidden: { y: -50, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { 
      duration: 0.6, 
      ease: [0.25, 0.1, 0.25, 1.0] 
    } 
  }
};

// Slide-in from left animation
export const slideInLeft = {
  hidden: { x: -100, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1, 
    transition: { 
      duration: 0.6, 
      ease: [0.25, 0.1, 0.25, 1.0] 
    } 
  }
};

// Slide-in from right animation
export const slideInRight = {
  hidden: { x: 100, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1, 
    transition: { 
      duration: 0.6, 
      ease: [0.25, 0.1, 0.25, 1.0] 
    } 
  }
};

// Elegant scale animation
export const scaleIn = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1, 
    transition: { 
      duration: 0.6, 
      ease: [0.25, 0.1, 0.25, 1.0] 
    } 
  }
};

// Staggered children animations
export const staggerContainer = (staggerChildren = 0.1, delayChildren = 0) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren,
      staggerChildren,
    }
  }
});

// Premium hover animations
export const goldHover = {
  initial: { 
    boxShadow: '0 0 0 rgba(212, 175, 55, 0)' 
  },
  hover: { 
    scale: 1.02,
    boxShadow: '0 0 20px rgba(212, 175, 55, 0.5)', 
    transition: { 
      duration: 0.3, 
      ease: 'easeOut' 
    } 
  }
};

// Button hover animation
export const buttonHover = {
  initial: { scale: 1, y: 0 },
  hover: { 
    scale: 1.05, 
    y: -3,
    transition: { 
      duration: 0.2, 
      ease: 'easeOut' 
    } 
  }
};

// Infinite pulse animation
export const pulse = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: { 
      duration: 2, 
      repeat: Infinity,
      repeatType: 'reverse',
      ease: 'easeInOut'
    }
  }
};

// Text reveal animation
export const textReveal = {
  hidden: { 
    y: 100,
    opacity: 0,
    clipPath: 'inset(100% 0 0 0)',
  },
  visible: {
    y: 0,
    opacity: 1,
    clipPath: 'inset(0% 0 0 0)',
    transition: {
      duration: 0.7,
      ease: [0.25, 0.1, 0.25, 1.0],
    }
  }
};

// For gold highlighting effect on text
export const goldHighlight = {
  hidden: { 
    color: '#FFFFFF',
    textShadow: '0 0 0px rgba(212, 175, 55, 0)',
  },
  visible: {
    color: '#D4AF37',
    textShadow: '0 0 8px rgba(212, 175, 55, 0.5)',
    transition: {
      duration: 0.8,
      ease: [0.25, 0.1, 0.25, 1.0],
    }
  }
};

// 3D tilt effect on hover
export const tiltHover = {
  initial: { 
    rotateX: 0, 
    rotateY: 0,
    scale: 1,
    z: 0,
  },
  hover: { 
    z: 50,
    scale: 1.05,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    }
  }
};

// Logo float animation
export const logoFloat = {
  initial: { y: 0 },
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      repeatType: 'loop',
      ease: 'easeInOut',
    }
  }
};

// Page transition
export const pageTransition = {
  initial: { 
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: { 
      duration: 0.5,
      when: 'beforeChildren',
      staggerChildren: 0.1,
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.3,
    }
  }
};

// GSAP ScrollTrigger animations

/**
 * Create a scroll-triggered animation
 */
export const useScrollAnimation = (
  options = {
    trigger: null,
    start: 'top 80%',
    end: 'bottom 20%',
    animation: null,
    scrub: false,
    markers: false,
    toggleActions: 'play none none reverse',
  }
) => {
  const elementRef = useRef(null);
  
  useEffect(() => {
    if (!elementRef.current) return;
    
    const trigger = options.trigger || elementRef.current;
    
    let tl;
    if (options.animation) {
      tl = options.animation(elementRef.current);
    } else {
      // Default animation - fade and slide up
      tl = gsap.timeline({ paused: true })
        .fromTo(elementRef.current, 
          { 
            y: 50, 
            opacity: 0 
          }, 
          { 
            y: 0, 
            opacity: 1, 
            duration: 0.8, 
            ease: 'power2.out' 
          }
        );
    }
    
    const scrollTrigger = ScrollTrigger.create({
      trigger,
      start: options.start || 'top 80%',
      end: options.end,
      markers: options.markers || false,
      toggleActions: options.toggleActions || 'play none none reverse',
      scrub: options.scrub || false,
      onEnter: () => tl.play(),
      onLeaveBack: options.scrub ? null : () => tl.reverse(),
    });
    
    return () => {
      scrollTrigger.kill();
      tl.kill();
    };
  }, [options]);
  
  return elementRef;
};

/**
 * Create a scroll-triggered parallax effect
 */
export const useParallaxEffect = (
  speed = 0.5,
  direction = 'y',
  options = {
    start: 'top bottom',
    end: 'bottom top',
    scrub: true,
  }
) => {
  const elementRef = useRef(null);
  
  useEffect(() => {
    if (!elementRef.current) return;
    
    const distance = direction === 'y' ? 
      window.innerHeight * speed * -1 : 
      window.innerWidth * speed * -1;
    
    const animProps = {};
    animProps[direction] = distance;
    
    const scrollTrigger = ScrollTrigger.create({
      trigger: elementRef.current,
      start: options.start || 'top bottom',
      end: options.end || 'bottom top',
      scrub: options.scrub !== undefined ? options.scrub : true,
      markers: options.markers || false,
      animation: gsap.fromTo(
        elementRef.current, 
        { [direction]: 0 }, 
        { ...animProps, ease: 'none' }
      ),
    });
    
    return () => {
      scrollTrigger.kill();
    };
  }, [direction, speed, options]);
  
  return elementRef;
};

/**
 * Create a horizontal scroll section
 */
export const useHorizontalScroll = (
  options = {
    container: null,
    items: null,
    speed: 1,
    snap: false,
    start: 'top top',
    end: '+=300%',
  }
) => {
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = options.container || containerRef.current;
    const items = options.items || container.querySelectorAll('.scroll-item');
    const speed = options.speed || 1;
    
    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        pin: true,
        start: options.start || 'top top',
        end: options.end || '+=300%',
        scrub: true,
        snap: options.snap ? 1 / (items.length - 1) : false,
        markers: options.markers || false,
        invalidateOnRefresh: true,
      }
    });
    
    gsap.utils.toArray(items).forEach((panel, i) => {
      if (i === 0) return;
      
      tl.to(container, {
        x: () => -panel.offsetLeft * speed,
        ease: 'none',
      });
    });
    
    return () => {
      tl.scrollTrigger.kill();
    };
  }, [options]);
  
  return containerRef;
};

/**
 * Letter-by-letter text animation
 */
export const useTextAnimation = (
  text,
  options = {
    type: 'chars', // 'chars', 'words', or 'lines'
    stagger: 0.03,
    duration: 0.5,
    ease: 'power2.out',
    trigger: null,
    start: 'top 80%',
  }
) => {
  const textRef = useRef(null);
  
  useEffect(() => {
    if (!textRef.current) return;
    
    // Handle React Text Nodes
    let splitText;
    if (typeof window !== 'undefined' && typeof SplitText !== 'undefined') {
      // If SplitText is available (requires GSAP premium)
      splitText = new SplitText(textRef.current, { 
        type: options.type,
        linesClass: 'split-line',
        wordsClass: 'split-word',
        charsClass: 'split-char', 
      });
    } else {
      // Fallback to simple query selection
      if (options.type === 'chars') {
        textRef.current.innerHTML = text.split('').map(char => 
          char === ' ' ? ' ' : \`<span class="split-char">\${char}</span>\`
        ).join('');
      } else if (options.type === 'words') {
        textRef.current.innerHTML = text.split(' ').map(word => 
          \`<span class="split-word">\${word}</span>\`
        ).join(' ');
      }
    }
    
    const elements = textRef.current.querySelectorAll(\`.split-\${options.type === 'chars' ? 'char' : 'word'}\`);
    
    gsap.set(elements, { opacity: 0, y: 20 });
    
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: options.trigger || textRef.current,
        start: options.start || 'top 80%',
        toggleActions: 'play none none reverse',
      }
    });
    
    tl.to(elements, {
      opacity: 1,
      y: 0,
      duration: options.duration || 0.5,
      stagger: options.stagger || 0.03,
      ease: options.ease || 'power2.out',
    });
    
    return () => {
      if (splitText) splitText.revert();
      tl.scrollTrigger.kill();
    };
  }, [text, options]);
  
  return textRef;
};

export default {
  // Framer Motion variants
  fadeIn,
  slideUp,
  slideDown,
  slideInLeft,
  slideInRight,
  scaleIn,
  staggerContainer,
  goldHover,
  buttonHover,
  pulse,
  textReveal,
  goldHighlight,
  tiltHover,
  logoFloat,
  pageTransition,
  
  // GSAP hooks
  useScrollAnimation,
  useParallaxEffect,
  useHorizontalScroll,
  useTextAnimation
};`,
        description: "Premium animation utilities for stunning visual effects",
      });
    }

    // Add UI components utility file
    if (
      !filePaths.some(
        (p) => p.includes("components/ui") || p.includes("components/UI")
      )
    ) {
      additionalFiles.push({
        path: "src/components/ui/Button.jsx",
        code: `/**
 * Premium Button component with various styles and animations
 */

import React from 'react';
import { motion } from 'framer-motion';

const variants = {
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
    },
  },
  tap: {
    scale: 0.98,
  },
  initial: {
    scale: 1,
  },
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  rounded = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = 'left',
  fullWidth = false,
  animate = true,
  onClick,
  ...props
}) => {
  // Button size styles
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl',
  };
  
  // Button variant styles
  const variantStyles = {
    primary: 'bg-primary hover:bg-primary-600 focus:ring-primary-300 text-white shadow-md',
    secondary: 'bg-secondary hover:bg-secondary-700 focus:ring-secondary-300 text-white shadow-md',
    outline: 'bg-transparent border-2 border-primary hover:bg-primary/10 text-primary focus:ring-primary-300',
    ghost: 'bg-transparent hover:bg-primary/10 text-primary',
    gold: 'bg-gradient-gold text-secondary font-semibold hover:shadow-gold-lg shadow-md',
    dark: 'bg-secondary text-white hover:bg-secondary-800 focus:ring-secondary-300 shadow-md',
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-300 text-white shadow-md',
    success: 'bg-green-600 hover:bg-green-700 focus:ring-green-300 text-white shadow-md',
    glass: 'backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 text-white shadow-lg',
  };
  
  // Button rounded styles
  const roundedStyles = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };
  
  // Combine all styles
  const buttonClasses = \`
    inline-flex items-center justify-center
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-60 disabled:cursor-not-allowed
    \${sizeStyles[size]}
    \${variantStyles[variant]}
    \${roundedStyles[rounded]}
    \${fullWidth ? 'w-full' : ''}
    \${className}
  \`.trim();
  
  // If animated, use motion.button
  const ButtonComponent = animate ? motion.button : 'button';
  const motionProps = animate ? {
    initial: "initial",
    whileHover: "hover",
    whileTap: "tap",
    variants,
  } : {};
  
  return (
    <ButtonComponent
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...motionProps}
      {...props}
    >
      {loading && (
        <svg 
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          ></circle>
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      
      {icon && iconPosition === 'left' && !loading && (
        <span className="mr-2">{icon}</span>
      )}
      
      {children}
      
      {icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </ButtonComponent>
  );
};

export default Button;`,
        description:
          "Premium button component with animations and multiple styles",
      });

      additionalFiles.push({
        path: "src/components/ui/Card.jsx",
        code: `/**
 * Premium Card component with elegant styling and animations
 */

import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  variant = 'default',
  padding = 'md',
  shadow = 'md',
  rounded = 'lg',
  className = '',
  hoverable = false,
  animation = null,
  glassmorphism = false,
  border = false,
  ...props
}) => {
  // Card variant styles
  const variantStyles = {
    default: 'bg-white dark:bg-secondary-900',
    primary: 'bg-primary-50 dark:bg-primary-900/20',
    secondary: 'bg-secondary-50 dark:bg-secondary-800',
    dark: 'bg-secondary-900 text-white',
    gold: 'bg-gradient-to-br from-primary-100 via-primary-50 to-primary-100 dark:from-primary-900/20 dark:via-primary-900/10 dark:to-primary-900/20',
    transparent: 'bg-transparent',
  };
  
  // Padding styles
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-7',
    xl: 'p-9',
  };
  
  // Shadow styles
  const shadowStyles = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    gold: 'shadow-gold',
    'gold-lg': 'shadow-gold-lg',
  };
  
  // Rounded styles
  const roundedStyles = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
    full: 'rounded-full',
  };
  
  // Animation variants
  const animationVariants = {
    fadeIn: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.5 } },
    },
    slideUp: {
      hidden: { y: 50, opacity: 0 },
      visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
    },
    scale: {
      hidden: { scale: 0.8, opacity: 0 },
      visible: { scale: 1, opacity: 1, transition: { duration: 0.5 } },
    },
    none: null,
  };
  
  // Hover animations
  const hoverAnimation = hoverable ? {
    whileHover: { 
      y: -5, 
      boxShadow: '0 25px 25px rgba(0, 0, 0, 0.1)',
      transition: { duration: 0.2 } 
    },
  } : {};
  
  // Glassmorphism effect
  const glassStyle = glassmorphism ? 'backdrop-filter backdrop-blur-lg bg-white/10 dark:bg-black/20' : '';
  
  // Border style
  const borderStyle = border ? 'border border-gray-100 dark:border-gray-800' : '';
  
  // Combine all styles
  const cardClasses = \`
    transition-all duration-300
    \${variantStyles[variant]}
    \${paddingStyles[padding]}
    \${shadowStyles[shadow]}
    \${roundedStyles[rounded]}
    \${glassStyle}
    \${borderStyle}
    \${className}
  \`.trim();
  
  // If animation is provided, use motion.div
  const selectedAnimation = animation && animationVariants[animation];
  const CardComponent = (animation || hoverable) ? motion.div : 'div';
  
  const motionProps = selectedAnimation ? {
    initial: "hidden",
    animate: "visible",
    variants: selectedAnimation,
    ...hoverAnimation,
  } : hoverAnimation;
  
  return (
    <CardComponent
      className={cardClasses}
      {...motionProps}
      {...props}
    >
      {children}
    </CardComponent>
  );
};

export default Card;`,
        description:
          "Premium card component with glassmorphism and animation effects",
      });
    }

    return additionalFiles;
  }

  /**
   * Execute a function with retries on failure
   * @private
   */
  async _executeWithRetries(fn, maxRetries = this.maxRetries) {
    let lastError = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Set up timeout for the operation
        const result = await Promise.race([
          fn(),
          new Promise((_, reject) =>
            setTimeout(
              () =>
                reject(
                  new Error(
                    `Operation timed out after ${this.requestTimeout}ms`
                  )
                ),
              this.requestTimeout
            )
          ),
        ]);

        return result; // Success, return the result
      } catch (error) {
        lastError = error;
        this.logger.warn(
          `Attempt ${attempt + 1}/${maxRetries} failed:`,
          error.message
        );

        // Wait before retrying (exponential backoff)
        if (attempt < maxRetries - 1) {
          const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s, ...
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    // All retries failed
    throw lastError;
  }

  /**
   * Determine website type based on requirements
   * @private
   */
  _determineWebsiteType(requirements, projectContext = {}) {
    // If explicitly provided, use that
    if (projectContext.websiteType) {
      return projectContext.websiteType;
    }

    // Try to infer from requirements
    const description =
      requirements.description ||
      requirements.planContext ||
      requirements.task ||
      JSON.stringify(requirements);

    const lowerDesc = description.toLowerCase();

    // Check for common website types
    if (
      lowerDesc.includes("ecommerce") ||
      lowerDesc.includes("shop") ||
      lowerDesc.includes("store") ||
      lowerDesc.includes("product") ||
      lowerDesc.includes("buy")
    ) {
      return "ecommerce";
    }

    if (
      lowerDesc.includes("blog") ||
      lowerDesc.includes("article") ||
      lowerDesc.includes("post")
    ) {
      return "blog";
    }

    if (
      lowerDesc.includes("portfolio") ||
      lowerDesc.includes("showcase") ||
      lowerDesc.includes("work")
    ) {
      return "portfolio";
    }

    if (
      lowerDesc.includes("dashboard") ||
      lowerDesc.includes("admin") ||
      lowerDesc.includes("analytics")
    ) {
      return "dashboard";
    }

    if (
      lowerDesc.includes("food") ||
      lowerDesc.includes("restaurant") ||
      lowerDesc.includes("menu") ||
      lowerDesc.includes("delivery")
    ) {
      return "foodDelivery";
    }

    // Default to landing page
    return "landingPage";
  }

  /**
   * Determine industry based on requirements
   * @private
   */
  _determineIndustry(requirements, projectContext = {}) {
    // If explicitly provided, use that
    if (projectContext.industry) {
      return projectContext.industry;
    }

    // Try to infer from requirements
    const description =
      requirements.description ||
      requirements.planContext ||
      requirements.task ||
      JSON.stringify(requirements);

    const lowerDesc = description.toLowerCase();

    // Map common industries
    const industries = {
      food: [
        "food",
        "restaurant",
        "meal",
        "recipe",
        "chef",
        "culinary",
        "dining",
      ],
      technology: [
        "tech",
        "software",
        "app",
        "digital",
        "computer",
        "ai",
        "code",
      ],
      fashion: ["fashion", "clothing", "apparel", "style", "wear", "accessory"],
      healthBeauty: ["health", "beauty", "wellness", "fitness", "spa", "salon"],
      luxury: [
        "luxury",
        "premium",
        "exclusive",
        "high-end",
        "elegant",
        "sophisticated",
      ],
    };

    // Check each industry keywords
    for (const [industry, keywords] of Object.entries(industries)) {
      if (keywords.some((keyword) => lowerDesc.includes(keyword))) {
        return industry;
      }
    }

    // Infer from website type
    if (projectContext.websiteType === "foodDelivery") return "food";
    if (projectContext.websiteType === "ecommerce") return "fashion";

    // Default industry
    return "luxury"; // Default to luxury for an elegant look
  }

  /**
   * Determine framework based on requirements and context
   * @private
   */
  _determineFramework(requirements, projectContext = {}) {
    // If explicitly provided, use that
    if (projectContext.framework) {
      return projectContext.framework.toLowerCase();
    }

    if (requirements.framework) {
      return requirements.framework.toLowerCase();
    }

    // Try to infer from requirements
    const description =
      requirements.description ||
      requirements.planContext ||
      requirements.task ||
      JSON.stringify(requirements);

    const lowerDesc = description.toLowerCase();

    // Check for framework mentions
    if (lowerDesc.includes("next.js") || lowerDesc.includes("nextjs")) {
      return "next";
    }

    if (lowerDesc.includes("react")) {
      return "react";
    }

    if (lowerDesc.includes("vue")) {
      return "vue";
    }

    // Default to Next.js as it's the most powerful option
    return "next";
  }

  /**
   * Generate React-specific code
   * @private
   */
  async _generateReactCode(requirements, projectContext) {
    try {
      // Get appropriate template
      const template = this._getTemplate("react", projectContext.websiteType);

      if (template) {
        // Generate based on template
        return this._generateFromTemplate(template, projectContext);
      }

      // If template not available, use LLM
      if (this.llm) {
        return await this._generateReactCodeWithLLM(
          requirements,
          projectContext
        );
      }

      // Fallback to basic template
      return this._generateFromTemplate(
        this._loadFallbackTemplate("reactBasic"),
        projectContext
      );
    } catch (error) {
      this.logger.error("Error generating React code:", error);

      // Ultimate fallback
      return this._generateFallbackCode(requirements, projectContext);
    }
  }

  /**
   * Generate code using a template
   * @private
   */
  _generateFromTemplate(template, projectContext) {
    try {
      const files = [];

      // Process each file in the template
      for (const [filePath, content] of Object.entries(template)) {
        // Replace placeholders with actual values
        let processedContent = content;

        // Replace website name
        if (projectContext.websiteName) {
          processedContent = processedContent.replace(
            /Chronos Luxury Timepieces/g,
            projectContext.websiteName
          );
        }

        // Replace color scheme values
        if (projectContext.colorScheme) {
          processedContent = processedContent.replace(
            /#D4AF37/g,
            projectContext.colorScheme.primary
          );
          processedContent = processedContent.replace(
            /#1A1A1A/g,
            projectContext.colorScheme.secondary
          );
          processedContent = processedContent.replace(
            /#E74C3C/g,
            projectContext.colorScheme.accent || "#E74C3C"
          );
          processedContent = processedContent.replace(
            /#ECF0F1/g,
            projectContext.colorScheme.text || "#ECF0F1"
          );
          processedContent = processedContent.replace(
            /#FFFFFF/g,
            projectContext.colorScheme.background || "#FFFFFF"
          );
        }

        // Add to file list
        files.push({
          path: filePath,
          code: processedContent,
          description: `Template file for ${projectContext.websiteType} website`,
        });
      }

      return {
        files,
        explanation: `Generated ${projectContext.websiteType} website using ${projectContext.framework} template.`,
      };
    } catch (error) {
      this.logger.error("Error generating from template:", error);
      throw error;
    }
  }

  /**
   * Get template for a specific framework and website type
   * @private
   */
  _getTemplate(framework, websiteType) {
    try {
      const templatePath = TEMPLATE_PATHS[framework]?.[websiteType];

      if (templatePath) {
        // Check if template is already cached
        const cacheKey = `${framework}-${websiteType}`;
        if (this.templateCache.has(cacheKey)) {
          return this.templateCache.get(cacheKey);
        }

        // Try to load the template
        try {
          const template = require(path.join("..", templatePath));
          this.templateCache.set(cacheKey, template);
          return template;
        } catch (error) {
          this.logger.warn(
            `Template not found at ${templatePath}, trying fallback`
          );
        }
      }

      // Try fallback templates
      if (framework === "react") {
        return this._loadFallbackTemplate("reactBasic");
      }

      if (framework === "next") {
        return this._loadFallbackTemplate("nextBasic");
      }

      // No suitable template found
      return null;
    } catch (error) {
      this.logger.error("Error getting template:", error);
      return null;
    }
  }

  /**
   * Load a fallback template
   * @private
   */
  _loadFallbackTemplate(templateName) {
    try {
      const templatePath = TEMPLATE_PATHS.fallbacks[templateName];
      if (!templatePath) {
        throw new Error(`Fallback template ${templateName} not defined`);
      }

      try {
        return require(path.join("..", templatePath));
      } catch (error) {
        // Create fallback templates directory if needed
        this._createBasicFallbackTemplates(
          path.join(__dirname, "..", "templates")
        );

        // Try again
        return require(path.join("..", templatePath));
      }
    } catch (error) {
      this.logger.error(
        `Error loading fallback template ${templateName}:`,
        error
      );

      // Return minimal hardcoded fallbacks
      if (templateName === "reactBasic") {
        return {
          "src/App.jsx": `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to My Beautiful Website</h1>
        <p>Your premium destination for elegant designs.</p>
      </header>
    </div>
  );
}

export default App;`,
          "src/App.css": `.App {
  text-align: center;
}

.App-header {
  background-color: #1A1A1A;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: #FFFFFF;
}

.App-header h1 {
  color: #D4AF37;
}`,
          "src/index.jsx": `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
          "src/index.css": `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}`,
        };
      }

      if (templateName === "nextBasic") {
        return {
          "src/pages/index.jsx": `import Head from 'next/head';
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Premium Website</title>
        <meta name="description" content="A beautiful premium website" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to our <span>Premium Website</span>
        </h1>
        <p className={styles.description}>
          Your destination for elegant designs.
        </p>
      </main>
    </div>
  );
}`,
          "src/pages/_app.jsx": `import '../styles/globals.css';

export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}`,
          "src/styles/globals.css": `html,
body {
  padding: 0;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
    Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
  background-color: #1A1A1A;
  color: #FFFFFF;
}

a {
  color: inherit;
  text-decoration: none;
}

* {
  box-sizing: border-box;
}`,
          "src/styles/Home.module.css": `.container {
  min-height: 100vh;
  padding: 0 2rem;
}

.main {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.title {
  margin: 0;
  line-height: 1.15;
  font-size: 4rem;
  text-align: center;
}

.title span {
  color: #D4AF37;
}

.description {
  text-align: center;
  line-height: 1.5;
  font-size: 1.5rem;
  margin-top: 2rem;
}`,
        };
      }

      return null;
    }
  }

  /**
   * Generate React code using LLM
   * @private
   */
  async _generateReactCodeWithLLM(requirements, projectContext) {
    const prompt = `
You are an expert React developer specializing in creating beautiful, production-ready websites.
You need to create a complete, error-free, production quality React code for a ${projectContext.websiteType} website in the ${projectContext.industry} industry.

Requirements:
${JSON.stringify(requirements, null, 2)}

Design specifications:
- Use a dark theme with gold accents to create an elegant, premium feel similar to luxury brands
- Primary color: ${projectContext.colorScheme.primary}
- Secondary color: ${projectContext.colorScheme.secondary}
- Accent color: ${projectContext.colorScheme.accent}
- Text color: ${projectContext.colorScheme.text}
- Background color: ${projectContext.colorScheme.background}
- Use Tailwind CSS for styling
- Include smooth animations and transitions with Framer Motion
- Make the design fully responsive for all screen sizes
- Add subtle parallax effects and premium micro-interactions
- Ensure high accessibility standards
- Include modern design elements like glassmorphism and gradient effects
- For images, use REAL image URLs - not placeholders

Website sections to include:
- Elegant hero section with a premium design
- Features/benefits section
- Testimonials or reviews
- Pricing/packages (if applicable)
- Contact form
- Footer with social links

Technical requirements:
- Use React 18 with functional components and hooks
- Use Tailwind CSS for styling
- Organize code into reusable components
- Include smooth page transitions and animations
- Ensure responsiveness across all device sizes
- Optimize for performance and SEO
- Ensure all buttons and links are functional

Create all necessary files for a complete React application.

Your response MUST be a valid JSON object with this EXACT structure:
{
  "files": [
    {
      "path": "file path relative to project root",
      "code": "complete file content",
      "description": "brief description of the file"
    }
  ],
  "explanation": "brief explanation of the codebase"
}

CRITICAL INSTRUCTIONS:
1. Your ENTIRE response must be valid JSON - no markdown, no explanations outside the JSON
2. Do not use backticks or code blocks - just return the raw JSON
3. Include all necessary files for a complete, working React application
4. Use real image URLs, not placeholder:* syntax
5. Ensure the "code" field contains the complete content of each file
`;

    try {
      const response = await this.llm.complete(prompt, {
        temperature: 0.3,
        max_tokens: 12000,
        response_format: { type: "json_object" },
      });

      try {
        // First try direct parsing
        return JSON.parse(response);
      } catch (parseError) {
        this.logger.warn(
          "Error parsing LLM response as JSON, attempting extraction:",
          parseError
        );

        // Try to extract JSON from the response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            return JSON.parse(jsonMatch[0]);
          } catch (extractError) {
            this.logger.error("Error parsing extracted JSON:", extractError);
            throw new Error("Failed to parse LLM response as valid JSON");
          }
        }

        throw new Error("Failed to extract valid JSON from LLM response");
      }
    } catch (error) {
      this.logger.error("Error in React code generation with LLM:", error);
      throw error;
    }
  }

  /**
   * Generate Next.js-specific code
   * @private
   */
  async _generateNextCode(requirements, projectContext) {
    try {
      // Get appropriate template
      const template = this._getTemplate("next", projectContext.websiteType);

      if (template) {
        // Generate based on template
        return this._generateFromTemplate(template, projectContext);
      }

      // If template not available, use LLM
      if (this.llm) {
        return await this._generateNextCodeWithLLM(
          requirements,
          projectContext
        );
      }

      // Fallback to basic template
      return this._generateFromTemplate(
        this._loadFallbackTemplate("nextBasic"),
        projectContext
      );
    } catch (error) {
      this.logger.error("Error generating Next.js code:", error);

      // Ultimate fallback
      return this._generateFallbackCode(requirements, projectContext);
    }
  }

  /**
   * Generate Next.js code using LLM
   * @private
   */
  async _generateNextCodeWithLLM(requirements, projectContext) {
    const prompt = `
You are an expert Next.js developer specializing in creating beautiful, production-ready websites.
You need to create a complete, error-free, production quality Next.js code for a ${projectContext.websiteType} website in the ${projectContext.industry} industry.

Requirements:
${JSON.stringify(requirements, null, 2)}

Design specifications:
- Use a dark theme with gold accents to create an elegant, premium feel similar to luxury brands
- Primary color: ${projectContext.colorScheme.primary}
- Secondary color: ${projectContext.colorScheme.secondary}
- Accent color: ${projectContext.colorScheme.accent}
- Text color: ${projectContext.colorScheme.text}
- Background color: ${projectContext.colorScheme.background}
- Use Tailwind CSS for styling
- Include smooth animations and transitions with Framer Motion
- Make the design fully responsive for all screen sizes
- Add subtle parallax effects and premium micro-interactions
- Ensure high accessibility standards
- Include modern design elements like glassmorphism and gradient effects
- For images, use next/image with REAL image URLs - not placeholders

Website sections to include:
- Elegant hero section with a premium design
- Features/benefits section
- Testimonials or reviews
- Pricing/packages (if applicable)
- Contact form
- Footer with social links

Technical requirements:
- Use the new Next.js App Router (src/app/...)
- Use React 18 features
- Use Tailwind CSS for styling
- Organize code into reusable components
- Include smooth page transitions and animations
- Ensure responsiveness across all device sizes
- Optimize for performance and SEO
- Ensure all buttons and links are functional

Create all necessary files for a complete Next.js application.

Your response MUST be a valid JSON object with this EXACT structure:
{
  "files": [
    {
      "path": "file path relative to project root",
      "code": "complete file content",
      "description": "brief description of the file"
    }
  ],
  "explanation": "brief explanation of the codebase"
}

CRITICAL INSTRUCTIONS:
1. Your ENTIRE response must be valid JSON - no markdown, no explanations outside the JSON
2. Do not use backticks or code blocks - just return the raw JSON
3. Include all necessary files for a complete, working Next.js application
4. Use real image URLs, not placeholder:* syntax
5. Ensure the "code" field contains the complete content of each file
`;

    try {
      const response = await this.llm.complete(prompt, {
        temperature: 0.3,
        max_tokens: 12000,
        response_format: { type: "json_object" },
      });

      try {
        // First try direct parsing
        return JSON.parse(response);
      } catch (parseError) {
        this.logger.warn(
          "Error parsing LLM response as JSON, attempting extraction:",
          parseError
        );

        // Try to extract JSON from the response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            return JSON.parse(jsonMatch[0]);
          } catch (extractError) {
            this.logger.error("Error parsing extracted JSON:", extractError);
            throw new Error("Failed to parse LLM response as valid JSON");
          }
        }

        throw new Error("Failed to extract valid JSON from LLM response");
      }
    } catch (error) {
      this.logger.error("Error in Next.js code generation with LLM:", error);
      throw error;
    }
  }

  /**
   * Generate Vue-specific code
   * @private
   */
  async _generateVueCode(requirements, projectContext) {
    // Similar to React and Next.js code generators
    try {
      // Get appropriate template
      const template = this._getTemplate("vue", projectContext.websiteType);

      if (template) {
        // Generate based on template
        return this._generateFromTemplate(template, projectContext);
      }

      // If template not available, use LLM
      if (this.llm) {
        return await this._generateVueCodeWithLLM(requirements, projectContext);
      }

      // Fallback to HTML template
      return this._generateHTMLCode(requirements, projectContext);
    } catch (error) {
      this.logger.error("Error generating Vue code:", error);

      // Ultimate fallback
      return this._generateFallbackCode(requirements, projectContext);
    }
  }

  /**
   * Generate Vue.js code using LLM
   * @private
   */
  async _generateVueCodeWithLLM(requirements, projectContext) {
    const prompt = `
You are an expert Vue.js developer specializing in creating beautiful, production-ready websites.
You need to create a complete, error-free, production quality Vue.js code for a ${projectContext.websiteType} website in the ${projectContext.industry} industry.

Requirements:
${JSON.stringify(requirements, null, 2)}

Design specifications:
- Use a dark theme with gold accents to create an elegant, premium feel similar to luxury brands
- Primary color: ${projectContext.colorScheme.primary}
- Secondary color: ${projectContext.colorScheme.secondary}
- Accent color: ${projectContext.colorScheme.accent}
- Text color: ${projectContext.colorScheme.text}
- Background color: ${projectContext.colorScheme.background}
- Use Tailwind CSS for styling
- Include smooth animations and transitions
- Make the design fully responsive for all screen sizes
- Add subtle parallax effects and premium micro-interactions
- Ensure high accessibility standards
- Include modern design elements like glassmorphism and gradient effects
- For images, use REAL image URLs - not placeholders

Website sections to include:
- Elegant hero section with a premium design
- Features/benefits section
- Testimonials or reviews
- Pricing/packages (if applicable)
- Contact form
- Footer with social links

Technical requirements:
- Use Vue 3 Composition API
- Use Tailwind CSS for styling
- Organize code into reusable components
- Include smooth page transitions and animations
- Ensure responsiveness across all device sizes
- Optimize for performance and SEO
- Ensure all buttons and links are functional

Create all necessary files for a complete Vue.js application.

Your response MUST be a valid JSON object with this EXACT structure:
{
  "files": [
    {
      "path": "file path relative to project root",
      "code": "complete file content",
      "description": "brief description of the file"
    }
  ],
  "explanation": "brief explanation of the codebase"
}

CRITICAL INSTRUCTIONS:
1. Your ENTIRE response must be valid JSON - no markdown, no explanations outside the JSON
2. Do not use backticks or code blocks - just return the raw JSON
3. Include all necessary files for a complete, working Vue.js application
4. Use real image URLs, not placeholder:* syntax
5. Ensure the "code" field contains the complete content of each file
`;

    try {
      const response = await this.llm.complete(prompt, {
        temperature: 0.3,
        max_tokens: 12000,
        response_format: { type: "json_object" },
      });

      try {
        // First try direct parsing
        return JSON.parse(response);
      } catch (parseError) {
        this.logger.warn(
          "Error parsing LLM response as JSON, attempting extraction:",
          parseError
        );

        // Try to extract JSON from the response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            return JSON.parse(jsonMatch[0]);
          } catch (extractError) {
            this.logger.error("Error parsing extracted JSON:", extractError);
            throw new Error("Failed to parse LLM response as valid JSON");
          }
        }

        throw new Error("Failed to extract valid JSON from LLM response");
      }
    } catch (error) {
      this.logger.error("Error in Vue.js code generation with LLM:", error);
      throw error;
    }
  }

  /**
   * Generate basic HTML code
   * @private
   */
  async _generateHTMLCode(requirements, projectContext) {
    try {
      // Get appropriate template
      const template = this._loadFallbackTemplate("basicHTML");

      if (template) {
        // Generate based on template
        return this._generateFromTemplate(template, projectContext);
      }

      // Ultimate fallback
      return this._generateFallbackCode(requirements, projectContext);
    } catch (error) {
      this.logger.error("Error generating HTML code:", error);

      // Ultimate fallback
      return this._generateFallbackCode(requirements, projectContext);
    }
  }

  /**
   * Generate code for any other framework
   * @private
   */
  async _generateDefaultCode(requirements, projectContext) {
    // Default to React generation as it's the most popular
    return this._generateReactCode(requirements, projectContext);
  }

  /**
   * Generate fallback code when everything else fails
   * @private
   */
  _generateFallbackCode(requirements, projectContext) {
    // Create a simple but elegant HTML page that works no matter what
    const websiteName = projectContext.websiteName || "Premium Website";
    const primaryColor = projectContext.colorScheme?.primary || "#D4AF37";
    const secondaryColor = projectContext.colorScheme?.secondary || "#1A1A1A";
    const textColor = projectContext.colorScheme?.text || "#FFFFFF";

    return {
      files: [
        {
          path: "index.html",
          code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${websiteName}</title>
  <style>
    :root {
      --color-primary: ${primaryColor};
      --color-secondary: ${secondaryColor};
      --color-text: ${textColor};
      --font-heading: 'Playfair Display', Georgia, serif;
      --font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: var(--font-body);
      background-color: var(--color-secondary);
      color: var(--color-text);
      line-height: 1.6;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }
    
    header {
      padding: 8rem 0 6rem;
      background: linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0.4)), url('https://images.pexels.com/photos/2325446/pexels-photo-2325446.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750');
      background-size: cover;
      background-position: center;
      text-align: center;
      position: relative;
    }
    
    header::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 100px;
      background: linear-gradient(to top, var(--color-secondary), transparent);
    }
    
    h1 {
      font-family: var(--font-heading);
      font-size: 3.5rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      color: var(--color-primary);
    }
    
    h2 {
      font-family: var(--font-heading);
      font-size: 2.5rem;
      color: var(--color-primary);
      margin-bottom: 1.5rem;
    }
    
    h3 {
      font-family: var(--font-heading);
      font-size: 1.75rem;
      margin-bottom: 1rem;
    }
    
    p {
      font-size: 1.1rem;
      line-height: 1.7;
      margin-bottom: 1rem;
      max-width: 40rem;
    }
    
    .tagline {
      font-size: 1.5rem;
      max-width: 600px;
      margin: 0 auto 2rem;
      color: rgba(255, 255, 255, 0.9);
    }
    
    .btn {
      display: inline-block;
      background-color: var(--color-primary);
      color: var(--color-secondary);
      font-weight: 600;
      padding: 0.8rem 1.8rem;
      border-radius: 0.25rem;
      text-decoration: none;
      transition: all 0.3s ease;
      border: none;
      cursor: pointer;
      font-size: 1rem;
    }
    
    .btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
    }
    
    .btn:active {
      transform: translateY(-1px);
    }
    
    section {
      padding: 5rem 0;
    }
    
    .features {
      background-color: rgba(255, 255, 255, 0.02);
    }
    
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-top: 3rem;
    }
    
    .feature-card {
      background-color: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 2rem;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .feature-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      border-color: var(--color-primary);
    }
    
    .feature-icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      color: var(--color-primary);
    }
    
    .cta {
      text-align: center;
      background: linear-gradient(135deg, rgba(26, 26, 26, 0.9), rgba(26, 26, 26, 0.7)), url('https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750');
      background-size: cover;
      background-position: center;
      background-attachment: fixed;
      padding: 6rem 0;
    }
    
    .cta h2 {
      margin-bottom: 2rem;
    }
    
    footer {
      background-color: rgba(0, 0, 0, 0.3);
      padding: 3rem 0;
      text-align: center;
    }
    
    .footer-content {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .footer-logo {
      font-family: var(--font-heading);
      font-size: 1.5rem;
      color: var(--color-primary);
      margin-bottom: 1.5rem;
    }
    
    .footer-links {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }
    
    .footer-links a {
      color: var(--color-text);
      text-decoration: none;
      transition: color 0.3s ease;
    }
    
    .footer-links a:hover {
      color: var(--color-primary);
    }
    
    .footer-social {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    
    .footer-social a {
      color: var(--color-text);
      text-decoration: none;
      transition: color 0.3s ease;
      font-size: 1.2rem;
    }
    
    .footer-social a:hover {
      color: var(--color-primary);
    }
    
    .copyright {
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.6);
    }
    
    @media (max-width: 768px) {
      h1 {
        font-size: 2.5rem;
      }
      
      h2 {
        font-size: 2rem;
      }
      
      .tagline {
        font-size: 1.2rem;
      }
      
      .features-grid {
        grid-template-columns: 1fr;
      }
      
      section {
        padding: 3rem 0;
      }
    }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <h1>${websiteName}</h1>
      <p class="tagline">Elevate your experience with our premium solutions tailored to exceed your expectations.</p>
      <a href="#contact" class="btn">Get Started</a>
    </div>
  </header>
  
  <section class="features">
    <div class="container">
      <h2>Premium Features</h2>
      <p>Discover what sets us apart from the competition and why clients consistently choose our services.</p>
      
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">✨</div>
          <h3>Exceptional Quality</h3>
          <p>Our commitment to excellence ensures that every aspect of our service meets the highest standards.</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">🛡️</div>
          <h3>Unparalleled Security</h3>
          <p>Your peace of mind is our priority, with state-of-the-art security measures in place.</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">⚡</div>
          <h3>Lightning Performance</h3>
          <p>Experience speed and efficiency that keeps you ahead in today's fast-paced world.</p>
        </div>
      </div>
    </div>
  </section>
  
  <section class="cta">
    <div class="container">
      <h2>Ready to Experience the Difference?</h2>
      <p style="margin: 0 auto 2rem;">Join thousands of satisfied clients who have elevated their experience with our premium solutions.</p>
      <a href="#contact" class="btn">Contact Us Today</a>
    </div>
  </section>
  
  <footer id="contact">
    <div class="container">
      <div class="footer-content">
        <div class="footer-logo">${websiteName}</div>
        
        <div class="footer-links">
          <a href="#">Home</a>
          <a href="#">Features</a>
          <a href="#">Pricing</a>
          <a href="#">About</a>
          <a href="#">Contact</a>
        </div>
        
        <div class="footer-social">
          <a href="#">LinkedIn</a>
          <a href="#">Twitter</a>
          <a href="#">Instagram</a>
          <a href="#">Facebook</a>
        </div>
        
        <p class="copyright">&copy; ${new Date().getFullYear()} ${websiteName}. All rights reserved.</p>
      </div>
    </div>
  </footer>
</body>
</html>`,
          description: "Premium single-page HTML website with elegant design",
        },
      ],
      explanation:
        "Elegant single-page website with premium design elements, responsive layout, and modern aesthetics.",
    };
  }
}

module.exports = CodeGenerationModule;
