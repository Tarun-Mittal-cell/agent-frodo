const fetch = require("node-fetch");

class LLMService {
  constructor(config = {}) {
    this.provider = config.provider || "openai";
    this.apiKey = config.apiKey;
    this.apiEndpoint = config.apiEndpoint;
    this.defaultModel = config.model || this._getDefaultModel();
    this.defaultMaxTokens = config.maxTokens || 1000;
    this.defaultTemperature =
      config.temperature !== undefined ? config.temperature : 0.7;
    this.logger = config.logger || console;
    this.timeout = config.timeout || 60000; // 1 minute
    this.retries = config.retries || 2;
    this.retryDelay = config.retryDelay || 1000; // 1 second starting delay
    this.httpClient = null;

    // Initialize the appropriate client
    this._initializeClient();
  }

  /**
   * Initialize the appropriate LLM client
   * @private
   */
  _initializeClient() {
    const supportedProviders = [
      "openai",
      "claude",
      "anthropic",
      "huggingface",
      "ollama",
      "custom",
    ];
    if (!supportedProviders.includes(this.provider.toLowerCase())) {
      throw new Error(
        `Unsupported LLM provider: "${this.provider}". Supported providers: ${supportedProviders.join(", ")}.`
      );
    }

    switch (this.provider.toLowerCase()) {
      case "openai":
        this._initializeOpenAI();
        break;
      case "claude":
      case "anthropic":
        this._initializeAnthropic();
        break;
      case "huggingface":
        this._initializeHuggingFace();
        break;
      case "ollama":
        this._initializeOllama();
        break;
      case "custom":
        this._initializeCustom();
        break;
    }
  }

  /**
   * Initialize OpenAI client
   * @private
   */
  _initializeOpenAI() {
    try {
      const { OpenAI } = require("openai");
      this.client = new OpenAI({
        apiKey: this.apiKey,
        timeout: this.timeout,
        maxRetries: this.retries,
      });
      this.logger.info("OpenAI client initialized");
    } catch (error) {
      this.logger.error("Failed to initialize OpenAI client:", error.message);
      throw new Error(`OpenAI client initialization failed: ${error.message}`);
    }
  }

  /**
   * Initialize Anthropic client
   * @private
   */
  _initializeAnthropic() {
    try {
      if (!this.apiKey || this.apiKey.trim() === "") {
        throw new Error("Invalid or missing API key for Anthropic");
      }
      const Anthropic = require("@anthropic-ai/sdk");
      this.client = new Anthropic({ apiKey: this.apiKey });
      if (!this.client) {
        throw new Error(
          "Anthropic client initialization returned undefined or null"
        );
      }
      this.logger.info("Anthropic client initialized");
    } catch (error) {
      this.logger.error(
        "Failed to initialize Anthropic client:",
        error.message
      );
      throw new Error(
        `Anthropic client initialization failed: ${error.message}`
      );
    }
  }

  /**
   * Initialize HuggingFace client
   * @private
   */
  _initializeHuggingFace() {
    try {
      this.httpClient = require("node-fetch");
      this.logger.info("HuggingFace client initialized");
    } catch (error) {
      this.logger.error(
        "Failed to initialize HuggingFace client:",
        error.message
      );
      throw new Error(
        `HuggingFace client initialization failed: ${error.message}`
      );
    }
  }

  /**
   * Initialize Ollama client
   * @private
   */
  _initializeOllama() {
    try {
      this.httpClient = require("node-fetch");
      this.apiEndpoint = this.apiEndpoint || "http://localhost:11434/api";
      this.logger.info("Ollama client initialized");
    } catch (error) {
      this.logger.error("Failed to initialize Ollama client:", error.message);
      throw new Error(`Ollama client initialization failed: ${error.message}`);
    }
  }

  /**
   * Initialize custom LLM provider
   * @private
   */
  _initializeCustom() {
    if (!this.apiEndpoint) {
      throw new Error("apiEndpoint is required for custom LLM provider");
    }
    try {
      this.httpClient = require("node-fetch");
      this.logger.info("Custom LLM client initialized");
    } catch (error) {
      this.logger.error(
        "Failed to initialize custom LLM client:",
        error.message
      );
      throw new Error(
        `Custom LLM client initialization failed: ${error.message}`
      );
    }
  }

  /**
   * Get default model for the selected provider
   * @private
   */
  _getDefaultModel() {
    switch (this.provider.toLowerCase()) {
      case "openai":
        return "gpt-4o";
      case "claude":
      case "anthropic":
        return "claude-3-opus-20240229";
      case "huggingface":
        return "mistralai/Mistral-7B-Instruct-v0.2";
      case "ollama":
        return "llama3";
      default:
        return "gpt-4o";
    }
  }

