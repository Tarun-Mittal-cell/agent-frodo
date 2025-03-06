/**
 * CodeGenerationModule.js
 * Advanced module for generating world-class frontend code with beautiful UI.
 * Integrates pre-built templates, ensures proper image loading, and provides robust error handling.
 * Supports multiple frameworks and styling systems with production-ready code generation.
 */

const path = require("path");
const fs = require("fs");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

// Template libraries imports
const reactBeautifulUI = require("../templates/reactBeautifulUI");
const nextjsTemplates = require("../templates/nextjsTemplates");
const sveltePremiumUI = require("../templates/sveltePremiumUI");
const vueElegantUI = require("../templates/vueElegantUI");
const tailwindComponents = require("../templates/tailwindComponents");
const imageLoaders = require("../templates/imageLoaders");
const cssAnimations = require("../templates/cssAnimations");
const modernLayouts = require("../templates/modernLayouts");

// Validated image sources that work correctly
const UNSPLASH_ACCESS_KEY =
  process.env.UNSPLASH_ACCESS_KEY || "your-fallback-key";
const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY || "your-fallback-key";
const PEXELS_API_KEY = process.env.PEXELS_API_KEY || "your-fallback-key";

// Common image categories for fallback
const IMAGE_CATEGORIES = [
  "business",
  "food",
  "nature",
  "people",
  "technology",
  "travel",
  "animals",
  "architecture",
  "art",
  "fashion",
];

class CodeGenerationModule {
  constructor(llmService, config = {}) {
    this.llm = llmService;
    this.fileSystem = config.fileSystem || this._createDefaultFileSystem();
    this.logger = config.logger || console;
    this.codeQualityCheckers = config.codeQualityCheckers || [];
    this.frameworkSpecificGenerators = new Map();
    this.templateLibraries = this._initializeTemplateLibraries();

    // Enhanced configuration for better generation
    this.maxRetries = config.maxRetries || 3;
    this.requestTimeout = config.requestTimeout || 30000;
    this.creditIssueDetected = false;
    this.projectRoot = config.projectRoot || process.cwd();
    this.workspaceDir = path.join(this.projectRoot, "workspace");

    // Image handling configuration
    this.imageCache = new Map();
    this.useLocalImages = config.useLocalImages || false;
    this.localImageDir = path.join(this.workspaceDir, "public/images");
    this.imageApiEndpoints = {
      unsplash: `https://api.unsplash.com/photos/random?client_id=${UNSPLASH_ACCESS_KEY}`,
      pixabay: `https://pixabay.com/api/?key=${PIXABAY_API_KEY}`,
      pexels: {
        url: "https://api.pexels.com/v1/search",
        headers: { Authorization: PEXELS_API_KEY },
      },
    };

    // Error tracking with more specific categories
    this.errorCounts = {
      parsing: 0,
      api: 0,
      filesystem: 0,
      timeout: 0,
      imageLoading: 0,
    };
    this.maxErrorCount = config.maxErrorCount || 3;

    // Register enhanced generators
    this._registerEnhancedGenerators();

    // Create workspace and necessary directories
    this._ensureWorkspaceExists();
  }

  /**
   * Initialize template libraries with high-quality pre-built components
   * @private
   */
  _initializeTemplateLibraries() {
    // Import and organize all templates
    return {
      // Framework-specific premium templates
      react: {
        basic: reactBeautifulUI.basic,
        ecommerce: reactBeautifulUI.ecommerce,
        portfolio: reactBeautifulUI.portfolio,
        dashboard: reactBeautifulUI.dashboard,
        blog: reactBeautifulUI.blog,
        landingPage: reactBeautifulUI.landingPage,
        darkMode: reactBeautifulUI.darkMode,
      },
      nextjs: {
        basic: nextjsTemplates.basic,
        ecommerce: nextjsTemplates.ecommerce,
        blog: nextjsTemplates.blog,
        portfolio: nextjsTemplates.portfolio,
        dashboard: nextjsTemplates.dashboard,
        foodDelivery: nextjsTemplates.foodDelivery,
      },
      vue: {
        basic: vueElegantUI.basic,
        ecommerce: vueElegantUI.ecommerce,
        dashboard: vueElegantUI.dashboard,
      },
      svelte: {
        basic: sveltePremiumUI.basic,
        ecommerce: sveltePremiumUI.ecommerce,
      },

      // Component-based templates that work across frameworks
      components: {
        headers: tailwindComponents.headers,
        footers: tailwindComponents.footers,
        heroes: tailwindComponents.heroes,
        features: tailwindComponents.features,
        pricing: tailwindComponents.pricing,
        testimonials: tailwindComponents.testimonials,
        contact: tailwindComponents.contact,
        cards: tailwindComponents.cards,
        tables: tailwindComponents.tables,
      },

      // Image handling templates
      images: {
        responsiveLoaders: imageLoaders.responsive,
        lazyLoading: imageLoaders.lazy,
        blur: imageLoaders.blur,
        gallery: imageLoaders.gallery,
      },

      // Animation and layout templates
      animations: {
        fade: cssAnimations.fade,
        slide: cssAnimations.slide,
        zoom: cssAnimations.zoom,
      },
      layouts: {
        grid: modernLayouts.grid,
        flexbox: modernLayouts.flexbox,
        responsive: modernLayouts.responsive,
      },
    };
  }

