// lib/Animations.js
// Animation utilities for modern UI effects and interactivity

import { twMerge } from "tailwind-merge";

// Animation presets for common UI elements
export const animationPresets = {
  // Button animations
  button: {
    primary:
      "transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 hover:scale-105 active:scale-95",
    secondary:
      "transition-all duration-300 hover:bg-opacity-80 active:scale-95",
    icon: "transition-all duration-200 hover:scale-110 active:scale-90",
    glass: "transition-all duration-300 hover:bg-white/20 active:bg-white/10",
  },

  // Card animations
  card: {
    hover:
      "transition-all duration-500 hover:shadow-xl hover:translate-y-[-5px]",
    interactive:
      "transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer",
    glass:
      "transition-all duration-300 hover:bg-white/15 hover:shadow-xl cursor-pointer",
    bounce:
      "transition-all duration-500 hover:shadow-xl hover:translate-y-[-7px]",
  },

  // Image animations
  image: {
    zoom: "transition-transform duration-500 hover:scale-110",
    rotate: "transition-transform duration-500 hover:rotate-3",
    shine:
      "relative overflow-hidden after:absolute after:inset-0 after:translate-x-[-100%] after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent hover:after:translate-x-[100%] after:transition-transform after:duration-1000",
    fadeIn: "animate-fade-in duration-1000",
  },

  // Page transition animations
  page: {
    fadeIn: "animate-in fade-in duration-500",
    slideUp: "animate-in slide-in-from-bottom duration-500",
    slideDown: "animate-in slide-in-from-top duration-500",
    slideLeft: "animate-in slide-in-from-right duration-500",
    slideRight: "animate-in slide-in-from-left duration-500",
    zoomIn: "animate-in zoom-in duration-500",
  },

  // Loading animations
  loading: {
    spinner: "animate-spin",
    pulse: "animate-pulse",
    bounce: "animate-bounce",
    skeleton: "animate-pulse bg-gray-200 dark:bg-gray-700",
  },

  // Text animations
  text: {
    fadeIn: "animate-in fade-in duration-700",
    highlight: "transition-colors duration-300 hover:text-primary",
    gradient:
      "bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-violet-600",
    gradientHover:
      "transition-colors duration-300 hover:bg-clip-text hover:text-transparent hover:bg-gradient-to-r hover:from-blue-500 hover:to-violet-600",
  },

  // Scroll animations (for scroll-triggered animations)
  scroll: {
    fadeIn: "opacity-0 transition-opacity duration-1000", // Add .opacity-100 when visible
    slideUp: "translate-y-10 opacity-0 transition-all duration-1000", // Add .translate-y-0 .opacity-100 when visible
    slideDown: "translate-y-[-10px] opacity-0 transition-all duration-1000", // Add .translate-y-0 .opacity-100 when visible
    slideLeft: "translate-x-10 opacity-0 transition-all duration-1000", // Add .translate-x-0 .opacity-100 when visible
    slideRight: "translate-x-[-10px] opacity-0 transition-all duration-1000", // Add .translate-x-0 .opacity-100 when visible
    scaleUp: "scale-95 opacity-0 transition-all duration-1000", // Add .scale-100 .opacity-100 when visible
  },
};

// Common animation sequences for complex animations
export const animationSequences = {
  // Staggered entrance animation for list items
  staggeredFadeIn: (count, delayBetween = 100) => {
    return Array.from({ length: count }, (_, i) => {
      return `animate-in fade-in duration-500 delay-[${i * delayBetween}ms]`;
    });
  },

  // Staggered entrance animation with slides for list items
  staggeredSlideUp: (count, delayBetween = 100) => {
    return Array.from({ length: count }, (_, i) => {
      return `animate-in fade-in slide-in-from-bottom duration-500 delay-[${i * delayBetween}ms]`;
    });
  },

  // Looping animation sequence (can be used with animation events in React)
  pulseAttention: "animate-pulse duration-1000 repeat-[3]",

  // Animation for notifications or alerts
  notification:
    "animate-in fade-in slide-in-from-top duration-300 animate-out fade-out slide-out-to-top duration-300",

  // Multi-step animation for buttons
  buttonSuccessSequence: [
    { classes: "scale-95 bg-green-500", duration: 200 },
    { classes: "scale-100", duration: 200 },
    { classes: "", duration: 300 },
  ],
};