  /**
   * Complete a text prompt
   * @param {string} prompt - Text prompt
   * @param {Object} options - Completion options
   * @returns {string} - Completion result
   */
  async complete(prompt, options = {}) {
    const model = options.model || this.defaultModel;
    const maxTokens = options.maxTokens || this.defaultMaxTokens;
    const temperature =
      options.temperature !== undefined
        ? options.temperature
        : this.defaultTemperature;
    const retryCount = options._retryCount || 0;

    this.logger.info(`Sending completion request to ${this.provider}`, {
      model,
      promptLength: prompt.length,
      temperature,
      maxTokens,
      retryCount,
    });

    try {
      let response;
      switch (this.provider.toLowerCase()) {
        case "openai":
          response = await this._completeWithOpenAI(
            prompt,
            model,
            maxTokens,
            temperature,
            options
          );
          break;
        case "claude":
        case "anthropic":
          response = await this._completeWithAnthropic(
            prompt,
            model,
            maxTokens,
            temperature,
            options
          );
          break;
        case "huggingface":
          response = await this._completeWithHuggingFace(
            prompt,
            model,
            maxTokens,
            temperature,
            options
          );
          break;
        case "ollama":
          response = await this._completeWithOllama(
            prompt,
            model,
            maxTokens,
            temperature,
            options
          );
          break;
        case "custom":
          response = await this._completeWithCustom(
            prompt,
            model,
            maxTokens,
            temperature,
            options
          );
          break;
        default:
          throw new Error(`Unsupported LLM provider: ${this.provider}`);
      }
      this.logger.debug(`Received response from ${this.provider}:`, response);
      return response;
    } catch (error) {
      this.logger.error(`Completion request failed: ${error.message}`);
      if (retryCount < this.retries) {
        const delay = this.retryDelay * Math.pow(2, retryCount); // Exponential backoff
        this.logger.info(
          `Retrying completion request (${retryCount + 1}/${this.retries}) in ${delay}ms`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.complete(prompt, {
          ...options,
          _retryCount: retryCount + 1,
        });
      }
      throw new Error(
        `LLM completion failed after ${this.retries} retries: ${error.message}`
      );
    }
  }

  /**
   * Complete with OpenAI
   * @private
   */
  async _completeWithOpenAI(prompt, model, maxTokens, temperature, options) {
    const response = await this.client.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
      temperature,
      response_format: options.responseFormat || undefined,
      top_p: options.topP || undefined,
      frequency_penalty: options.frequencyPenalty || undefined,
      presence_penalty: options.presencePenalty || undefined,
      stop: options.stop || undefined,
    });
    if (!response.choices?.[0]?.message?.content) {
      throw new Error("Invalid OpenAI response: Missing choices or content.");
    }
    return response.choices[0].message.content;
  }

  /**
   * Complete with Anthropic
   * @private
   */
  async _completeWithAnthropic(prompt, model, maxTokens, temperature, options) {
    try {
      if (!this.client || !this.client.messages) {
        throw new Error("Anthropic client is not properly initialized");
      }
      this.logger.info(`Sending request to Anthropic with model: ${model}`);
      const response = await this.client.messages.create({
        model,
        max_tokens: maxTokens,
        temperature,
        messages: [{ role: "user", content: prompt }],
        top_p: options.topP || undefined,
        top_k: options.topK || undefined,
        stop_sequences: options.stop || undefined,
      });
      if (!response || !response.content || !response.content[0]) {
        throw new Error(
          "Received empty or invalid response from Anthropic API"
        );
      }
      return response.content[0].text;
    } catch (error) {
      if (error.status === 401) {
        throw new Error(
          `Authentication error: Invalid API key or unauthorized access (${error.message})`
        );
      } else if (error.status === 400) {
        throw new Error(`Bad request: ${error.message}`);
      } else if (error.status === 429) {
        throw new Error(
          `Rate limit exceeded: ${error.message}. Consider increasing retry delay.`
        );
      } else if (error.status === 500) {
        throw new Error(`Anthropic server error: ${error.message}`);
      }
      throw new Error(`Anthropic API error: ${error.message}`);
    }
  }

  /**
   * Complete with HuggingFace
   * @private
   */
  async _completeWithHuggingFace(
    prompt,
    model,
    maxTokens,
    temperature,
    options
  ) {
    const endpoint = `https://api-inference.huggingface.co/models/${model}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: maxTokens,
          temperature: temperature,
          top_p: options.topP || undefined,
          top_k: options.topK || undefined,
          do_sample: true,
          return_full_text: false,
        },
      }),
      timeout: this.timeout,
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HuggingFace API error: ${error}`);
    }
    const data = await response.json();
    if (!data[0]?.generated_text) {
      throw new Error("Invalid HuggingFace response: Missing generated_text.");
    }
    return data[0].generated_text;
  }

  /**
   * Complete with Ollama
   * @private
   */
  async _completeWithOllama(prompt, model, maxTokens, temperature, options) {
    const endpoint = `${this.apiEndpoint}/generate`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        prompt,
        options: {
          num_predict: maxTokens,
          temperature,
          top_p: options.topP || undefined,
          top_k: options.topK || undefined,
          stop: options.stop || undefined,
        },
      }),
      timeout: this.timeout,
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ollama API error: ${error}`);
    }
    const data = await response.json();
    if (!data.response) {
      throw new Error("Invalid Ollama response: Missing response field.");
    }
    return data.response;
  }

  /**
   * Complete with custom LLM provider
   * @private
   */
  async _completeWithCustom(prompt, model, maxTokens, temperature, options) {
    const response = await fetch(this.apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: this.apiKey ? `Bearer ${this.apiKey}` : undefined,
        ...options.headers,
      },
      body: JSON.stringify({
        model,
        prompt,
        max_tokens: maxTokens,
        temperature,
        ...options.extraParams,
      }),
      timeout: this.timeout,
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Custom LLM API error: ${error}`);
    }
    const data = await response.json();
    const result = options.resultPath
      ? data[options.resultPath]
      : data.choices?.[0]?.text ||
        data.response ||
        data.output ||
        data.completion;
    if (!result) {
      throw new Error(
        "Invalid custom LLM response: Unable to find completion text."
      );
    }
    return result;
  }
}

module.exports = LLMService;
