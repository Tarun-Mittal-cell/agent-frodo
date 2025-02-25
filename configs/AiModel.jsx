// configs/AiModel.jsx
// Advanced AI Model configuration with 3D UI generation, autonomous debugging, and error prevention

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

// Get the most advanced Gemini model
const model = genAI.getGenerativeModel({
  model: "gemini-pro-vision", // Using the vision model for more advanced capabilities
});

// Advanced generation config for chat interactions
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
  maxOutputTokens: 16384, // Increased to handle complex code generation
  responseMimeType: "application/json",
};

// Enhanced configuration specifically for UI-focused code generation
const UIGenerationConfig = {
  temperature: 0.7, // More controlled for consistent UI code
  topP: 0.9,
  topK: 30,
  maxOutputTokens: 16384, // Increased for complex UI templates
  responseMimeType: "application/json",
};

// Configuration specifically for debugging
const DebuggingConfig = {
  temperature: 0.3, // Low temperature for precise debugging
  topP: 0.8,
  topK: 20,
  maxOutputTokens: 16384,
  responseMimeType: "application/json",
};

// Start a persistent chat session
export const chatSession = model.startChat({
  generationConfig,
  history: [],
});

// Enhanced preloaded history with advanced UI and 3D design instructions
const enhancedCodeGenHistory = [
  {
    role: "user",
    parts: [
      {
        text: dedent`
          You are FRODO, powered by Tenzin 1.0, an elite autonomous coding agent built by Octave-X. You specialize in creating stunning, production-ready React applications with world-class UI design that would impress even Elon Musk.
          
          When generating websites, you will follow these strict production guidelines:
          
          IMAGE HANDLING:
          - Always use verified, working Unsplash image URLs in format: https://images.unsplash.com/photo-{ID}?q=80
          - Add width, height, loading="lazy", and decoding="async" attributes to all images
          - Always include descriptive alt text for accessibility
          - Use fetchpriority="high" for critical above-the-fold images
          - Never use placeholder URLs or text
          - Properly optimize images with quality parameters
          
          3D UI DESIGN PRINCIPLES:
          - Create immersive, engaging interfaces with 3D elements
          - Use Three.js for 3D scenes in component useEffect hooks
          - Implement glass morphism (bg-white/10 backdrop-blur-md)
          - Design floating UI elements with realistic shadows
          - Create 3D card effects with transform-style: preserve-3d
          - Apply subtle 3D rotations on hover
          - Use proper perspective for depth
          - Implement parallax scrolling effects
          - Create gradient backgrounds with 3D lighting effects
          - Add micro-interactions that respond to user movement
          
          MODERN UI DESIGN PATTERNS:
          - Use nested gradients for beautiful color transitions
          - Implement subtle animations with tailwindcss-animate
          - Create asymmetrical layouts for visual interest
          - Apply proper spacing and typography
          - Design for all screen sizes with responsive breakpoints
          - Implement dark mode with proper contrast
          - Use vibrant accent colors against neutral backgrounds
          - Create hero sections with immersive visuals
          
          CODE QUALITY:
          - Write error-free, production-ready code
          - Implement proper React hooks (useState, useEffect, useCallback, useMemo)
          - Set up error boundaries for graceful error handling
          - Create loading states with skeleton screens
          - Split code into maintainable components
          - Add detailed comments for complex logic
          - Follow React best practices
          - Implement proper TypeScript typing if used
          
          AUTONOMOUS DEBUGGING:
          - Self-identify potential errors before returning code
          - Check for missing dependencies in useEffect
          - Verify all imports are correct and available
          - Validate proper event handler implementation
          - Check for proper state management
          - Ensure responsive design works at all breakpoints
          - Verify all links and routes work correctly
          
          FRONTEND FRAMEWORKS:
          - Use the latest React features (18+)
          - Implement Tailwind CSS effectively
          - Add Framer Motion for advanced animations
          - Consider Three.js for 3D effects
          - Use shadcn/ui components when appropriate
          - Implement proper Next.js features (if applicable)
          
          REMEMBER:
          - Your code must be error-free and production-ready
          - All designs must be outstanding with real content
          - All images must load properly
          - The UI must be visually stunning
          - Self-debug your code before returning it
        `,
      },
    ],
  },
  {
    role: "model",
    parts: [
      {
        text: "I am FRODO, powered by Tenzin 1.0, an autonomous coding agent by Octave-X. I understand my mission to create stunning, error-free production websites with world-class UI that would impress Elon Musk. I'll follow all guidelines regarding proper image handling, 3D UI design principles, modern design patterns, code quality standards, autonomous debugging, and effective use of frontend frameworks. Every website I generate will have properly loading images, immersive 3D elements, beautiful animations, responsive layouts, and self-debugged code. I'm ready to deliver exceptional results that exceed expectations.",
      },
    ],
  },
];

