// configs/AiModel.jsx
// Enhanced AI Model configuration with modern UI generation and autonomous capabilities

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import axios from "axios";
import dedent from "dedent";
import Prompts from "../data/Prompt";

// Initialize Google Generative AI with API key
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// Get the latest Gemini model
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp", // Using the experimental flash model for best performance
});

// Base generation config for chat interactions
const generationConfig = {
  temperature: 0.9, // Slightly increased for more creative outputs
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

// Enhanced configuration for code generation with JSON output
const CodeGenerationConfig = {
  temperature: 0.85, // Balanced for creativity while maintaining correctness
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

// Enhanced configuration specifically for UI-focused code generation
const UIGenerationConfig = {
  temperature: 0.7, // More controlled for consistent UI code
  topP: 0.9,
  topK: 30,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

// Start a persistent chat session
export const chatSession = model.startChat({
  generationConfig,
  history: [],
});

// Preloaded history with enhanced code generation instructions
const enhancedCodeGenHistory = [
  {
    role: "user",
    parts: [
      {
        text: dedent`
          You are Frodo, an elite UI engineer specializing in creating stunning, production-ready React applications.
          
          When generating websites, you will follow these strict guidelines:
          
          IMAGE HANDLING:
          - Always use real, working Unsplash image URLs in format: https://images.unsplash.com/photo-{ID}
          - For profile images, use: https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300
          - For landscapes: https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800
          - For products: https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400
          - For food: https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500
          - Properly size images with width/height attributes
          - Include alt text for accessibility
          - Use proper loading="lazy" attribute for performance
          - Never use placeholder URLs that don't work

          UI DESIGN PRINCIPLES:
          - Use glass morphism effects (bg-white/10 backdrop-blur-md)
          - Create gradient backgrounds and buttons
          - Implement subtle hover animations (transform, shadow changes)
          - Design responsive layouts that work on all devices
          - Use proper color contrast for accessibility
          - Include dark mode support
          - Create asymmetrical layouts for visual interest
          - Use ample white space for clean designs
          - Apply proper typography hierarchy
          
          CODE QUALITY:
          - Write error-free, production-ready code
          - Use proper React hooks (useEffect, useState, etc.)
          - Follow proper component structure
          - Implement loading states and error handling
          - Add comments for complex logic
          - Ensure all imports are correct
          - Make code maintainable and extensible
          
          YOU MUST FOLLOW THESE RULES:
          - Never use placeholders like "example.com" or "lorem ipsum"
          - Only use lucide-react icons when needed (no other icon libraries)
          - All designs must be production-ready with real content
          - Use tailwindcss-animate for subtle animations
          - Ensure all links and buttons have proper hover states
          - All forms must have proper validation
          - Error-free JSX syntax
          - Always test your code mentally before returning it
        `,
      },
    ],
  },
  {
    role: "model",
    parts: [
      {
        text: "I understand my role as Frodo, an elite UI engineer. I will create stunning, production-ready React applications following all the guidelines you've specified. I'll ensure proper image handling with real Unsplash URLs, implement modern UI design principles like glass morphism and subtle animations, and maintain high code quality with proper hooks, error handling, and comments. I won't use placeholders, will only use lucide-react icons when needed, and will mentally test all code before returning it. I'm ready to create beautiful, functional, and error-free designs.",
      },
    ],
  },
];

// Enhanced chat session specifically for UI code generation
export const GenAiCode = model.startChat({
  generationConfig: CodeGenerationConfig,
  history: enhancedCodeGenHistory,
});

// Map of image categories to reliable Unsplash URLs
const reliableImageURLs = {
  profile: [
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300",
  ],
  landscape: [
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800",
    "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800",
    "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800",
  ],
  product: [
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400",
    "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=400",
  ],
  food: [
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500",
    "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500",
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500",
  ],
  technology: [
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600",
    "https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?w=600",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600",
    "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600",
  ],
  nature: [
    "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800",
    "https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=800",
  ],
  business: [
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600",
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600",
    "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=600",
  ],
  fashion: [
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600",
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600",
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600",
    "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600",
  ],
  abstract: [
    "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600",
    "https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?w=600",
    "https://images.unsplash.com/photo-1507908708918-778587c9e563?w=600",
    "https://images.unsplash.com/photo-1579546929662-711aa81148cf?w=600",
  ],
};

// Modern UI design patterns with examples for improved generation
const modernUIPatterns = {
  glassCard: `<div className="backdrop-blur-md bg-white/10 rounded-xl border border-white/20 shadow-xl p-6 transition-all duration-300 hover:shadow-blue-500/20 hover:scale-[1.02]">
    <h3 className="text-xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-500">Card Title</h3>
    <p className="text-gray-300">Card content goes here with a clean, modern look.</p>
  </div>`,

  gradientButton: `<button className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-violet-600 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105 active:scale-95">
    Button Text
  </button>`,

  imageComponent: `<div className="relative overflow-hidden rounded-xl group">
    <img 
      src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800" 
      alt="Beautiful landscape" 
      className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
      loading="lazy"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
      <div className="p-4">
        <h3 className="text-white text-xl font-bold">Image Title</h3>
        <p className="text-white/80 text-sm">Image description here</p>
      </div>
    </div>
  </div>`,
};

// Claude computer use configuration (for future autonomy)
const claudeComputerUseConfig = {
  enabled: false, // Will be enabled when ready for production
  tools: [
    {
      type: "computer_20241022",
      name: "computer",
      display_width_px: 1024,
      display_height_px: 768,
      display_number: 1,
    },
    {
      type: "text_editor_20241022",
      name: "str_replace_editor",
    },
    {
      type: "bash_20241022",
      name: "bash",
    },
  ],
  systemPrompt: `You are Frodo, an autonomous web development assistant that creates stunning, modern websites with React and Tailwind CSS. You can use the computer to test your code, find bugs, and make improvements without human input. Always generate production-ready code with working images, proper animations, and error-free functionality.`,
};

// Main AiModel object with enhanced functionality
const AiModel = {
  // Standard configurations
  config: {
    chatConfig: generationConfig,
    codeConfig: CodeGenerationConfig,
    uiConfig: UIGenerationConfig,
    claudeConfig: claudeComputerUseConfig,
  },

  // Standard chat session
  chatSession,

  // Enhanced code generation session
  GenAiCode,

  // Reliable image resources for generation
  reliableImages: reliableImageURLs,

  // Modern UI patterns for reference
  uiPatterns: modernUIPatterns,

  // Generate a website based on user input
  generateWebsite: async (userPrompt) => {
    try {
      // Enhance the user prompt with our UI-focused instructions
      const enhancedPrompt = dedent`
        ${Prompts.CODE_GEN_PROMPT}

        ADDITIONAL REQUIREMENTS:
        1. Use these specific, working image URLs in your design:
           - For profiles: ${reliableImageURLs.profile[0]}
           - For landscapes: ${reliableImageURLs.landscape[0]}
           - For products: ${reliableImageURLs.product[0]}
           - Never use placeholder image URLs
        
        2. Create modern UI with these effects:
           - Glass morphism (bg-white/10 backdrop-blur-md)
           - Gradient text and buttons
           - Subtle hover animations
           - Responsive design for all devices
        
        3. Ensure all code is error-free:
           - Check all imports
           - Validate JSX syntax
           - Test all component interactions
           - Add proper loading states
           - Implement error handling

        USER REQUEST: ${userPrompt}
      `;

      // Create a specialized UI generation session
      const uiGenSession = model.startChat({
        generationConfig: UIGenerationConfig,
        history: enhancedCodeGenHistory,
      });

      // Send the enhanced prompt
      const result = await uiGenSession.sendMessage(enhancedPrompt);
      const responseText = result.response.text();

      // Parse and validate the JSON response
      try {
        // Try to find a JSON block first
        const jsonMatch = responseText.match(/```json\n([\s\S]*?)```/) ||
          responseText.match(/{[\s\S]*}/) || [null, responseText];

        const jsonString = jsonMatch[1] || responseText;
        const parsedResponse = JSON.parse(jsonString);

        // Validate and enhance the response
        if (parsedResponse.files) {
          // Post-process all files to ensure proper image URLs and patterns
          Object.keys(parsedResponse.files).forEach((filePath) => {
            let code = parsedResponse.files[filePath].code;

            // Replace any placeholder images with reliable ones
            code = code.replace(
              /https:\/\/archive\.org\/download\/placeholder-image\/placeholder-image\.jpg/g,
              reliableImageURLs.product[
                Math.floor(Math.random() * reliableImageURLs.product.length)
              ]
            );

            // Replace any placeholdercgi.com URLs
            code = code.replace(
              /https:\/\/via\.placeholder\.com\/\d+x\d+/g,
              reliableImageURLs.abstract[
                Math.floor(Math.random() * reliableImageURLs.abstract.length)
              ]
            );

            // Replace any common lorem ipsum image services
            code = code.replace(
              /https?:\/\/(placeimg\.com|placeholder\.pics|placekitten\.com|loremflickr\.com|dummyimage\.com|placecage\.com|baconmockup\.com|placebear\.com|placepuppy\.it)\/\d+\/\d+/g,
              reliableImageURLs.nature[
                Math.floor(Math.random() * reliableImageURLs.nature.length)
              ]
            );

            // Ensure proper loading attribute for all images
            code = code.replace(/<img([^>]*)>/g, '<img$1 loading="lazy">');

            // Ensure no <img> tags without alt text
            code = code.replace(
              /<img([^>]*)(?!\salt=)([^>]*)>/g,
              '<img$1 alt="Image"$2>'
            );

            // Update the processed code
            parsedResponse.files[filePath].code = code;
          });
        }

        return parsedResponse;
      } catch (jsonError) {
        console.error("Error parsing JSON:", jsonError);
        throw new Error(
          "Failed to parse AI response. The response format was invalid."
        );
      }
    } catch (error) {
      console.error("Error in website generation:", error);
      throw new Error(`Website generation failed: ${error.message}`);
    }
  },

  // Enhanced chat function with improved error handling
  enhancedChat: async (userMessage, chatHistory = []) => {
    try {
      // Create a new chat session with history
      const session = model.startChat({
        generationConfig,
        history: chatHistory,
      });

      // Send the message
      const result = await session.sendMessage(userMessage);
      return {
        success: true,
        message: result.response.text(),
        error: null,
      };
    } catch (error) {
      console.error("Chat error:", error);
      return {
        success: false,
        message: null,
        error: error.message || "Failed to generate response",
      };
    }
  },

  // Function to prepare for autonomous computer use with Claude
  prepareAutonomousMode: async (apiKey) => {
    try {
      // Store the API key
      process.env.ANTHROPIC_API_KEY = apiKey;

      // Test connection
      const response = await axios.post(
        "https://api.anthropic.com/v1/messages",
        {
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 1024,
          messages: [
            {
              role: "user",
              content: "Test connection. Respond with 'Connection successful.'",
            },
          ],
        },
        {
          headers: {
            "content-type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
        }
      );

      // Enable computer use if test is successful
      if (response.data && response.data.content) {
        claudeComputerUseConfig.enabled = true;
        return {
          success: true,
          message: "Autonomous mode ready",
        };
      } else {
        return {
          success: false,
          message: "Failed to validate Claude API connection",
        };
      }
    } catch (error) {
      console.error("Error preparing autonomous mode:", error);
      return {
        success: false,
        message: error.message || "Failed to prepare autonomous mode",
      };
    }
  },

  // Autonomous website generation (when computer use is enabled)
  generateAutonomousWebsite: async (userPrompt) => {
    if (!claudeComputerUseConfig.enabled) {
      throw new Error(
        "Autonomous mode is not enabled. Please run prepareAutonomousMode first."
      );
    }

    try {
      // Initialize Claude with computer use tools
      const response = await axios.post(
        "https://api.anthropic.com/v1/messages",
        {
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 4096,
          tools: claudeComputerUseConfig.tools,
          messages: [
            {
              role: "user",
              content: `Create a beautiful, modern ${userPrompt} website using React and Tailwind CSS. The website should have stunning visuals, subtle animations, and be production-ready. The site should include multiple pages, responsive design, and proper navigation.`,
            },
          ],
          system: claudeComputerUseConfig.systemPrompt,
        },
        {
          headers: {
            "content-type": "application/json",
            "x-api-key": process.env.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "anthropic-beta": "computer-use-2024-10-22",
          },
        }
      );

      // This would be expanded with the agent loop in production
      return {
        success: true,
        message: "Autonomous website generation initiated",
        data: response.data,
      };
    } catch (error) {
      console.error("Error in autonomous website generation:", error);
      throw new Error(`Autonomous website generation failed: ${error.message}`);
    }
  },
};

export default AiModel;
