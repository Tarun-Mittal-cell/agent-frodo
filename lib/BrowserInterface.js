/**
 * BrowserInterface.js
 * Provides an interface for web browser automation.
 * Supports web research, page visiting, content extraction, and interactions.
 */

class BrowserInterface {
  constructor(config = {}) {
    this.puppeteer = null;
    this.browser = null;
    this.currentPage = null;
    this.userAgent =
      config.userAgent ||
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";
    this.defaultTimeout = config.defaultTimeout || 30000;
    this.defaultViewport = config.defaultViewport || {
      width: 1280,
      height: 800,
    };
    this.headless = config.headless !== false;
    this.logger = config.logger || console;
    this.cookiesEnabled = config.cookiesEnabled !== false;
    this.cookiesPath = config.cookiesPath || "./browser-cookies.json";
    this.searchEngineUrls = {
      google: "https://www.google.com/search?q=",
      bing: "https://www.bing.com/search?q=",
      duckduckgo: "https://duckduckgo.com/?q=",
    };
    this.initialized = false;
  }

  /**
   * Initialize the browser
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Import puppeteer
      this.puppeteer = require("puppeteer");

      // Launch browser
      this.browser = await this.puppeteer.launch({
        headless: this.headless ? "new" : false,
        defaultViewport: this.defaultViewport,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--disable-gpu",
          "--window-size=1280,800",
        ],
      });

      // Create a new page
      this.currentPage = await this.browser.newPage();

      // Set user agent
      await this.currentPage.setUserAgent(this.userAgent);

      // Set default timeout
      this.currentPage.setDefaultTimeout(this.defaultTimeout);

      // Load cookies if enabled
      if (this.cookiesEnabled) {
        await this._loadCookies();
      }

      this.initialized = true;
      this.logger.info("Browser initialized");

      // Setup event handlers
      this.currentPage.on("console", (message) => {
        this.logger.debug(
          `Browser console ${message.type()}: ${message.text()}`
        );
      });

      this.currentPage.on("pageerror", (error) => {
        this.logger.warn("Browser page error:", error.message);
      });

      return true;
    } catch (error) {
      this.logger.error("Failed to initialize browser:", error.message);
      throw new Error(`Browser initialization failed: ${error.message}`);
    }
  }

  /**
   * Close the browser
   */
  async close() {
    if (!this.initialized) return;

    try {
      // Save cookies if enabled
      if (this.cookiesEnabled) {
        await this._saveCookies();
      }

      // Close browser
      if (this.browser) {
        await this.browser.close();
      }

      this.browser = null;
      this.currentPage = null;
      this.initialized = false;
      this.logger.info("Browser closed");
    } catch (error) {
      this.logger.error("Error closing browser:", error.message);
    }
  }