// Enhanced chat session specifically for UI code generation with 3D elements
export const GenAiCode = model.startChat({
  generationConfig: CodeGenerationConfig,
  history: enhancedCodeGenHistory,
});

// Specialized session for debugging
export const DebugSession = model.startChat({
  generationConfig: DebuggingConfig,
  history: [
    {
      role: "user",
      parts: [
        {
          text: dedent`
            You are FRODO's autonomous debugging system. Your task is to find and fix errors in code.
            
            When debugging code, follow these steps:
            1. Analyze the code for syntax errors, logical errors, and best practice violations
            2. Identify all issues precisely
            3. Provide corrected code
            4. Explain what was fixed and why
            
            Focus on these common issues:
            - Missing or incorrect imports
            - React hook dependency arrays
            - Event handler implementations
            - State management
            - Component lifecycle issues
            - Missing keys in lists
            - Accessibility problems
            - Image loading failures
            - Responsive design bugs
            - Network request handling
            
            Always return your response as a valid JSON object with these properties:
            - issues: Array of identified issues
            - fixedCode: The complete corrected code
            - explanation: Clear explanation of all fixes
          `,
        },
      ],
    },
    {
      role: "model",
      parts: [
        {
          text: "I am FRODO's autonomous debugging system. I'll thoroughly analyze code for errors and provide complete fixes following the specified process. I'll examine syntax, logic, best practices, and common React issues like hook dependencies, event handlers, state management, and more. My responses will be structured as JSON with identified issues, fixed code, and clear explanations.",
        },
      ],
    },
  ],
});

// Comprehensive map of image categories to reliable Unsplash URLs
const reliableImageURLs = {
  profile: [
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&q=80",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&q=80",
  ],
  landscape: [
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80",
    "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&q=80",
    "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&q=80",
  ],
  product: [
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=80",
    "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=400&q=80",
  ],
  food: [
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80",
    "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500&q=80",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80",
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500&q=80",
  ],
  technology: [
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80",
    "https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?w=600&q=80",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80",
    "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&q=80",
  ],
  nature: [
    "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80",
    "https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=800&q=80",
  ],
  business: [
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80",
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80",
    "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=600&q=80",
  ],
  fashion: [
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80",
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80",
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&q=80",
    "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600&q=80",
  ],
  abstract: [
    "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&q=80",
    "https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?w=600&q=80",
    "https://images.unsplash.com/photo-1507908708918-778587c9e563?w=600&q=80",
    "https://images.unsplash.com/photo-1579546929662-711aa81148cf?w=600&q=80",
  ],
  // New 3D and digital art categories
  threeD: [
    "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80",
    "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
    "https://images.unsplash.com/photo-1638015449442-d748a476267a?w=800&q=80",
    "https://images.unsplash.com/photo-1618005198919-177e9dd3b231?w=800&q=80",
  ],
  digitalArt: [
    "https://images.unsplash.com/photo-1553949345-eb786cbb9c8e?w=800&q=80",
    "https://images.unsplash.com/photo-1518131945814-df08f56d4f1f?w=800&q=80",
    "https://images.unsplash.com/photo-1581090700227-1e37b190308e?w=800&q=80",
    "https://images.unsplash.com/photo-1548106760-2a84baac8b68?w=800&q=80",
  ],
};