  /**
   * Create a default file system implementation with enhanced error handling
   * @private
   */
  _createDefaultFileSystem() {
    return {
      writeFile: async (filePath, content) => {
        try {
          const fullPath = path.join(this.workspaceDir, filePath);
          const directory = path.dirname(fullPath);

          // Create directory if it doesn't exist
          if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
          }

          fs.writeFileSync(fullPath, content);
          return true;
        } catch (error) {
          this.logger.error(
            `File system error while writing ${filePath}:`,
            error
          );
          this.errorCounts.filesystem++;
          throw error;
        }
      },
      readFile: async (filePath) => {
        try {
          const fullPath = path.join(this.workspaceDir, filePath);
          if (!fs.existsSync(fullPath)) {
            throw new Error(`File not found: ${filePath}`);
          }
          return fs.readFileSync(fullPath, "utf8");
        } catch (error) {
          this.logger.error(
            `File system error while reading ${filePath}:`,
            error
          );
          this.errorCounts.filesystem++;
          throw error;
        }
      },
      fileExists: async (filePath) => {
        try {
          const fullPath = path.join(this.workspaceDir, filePath);
          return fs.existsSync(fullPath);
        } catch (error) {
          this.logger.error(
            `File system error checking existence of ${filePath}:`,
            error
          );
          this.errorCounts.filesystem++;
          return false;
        }
      },
      // Added methods for image handling
      saveImage: async (url, targetPath) => {
        try {
          const fullPath = path.join(this.workspaceDir, targetPath);
          const directory = path.dirname(fullPath);

          if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
          }

          const response = await axios({
            method: "GET",
            url: url,
            responseType: "stream",
          });

          const writer = fs.createWriteStream(fullPath);
          response.data.pipe(writer);

          return new Promise((resolve, reject) => {
            writer.on("finish", resolve);
            writer.on("error", reject);
          });
        } catch (error) {
          this.logger.error(
            `Error saving image from ${url} to ${targetPath}:`,
            error
          );
          this.errorCounts.imageLoading++;
          throw error;
        }
      },
    };
  }

  /**
   * Ensure workspace directory exists with enhanced structure
   * @private
   */
  _ensureWorkspaceExists() {
    try {
      if (!fs.existsSync(this.workspaceDir)) {
        fs.mkdirSync(this.workspaceDir, { recursive: true });

        // Create enhanced project structure
        const srcDir = path.join(this.workspaceDir, "src");
        const componentsDir = path.join(srcDir, "components");
        const pagesDir = path.join(srcDir, "pages");
        const publicDir = path.join(this.workspaceDir, "public");
        const imagesDir = path.join(publicDir, "images");
        const stylesDir = path.join(srcDir, "styles");

        // Create all required directories
        [
          srcDir,
          componentsDir,
          pagesDir,
          publicDir,
          imagesDir,
          stylesDir,
        ].forEach((dir) => {
          fs.mkdirSync(dir, { recursive: true });
        });

        // Create modern package.json with essential dependencies
        const packageJson = {
          name: "autonomous-agent-workspace",
          version: "0.1.0",
          private: true,
          dependencies: {
            react: "^18.2.0",
            "react-dom": "^18.2.0",
            next: "^13.4.10",
            axios: "^1.4.0",
            tailwindcss: "^3.3.2",
            "framer-motion": "^10.12.18",
            "react-intersection-observer": "^9.5.2",
            uuid: "^9.0.0",
          },
          devDependencies: {
            autoprefixer: "^10.4.14",
            postcss: "^8.4.25",
          },
        };

        fs.writeFileSync(
          path.join(this.workspaceDir, "package.json"),
          JSON.stringify(packageJson, null, 2)
        );

        // Create minimal tailwind.config.js for styling
        const tailwindConfig = `
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
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
      },
    },
  },
  plugins: [],
};`;

        fs.writeFileSync(
          path.join(this.workspaceDir, "tailwind.config.js"),
          tailwindConfig
        );

        this.logger.info(
          `Created enhanced workspace directory at ${this.workspaceDir}`
        );
      }

      // Always ensure the images directory exists
      const imagesDir = path.join(this.workspaceDir, "public/images");
      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
      }
    } catch (error) {
      this.logger.error("Failed to create workspace directory:", error);
      // Continue execution - we'll try to handle file operations safely later
    }
  }

  /**
   * Register enhanced framework-specific code generators
   * @private
   */
  _registerEnhancedGenerators() {
    // Register improved handlers for different frameworks
    this.registerFrameworkGenerator(
      "react",
      this._generateReactCode.bind(this)
    );
    this.registerFrameworkGenerator("vue", this._generateVueCode.bind(this));
    this.registerFrameworkGenerator(
      "angular",
      this._generateAngularCode.bind(this)
    );
    this.registerFrameworkGenerator(
      "next",
      this._generateNextJsCode.bind(this)
    );
    this.registerFrameworkGenerator(
      "nextjs",
      this._generateNextJsCode.bind(this)
    ); // Alias
    this.registerFrameworkGenerator(
      "svelte",
      this._generateSvelteCode.bind(this)
    );
    // Add premium themes generator
    this.registerFrameworkGenerator(
      "premium",
      this._generatePremiumCode.bind(this)
    );
  }

  /**
   * Register a framework-specific code generator
   * @param {string} framework - Framework name
   * @param {Function} generator - Generator function
   */
  registerFrameworkGenerator(framework, generator) {
    if (typeof generator !== "function") {
      throw new Error(
        `Generator for framework '${framework}' must be a function`
      );
    }
    this.frameworkSpecificGenerators.set(framework, generator);
  }

  /**
   * Set or update the LLM service
   * @param {Object} llmService - LLM service
   */
  setLLM(llmService) {
    this.llm = llmService;
  }

  /**
   * Set file system interface for file operations
   * @param {Object} fileSystem - File system interface
   */
  setFileSystem(fileSystem) {
    this.fileSystem = fileSystem;
  }

  /**
   * Set project root directory
   * @param {string} projectRoot - Project root path
   */
  setProjectRoot(projectRoot) {
    this.projectRoot = projectRoot;
    this.workspaceDir = path.join(this.projectRoot, "workspace");
    this._ensureWorkspaceExists();
  }

  /**
   * Generate code based on requirements with enhanced template selection
   * @param {Object} requirements - Code requirements
   * @param {Object} projectContext - Project context
   * @returns {Object} - Generated code files
   */
  async generateCode(requirements, projectContext = {}) {
    // Set defaults and determine website type/industry
    projectContext.websiteType = this._determineWebsiteType(
      requirements,
      projectContext
    );
    projectContext.industry = this._determineIndustry(
      requirements,
      projectContext
    );
    projectContext.colorScheme =
      projectContext.colorScheme ||
      this._suggestColorScheme(projectContext.industry);

    // Check for critical errors before proceeding
    if (this._hasTooManyErrors()) {
      this.logger.warn(
        "Too many errors encountered, falling back to template-based code generation"
      );
      return this._generatePremiumTemplateCode(requirements, projectContext);
    }

    // Check if credit issues were previously detected
    if (this.creditIssueDetected) {
      this.logger.warn(
        "API credit issues detected, using premium template code generation"
      );
      return this._generatePremiumTemplateCode(requirements, projectContext);
    }

    this.logger.info("Generating code", {
      type: requirements.step?.type || "website",
      framework: projectContext.framework || "next",
      websiteType: projectContext.websiteType,
      industry: projectContext.industry,
    });

    if (!this.llm) {
      this.logger.warn(
        "No LLM service available, using template code generation"
      );
      return this._generatePremiumTemplateCode(requirements, projectContext);
    }

    // Determine the framework to use with preference for modern frameworks
    const framework = this._determineFramework(requirements, projectContext);

    // Check if we have a specialized generator for this framework
    const frameworkGenerator = this.frameworkSpecificGenerators.get(framework);

    try {
      let generatedCode;

      // Always try to use a premium template first if it matches the requirements
      if (this._hasPremiumTemplate(framework, projectContext.websiteType)) {
        generatedCode = await this._generatePremiumTemplateCode(requirements, {
          ...projectContext,
          framework,
        });

        // Add note about using a premium template
        generatedCode.explanation = `Generated using premium ${framework} template for ${projectContext.websiteType} websites.`;
        generatedCode.usingPremiumTemplate = true;

        return this._processGeneratedCode(
          generatedCode,
          requirements,
          framework
        );
      }

      // If no premium template is available, use the framework-specific generator
      if (frameworkGenerator) {
        generatedCode = await this._executeWithRetries(() =>
          frameworkGenerator(requirements, projectContext)
        );
      } else {
        // Fall back to generic code generation
        generatedCode = await this._executeWithRetries(() =>
          this._generateGenericCode(requirements, projectContext, framework)
        );
      }

      return this._processGeneratedCode(generatedCode, requirements, framework);
    } catch (error) {
      this.logger.error(`Code generation failed:`, error);

      // Check for specific error types to track
      if (
        error.message.includes("credit") ||
        error.message.includes("quota") ||
        error.message.includes("rate limit")
      ) {
        this.creditIssueDetected = true;
        this.errorCounts.api++;
      } else if (
        error.message.includes("parse") ||
        error.message.includes("JSON")
      ) {
        this.errorCounts.parsing++;
      } else if (error.message.includes("timeout")) {
        this.errorCounts.timeout++;
      }

      // Fall back to premium template-based generation
      return this._generatePremiumTemplateCode(requirements, projectContext);
    }
  }

  /**
   * Determine website type based on requirements and context
   * @private
   */
  _determineWebsiteType(requirements, projectContext) {
    // If explicitly provided, use that
    if (projectContext.websiteType) {
      return projectContext.websiteType;
    }

    // Try to infer from requirements
    const context = (
      requirements.planContext ||
      requirements.description ||
      ""
    ).toLowerCase();

    if (
      context.includes("commerce") ||
      context.includes("shop") ||
      context.includes("store") ||
      context.includes("product") ||
      context.includes("buy") ||
      context.includes("sell")
    ) {
      return "ecommerce";
    }

    if (
      context.includes("blog") ||
      context.includes("article") ||
      context.includes("post") ||
      context.includes("content") ||
      context.includes("news")
    ) {
      return "blog";
    }

    if (
      context.includes("portfolio") ||
      context.includes("showcase") ||
      context.includes("work") ||
      context.includes("project") ||
      context.includes("gallery")
    ) {
      return "portfolio";
    }

    if (
      context.includes("dashboard") ||
      context.includes("admin") ||
      context.includes("analytics") ||
      context.includes("chart") ||
      context.includes("metric")
    ) {
      return "dashboard";
    }

    if (
      context.includes("landing") ||
      context.includes("home") ||
      context.includes("main") ||
      context.includes("marketing")
    ) {
      return "landingPage";
    }

    if (
      context.includes("food") ||
      context.includes("restaurant") ||
      context.includes("delivery") ||
      context.includes("menu") ||
      context.includes("order")
    ) {
      return "foodDelivery";
    }

    // Default to landing page if we can't determine
    return "landingPage";
  }

  /**
   * Determine industry based on requirements and context
   * @private
   */
  _determineIndustry(requirements, projectContext) {
    // If explicitly provided, use that
    if (projectContext.industry) {
      return projectContext.industry;
    }

    // Try to infer from requirements
    const context = (
      requirements.planContext ||
      requirements.description ||
      ""
    ).toLowerCase();

    const industries = {
      technology: [
        "tech",
        "software",
        "app",
        "digital",
        "computer",
        "it",
        "saas",
      ],
      health: [
        "health",
        "medical",
        "doctor",
        "clinic",
        "hospital",
        "wellness",
        "fitness",
      ],
      education: [
        "education",
        "learn",
        "course",
        "school",
        "teach",
        "training",
        "university",
      ],
      finance: [
        "finance",
        "bank",
        "money",
        "investment",
        "financial",
        "trading",
      ],
      food: [
        "food",
        "restaurant",
        "meal",
        "cooking",
        "recipe",
        "culinary",
        "chef",
      ],
      travel: [
        "travel",
        "tour",
        "vacation",
        "holiday",
        "destination",
        "flight",
        "hotel",
      ],
      realestate: [
        "real estate",
        "property",
        "home",
        "house",
        "apartment",
        "rent",
        "buy home",
      ],
      fashion: ["fashion", "clothing", "apparel", "wear", "style", "outfit"],
      beauty: ["beauty", "cosmetic", "makeup", "skin", "salon", "spa"],
      creative: [
        "design",
        "creative",
        "art",
        "photography",
        "video",
        "media",
        "portfolio",
      ],
    };

    // Check for industry keywords in the context
    for (const [industry, keywords] of Object.entries(industries)) {
      if (keywords.some((keyword) => context.includes(keyword))) {
        return industry;
      }
    }

    // If website type is known, suggest related industry
    if (projectContext.websiteType === "ecommerce") return "fashion";
    if (projectContext.websiteType === "portfolio") return "creative";
    if (projectContext.websiteType === "foodDelivery") return "food";

    // Default to technology if we can't determine
    return "technology";
  }

  /**
   * Suggest a color scheme based on industry
   * @private
   */
  _suggestColorScheme(industry) {
    const colorSchemes = {
      technology: {
        primary: "#4f46e5", // Indigo
        secondary: "#22d3ee", // Cyan
        accent: "#a855f7", // Purple
        text: "#1e293b", // Slate
        background: "#ffffff",
      },
      health: {
        primary: "#0ea5e9", // Sky Blue
        secondary: "#22c55e", // Green
        accent: "#0891b2", // Cyan
        text: "#334155",
        background: "#f8fafc",
      },
      education: {
        primary: "#8b5cf6", // Violet
        secondary: "#f97316", // Orange
        accent: "#ec4899", // Pink
        text: "#1e293b",
        background: "#ffffff",
      },
      finance: {
        primary: "#1e40af", // Dark Blue
        secondary: "#064e3b", // Dark Green
        accent: "#0c4a6e", // Dark Cyan
        text: "#0f172a",
        background: "#f8fafc",
      },
      food: {
        primary: "#ea580c", // Orange
        secondary: "#65a30d", // Lime
        accent: "#fbbf24", // Amber
        text: "#44403c",
        background: "#fffbeb",
      },
      travel: {
        primary: "#0284c7", // Blue
        secondary: "#2dd4bf", // Teal
        accent: "#f59e0b", // Amber
        text: "#374151",
        background: "#f9fafb",
      },
      realestate: {
        primary: "#4338ca", // Indigo
        secondary: "#166534", // Green
        accent: "#b45309", // Amber
        text: "#1f2937",
        background: "#f9fafb",
      },
      fashion: {
        primary: "#be185d", // Pink
        secondary: "#4c1d95", // Purple
        accent: "#b91c1c", // Red
        text: "#1e1e1e",
        background: "#ffffff",
      },
      beauty: {
        primary: "#ec4899", // Pink
        secondary: "#8b5cf6", // Violet
        accent: "#f43f5e", // Rose
        text: "#1e1b4b",
        background: "#fdf2f8",
      },
      creative: {
        primary: "#2563eb", // Blue
        secondary: "#f97316", // Orange
        accent: "#84cc16", // Lime
        text: "#111827",
        background: "#ffffff",
      },
      default: {
        primary: "#3b82f6", // Blue
        secondary: "#10b981", // Emerald
        accent: "#f59e0b", // Amber
        text: "#1f2937",
        background: "#ffffff",
      },
    };

    return colorSchemes[industry] || colorSchemes.default;
  }

  /**
   * Check if we have a premium template for the specified framework and website type
   * @private
   */
  _hasPremiumTemplate(framework, websiteType) {
    try {
      return (
        this.templateLibraries[framework] &&
        this.templateLibraries[framework][websiteType] &&
        Object.keys(this.templateLibraries[framework][websiteType]).length > 0
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate code using premium templates
   * @private
   */
  async _generatePremiumTemplateCode(requirements, projectContext) {
    try {
      const framework = this._determineFramework(requirements, projectContext);
      const websiteType = projectContext.websiteType || "landingPage";
      const colorScheme =
        projectContext.colorScheme ||
        this._suggestColorScheme(projectContext.industry || "default");

      // Try to get framework-specific template
      let template;
      if (
        this.templateLibraries[framework] &&
        this.templateLibraries[framework][websiteType]
      ) {
        template = this.templateLibraries[framework][websiteType];
      } else {
        // Fall back to React template if specific framework template is unavailable
        template =
          this.templateLibraries.react[websiteType] ||
          this.templateLibraries.react.landingPage;
      }

      // Prepare files array
      const files = [];

      // Process each template file
      for (const [filePath, templateContent] of Object.entries(template)) {
        // Replace placeholders with actual values
        let processedContent = templateContent
          .replace(
            /{{WEBSITE_NAME}}/g,
            projectContext.websiteName || "Beautiful Website"
          )
          .replace(/{{PRIMARY_COLOR}}/g, colorScheme.primary)
          .replace(/{{SECONDARY_COLOR}}/g, colorScheme.secondary)
          .replace(/{{ACCENT_COLOR}}/g, colorScheme.accent)
          .replace(/{{TEXT_COLOR}}/g, colorScheme.text)
          .replace(/{{BACKGROUND_COLOR}}/g, colorScheme.background);

        // Handle image placeholders
        processedContent = await this._replaceImagePlaceholders(
          processedContent,
          projectContext
        );

        files.push({
          path: filePath,
          code: processedContent,
          description: `Premium template file for ${websiteType} website`,
        });
      }

      // Add utility files
      files.push({
        path: "src/utils/imageLoader.js",
        code: imageLoaders.responsive,
        description: "Utility for responsive image loading",
      });

      // Handle actual image assets
      await this._processImageAssets(files, projectContext);

      return {
        files,
        framework,
        explanation: `Generated using premium ${framework} template for ${websiteType} websites.`,
        usingPremiumTemplate: true,
      };
    } catch (error) {
      this.logger.error("Error generating premium template code:", error);

      // Fall back to the most basic template we have
      return this._generateUltimateFallbackCode(requirements, projectContext);
    }
  }

  /**
   * Replace image placeholders with actual image URLs or references
   * @private
   */
  async _replaceImagePlaceholders(content, projectContext) {
    try {
      // Match all image placeholders: {{IMAGE:category:position}}
      // e.g. {{IMAGE:hero:1}}, {{IMAGE:product:3}}, etc.
      const placeholderPattern = /{{IMAGE:([\w-]+):([\w-]+)}}/g;
      const matches = [...content.matchAll(placeholderPattern)];

      let processedContent = content;

      for (const match of matches) {
        const fullMatch = match[0];
        const category = match[1];
        const position = match[2];

        // Generate a unique key for this image
        const imageKey = `${category}-${position}`;

        // Get or fetch image URL
        const imageUrl = await this._getImageUrl(category, projectContext);

        // Create local image path
        const extension = imageUrl.split(".").pop().split("?")[0]; // Get file extension
        const localPath = `/images/${imageKey}.${extension || "jpg"}`;

        // Replace the placeholder with the image URL
        if (this.useLocalImages) {
          // Save image locally and use local path
          try {
            await this.fileSystem.saveImage(imageUrl, `public${localPath}`);
            processedContent = processedContent.replace(fullMatch, localPath);
          } catch (error) {
            // If saving fails, use remote URL
            processedContent = processedContent.replace(fullMatch, imageUrl);
          }
        } else {
          // Just use the remote URL
          processedContent = processedContent.replace(fullMatch, imageUrl);
        }

        // Cache the image URL for reuse
        this.imageCache.set(imageKey, imageUrl);
      }

      return processedContent;
    } catch (error) {
      this.logger.error("Error replacing image placeholders:", error);
      this.errorCounts.imageLoading++;

      // Return content with fallback URLs
      return content.replace(
        /{{IMAGE:[\w-]+:[\w-]+}}/g,
        "https://source.unsplash.com/random/800x600"
      );
    }
  }

  /**
   * Get an image URL for a specific category
   * @private
   */
  async _getImageUrl(category, projectContext) {
    try {
      // Determine the actual search query based on the category and context
      let query = category;

      if (category === "hero") {
        query = projectContext.industry || "business";
      } else if (category === "product") {
        query =
          projectContext.industry === "food"
            ? "meal"
            : projectContext.industry === "fashion"
              ? "clothing"
              : "product";
      } else if (category === "profile") {
        query = "professional headshot";
      } else if (category === "background") {
        query = projectContext.industry || "abstract";
      }

      // Try different image services
      const apis = Object.keys(this.imageApiEndpoints);

      // Shuffle APIs to distribute usage
      const shuffledApis = apis.sort(() => Math.random() - 0.5);

      for (const api of shuffledApis) {
        try {
          let response;

          if (api === "unsplash") {
            response = await axios.get(
              `${this.imageApiEndpoints.unsplash}&query=${query}`
            );
            return response.data.urls.regular;
          } else if (api === "pixabay") {
            response = await axios.get(
              `${this.imageApiEndpoints.pixabay}&q=${query}&image_type=photo`
            );
            if (response.data.hits && response.data.hits.length > 0) {
              return response.data.hits[0].webformatURL;
            }
          } else if (api === "pexels") {
            response = await axios.get(
              `${this.imageApiEndpoints.pexels.url}?query=${query}&per_page=1`,
              { headers: this.imageApiEndpoints.pexels.headers }
            );
            if (response.data.photos && response.data.photos.length > 0) {
              return response.data.photos[0].src.large;
            }
          }
        } catch (apiError) {
          // Try next API if one fails
          continue;
        }
      }

      // If all APIs fail, return a placeholder URL
      return `https://source.unsplash.com/random/800x600?${query}`;
    } catch (error) {
      this.logger.error("Error getting image URL:", error);
      this.errorCounts.imageLoading++;

      // Return a reliable placeholder
      return "https://source.unsplash.com/random/800x600";
    }
  }

  /**
   * Process and add actual image assets to the files
   * @private
   */
  async _processImageAssets(files, projectContext) {
    try {
      // Common images that most sites need
      const standardImages = {
        logo: projectContext.industry || "business",
        hero: projectContext.industry || "business",
        feature1: projectContext.industry || "business",
        feature2: projectContext.industry || "business",
        testimonial: "person",
        about: projectContext.industry || "team",
      };

      // Add additional images based on website type
      if (projectContext.websiteType === "ecommerce") {
        standardImages.product1 = "product";
        standardImages.product2 = "product";
        standardImages.product3 = "product";
        standardImages.product4 = "product";
      }

      if (projectContext.websiteType === "portfolio") {
        standardImages.project1 = "project";
        standardImages.project2 = "project";
        standardImages.project3 = "project";
        standardImages.profile = "person";
      }

      if (projectContext.websiteType === "foodDelivery") {
        standardImages.food1 = "food";
        standardImages.food2 = "food";
        standardImages.food3 = "food";
        standardImages.chef = "chef";
        standardImages.restaurant = "restaurant";
      }

      // Get URLs for all standard images
      for (const [key, category] of Object.entries(standardImages)) {
        if (!this.imageCache.has(key)) {
          const imageUrl = await this._getImageUrl(category, projectContext);
          this.imageCache.set(key, imageUrl);

          if (this.useLocalImages) {
            // Save image locally
            const extension = imageUrl.split(".").pop().split("?")[0]; // Get file extension
            const localPath = `/images/${key}.${extension || "jpg"}`;

            try {
              await this.fileSystem.saveImage(imageUrl, `public${localPath}`);
            } catch (error) {
              this.logger.warn(`Failed to save image ${key} locally:`, error);
            }
          }
        }
      }
    } catch (error) {
      this.logger.error("Error processing image assets:", error);
      this.errorCounts.imageLoading++;
    }
  }

  /**
   * Ultimate fallback code generation when everything else fails
   * @private
   */
  _generateUltimateFallbackCode(requirements, projectContext) {
    try {
      // Basic landing page that's guaranteed to work
      const websiteName = projectContext.websiteName || "Beautiful Website";
      const industry = projectContext.industry || "business";
      const colorScheme =
        projectContext.colorScheme || this._suggestColorScheme(industry);

      const indexHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${websiteName}</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <style>
    :root {
      --primary-color: ${colorScheme.primary};
      --secondary-color: ${colorScheme.secondary};
      --accent-color: ${colorScheme.accent};
      --text-color: ${colorScheme.text};
      --bg-color: ${colorScheme.background};
    }
    body {
      font-family: 'Inter', sans-serif;
      color: var(--text-color);
      background-color: var(--bg-color);
    }
    .btn-primary {
      background-color: var(--primary-color);
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 0.375rem;
      font-weight: 600;
      transition: all 0.3s ease;
    }
    .btn-primary:hover {
      opacity: 0.9;
      transform: translateY(-2px);
    }
    .hero {
      background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://source.unsplash.com/random/1600x900?${industry}');
      background-size: cover;
      background-position: center;
    }
    .card {
      transition: all 0.3s ease;
    }
    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
  </style>
</head>
<body>
  <!-- Header -->
  <header class="bg-white shadow-sm">
    <div class="container mx-auto px-4 py-4 flex justify-between items-center">
      <div class="text-xl font-bold" style="color: var(--primary-color);">${websiteName}</div>
      <nav>
        <ul class="flex space-x-6">
          <li><a href="#" class="hover:text-gray-600">Home</a></li>
          <li><a href="#features" class="hover:text-gray-600">Features</a></li>
          <li><a href="#testimonials" class="hover:text-gray-600">Testimonials</a></li>
          <li><a href="#contact" class="hover:text-gray-600">Contact</a></li>
        </ul>
      </nav>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="hero text-white py-32">
    <div class="container mx-auto px-4 text-center">
      <h1 class="text-4xl md:text-6xl font-bold mb-6">Welcome to ${websiteName}</h1>
      <p class="text-xl md:text-2xl mb-10 max-w-3xl mx-auto">The perfect solution for your ${industry} needs. We deliver exceptional results with a focus on quality.</p>
      <div class="flex justify-center gap-4">
        <a href="#contact" class="btn-primary">Get Started</a>
        <a href="#features" class="btn-primary" style="background-color: var(--secondary-color);">Learn More</a>
      </div>
    </div>
  </section>

  <!-- Features Section -->
  <section id="features" class="py-20 bg-gray-50">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl md:text-4xl font-bold text-center mb-16">Our Features</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Feature 1 -->
        <div class="card bg-white p-6 rounded-lg shadow-md">
          <img src="https://source.unsplash.com/random/600x400?${industry}+feature" alt="Feature 1" class="w-full h-48 object-cover rounded-md mb-6">
          <h3 class="text-xl font-semibold mb-3" style="color: var(--primary-color);">Premium Quality</h3>
          <p class="text-gray-600">We pride ourselves on delivering the highest quality products and services in the industry.</p>
        </div>
        
        <!-- Feature 2 -->
        <div class="card bg-white p-6 rounded-lg shadow-md">
          <img src="https://source.unsplash.com/random/600x400?${industry}+service" alt="Feature 2" class="w-full h-48 object-cover rounded-md mb-6">
          <h3 class="text-xl font-semibold mb-3" style="color: var(--primary-color);">Expert Support</h3>
          <p class="text-gray-600">Our team of experts is always ready to provide exceptional support whenever you need it.</p>
        </div>
        
        <!-- Feature 3 -->
        <div class="card bg-white p-6 rounded-lg shadow-md">
          <img src="https://source.unsplash.com/random/600x400?${industry}+innovation" alt="Feature 3" class="w-full h-48 object-cover rounded-md mb-6">
          <h3 class="text-xl font-semibold mb-3" style="color: var(--primary-color);">Innovative Solutions</h3>
          <p class="text-gray-600">We constantly innovate to ensure that our offerings stay ahead of the competition.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Testimonials Section -->
  <section id="testimonials" class="py-20">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl md:text-4xl font-bold text-center mb-16">What Our Clients Say</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Testimonial 1 -->
        <div class="bg-white p-6 rounded-lg shadow-md">
          <div class="flex items-center mb-4">
            <img src="https://source.unsplash.com/random/100x100?person" alt="Client" class="w-16 h-16 rounded-full object-cover mr-4">
            <div>
              <h4 class="font-semibold">Sarah Johnson</h4>
              <p class="text-sm text-gray-500">CEO, Example Corp</p>
            </div>
          </div>
          <p class="text-gray-600">"Working with ${websiteName} has been an excellent experience. Their attention to detail and commitment to quality is unmatched in the industry."</p>
        </div>
        
        <!-- Testimonial 2 -->
        <div class="bg-white p-6 rounded-lg shadow-md">
          <div class="flex items-center mb-4">
            <img src="https://source.unsplash.com/random/100x100?businessman" alt="Client" class="w-16 h-16 rounded-full object-cover mr-4">
            <div>
              <h4 class="font-semibold">David Chen</h4>
              <p class="text-sm text-gray-500">Marketing Director, Sample Inc</p>
            </div>
          </div>
          <p class="text-gray-600">"The team at ${websiteName} exceeded our expectations. Their products are exceptional and their support is always timely and helpful."</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Contact Section -->
  <section id="contact" class="py-20 bg-gray-50">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl md:text-4xl font-bold text-center mb-16">Get In Touch</h2>
      <div class="max-w-xl mx-auto">
        <form>
          <div class="mb-4">
            <label for="name" class="block text-gray-700 mb-2">Name</label>
            <input type="text" id="name" class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50" style="focus:ring-color: var(--primary-color);">
          </div>
          <div class="mb-4">
            <label for="email" class="block text-gray-700 mb-2">Email</label>
            <input type="email" id="email" class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50" style="focus:ring-color: var(--primary-color);">
          </div>
          <div class="mb-4">
            <label for="message" class="block text-gray-700 mb-2">Message</label>
            <textarea id="message" rows="4" class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50" style="focus:ring-color: var(--primary-color);"></textarea>
          </div>
          <button type="submit" class="btn-primary w-full">Send Message</button>
        </form>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="bg-gray-800 text-white py-12">
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 class="text-xl font-bold mb-4">${websiteName}</h3>
          <p class="text-gray-400">We provide the best solutions for your ${industry} needs.</p>
        </div>
        <div>
          <h4 class="font-semibold mb-4">Quick Links</h4>
          <ul class="space-y-2">
            <li><a href="#" class="text-gray-400 hover:text-white">Home</a></li>
            <li><a href="#features" class="text-gray-400 hover:text-white">Features</a></li>
            <li><a href="#testimonials" class="text-gray-400 hover:text-white">Testimonials</a></li>
            <li><a href="#contact" class="text-gray-400 hover:text-white">Contact</a></li>
          </ul>
        </div>
        <div>
          <h4 class="font-semibold mb-4">Contact Info</h4>
          <ul class="space-y-2 text-gray-400">
            <li>123 Main Street, City</li>
            <li>info@${websiteName.toLowerCase().replace(/\s/g, "")}.com</li>
            <li>(123) 456-7890</li>
          </ul>
        </div>
        <div>
          <h4 class="font-semibold mb-4">Follow Us</h4>
          <div class="flex space-x-4">
            <a href="#" class="text-gray-400 hover:text-white">Facebook</a>
            <a href="#" class="text-gray-400 hover:text-white">Twitter</a>
            <a href="#" class="text-gray-400 hover:text-white">Instagram</a>
          </div>
        </div>
      </div>
      <div class="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
        <p>&copy; ${new Date().getFullYear()} ${websiteName}. All rights reserved.</p>
      </div>
    </div>
  </footer>
</body>
</html>`;

      return {
        files: [
          {
            path: "index.html",
            code: indexHTML,
            description: "Complete landing page with all necessary sections",
          },
        ],
        framework: "html",
        explanation:
          "Basic yet beautiful landing page created with HTML, CSS, and Tailwind CDN. This page includes all essential sections: hero, features, testimonials, contact form, and footer.",
        fallback: true,
      };
    } catch (error) {
      this.logger.error("Ultimate fallback code generation failed:", error);

      // If even this fails, return an absolute minimal HTML page
      return {
        files: [
          {
            path: "index.html",
            code: `<!DOCTYPE html><html><head><title>Simple Page</title></head><body><h1>Hello World</h1><p>This is a minimal page.</p></body></html>`,
            description: "Minimal HTML page",
          },
        ],
        framework: "html",
        explanation: "Minimal HTML page generated as last resort fallback.",
        fallback: true,
      };
    }
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
              () => reject(new Error("Operation timed out")),
              this.requestTimeout
            )
          ),
        ]);

        return result; // Success, return the result
      } catch (error) {
        lastError = error;

        // Check if we should stop retrying
        if (
          error.message.includes("credit") ||
          error.message.includes("quota") ||
          error.message.includes("rate limit")
        ) {
          this.creditIssueDetected = true;
          throw error; // Don't retry API credit issues
        }

        // Log the error and retry
        this.logger.warn(
          `Attempt ${attempt + 1}/${maxRetries} failed:`,
          error.message
        );

        // Wait before retrying (exponential backoff)
        if (attempt < maxRetries - 1) {
          const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s, 8s...
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    // All retries failed
    throw lastError;
  }

  /**
   * Check if we've hit too many errors of any type
   * @private
   */
  _hasTooManyErrors() {
    return Object.values(this.errorCounts).some(
      (count) => count >= this.maxErrorCount
    );
  }

  /**
   * Determine the framework to use with modern preferences
   * @private
   */
  _determineFramework(requirements, projectContext) {
    // First, check if the requirements explicitly specify a framework
    if (requirements.framework) {
      return requirements.framework.toLowerCase();
    }

    // Next, check the project context
    if (projectContext.framework) {
      return projectContext.framework.toLowerCase();
    }

    // Website type based framework selection - use best framework for each type
    if (projectContext.websiteType) {
      const typeToFramework = {
        ecommerce: "next",
        blog: "next",
        portfolio: "react",
        dashboard: "next",
        landingPage: "react",
        foodDelivery: "next",
      };

      if (typeToFramework[projectContext.websiteType]) {
        return typeToFramework[projectContext.websiteType];
      }
    }

    // If there's a package.json, try to infer from dependencies
    if (projectContext.packageJson) {
      const deps = {
        ...projectContext.packageJson.dependencies,
        ...projectContext.packageJson.devDependencies,
      };

      if (deps.next) return "next";
      if (deps.react && !deps.next) return "react";
      if (deps.vue) return "vue";
      if (deps.angular) return "angular";
      if (deps.svelte) return "svelte";
    }

    // Default to Next.js as it's the most modern and versatile
    return "next";
  }

  /**
   * Process and validate generated code with enhanced error checking
   * @private
   */
  async _processGeneratedCode(generatedCode, requirements, framework) {
    try {
      if (
        !generatedCode ||
        !generatedCode.files ||
        !Array.isArray(generatedCode.files)
      ) {
        this.logger.warn("Invalid code generation result, missing files array");
        return this._generatePremiumTemplateCode(requirements, { framework });
      }

      // Normalize file path format and validate code content
      const normalizedCode = {
        ...generatedCode,
        files: await Promise.all(
          generatedCode.files.map(async (file) => {
            // Ensure code property exists and is a string
            const code = file.code || file.content || "";

            // Process any image placeholders in the code
            let processedCode = code;
            if (typeof code === "string" && code.includes("{{IMAGE:")) {
              processedCode = await this._replaceImagePlaceholders(code, {
                framework,
                websiteType: requirements.websiteType || "landingPage",
                industry: requirements.industry || "business",
              });
            }

            return {
              path: file.path,
              code: processedCode,
              description: file.description || "",
            };
          })
        ),
      };

      // Apply code quality checks if available
      let finalCode = normalizedCode;

      if (this.codeQualityCheckers.length > 0) {
        for (const checker of this.codeQualityCheckers) {
          try {
            finalCode = await checker(finalCode, framework);
          } catch (e) {
            this.logger.warn(`Code quality checker failed: ${e.message}`);
          }
        }
      }

      // Add utility files if they're not already included
      const missingUtilityFiles = this._addMissingUtilityFiles(
        finalCode.files,
        framework
      );
      if (missingUtilityFiles.length > 0) {
        finalCode.files = [...finalCode.files, ...missingUtilityFiles];
      }

      // Write files if file system is available
      if (this.fileSystem && finalCode.files) {
        for (const file of finalCode.files) {
          try {
            await this.fileSystem.writeFile(file.path, file.code);
            this.logger.info(`File written: ${file.path}`);
          } catch (e) {
            this.logger.warn(`Failed to write file: ${file.path}`, {
              error: e.message,
            });
            this.errorCounts.filesystem++;
          }
        }
      }

      return {
        files: finalCode.files,
        framework,
        explanation:
          finalCode.explanation ||
          normalizedCode.explanation ||
          "Generated high-quality code with proper image loading and error handling",
        usingPremiumTemplate: finalCode.usingPremiumTemplate || false,
      };
    } catch (error) {
      this.logger.error("Error processing generated code:", error);
      return this._generatePremiumTemplateCode(requirements, { framework });
    }
  }

  /**
   * Add missing utility files based on framework and existing files
   * @private
   */
  _addMissingUtilityFiles(files, framework) {
    const missingFiles = [];
    const filePaths = files.map((f) => f.path);

    // Check if image utilities are needed
    const hasImages = files.some(
      (file) =>
        file.code &&
        typeof file.code === "string" &&
        (file.code.includes("<img") || file.code.includes("background-image"))
    );

    if (
      hasImages &&
      !filePaths.some(
        (p) => p.includes("imageLoader") || p.includes("ImageUtils")
      )
    ) {
      // Add appropriate image utility based on framework
      if (framework === "next") {
        missingFiles.push({
          path: "src/utils/imageLoader.js",
          code: imageLoaders.responsive,
          description: "Utility for responsive image loading in Next.js",
        });
      } else if (framework === "react") {
        missingFiles.push({
          path: "src/utils/ImageUtils.js",
          code: imageLoaders.lazy,
          description: "Utility for lazy loading images in React",
        });
      }
    }

    // Check if animation utilities are needed
    const hasAnimations = files.some(
      (file) =>
        file.code &&
        typeof file.code === "string" &&
        (file.code.includes("animation") || file.code.includes("transition"))
    );

    if (
      hasAnimations &&
      !filePaths.some((p) => p.includes("animation") || p.includes("motion"))
    ) {
      missingFiles.push({
        path: "src/utils/animations.js",
        code: cssAnimations.fade,
        description: "Utility for creating smooth animations",
      });
    }

    return missingFiles;
  }

  /**
   * Generate React-specific code with enhanced templates
   * @private
   */
  async _generateReactCode(requirements, projectContext) {
    // Determine if we're using TypeScript
    const useTypeScript = this._isUsingTypeScript(projectContext);
    const fileExtension = useTypeScript ? ".tsx" : ".jsx";

    // Determine styling approach
    const stylingApproach = this._determineStylingApproach(projectContext);

    // Determine website type/theme and color scheme
    const websiteType =
      projectContext.websiteType ||
      this._determineWebsiteType(requirements, projectContext);
    const colorScheme =
      projectContext.colorScheme ||
      this._suggestColorScheme(projectContext.industry || "default");

    // Check for premium template first
    if (this._hasPremiumTemplate("react", websiteType)) {
      return this._generatePremiumCode(requirements, {
        ...projectContext,
        framework: "react",
        websiteType,
      });
    }

    const reactPrompt = `
      You are an expert React developer generating production-quality code for beautiful websites.
      
      REQUIREMENTS:
      ${JSON.stringify(requirements, null, 2)}
      
      PROJECT CONTEXT:
      ${JSON.stringify(
        {
          ...projectContext,
          websiteType,
          colorScheme,
        },
        null,
        2
      )}
      
      TECHNICAL DETAILS:
      - Using ${useTypeScript ? "TypeScript" : "JavaScript"}
      - Styling with ${stylingApproach}
      - File extension: ${fileExtension}
      
      IMPORTANT REQUIREMENTS:
      1. Generate a beautiful, modern, production-ready React website similar to the examples described
      2. Ensure proper image loading with responsive handling
      3. Include animations and transitions for a premium feel
      4. Use the provided color scheme consistently
      5. Make sure all components are well-organized and reusable
      6. Include proper error handling for all functionality
      7. Ensure all images have proper loading states and fallbacks
      8. DO NOT use Lorem Ipsum text - write actual good content related to the website type
      9. No placeholders - all links, buttons and forms should be functional
      10. Focus on a beautiful dark-themed design with gold accents like in the examples shown
      
      Generate the complete React application with all necessary files. Follow React best practices.
      
      ${useTypeScript ? "Use proper TypeScript types for all components, props, and state." : ""}
      ${stylingApproach === "CSS Modules" ? "Create separate CSS Module files for styling." : ""}
      ${stylingApproach === "Styled Components" ? "Use styled-components for styling." : ""}
      ${stylingApproach === "Tailwind CSS" ? "Use Tailwind CSS classes for styling." : ""}
      
      IMPORTANT: Format your response EXACTLY as a JSON object with the following structure:
      {
        "files": [
          {
            "path": "src/components/file${fileExtension}",
            "code": "// Code content here",
            "description": "What this file does and how it fits into the project"
          },
          // More files as needed
        ],
        "explanation": "Overall explanation of how these files work together"
      }
      
      Do not include any text outside of this JSON object.
      `;

    const codeResponse = await this.llm.complete(reactPrompt, {
      temperature: 0.2,
      responseFormat: { type: "json_object" },
      maxTokens: 6000,
    });

    return this._parseCodeResponse(codeResponse);
  }

  /**
   * Generate Next.js-specific code with enhanced templates and features
   * @private
   */
  async _generateNextJsCode(requirements, projectContext) {
    // Determine if we're using TypeScript
    const useTypeScript = this._isUsingTypeScript(projectContext);
    const fileExtension = useTypeScript ? ".tsx" : ".jsx";

    // Determine if using App Router or Pages Router
    const usingAppRouter = this._isUsingAppRouter(projectContext);

    // Determine styling approach
    const stylingApproach = this._determineStylingApproach(projectContext);

    // Determine website type/theme and color scheme
    const websiteType =
      projectContext.websiteType ||
      this._determineWebsiteType(requirements, projectContext);
    const colorScheme =
      projectContext.colorScheme ||
      this._suggestColorScheme(projectContext.industry || "default");

    // Check for premium template first
    if (this._hasPremiumTemplate("nextjs", websiteType)) {
      return this._generatePremiumCode(requirements, {
        ...projectContext,
        framework: "nextjs",
        websiteType,
      });
    }

    const nextPrompt = `
      You are an expert Next.js developer generating production-quality code for beautiful websites.
      
      REQUIREMENTS:
      ${JSON.stringify(requirements, null, 2)}
      
      PROJECT CONTEXT:
      ${JSON.stringify(
        {
          ...projectContext,
          websiteType,
          colorScheme,
        },
        null,
        2
      )}
      
      TECHNICAL DETAILS:
      - Using Next.js with ${useTypeScript ? "TypeScript" : "JavaScript"}
      - Using ${usingAppRouter ? "App Router" : "Pages Router"}
      - Styling with ${stylingApproach}
      - File extension: ${fileExtension}
      
      IMPORTANT REQUIREMENTS:
      1. Generate a beautiful, modern, production-ready Next.js website similar to the examples described
      2. Ensure proper image loading using Next.js Image component
      3. Include animations and transitions for a premium feel (use framer-motion if needed)
      4. Use the provided color scheme consistently throughout the site
      5. Make sure all components are well-organized and reusable
      6. Include proper error handling and loading states
      7. Ensure all images have proper loading states and fallbacks
      8. Implement responsive designs that work on all devices
      9. DO NOT use Lorem Ipsum text - write actual good content related to the website type
      10. No placeholders - all links, buttons and forms should be functional
      11. Focus on a beautiful dark-themed design with gold accents like in the examples shown
      
      Generate the complete Next.js application with all necessary files. Follow Next.js best practices.
      
      ${useTypeScript ? "Use proper TypeScript types for all components, props, and state." : ""}
      ${usingAppRouter ? "Follow App Router conventions with server and client components where appropriate." : "Follow Pages Router conventions."}
      ${stylingApproach === "CSS Modules" ? "Create separate CSS Module files for styling." : ""}
      ${stylingApproach === "Styled Components" ? "Use styled-components for styling." : ""}
      ${stylingApproach === "Tailwind CSS" ? "Use Tailwind CSS classes for styling." : ""}
      
      IMPORTANT: Format your response EXACTLY as a JSON object with the following structure:
      {
        "files": [
          {
            "path": "src/${usingAppRouter ? "app" : "pages"}/path/to/file${fileExtension}",
            "code": "// Code content here",
            "description": "What this file does and how it fits into the project"
          },
          // More files as needed
        ],
        "explanation": "Overall explanation of how these files work together"
      }
      
      Do not include any text outside of this JSON object.
      `;

    const codeResponse = await this.llm.complete(nextPrompt, {
      temperature: 0.2,
      responseFormat: { type: "json_object" },
      maxTokens: 6000,
    });

    return this._parseCodeResponse(codeResponse);
  }

  /**
   * Generate premium-themed code using best templates and customizations
   * @private
   */
  async _generatePremiumCode(requirements, projectContext) {
    // Determine framework, website type and color scheme
    const framework = projectContext.framework || "next";
    const websiteType = projectContext.websiteType || "landingPage";
    const colorScheme =
      projectContext.colorScheme ||
      this._suggestColorScheme(projectContext.industry || "default");

    try {
      // First check if we have a specific premium template for this combination
      if (this._hasPremiumTemplate(framework, websiteType)) {
        return this._generatePremiumTemplateCode(requirements, projectContext);
      }

      // If not, generate using the appropriate framework with premium styling guidance
      const frameworkGenerator =
        this.frameworkSpecificGenerators.get(framework);
      if (frameworkGenerator) {
        // Add premium styling requirements to the project context
        const enhancedContext = {
          ...projectContext,
          premiumTheme: true,
          colorScheme,
          stylingApproach: "Tailwind CSS", // Tailwind is best for premium themes
          layoutStyle: "modern",
          animationLevel: "rich",
          imageQuality: "high",
        };

        return frameworkGenerator(requirements, enhancedContext);
      }

      // If no generator is available, use the template-based approach
      return this._generatePremiumTemplateCode(requirements, projectContext);
    } catch (error) {
      this.logger.error("Error generating premium code:", error);
      return this._generatePremiumTemplateCode(requirements, projectContext);
    }
  }

  /**
   * Generate Vue-specific code
   * @private
   */
  async _generateVueCode(requirements, projectContext) {
    // Determine if we're using TypeScript
    const useTypeScript = this._isUsingTypeScript(projectContext);
    const fileExtension = ".vue"; // Vue uses .vue for both TS and JS

    // Determine Vue version
    const vueVersion = this._determineVueVersion(projectContext);

    // Determine website type/theme
    const websiteType =
      projectContext.websiteType ||
      this._determineWebsiteType(requirements, projectContext);
    const colorScheme =
      projectContext.colorScheme ||
      this._suggestColorScheme(projectContext.industry || "default");

    // Check for premium template first
    if (this._hasPremiumTemplate("vue", websiteType)) {
      return this._generatePremiumCode(requirements, {
        ...projectContext,
        framework: "vue",
        websiteType,
      });
    }

    const vuePrompt = `
      You are an expert Vue.js developer generating production-quality code for beautiful websites.
      
      REQUIREMENTS:
      ${JSON.stringify(requirements, null, 2)}
      
      PROJECT CONTEXT:
      ${JSON.stringify(
        {
          ...projectContext,
          websiteType,
          colorScheme,
        },
        null,
        2
      )}
      
      TECHNICAL DETAILS:
      - Using Vue.js ${vueVersion}
      - ${useTypeScript ? "Using TypeScript" : "Using JavaScript"}
      - File extension: ${fileExtension}
      
      IMPORTANT REQUIREMENTS:
      1. Generate a beautiful, modern, production-ready Vue.js website similar to the examples described
      2. Ensure proper image loading with responsive handling
      3. Include animations and transitions for a premium feel
      4. Use the provided color scheme consistently throughout the site
      5. Make sure all components are well-organized and reusable
      6. Include proper error handling and loading states
      7. Ensure all images have proper loading states and fallbacks
      8. DO NOT use Lorem Ipsum text - write actual good content related to the website type
      9. No placeholders - all links, buttons and forms should be functional
      10. Focus on a beautiful dark-themed design with gold accents like in the examples shown
      
      Generate the complete Vue.js application with all necessary files. Follow Vue.js best practices.
      
      ${useTypeScript ? "Use proper TypeScript types in the script section." : ""}
      ${vueVersion === "3" ? "Use the Composition API rather than the Options API where appropriate." : ""}
      
      IMPORTANT: Format your response EXACTLY as a JSON object with the following structure:
      {
        "files": [
          {
            "path": "src/components/file${fileExtension}",
            "code": "// Code content here",
            "description": "What this file does and how it fits into the project"
          },
          // More files as needed
        ],
        "explanation": "Overall explanation of how these files work together"
      }
      
      Do not include any text outside of this JSON object.
      `;

    const codeResponse = await this.llm.complete(vuePrompt, {
      temperature: 0.2,
      responseFormat: { type: "json_object" },
      maxTokens: 6000,
    });

    return this._parseCodeResponse(codeResponse);
  }

  /**
   * Generate Angular-specific code
   * @private
   */
  async _generateAngularCode(requirements, projectContext) {
    // Angular uses TypeScript by default
    const fileExtensions = {
      component: ".component.ts",
      template: ".component.html",
      style: ".component.scss",
      service: ".service.ts",
      module: ".module.ts",
      pipe: ".pipe.ts",
      directive: ".directive.ts",
    };

    // Determine website type/theme
    const websiteType =
      projectContext.websiteType ||
      this._determineWebsiteType(requirements, projectContext);
    const colorScheme =
      projectContext.colorScheme ||
      this._suggestColorScheme(projectContext.industry || "default");

    const angularPrompt = `
      You are an expert Angular developer generating production-quality code for beautiful websites.
      
      REQUIREMENTS:
      ${JSON.stringify(requirements, null, 2)}
      
      PROJECT CONTEXT:
      ${JSON.stringify(
        {
          ...projectContext,
          websiteType,
          colorScheme,
        },
        null,
        2
      )}
      
      TECHNICAL DETAILS:
      - Using Angular with TypeScript
      - Following Angular best practices for file organization and naming
      
      IMPORTANT REQUIREMENTS:
      1. Generate a beautiful, modern, production-ready Angular website similar to the examples described
      2. Ensure proper image loading with responsive handling
      3. Include animations and transitions for a premium feel
      4. Use the provided color scheme consistently throughout the site
      5. Make sure all components are well-organized and reusable
      6. Include proper error handling and loading states
      7. Ensure all images have proper loading states and fallbacks
      8. DO NOT use Lorem Ipsum text - write actual good content related to the website type
      9. No placeholders - all links, buttons and forms should be functional
      10. Focus on a beautiful dark-themed design with gold accents like in the examples shown
      
      Generate the complete Angular application with all necessary files. Follow Angular best practices.
      
      Use proper TypeScript types for all components, services, and models.
      Follow Angular's style guide for naming and file organization.
      
      IMPORTANT: Format your response EXACTLY as a JSON object with the following structure:
      {
        "files": [
          {
            "path": "src/app/components/component-name/component-name${fileExtensions.component}",
            "code": "// Code content here",
            "description": "What this file does and how it fits into the project"
          },
          {
            "path": "src/app/components/component-name/component-name${fileExtensions.template}",
            "code": "<!-- Template content here -->",
            "description": "Component template"
          },
          // More files as needed
        ],
        "explanation": "Overall explanation of how these files work together"
      }
      
      Do not include any text outside of this JSON object.
      `;

    const codeResponse = await this.llm.complete(angularPrompt, {
      temperature: 0.2,
      responseFormat: { type: "json_object" },
      maxTokens: 6000,
    });

    return this._parseCodeResponse(codeResponse);
  }

  /**
   * Generate Svelte-specific code
   * @private
   */
  async _generateSvelteCode(requirements, projectContext) {
    // Determine if we're using TypeScript
    const useTypeScript = this._isUsingTypeScript(projectContext);
    const fileExtension = ".svelte"; // Svelte uses .svelte for both TS and JS

    // Determine if using SvelteKit
    const usingSvelteKit = this._isUsingSvelteKit(projectContext);

    // Determine website type/theme
    const websiteType =
      projectContext.websiteType ||
      this._determineWebsiteType(requirements, projectContext);
    const colorScheme =
      projectContext.colorScheme ||
      this._suggestColorScheme(projectContext.industry || "default");

    // Check for premium template first
    if (this._hasPremiumTemplate("svelte", websiteType)) {
      return this._generatePremiumCode(requirements, {
        ...projectContext,
        framework: "svelte",
        websiteType,
      });
    }

    const sveltePrompt = `
      You are an expert Svelte developer generating production-quality code for beautiful websites.
      
      REQUIREMENTS:
      ${JSON.stringify(requirements, null, 2)}
      
      PROJECT CONTEXT:
      ${JSON.stringify(
        {
          ...projectContext,
          websiteType,
          colorScheme,
        },
        null,
        2
      )}
      
      TECHNICAL DETAILS:
      - Using ${usingSvelteKit ? "SvelteKit" : "Svelte"}
      - ${useTypeScript ? "Using TypeScript" : "Using JavaScript"}
      - File extension: ${fileExtension}
      
      IMPORTANT REQUIREMENTS:
      1. Generate a beautiful, modern, production-ready Svelte website similar to the examples described
      2. Ensure proper image loading with responsive handling
      3. Include animations and transitions for a premium feel
      4. Use the provided color scheme consistently throughout the site
      5. Make sure all components are well-organized and reusable
      6. Include proper error handling and loading states
      7. Ensure all images have proper loading states and fallbacks
      8. DO NOT use Lorem Ipsum text - write actual good content related to the website type
      9. No placeholders - all links, buttons and forms should be functional
      10. Focus on a beautiful dark-themed design with gold accents like in the examples shown
      
      Generate the complete Svelte application with all necessary files. Follow Svelte best practices.
      
      ${useTypeScript ? "Use proper TypeScript types in the script section." : ""}
      ${usingSvelteKit ? "Follow SvelteKit conventions for routing and layouts." : ""}
      
      IMPORTANT: Format your response EXACTLY as a JSON object with the following structure:
      {
        "files": [
          {
            "path": "src/${usingSvelteKit ? "routes" : "components"}/file${fileExtension}",
            "code": "<!-- Svelte component code here -->",
            "description": "What this file does and how it fits into the project"
          },
          // More files as needed
        ],
        "explanation": "Overall explanation of how these files work together"
      }
      
      Do not include any text outside of this JSON object.
      `;

    const codeResponse = await this.llm.complete(sveltePrompt, {
      temperature: 0.2,
      responseFormat: { type: "json_object" },
      maxTokens: 6000,
    });

    return this._parseCodeResponse(codeResponse);
  }

  /**
   * Generate generic code (framework-agnostic) with enhanced features
   * @private
   */
  async _generateGenericCode(requirements, projectContext, framework) {
    // Determine website type/theme
    const websiteType =
      projectContext.websiteType ||
      this._determineWebsiteType(requirements, projectContext);
    const colorScheme =
      projectContext.colorScheme ||
      this._suggestColorScheme(projectContext.industry || "default");

    const codePrompt = `
      You are an expert frontend developer generating production-quality code for beautiful websites.
      
      REQUIREMENTS:
      ${JSON.stringify(requirements, null, 2)}
      
      PROJECT CONTEXT:
      ${JSON.stringify(
        {
          ...projectContext,
          websiteType,
          colorScheme,
        },
        null,
        2
      )}
      
      FRAMEWORK:
      ${framework}
      
      IMPORTANT REQUIREMENTS:
      1. Generate a beautiful, modern, production-ready website similar to the examples described
      2. Ensure proper image loading with responsive handling
      3. Include animations and transitions for a premium feel
      4. Use the provided color scheme consistently throughout the site
      5. Make sure all components are well-organized and reusable
      6. Include proper error handling and loading states
      7. Ensure all images have proper loading states and fallbacks
      8. DO NOT use Lorem Ipsum text - write actual good content related to the website type
      9. No placeholders - all links, buttons and forms should be functional
      10. Focus on a beautiful dark-themed design with gold accents like in the examples shown
      
      Generate clean, maintainable, production-ready code for this task using the ${framework} framework.
      Follow best practices for frontend development with ${framework}.
      Include helpful comments to explain complex logic.
      
      IMPORTANT: Format your response EXACTLY as a JSON object with the following structure:
      {
        "files": [
          {
            "path": "src/components/file.js",
            "code": "// Code content here",
            "description": "What this file does and how it fits into the project"
          },
          // More files as needed
        ],
        "explanation": "Overall explanation of how these files work together"
      }
      
      Do not include any text outside of this JSON object.
      `;

    const codeResponse = await this.llm.complete(codePrompt, {
      temperature: 0.2,
      responseFormat: { type: "json_object" },
      maxTokens: 6000,
    });

    return this._parseCodeResponse(codeResponse);
  }

  /**
   * Parse code response from LLM with enhanced error handling
   * @private
   */
  _parseCodeResponse(codeResponse) {
    try {
      // First try: parse the response directly if it's already an object
      if (typeof codeResponse === "object" && codeResponse !== null) {
        if (codeResponse.files) {
          return codeResponse;
        }

        // If it's an API response object with text content
        if (codeResponse.text) {
          return JSON.parse(codeResponse.text);
        }

        if (codeResponse.content && Array.isArray(codeResponse.content)) {
          return JSON.parse(codeResponse.content[0].text);
        }
      }

      // Second try: parse the response as JSON if it's a string
      if (typeof codeResponse === "string") {
        return JSON.parse(codeResponse);
      }

      // Third try: extract JSON from the text if possible
      const responseText =
        typeof codeResponse === "string"
          ? codeResponse
          : codeResponse.text ||
            (codeResponse.content && codeResponse.content[0].text) ||
            "";

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // If all parsing attempts fail, extract code blocks
      const extracted = this._extractCodeFromText(responseText);
      if (extracted.files.length > 0) {
        return extracted;
      }

      throw new Error(
        "Failed to parse code response - no valid JSON or code blocks found"
      );
    } catch (error) {
      this.logger.warn(`Error parsing code response: ${error.message}`);
      this.errorCounts.parsing++;

      // Try to salvage content by extracting code blocks if JSON parsing failed
      const responseText =
        typeof codeResponse === "string"
          ? codeResponse
          : codeResponse.text ||
            (codeResponse.content && codeResponse.content[0].text) ||
            "";

      return this._extractCodeFromText(responseText);
    }
  }

  /**
   * Extract code blocks from text response with improved recognition
   * @private
   */
  _extractCodeFromText(text) {
    const files = [];

    // Try to extract code blocks marked with ```
    const codeBlockRegex =
      /```(?:(jsx?|tsx?|css|html|vue|svelte|scss|json|tailwind|php|py))?([^`]+)```/g;
    let match;
    let fileCount = 0;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      fileCount++;
      const language = match[1] || "";
      const content = match[2].trim();

      // Determine file type and path based on content and language
      let path = this._inferFilePathFromContent(content, language, fileCount);

      files.push({
        path,
        code: content,
        description: `Extracted from code block in response (language: ${language || "unspecified"})`,
      });
    }

    // If no code blocks found with triple backticks, try looking for file path indicators
    if (files.length === 0) {
      const filePathRegex =
        /(?:filename|file path|filepath):\s*["']?([^"'\n]+)["']?/gi;
      const contentSections = text.split(
        /(?:^|\n)(?:filename|file path|filepath):/i
      );

      if (contentSections.length > 1) {
        // Skip the first section which is likely introduction text
        for (let i = 1; i < contentSections.length; i++) {
          const section = contentSections[i];
          const pathMatch = section.match(/^[\s]*["']?([^"'\n]+)["']?/);

          if (pathMatch) {
            const path = pathMatch[1].trim();
            // Extract content after the path line until the next filename or end
            const contentMatch = section.match(
              /\n([\s\S]+?)(?=\n(?:filename|file path|filepath):|$)/i
            );

            if (contentMatch) {
              files.push({
                path,
                code: contentMatch[1].trim(),
                description: `Extracted from content section with filename indicator`,
              });
            }
          }
        }
      }
    }

    // If still no files found, try to extract based on content patterns
    if (files.length === 0) {
      this._extractFilesFromContentPatterns(text, files);
    }

    return {
      files,
      explanation: "Code extracted from non-JSON response",
    };
  }

  /**
   * Infer file path based on content and language
   * @private
   */
  _inferFilePathFromContent(content, language, fileCount) {
    // Look for filename in comments
    const filenameCommentRegex =
      /(?:\/\/|\/\*|\#|<!--)\s*(?:filename|file):\s*([^\n\*]+)(?:\*\/|-->)?/i;
    const filenameMatch = content.match(filenameCommentRegex);

    if (filenameMatch) {
      return filenameMatch[1].trim();
    }

    // Infer from content
    if (
      content.includes("import React") ||
      content.includes("from 'react'") ||
      content.includes('from "react"') ||
      content.includes("extends React.Component")
    ) {
      const componentName = this._extractComponentNameFromReactCode(content);
      return `src/components/${componentName}.${language === "tsx" ? "tsx" : "jsx"}`;
    }

    if (content.includes("<template") && content.includes("<script")) {
      const componentName = this._extractComponentNameFromVueCode(content);
      return `src/components/${componentName}.vue`;
    }

    if (
      content.includes('<script context="module"') ||
      (content.includes("<script") && content.includes("export default"))
    ) {
      const componentName = this._extractComponentNameFromSvelteCode(content);
      return `src/components/${componentName}.svelte`;
    }

    if (content.includes("@Component") || content.includes("@NgModule")) {
      return `src/app/components/component-${fileCount}.ts`;
    }

    // Infer from language
    if (language) {
      switch (language) {
        case "js":
        case "jsx":
          return `src/components/Component${fileCount}.jsx`;
        case "ts":
        case "tsx":
          return `src/components/Component${fileCount}.tsx`;
        case "css":
          return `src/styles/style${fileCount}.css`;
        case "scss":
          return `src/styles/style${fileCount}.scss`;
        case "html":
          return `src/pages/page${fileCount}.html`;
        case "vue":
          return `src/components/Component${fileCount}.vue`;
        case "svelte":
          return `src/components/Component${fileCount}.svelte`;
        case "json":
          return `src/data/data${fileCount}.json`;
        case "php":
          return `api/script${fileCount}.php`;
        case "py":
          return `api/script${fileCount}.py`;
        default:
          return `src/file${fileCount}.${language}`;
      }
    }

    // Default fallback
    return `src/file${fileCount}.js`;
  }

  /**
   * Extract component name from React code
   * @private
   */
  _extractComponentNameFromReactCode(content) {
    // Try to find component declaration
    const functionalComponentRegex =
      /(?:function|const)\s+([A-Z][A-Za-z0-9_]*)/;
    const classComponentRegex = /class\s+([A-Z][A-Za-z0-9_]*)\s+extends/;

    const functionalMatch = content.match(functionalComponentRegex);
    const classMatch = content.match(classComponentRegex);

    if (functionalMatch) return functionalMatch[1];
    if (classMatch) return classMatch[1];

    // Check for common component names in the content
    if (content.includes("Button")) return "Button";
    if (content.includes("Card")) return "Card";
    if (content.includes("Header")) return "Header";
    if (content.includes("Footer")) return "Footer";
    if (content.includes("Navigation")) return "Navigation";
    if (content.includes("Hero")) return "Hero";
    if (content.includes("Feature")) return "Feature";
    if (content.includes("Pricing")) return "Pricing";
    if (content.includes("Testimonial")) return "Testimonial";
    if (content.includes("Contact")) return "Contact";

    return "Component";
  }

  /**
   * Extract component name from Vue code
   * @private
   */
  _extractComponentNameFromVueCode(content) {
    // Try to find component name declaration
    const nameRegex = /name:\s*['"]([A-Za-z0-9_]+)['"]/;
    const nameMatch = content.match(nameRegex);

    if (nameMatch) return nameMatch[1];

    // Check for common component names in the content
    if (content.includes("Button")) return "Button";
    if (content.includes("Card")) return "Card";
    if (content.includes("Header")) return "Header";
    if (content.includes("Footer")) return "Footer";
    if (content.includes("Navigation")) return "Navigation";
    if (content.includes("Hero")) return "Hero";

    return "VueComponent";
  }

  /**
   * Extract component name from Svelte code
   * @private
   */
  _extractComponentNameFromSvelteCode(content) {
    // Check for common component names in the content
    if (content.includes("Button")) return "Button";
    if (content.includes("Card")) return "Card";
    if (content.includes("Header")) return "Header";
    if (content.includes("Footer")) return "Footer";
    if (content.includes("Navigation")) return "Navigation";
    if (content.includes("Hero")) return "Hero";

    return "SvelteComponent";
  }

  /**
   * Extract files based on content patterns when other methods fail
   * @private
   */
  _extractFilesFromContentPatterns(text, files) {
    // Look for React component patterns
    if (
      text.includes("import React") ||
      text.includes("useState") ||
      text.includes("return <")
    ) {
      const componentName = text.includes("Counter")
        ? "Counter"
        : text.includes("Todo")
          ? "TodoList"
          : text.includes("Header")
            ? "Header"
            : text.includes("Hero")
              ? "Hero"
              : text.includes("Product")
                ? "Product"
                : "Component";

      files.push({
        path: `src/components/${componentName}.jsx`,
        code: text
          .replace(/^(Here is|I'll create|Let me implement)/i, "")
          .trim(),
        description: `Extracted React component based on code patterns`,
      });
    }

    // Look for CSS patterns
    else if (
      text.includes("{") &&
      text.includes("}") &&
      (text.includes("color:") ||
        text.includes("margin:") ||
        text.includes("padding:"))
    ) {
      files.push({
        path: `src/styles/styles.css`,
        code: text
          .replace(/^(Here is|I'll create|Let me implement)/i, "")
          .trim(),
        description: `Extracted CSS based on code patterns`,
      });
    }

    // Look for HTML patterns
    else if (
      text.includes("<html") ||
      text.includes("<body") ||
      (text.includes("<div") && text.includes("</div>"))
    ) {
      files.push({
        path: `index.html`,
        code: text
          .replace(/^(Here is|I'll create|Let me implement)/i, "")
          .trim(),
        description: `Extracted HTML based on code patterns`,
      });
    }

    // Last resort - just put the text in a file
    else if (text.trim().length > 0) {
      files.push({
        path: `src/unknown-content.txt`,
        code: text.trim(),
        description: `Unrecognized content format`,
      });
    }
  }

  /**
   * Check if project is using TypeScript
   * @private
   */
  _isUsingTypeScript(projectContext) {
    // Check for TypeScript in package.json
    if (projectContext.packageJson) {
      const deps = {
        ...projectContext.packageJson.dependencies,
        ...projectContext.packageJson.devDependencies,
      };

      if (deps.typescript || deps["@types/react"] || deps["@types/node"]) {
        return true;
      }
    }

    // Check for tsconfig.json
    if (projectContext.projectStructure) {
      if (projectContext.projectStructure.includes("tsconfig.json")) {
        return true;
      }
    }

    // Look for .ts or .tsx files
    if (projectContext.projectStructure) {
      const hasTsFiles = projectContext.projectStructure.some(
        (file) => file.endsWith(".ts") || file.endsWith(".tsx")
      );

      if (hasTsFiles) {
        return true;
      }
    }

    // Default to true for new projects - TypeScript is preferred
    return true;
  }

  /**
   * Determine styling approach with better defaults
   * @private
   */
  _determineStylingApproach(projectContext) {
    // Check package.json for styling libraries
    if (projectContext.packageJson) {
      const deps = {
        ...projectContext.packageJson.dependencies,
        ...projectContext.packageJson.devDependencies,
      };

      if (deps["styled-components"]) {
        return "Styled Components";
      }

      if (deps["tailwindcss"]) {
        return "Tailwind CSS";
      }

      if (deps["sass"] || deps["node-sass"]) {
        return "SCSS";
      }

      if (
        deps["emotion"] ||
        deps["@emotion/react"] ||
        deps["@emotion/styled"]
      ) {
        return "Emotion";
      }
    }

    // Check for config files
    if (projectContext.projectStructure) {
      if (
        projectContext.projectStructure.includes("tailwind.config.js") ||
        projectContext.projectStructure.includes("tailwind.config.ts")
      ) {
        return "Tailwind CSS";
      }
    }

    // Look for CSS module files
    if (projectContext.projectStructure) {
      const hasCssModules = projectContext.projectStructure.some(
        (file) => file.includes(".module.css") || file.includes(".module.scss")
      );

      if (hasCssModules) {
        return "CSS Modules";
      }
    }

    // Default to Tailwind CSS for new projects - it's the most versatile
    return "Tailwind CSS";
  }

  /**
   * Determine Vue version
   * @private
   */
  _determineVueVersion(projectContext) {
    // Check package.json for Vue version
    if (projectContext.packageJson && projectContext.packageJson.dependencies) {
      const vueDep = projectContext.packageJson.dependencies.vue;

      if (typeof vueDep === "string") {
        if (vueDep.startsWith("3") || vueDep.startsWith("^3")) {
          return "3";
        } else if (vueDep.startsWith("2") || vueDep.startsWith("^2")) {
          return "2";
        }
      }
    }

    // Default to Vue 3
    return "3";
  }

  /**
   * Check if using App Router (Next.js)
   * @private
   */
  _isUsingAppRouter(projectContext) {
    // Check for app directory in the project structure
    if (projectContext.projectStructure) {
      return projectContext.projectStructure.some(
        (path) => path.startsWith("app/") || path === "app"
      );
    }

    // Default to App Router for newer projects
    return true;
  }

  /**
   * Check if using SvelteKit
   * @private
   */
  _isUsingSvelteKit(projectContext) {
    // Check package.json for SvelteKit
    if (projectContext.packageJson) {
      const deps = {
        ...projectContext.packageJson.dependencies,
        ...projectContext.packageJson.devDependencies,
      };

      if (deps["@sveltejs/kit"]) {
        return true;
      }
    }

    // Check for SvelteKit structure
    if (projectContext.projectStructure) {
      return projectContext.projectStructure.some(
        (path) => path.startsWith("routes/") || path === "routes"
      );
    }

    return false;
  }
}

module.exports = CodeGenerationModule;