  /**
   * Visit a URL
   * @param {string} url - URL to visit
   * @param {Object} options - Options
   * @returns {Object} - Page content and metadata
   */
  async visitUrl(url, options = {}) {
    if (!this.initialized) {
      await this.initialize();
    }

    this.logger.info(`Visiting URL: ${url}`);

    try {
      // Ensure URL has protocol
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
      }

      // Navigate to URL with timeout
      const response = await this.currentPage.goto(url, {
        waitUntil: options.waitUntil || "domcontentloaded",
        timeout: options.timeout || this.defaultTimeout,
      });

      // Wait for network to be idle if requested
      if (options.waitForNetworkIdle) {
        await this.currentPage.waitForNetworkIdle({
          idle: options.networkIdleTime || 500,
          timeout: options.networkIdleTimeout || this.defaultTimeout,
        });
      }

      // Wait additional time if specified
      if (options.waitTime) {
        await new Promise((resolve) => setTimeout(resolve, options.waitTime));
      }

      // Get page content
      const content = await this.currentPage.content();

      // Extract text content
      const textContent = await this.currentPage.evaluate(() => {
        // Remove scripts, styles, and hidden elements
        const elements = document.querySelectorAll(
          'script, style, [style*="display:none"], [style*="display: none"]'
        );
        for (const element of elements) {
          element.remove();
        }

        // Get visible text
        return document.body.innerText;
      });

      // Get page metadata
      const title = await this.currentPage.title();
      const url = this.currentPage.url();

      // Take screenshot if requested
      let screenshot = null;
      if (options.screenshot) {
        screenshot = await this.currentPage.screenshot({
          type: "jpeg",
          quality: options.screenshotQuality || 70,
          fullPage: options.fullPageScreenshot || false,
        });
      }

      // Return page data
      return {
        url,
        title,
        content,
        textContent,
        statusCode: response ? response.status() : null,
        headers: response ? response.headers() : {},
        screenshot,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Error visiting URL ${url}:`, error.message);
      throw new Error(`Failed to visit URL ${url}: ${error.message}`);
    }
  }

  /**
   * Perform a web search
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Array} - Search results
   */
  async search(query, options = {}) {
    if (!this.initialized) {
      await this.initialize();
    }

    const engine = options.engine || "google";
    const numResults = options.numResults || 10;

    this.logger.info(`Searching for "${query}" using ${engine}`);

    try {
      // Get search engine URL
      const searchUrl = this._getSearchUrl(engine, query);

      // Visit search engine
      await this.visitUrl(searchUrl, {
        waitUntil: "networkidle2",
        timeout: options.timeout || this.defaultTimeout,
      });

      // Extract search results based on engine
      let results;

      switch (engine.toLowerCase()) {
        case "google":
          results = await this._extractGoogleResults(numResults);
          break;
        case "bing":
          results = await this._extractBingResults(numResults);
          break;
        case "duckduckgo":
          results = await this._extractDuckDuckGoResults(numResults);
          break;
        default:
          // Generic extraction
          results = await this._extractGenericResults(numResults);
      }

      return {
        query,
        engine,
        timestamp: new Date().toISOString(),
        results,
      };
    } catch (error) {
      this.logger.error(`Search failed for "${query}":`, error.message);
      throw new Error(`Search failed for "${query}": ${error.message}`);
    }
  }

  /**
   * Interact with the current page
   * @param {Object} interaction - Interaction details
   * @returns {Object} - Interaction result
   */
  async interact(interaction) {
    if (!this.initialized) {
      await this.initialize();
    }

    this.logger.info(`Performing interaction: ${interaction.type}`);

    try {
      let result = null;

      switch (interaction.type) {
        case "click":
          result = await this._handleClickInteraction(interaction);
          break;

        case "type":
          result = await this._handleTypeInteraction(interaction);
          break;

        case "scroll":
          result = await this._handleScrollInteraction(interaction);
          break;

        case "wait":
          result = await this._handleWaitInteraction(interaction);
          break;

        case "screenshot":
          result = await this._handleScreenshotInteraction(interaction);
          break;

        case "evaluate":
          result = await this._handleEvaluateInteraction(interaction);
          break;

        default:
          throw new Error(`Unknown interaction type: ${interaction.type}`);
      }

      return {
        success: true,
        interaction,
        result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Interaction failed: ${interaction.type}`,
        error.message
      );
      throw new Error(`Interaction failed: ${error.message}`);
    }
  }

  /**
   * Extract content from the current page
   * @param {Object} options - Extraction options
   * @returns {Object} - Extracted content
   */
  async extractContent(options = {}) {
    if (!this.initialized || !this.currentPage) {
      throw new Error("Browser not initialized or no page open");
    }

    this.logger.info("Extracting content from current page");

    try {
      const results = {};

      // Get basic page info
      results.url = this.currentPage.url();
      results.title = await this.currentPage.title();

      // Extract text content
      if (options.extractText !== false) {
        results.textContent = await this.currentPage.evaluate(() => {
          // Remove scripts, styles, and hidden elements
          const elements = document.querySelectorAll(
            'script, style, [style*="display:none"], [style*="display: none"]'
          );
          for (const element of elements) {
            element.remove();
          }

          // Get visible text
          return document.body.innerText;
        });
      }

      // Extract specific elements
      if (options.selectors && Array.isArray(options.selectors)) {
        results.elements = {};

        for (const selector of options.selectors) {
          try {
            results.elements[selector] = await this.currentPage.evaluate(
              (sel) => {
                const elements = Array.from(document.querySelectorAll(sel));
                return elements.map((el) => ({
                  text: el.innerText,
                  html: el.innerHTML,
                  attributes: Object.fromEntries(
                    Array.from(el.attributes).map((attr) => [
                      attr.name,
                      attr.value,
                    ])
                  ),
                }));
              },
              selector
            );
          } catch (e) {
            results.elements[selector] = { error: e.message };
          }
        }
      }

      // Extract links
      if (options.extractLinks !== false) {
        results.links = await this.currentPage.evaluate(() => {
          return Array.from(document.querySelectorAll("a[href]"))
            .map((a) => ({
              text: a.innerText,
              href: a.href,
              title: a.title || null,
            }))
            .filter((link) => link.href && link.href.startsWith("http"));
        });
      }

      // Extract images
      if (options.extractImages) {
        results.images = await this.currentPage.evaluate(() => {
          return Array.from(document.querySelectorAll("img[src]"))
            .map((img) => ({
              src: img.src,
              alt: img.alt || null,
              width: img.width,
              height: img.height,
            }))
            .filter((img) => img.src && (img.width > 100 || img.height > 100)); // Filter out tiny images
        });
      }

      // Extract metadata
      if (options.extractMetadata !== false) {
        results.metadata = await this.currentPage.evaluate(() => {
          const metadata = {};

          // Get meta tags
          const metaTags = Array.from(document.querySelectorAll("meta"));
          metaTags.forEach((meta) => {
            const name =
              meta.getAttribute("name") || meta.getAttribute("property");
            const content = meta.getAttribute("content");
            if (name && content) {
              metadata[name] = content;
            }
          });

          return metadata;
        });
      }

      // Take screenshot if requested
      if (options.screenshot) {
        results.screenshot = await this.currentPage.screenshot({
          type: "jpeg",
          quality: options.screenshotQuality || 70,
          fullPage: options.fullPageScreenshot || false,
        });
      }

      results.timestamp = new Date().toISOString();
      return results;
    } catch (error) {
      this.logger.error("Content extraction failed:", error.message);
      throw new Error(`Content extraction failed: ${error.message}`);
    }
  }

  /**
   * Handle click interaction
   * @private
   */
  async _handleClickInteraction(interaction) {
    const { selector, position, waitForNavigation, timeout } = interaction;

    if (selector) {
      // Click by selector
      if (waitForNavigation) {
        await Promise.all([
          this.currentPage.waitForNavigation({
            timeout: timeout || this.defaultTimeout,
          }),
          this.currentPage.click(selector),
        ]);
      } else {
        await this.currentPage.click(selector);
      }

      return { clicked: selector };
    } else if (
      position &&
      position.x !== undefined &&
      position.y !== undefined
    ) {
      // Click by position
      if (waitForNavigation) {
        await Promise.all([
          this.currentPage.waitForNavigation({
            timeout: timeout || this.defaultTimeout,
          }),
          this.currentPage.mouse.click(position.x, position.y),
        ]);
      } else {
        await this.currentPage.mouse.click(position.x, position.y);
      }

      return { clicked: position };
    } else {
      throw new Error(
        "Click interaction requires either a selector or position"
      );
    }
  }

  /**
   * Handle type interaction
   * @private
   */
  async _handleTypeInteraction(interaction) {
    const { selector, text, delay } = interaction;

    if (!selector) {
      throw new Error("Type interaction requires a selector");
    }

    if (!text) {
      throw new Error("Type interaction requires text");
    }

    // Click the element first to focus it
    await this.currentPage.click(selector);

    // Type the text
    await this.currentPage.type(selector, text, { delay: delay || 50 });

    return { typed: text, into: selector };
  }

  /**
   * Handle scroll interaction
   * @private
   */
  async _handleScrollInteraction(interaction) {
    const { direction, distance, selector } = interaction;

    if (selector) {
      // Scroll element into view
      const element = await this.currentPage.$(selector);
      if (!element) {
        throw new Error(`Element not found: ${selector}`);
      }

      await element.scrollIntoView();
      return { scrolled: `Element ${selector} into view` };
    } else {
      // Scroll the page
      let x = 0;
      let y = 0;

      if (direction === "up") y = -(distance || 500);
      else if (direction === "down") y = distance || 500;
      else if (direction === "left") x = -(distance || 500);
      else if (direction === "right") x = distance || 500;

      await this.currentPage.evaluate(
        (x, y) => {
          window.scrollBy(x, y);
        },
        x,
        y
      );

      return { scrolled: `${direction} by ${x || y}px` };
    }
  }

  /**
   * Handle wait interaction
   * @private
   */
  async _handleWaitInteraction(interaction) {
    const { milliseconds, selector, selectorVisible, navigation } = interaction;

    if (milliseconds) {
      // Wait for a specific time
      await new Promise((resolve) => setTimeout(resolve, milliseconds));
      return { waited: `${milliseconds}ms` };
    } else if (selector) {
      // Wait for selector
      await this.currentPage.waitForSelector(selector, {
        visible: selectorVisible === true,
        timeout: interaction.timeout || this.defaultTimeout,
      });
      return { waited: `for selector ${selector}` };
    } else if (navigation) {
      // Wait for navigation
      await this.currentPage.waitForNavigation({
        timeout: interaction.timeout || this.defaultTimeout,
      });
      return { waited: "for navigation" };
    } else {
      throw new Error(
        "Wait interaction requires milliseconds, selector, or navigation"
      );
    }
  }

  /**
   * Handle screenshot interaction
   * @private
   */
  async _handleScreenshotInteraction(interaction) {
    const { fullPage, quality, path } = interaction;

    const screenshot = await this.currentPage.screenshot({
      type: "jpeg",
      quality: quality || 70,
      fullPage: fullPage || false,
      path: path || null,
    });

    return { screenshot };
  }

  /**
   * Handle evaluate interaction
   * @private
   */
  async _handleEvaluateInteraction(interaction) {
    const { script, args } = interaction;

    if (!script) {
      throw new Error("Evaluate interaction requires a script");
    }

    // Execute the script in the browser context
    const result = await this.currentPage.evaluate(
      new Function(`return (${script})(${args ? "...arguments" : ""})`),
      ...(args || [])
    );

    return { evaluated: result };
  }

  /**
   * Extract search results from Google
   * @private
   */
  async _extractGoogleResults(numResults) {
    return this.currentPage.evaluate((max) => {
      const resultElements = document.querySelectorAll("div.g");
      const results = [];

      for (let i = 0; i < Math.min(resultElements.length, max); i++) {
        const element = resultElements[i];
        const titleElement = element.querySelector("h3");
        const linkElement = element.querySelector("a");
        const snippetElement = element.querySelector("div.VwiC3b");

        if (titleElement && linkElement && linkElement.href) {
          results.push({
            title: titleElement.innerText,
            url: linkElement.href,
            snippet: snippetElement ? snippetElement.innerText : null,
          });
        }
      }

      return results;
    }, numResults);
  }

  /**
   * Extract search results from Bing
   * @private
   */
  async _extractBingResults(numResults) {
    return this.currentPage.evaluate((max) => {
      const resultElements = document.querySelectorAll("li.b_algo");
      const results = [];

      for (let i = 0; i < Math.min(resultElements.length, max); i++) {
        const element = resultElements[i];
        const titleElement = element.querySelector("h2 a");
        const snippetElement = element.querySelector("div.b_caption p");

        if (titleElement && titleElement.href) {
          results.push({
            title: titleElement.innerText,
            url: titleElement.href,
            snippet: snippetElement ? snippetElement.innerText : null,
          });
        }
      }

      return results;
    }, numResults);
  }

  /**
   * Extract search results from DuckDuckGo
   * @private
   */
  async _extractDuckDuckGoResults(numResults) {
    return this.currentPage.evaluate((max) => {
      const resultElements = document.querySelectorAll("article");
      const results = [];

      for (let i = 0; i < Math.min(resultElements.length, max); i++) {
        const element = resultElements[i];
        const titleElement = element.querySelector("h2");
        const linkElement = element.querySelector("a.result__a");
        const snippetElement = element.querySelector("div.result__snippet");

        if (titleElement && linkElement && linkElement.href) {
          results.push({
            title: titleElement.innerText,
            url: linkElement.href,
            snippet: snippetElement ? snippetElement.innerText : null,
          });
        }
      }

      return results;
    }, numResults);
  }

  /**
   * Extract search results using a generic approach
   * @private
   */
  async _extractGenericResults(numResults) {
    return this.currentPage.evaluate((max) => {
      // Find all links that appear to be search results
      const links = Array.from(document.querySelectorAll("a")).filter(
        (a) =>
          a.href &&
          a.href.startsWith("http") &&
          !a.href.includes(window.location.hostname) &&
          a.innerText &&
          a.innerText.length > 10
      );

      const results = [];

      for (let i = 0; i < Math.min(links.length, max); i++) {
        const link = links[i];
        // Try to find a snippet near the link
        let snippet = null;
        let parent = link.parentElement;
        for (let j = 0; j < 3 && !snippet; j++) {
          if (parent) {
            const potentialSnippet = Array.from(parent.childNodes)
              .filter(
                (node) =>
                  node !== link &&
                  node.textContent &&
                  node.textContent.length > 30
              )
              .map((node) => node.textContent.trim())
              .join(" ");

            if (potentialSnippet) {
              snippet = potentialSnippet;
            }

            parent = parent.parentElement;
          }
        }

        results.push({
          title: link.innerText.trim(),
          url: link.href,
          snippet,
        });
      }

      return results;
    }, numResults);
  }

  /**
   * Get search URL for a given engine
   * @private
   */
  _getSearchUrl(engine, query) {
    const encodedQuery = encodeURIComponent(query);
    const baseUrl =
      this.searchEngineUrls[engine.toLowerCase()] ||
      this.searchEngineUrls.google;
    return baseUrl + encodedQuery;
  }

  /**
   * Load cookies from file
   * @private
   */
  async _loadCookies() {
    try {
      const fs = require("fs");

      if (fs.existsSync(this.cookiesPath)) {
        const cookiesString = fs.readFileSync(this.cookiesPath, "utf8");
        const cookies = JSON.parse(cookiesString);

        if (Array.isArray(cookies) && cookies.length > 0) {
          await this.currentPage.setCookie(...cookies);
          this.logger.info(
            `Loaded ${cookies.length} cookies from ${this.cookiesPath}`
          );
        }
      }
    } catch (error) {
      this.logger.warn(`Failed to load cookies: ${error.message}`);
    }
  }

  /**
   * Save cookies to file
   * @private
   */
  async _saveCookies() {
    try {
      const fs = require("fs");

      const cookies = await this.currentPage.cookies();
      fs.writeFileSync(this.cookiesPath, JSON.stringify(cookies, null, 2));
      this.logger.info(
        `Saved ${cookies.length} cookies to ${this.cookiesPath}`
      );
    } catch (error) {
      this.logger.warn(`Failed to save cookies: ${error.message}`);
    }
  }
}

module.exports = BrowserInterface;