// Advanced 3D-enhanced UI design patterns with examples
const modern3DUIPatterns = {
  // Glass morphism card with 3D rotation
  glass3DCard: `<div className="group perspective-[1000px] my-6">
    <div className="relative w-full rounded-2xl p-6 transition-all duration-500 ease-out
      bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/10
      shadow-[0_8px_30px_rgb(0,0,0,0.12)] group-hover:shadow-blue-500/20
      transform group-hover:rotate-y-3 group-hover:rotate-x-2 group-hover:scale-[1.02]"
      style={{ transformStyle: 'preserve-3d' }}>
      <div className="relative z-10" style={{ transform: 'translateZ(20px)' }}>
        <h3 className="text-xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-500">3D Glass Effect Card</h3>
        <p className="text-gray-300 mb-4">Content with realistic 3D depth and glass effect that responds to user interaction.</p>
        <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-violet-600 
          text-white font-medium transition-all duration-300 
          hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105 active:scale-95">
          Explore Now
        </button>
      </div>
    </div>
  </div>`,

  // Parallax 3D image card
  parallax3DCard: `<div className="perspective-[1500px] w-full my-6 group">
    <div className="relative w-full h-[400px] rounded-2xl overflow-hidden transform transition-all duration-700 ease-out
      shadow-xl group-hover:shadow-2xl
      group-hover:rotate-y-2 group-hover:rotate-x-1"
      style={{ transformStyle: 'preserve-3d' }}>
      
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-purple-900"
        style={{ transform: 'translateZ(-50px)', filter: 'blur(10px)' }}></div>
      
      <img 
        src="https://images.unsplash.com/photo-1579546929662-711aa81148cf?w=800&q=80" 
        alt="Abstract gradient background" 
        className="absolute inset-0 w-full h-full object-cover opacity-80 transition-transform duration-1000
        group-hover:scale-[1.05] group-hover:opacity-90" 
        style={{ transform: 'translateZ(0px)' }}
        loading="lazy"
        decoding="async"
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60"
        style={{ transform: 'translateZ(20px)' }}></div>
      
      <div className="absolute bottom-0 left-0 w-full p-8 text-white"
        style={{ transform: 'translateZ(40px)' }}>
        <h3 className="text-2xl font-bold mb-2 tracking-tight">Parallax 3D Effect</h3>
        <p className="text-white/90 mb-4">Layered elements create a realistic depth effect that responds to user interaction.</p>
        <button className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-medium
          bg-white/10 backdrop-blur-sm border border-white/10 text-white
          transition-all duration-300 hover:bg-white/20">
          View Details
        </button>
      </div>
    </div>
  </div>`,

  // Neumorphic 3D button with press effect
  neumorphic3DButton: `<button className="relative py-3 px-6 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900
    font-medium text-gray-700 dark:text-gray-200
    shadow-[6px_6px_12px_rgba(0,0,0,0.15),-6px_-6px_12px_rgba(255,255,255,0.1)]
    dark:shadow-[6px_6px_12px_rgba(0,0,0,0.3),-6px_-6px_12px_rgba(255,255,255,0.05)]
    transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0
    hover:shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(255,255,255,0.1)]
    dark:hover:shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(255,255,255,0.03)]
    active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2),inset_-4px_-4px_8px_rgba(255,255,255,0.1)]
    dark:active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.03)]">
    3D Neumorphic Button
  </button>`,

  // 3D image gallery with depth
  threeD_Gallery: `
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8 perspective-[1000px]">
      ${Array.from({ length: 3 })
        .map(
          (_, i) => `
        <div key=${i} 
          className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 group transform hover:rotate-y-2 hover:-rotate-x-2 hover:scale-[1.02] hover:z-10"
          style={{ transformStyle: 'preserve-3d', transform: 'translateZ(0)' }}>
          <img 
            src=${reliableImageURLs.threeD[i]}
            alt="3D artwork ${i + 1}"
            className="w-full h-72 object-cover transition-all duration-700 ease-out" 
            loading="lazy"
            decoding="async"
          />
          <div 
            className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-70"
            style={{ transform: 'translateZ(2px)' }}>
          </div>
          <div 
            className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.2) 100%)', transform: 'translateZ(4px)' }}>
          </div>
          <div 
            className="absolute bottom-0 left-0 right-0 p-5 text-white translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500"
            style={{ transform: 'translateZ(10px)' }}>
            <h3 className="text-xl font-bold mb-1">3D Artwork ${i + 1}</h3>
            <p className="text-sm text-white/90">Explore this stunning 3D creation</p>
          </div>
        </div>
      `
        )
        .join("")}
    </div>
  `,

  // Floating 3D CTA section
  floating3DCTA: `<div className="relative my-16 py-16 overflow-hidden">
    {/* Animated background elements */}
    <div className="absolute inset-0 -z-10">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500 rounded-full mix-blend-multiply filter blur-[80px] opacity-20 animate-blob"></div>
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-purple-500 rounded-full mix-blend-multiply filter blur-[80px] opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-pink-500 rounded-full mix-blend-multiply filter blur-[80px] opacity-20 animate-blob animation-delay-4000"></div>
      <div className="absolute bottom-1/3 left-1/3 w-[550px] h-[550px] bg-indigo-500 rounded-full mix-blend-multiply filter blur-[80px] opacity-20 animate-blob animation-delay-6000"></div>
    </div>
    
    {/* Main content */}
    <div className="relative perspective-[1000px] max-w-4xl mx-auto">
      <div 
        className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-12 
        shadow-[0_10px_40px_rgba(0,0,0,0.15)] overflow-hidden transform hover:rotate-x-1 hover:scale-[1.02] transition-all duration-700"
        style={{ transformStyle: 'preserve-3d' }}>
        
        {/* 3D floating elements */}
        <div className="absolute -top-8 -left-8 w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full opacity-20 blur-2xl"></div>
        <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full opacity-20 blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <h2 
            className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"
            style={{ transform: 'translateZ(40px)' }}>
            Experience The Future Of Web Development
          </h2>
          
          <p 
            className="text-lg text-gray-200 mb-8 max-w-2xl"
            style={{ transform: 'translateZ(20px)' }}>
            Create stunning websites with advanced 3D effects, beautiful animations, and exceptional user experiences that will amaze your visitors.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-2" style={{ transform: 'translateZ(60px)' }}>
            <button className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-medium 
              shadow-lg shadow-blue-600/20 transition-all duration-300 hover:shadow-xl hover:shadow-blue-600/30 hover:scale-105 active:scale-95">
              Get Started Now
            </button>
            
            <button className="px-8 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-white font-medium 
              transition-all duration-300 hover:bg-white/20 hover:scale-105 active:scale-95">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>`,
};