// Animation helper functions
const Animations = {
  // Apply hover effects to elements
  applyHoverEffect: (baseClasses, effect = "hover") => {
    if (typeof effect === "string") {
      const presetEffect =
        animationPresets.card[effect] || animationPresets.button[effect];
      return twMerge(baseClasses, presetEffect);
    }
    return twMerge(baseClasses, effect);
  },

  // Apply entrance animations
  applyEntrance: (baseClasses, effect = "fadeIn") => {
    const entranceEffect =
      animationPresets.page[effect] || animationPresets.page.fadeIn;
    return twMerge(baseClasses, entranceEffect);
  },

  // Generate skeleton loading placeholders
  createSkeleton: (className, count = 1) => {
    if (count === 1) {
      return twMerge(className, animationPresets.loading.skeleton);
    }

    // For multiple skeletons, return an array
    return Array.from({ length: count }, () =>
      twMerge(className, animationPresets.loading.skeleton)
    );
  },

  // Create staggered animations for lists
  createStaggered: (
    baseClasses,
    count,
    type = "fadeIn",
    delayBetween = 100
  ) => {
    return Array.from({ length: count }, (_, i) => {
      let animationClass = "animate-in fade-in";

      if (type === "slideUp") {
        animationClass = "animate-in fade-in slide-in-from-bottom";
      } else if (type === "slideDown") {
        animationClass = "animate-in fade-in slide-in-from-top";
      } else if (type === "slideLeft") {
        animationClass = "animate-in fade-in slide-in-from-right";
      } else if (type === "slideRight") {
        animationClass = "animate-in fade-in slide-in-from-left";
      }

      return twMerge(
        baseClasses,
        `${animationClass} duration-500 delay-[${i * delayBetween}ms]`
      );
    });
  },

  // Add scroll-triggered animation classes
  // (Note: Requires intersection observer implementation in component)
  applyScrollAnimation: (baseClasses, effect = "fadeIn") => {
    const scrollEffect =
      animationPresets.scroll[effect] || animationPresets.scroll.fadeIn;
    return {
      initial: twMerge(baseClasses, scrollEffect),
      visible: baseClasses,
    };
  },

  // Generate keyframe animation for Tailwind config
  generateKeyframes: () => {
    return {
      // Float animation
      float: {
        "0%, 100%": { transform: "translateY(0)" },
        "50%": { transform: "translateY(-10px)" },
      },
      // Breathe animation
      breathe: {
        "0%, 100%": { transform: "scale(1)" },
        "50%": { transform: "scale(1.05)" },
      },
      // Shimmer effect (for skeleton loading)
      shimmer: {
        "0%": { backgroundPosition: "-1000px 0" },
        "100%": { backgroundPosition: "1000px 0" },
      },
      // Pulse border
      pulseBorder: {
        "0%, 100%": { borderColor: "rgba(99, 102, 241, 0.2)" },
        "50%": { borderColor: "rgba(99, 102, 241, 0.8)" },
      },
      // Wiggle
      wiggle: {
        "0%, 100%": { transform: "rotate(-3deg)" },
        "50%": { transform: "rotate(3deg)" },
      },
    };
  },

  // Tailwind animations config (to be added to tailwind.config.js)
  tailwindConfig: {
    extend: {
      animation: {
        float: "float 3s ease-in-out infinite",
        breathe: "breathe 4s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "pulse-border": "pulseBorder 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        wiggle: "wiggle 1s ease-in-out infinite",
      },
    },
  },

  // Easy access to animation presets
  presets: animationPresets,

  // Easy access to animation sequences
  sequences: animationSequences,
};

export default Animations;