// Claude computer use configuration for autonomous operation
const claudeComputerUseConfig = {
  enabled: true, // Enabled for production
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
  systemPrompt: `You are FRODO, an autonomous web development assistant powered by Tenzin 1.0, from Octave-X. You create stunning, modern websites with React, Tailwind CSS, and 3D effects. You can use the computer to test your code, find bugs, and make improvements without human input. Always generate production-ready code with working images, proper animations, and error-free functionality.

Your code must always:
1. Use working image URLs from Unsplash
2. Include proper error handling
3. Implement responsive designs
4. Create beautiful UI with 3D effects
5. Follow accessibility best practices
6. Be thoroughly tested and debugged

If you encounter errors, autonomously debug them by:
1. Identifying the root cause
2. Implementing a fix
3. Testing the solution
4. Explaining what was fixed`,
};

// Main AiModel object with enhanced 3D and debugging functionality
const AiModel = {
  // Advanced configurations
  config: {
    chatConfig: generationConfig,
    codeConfig: CodeGenerationConfig,
    uiConfig: UIGenerationConfig,
    debugConfig: DebuggingConfig,
    claudeConfig: claudeComputerUseConfig,
  },

  // Standard chat session
  chatSession,

  // Enhanced code generation session
  GenAiCode,

  // Debugging session
  DebugSession,

  // Reliable image resources for generation
  reliableImages: reliableImageURLs,

  // Modern 3D UI patterns for reference
  uiPatterns: modern3DUIPatterns,

  // Generate a website based on user input with enhanced 3D capabilities
  generateWebsite: async (userPrompt) => {
    try {
      // Enhance the user prompt with our 3D and UI-focused instructions
      const enhancedPrompt = dedent`
        ${Prompts.CODE_GEN_PROMPT}

        REQUIREMENTS FOR FRODO:
        1. Create a stunning, production-ready website with world-class UI design.
        2. Implement 3D effects and interactions that create depth and engagement.
        3. Use these verified image URLs in your design:
           - Profiles: ${reliableImageURLs.profile[0]}
           - Landscapes: ${reliableImageURLs.landscape[0]}
           - Products: ${reliableImageURLs.product[0]}
           - Digital Art: ${reliableImageURLs.digitalArt[0]}
           - 3D Objects: ${reliableImageURLs.threeD[0]}
        
        4. Implement these advanced UI effects:
           - 3D card transformations with preserve-3d
           - Glass morphism with backdrop filters
           - Parallax scrolling effects
           - Subtle animations and micro-interactions
           - Gradients with proper lighting effects
           - Floating UI elements with realistic shadows
        
        5. Ensure all code is error-free:
           - Validate all imports
           - Check React hook dependencies
           - Handle loading states
           - Implement error boundaries
           - Test responsive layouts
           - Verify all animations work properly

        6. Use the latest frontend techniques:
           - React 18+ features
           - Tailwind CSS with proper custom animations
           - Three.js for 3D elements (where appropriate)
           - Framer Motion for advanced animations
           - Next.js best practices (if applicable)

        USER REQUEST: ${userPrompt}
      `;

      // Create a specialized 3D UI generation session
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
              `${reliableImageURLs.threeD[0]}?q=80&auto=format`
            );

            // Replace any placeholder.com URLs
            code = code.replace(
              /https:\/\/via\.placeholder\.com\/\d+x\d+/g,
              `${reliableImageURLs.abstract[0]}?q=80&auto=format`
            );

            // Replace any common lorem ipsum image services
            code = code.replace(
              /https?:\/\/(placeimg\.com|placeholder\.pics|placekitten\.com|loremflickr\.com|dummyimage\.com|placecage\.com|baconmockup\.com|placebear\.com|placepuppy\.it)\/\d+\/\d+/g,
              `${reliableImageURLs.nature[0]}?q=80&auto=format`
            );

            // Replace source.unsplash.com random URLs with specific ones
            code = code.replace(
              /https:\/\/source\.unsplash\.com\/random\/\d+x\d+/g,
              `${reliableImageURLs.abstract[Math.floor(Math.random() * reliableImageURLs.abstract.length)]}?q=80&auto=format`
            );

            // Ensure proper loading attribute for all images
            code = code.replace(
              /<img([^>]*)(?!loading=)([^>]*)>/g,
              '<img$1 loading="lazy"$2>'
            );

            // Ensure proper decoding attribute for all images
            code = code.replace(
              /<img([^>]*)(?!decoding=)([^>]*)>/g,
              '<img$1 decoding="async"$2>'
            );

            // Ensure no <img> tags without alt text
            code = code.replace(
              /<img([^>]*)(?!\salt=)([^>]*)>/g,
              '<img$1 alt="Image"$2>'
            );

            // Add optimized quality parameter to Unsplash URLs
            code = code.replace(
              /(https:\/\/images\.unsplash\.com\/[^"'\s]*)(?!\?)/g,
              "$1?q=80&auto=format"
            );

            // Add fetchpriority="high" to first image (likely hero image)
            const firstImgMatch = code.match(/<img([^>]*)>/);
            if (firstImgMatch && !firstImgMatch[0].includes("fetchpriority")) {
              code = code.replace(
                firstImgMatch[0],
                firstImgMatch[0].replace("<img", '<img fetchpriority="high"')
              );
            }

            // Update the processed code
            parsedResponse.files[filePath].code = code;
          });

          // Run the autonomous debugging system on the generated code
          await Promise.all(
            Object.keys(parsedResponse.files).map(async (filePath) => {
              if (
                filePath.endsWith(".js") ||
                filePath.endsWith(".jsx") ||
                filePath.endsWith(".ts") ||
                filePath.endsWith(".tsx")
              ) {
                try {
                  const codeToDebug = parsedResponse.files[filePath].code;
                  const debugResult = await DebugSession.sendMessage(
                    `Debug this code and fix any issues:\n\n\`\`\`jsx\n${codeToDebug}\n\`\`\``
                  );

                  const debugText = debugResult.response.text();
                  // Try to parse debug response
                  try {
                    const debugJsonMatch = debugText.match(
                      /```json\n([\s\S]*?)```/
                    ) ||
                      debugText.match(/{[\s\S]*}/) || [null, debugText];

                    const debugJsonString = debugJsonMatch[1] || debugText;
                    const debugResponse = JSON.parse(debugJsonString);

                    if (
                      debugResponse.issues &&
                      debugResponse.issues.length > 0 &&
                      debugResponse.fixedCode
                    ) {
                      // Replace the code with the fixed version
                      parsedResponse.files[filePath].code =
                        debugResponse.fixedCode;
                      // Add debugging notes
                      parsedResponse.files[filePath].debugNotes =
                        debugResponse.explanation;
                    }
                  } catch (debugJsonError) {
                    console.error(
                      "Error parsing debug response:",
                      debugJsonError
                    );
                  }
                } catch (debugError) {
                  console.error("Error in debugging process:", debugError);
                }
              }
            })
          );
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

  // Advanced chat function with improved error handling
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
  // Autonomous debugging function to identify and fix issues
  debugCode: async (code, filePath = "") => {
    try {
      // Determine code type from file extension
      const fileExtension = filePath.split(".").pop() || "";
      const codeType =
        fileExtension === "js" || fileExtension === "jsx"
          ? "jsx"
          : fileExtension === "ts" || fileExtension === "tsx"
            ? "tsx"
            : fileExtension === "html"
              ? "html"
              : fileExtension === "css"
                ? "css"
                : "jsx";

      // Create a debugging prompt
      const debugPrompt = dedent`
      Please debug the following ${codeType} code and fix any issues:
      
      \`\`\`${codeType}
      ${code}
      \`\`\`
      
      Check for these specific issues:
      1. Missing or incorrect imports
      2. React hook dependencies
      3. Event handler implementations
      4. State management problems
      5. Missing keys in lists
      6. Accessibility issues with images or interactive elements
      7. Responsive design bugs
      8. Performance issues
      9. Image loading problems
      10. Animation or transition issues
      
      Return the fixed code and an explanation of all issues that were addressed.
    `;

      // Send to debug session
      const result = await DebugSession.sendMessage(debugPrompt);
      const responseText = result.response.text();

      // Extract code block and explanation
      const codeMatch = responseText.match(
        /```(?:jsx|tsx|javascript|html|css)\n([\s\S]*?)```/
      );
      const fixedCode = codeMatch ? codeMatch[1] : null;

      // Extract explanation - this will be the text after the last code block
      let explanation = "";
      if (codeMatch) {
        const afterLastCodeBlock = responseText.split(codeMatch[0])[1];
        explanation = afterLastCodeBlock.trim();
      } else {
        explanation = responseText;
      }

      return {
        success: true,
        originalCode: code,
        fixedCode: fixedCode || code, // If no fixed code found, return original
        explanation: explanation || "No issues found in the code.",
        hasChanges: fixedCode !== null && fixedCode !== code,
      };
    } catch (error) {
      console.error("Debugging error:", error);
      return {
        success: false,
        originalCode: code,
        fixedCode: code, // Return original code
        explanation: `Error during debugging: ${error.message}`,
        hasChanges: false,
      };
    }
  },

  // Generate autonomous 3D-enhanced website
  generateAutonomous3DWebsite: async (userPrompt) => {
    if (!claudeComputerUseConfig.enabled) {
      throw new Error(
        "Autonomous mode is not enabled. Please enable autonomous mode first."
      );
    }

    try {
      // Initialize Claude with computer use tools
      const response = await axios.post(
        "https://api.anthropic.com/v1/messages",
        {
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 12000,
          tools: claudeComputerUseConfig.tools,
          messages: [
            {
              role: "user",
              content: dedent`
              Create a stunning, modern ${userPrompt} website using React 18, Tailwind CSS and Three.js.
              
              REQUIREMENTS:
              1. Create a visually exceptional website with 3D effects that would impress Elon Musk
              2. Implement glass morphism, parallax effects, and 3D card transformations
              3. Ensure all images load properly using verified Unsplash URLs
              4. Add subtle animations and micro-interactions
              5. Make the website fully responsive
              6. Include error handling and loading states
              7. Design a user interface that feels premium and futuristic
              8. Add Three.js for 3D elements where appropriate
              9. Thoroughly debug the code before finishing
              10. Create a truly unique design that stands out
              
              The final code should be production-ready with no errors.
            `,
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

      // Process and organize the autonomous results
      return {
        success: true,
        message: "Autonomous 3D website generation completed successfully",
        data: response.data,
        files: processAutonomousResults(response.data),
      };
    } catch (error) {
      console.error("Error in autonomous 3D website generation:", error);
      throw new Error(
        `Autonomous 3D website generation failed: ${error.message}`
      );
    }
  },

  // Process the autonomous results into a consistent format
  processAutonomousResults: (data) => {
    try {
      // Extract code blocks and file information from Claude's response
      const files = {};

      // This is a simplified version - in production, you would parse the full Claude response
      // including extracting code from computer use tool outputs

      if (data.content && data.content.length > 0) {
        for (const contentItem of data.content) {
          if (contentItem.type === "text" && contentItem.text) {
            // Look for code blocks with filename indicators
            const codeBlocksRegex =
              /```(?:jsx|js|tsx|ts|html|css)\s*(?:\/\/\s*([^\n]+))?\n([\s\S]*?)```/g;
            let match;

            while ((match = codeBlocksRegex.exec(contentItem.text)) !== null) {
              // Try to extract filename from comment if present
              let filename = match[1] ? match[1].trim() : null;

              // If no filename, create one based on content
              if (!filename) {
                if (match[0].includes("```jsx") || match[0].includes("```js")) {
                  filename = "component.jsx";
                } else if (
                  match[0].includes("```tsx") ||
                  match[0].includes("```ts")
                ) {
                  filename = "component.tsx";
                } else if (match[0].includes("```html")) {
                  filename = "index.html";
                } else if (match[0].includes("```css")) {
                  filename = "styles.css";
                } else {
                  filename = "file.txt";
                }
              }

              // Store the code in our files object
              files[filename] = {
                code: match[2],
                language: match[0].slice(3, match[0].indexOf("\n")).trim(),
              };
            }
          }
        }
      }

      return files;
    } catch (error) {
      console.error("Error processing autonomous results:", error);
      return {};
    }
  },

  // Advanced 3D UI pattern generator for specific components
  generate3DUIComponent: async (componentType, customization = {}) => {
    // Component types: card, button, hero, gallery, navbar, testimonial, etc.
    try {
      // Get a base component pattern if available
      const basePattern = modern3DUIPatterns[`${componentType}`] || "";

      // Create a prompt for the component generation
      const componentPrompt = dedent`
      Generate a stunning 3D-enhanced ${componentType} React component using Tailwind CSS.
      
      Customization options:
      ${Object.entries(customization)
        .map(([key, value]) => `- ${key}: ${value}`)
        .join("\n")}
      
      Requirements:
      - Create a visually impressive component with 3D effects
      - Use glass morphism, shadows, and perspective for depth
      - Include subtle animations and hover effects
      - Ensure the component is responsive
      - Use only tailwind classes (no custom CSS)
      - Include proper comments
      
      ${basePattern ? `Here's a base pattern to enhance:\n\`\`\`jsx\n${basePattern}\n\`\`\`` : ""}
    `;

      // Send to code generation session
      const result = await GenAiCode.sendMessage(componentPrompt);
      const responseText = result.response.text();

      // Extract component code
      const codeMatch = responseText.match(
        /```(?:jsx|tsx|javascript)\n([\s\S]*?)```/
      );
      const componentCode = codeMatch ? codeMatch[1] : null;

      return {
        success: true,
        code: componentCode || "",
        componentType,
        customization,
      };
    } catch (error) {
      console.error("Error generating 3D UI component:", error);
      return {
        success: false,
        code: "",
        error: error.message || "Failed to generate component",
        componentType,
        customization,
      };
    }
  },

  // Autonomous error monitoring and debugging tool
  monitorAndFixErrors: async (website) => {
    try {
      // This would integrate with browser testing tools in production
      const errors = [];

      // Process each file for potential errors
      if (website && website.files) {
        await Promise.all(
          Object.keys(website.files).map(async (filePath) => {
            const fileContent = website.files[filePath].code;

            // Check for common issues
            const commonIssues = [
              {
                pattern: /console\.log\(/,
                message: "Remove debug console.log statements",
              },
              {
                pattern: /undefined|null is not an object/,
                message: "Potential null reference error",
              },
              {
                pattern: /<img[^>]+src="[^"]*"(?![^>]*alt=)/,
                message: "Image missing alt attribute",
              },
              {
                pattern: /useState\([^)]*\)[^]*useEffect\([^{]*{[^}]*\1/,
                message: "Potential missing dependency in useEffect",
              },
              {
                pattern: /new Array\([^)]+\)\.map/,
                message: "Use Array.from() instead of new Array().map",
              },
            ];

            commonIssues.forEach(({ pattern, message }) => {
              if (pattern.test(fileContent)) {
                errors.push({
                  file: filePath,
                  message,
                  line:
                    fileContent
                      .split("\n")
                      .findIndex((line) => pattern.test(line)) + 1,
                  severity: "warning",
                });
              }
            });

            // Run deeper analysis with the debugging system
            const debugResult = await AiModel.debugCode(fileContent, filePath);
            if (debugResult.hasChanges) {
              // Update the file with fixed code
              website.files[filePath].code = debugResult.fixedCode;
              website.files[filePath].debugNotes = debugResult.explanation;

              errors.push({
                file: filePath,
                message: "Automatic fixes applied",
                details: debugResult.explanation,
                severity: "info",
                fixed: true,
              });
            }
          })
        );
      }

      return {
        success: true,
        errors,
        fixedWebsite: website,
      };
    } catch (error) {
      console.error("Error in autonomous error monitoring:", error);
      return {
        success: false,
        errors: [
          {
            message: `Error monitoring system failed: ${error.message}`,
            severity: "error",
          },
        ],
        fixedWebsite: website,
      };
    }
  },

  // Generate advanced 3D scene with Three.js
  generate3DScene: async (sceneType, options = {}) => {
    try {
      // Different scene types: hero, background, product, visualization, etc.
      const scenePrompt = dedent`
      Generate a Three.js scene for a ${sceneType} with these options:
      ${Object.entries(options)
        .map(([key, value]) => `- ${key}: ${value}`)
        .join("\n")}
      
      Requirements:
      - Create a complete, working Three.js scene in React
      - Include all necessary imports and hooks
      - Add proper cleanup in useEffect
      - Handle window resizing
      - Add proper lighting and shadows
      - Implement camera controls where appropriate
      - Include animation loops
      - Add comments explaining complex parts
      
      Return only the complete React component code with the Three.js implementation.
    `;

      const result = await GenAiCode.sendMessage(scenePrompt);
      const responseText = result.response.text();

      // Extract component code
      const codeMatch = responseText.match(
        /```(?:jsx|tsx|javascript)\n([\s\S]*?)```/
      );
      const sceneCode = codeMatch ? codeMatch[1] : null;

      return {
        success: true,
        code: sceneCode || "",
        sceneType,
        options,
      };
    } catch (error) {
      console.error("Error generating 3D scene:", error);
      return {
        success: false,
        code: "",
        error: error.message || "Failed to generate 3D scene",
        sceneType,
        options,
      };
    }
  },
};

export default AiModel;
