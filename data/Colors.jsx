// Modern UI color system for Frodo
// This file defines color schemes and gradients for consistent, modern UI generation

const Colors = {
  // Primary color scheme with multiple variations
  primary: {
    gradient: "bg-gradient-to-r from-blue-500 to-violet-600",
    text: "text-blue-500",
    textGradient:
      "bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-violet-600",
    hover: "hover:bg-blue-600",
    border: "border-blue-500",
    light: "bg-blue-100",
    dark: "bg-blue-800",
    focusRing: "focus:ring-blue-500",
  },

  // Secondary color scheme
  secondary: {
    gradient: "bg-gradient-to-r from-emerald-400 to-teal-500",
    text: "text-emerald-500",
    textGradient:
      "bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-500",
    hover: "hover:bg-emerald-600",
    border: "border-emerald-500",
    light: "bg-emerald-100",
    dark: "bg-emerald-800",
    focusRing: "focus:ring-emerald-500",
  },

  // Accent color scheme
  accent: {
    gradient: "bg-gradient-to-r from-amber-400 to-orange-500",
    text: "text-amber-500",
    textGradient:
      "bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500",
    hover: "hover:bg-amber-600",
    border: "border-amber-500",
    light: "bg-amber-100",
    dark: "bg-amber-800",
    focusRing: "focus:ring-amber-500",
  },

  // Neutral color scheme for backgrounds and containers
  neutral: {
    // Light mode
    light: {
      background: "bg-white",
      backgroundGradient: "bg-gradient-to-br from-slate-50 to-slate-100",
      card: "bg-white",
      cardGlass: "bg-white/80 backdrop-blur-md",
      border: "border-slate-200",
      text: {
        primary: "text-slate-900",
        secondary: "text-slate-600",
        tertiary: "text-slate-400",
      },
    },
    // Dark mode
    dark: {
      background: "bg-slate-900",
      backgroundGradient: "bg-gradient-to-br from-slate-900 to-slate-800",
      card: "bg-slate-800",
      cardGlass: "bg-slate-800/50 backdrop-blur-md",
      border: "border-slate-700",
      text: {
        primary: "text-white",
        secondary: "text-slate-300",
        tertiary: "text-slate-400",
      },
    },
  },

  // Status colors
  status: {
    success: {
      bg: "bg-green-500",
      text: "text-green-500",
      border: "border-green-500",
      light: "bg-green-100",
    },
    warning: {
      bg: "bg-amber-500",
      text: "text-amber-500",
      border: "border-amber-500",
      light: "bg-amber-100",
    },
    error: {
      bg: "bg-red-500",
      text: "text-red-500",
      border: "border-red-500",
      light: "bg-red-100",
    },
    info: {
      bg: "bg-sky-500",
      text: "text-sky-500",
      border: "border-sky-500",
      light: "bg-sky-100",
    },
  },

  // Glassmorphism presets
  glass: {
    light: "bg-white/10 backdrop-blur-md border border-white/20",
    medium: "bg-white/20 backdrop-blur-md border border-white/30",
    heavy: "bg-white/30 backdrop-blur-lg border border-white/40",
    gradient:
      "bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-md border border-white/20",
  },

  // Button presets for quick implementation
  buttons: {
    primary:
      "px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-violet-600 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105 active:scale-100",
    secondary:
      "px-4 py-2 rounded-lg bg-gradient-to-r from-slate-800 to-slate-700 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-slate-500/25 active:scale-95",
    outline:
      "px-4 py-2 rounded-lg border border-blue-500 text-blue-500 font-medium transition-all duration-300 hover:bg-blue-500 hover:text-white",
    glass:
      "px-4 py-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium transition-all duration-300 hover:bg-white/20",
    danger:
      "px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-rose-600 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25 active:scale-95",
  },

  // Card presets for consistent card styling
  cards: {
    basic: "rounded-xl p-6 shadow-lg",
    glass:
      "rounded-xl p-6 bg-white/10 backdrop-blur-md border border-white/20 shadow-xl",
    raised:
      "rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300",
    interactive:
      "rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer",
    glassInteractive:
      "rounded-xl p-6 bg-white/10 backdrop-blur-md border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:bg-white/15 cursor-pointer",
  },

  // Animation presets
  animations: {
    fadeIn: "animate-fade-in",
    slideUp: "animate-slide-up",
    pulse: "animate-pulse",
    bounce: "animate-bounce",
    spin: "animate-spin",
    hover: "transition-all duration-300 hover:scale-105",
  },

  // Typography presets
  typography: {
    heading1: "text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight",
    heading2: "text-3xl md:text-4xl font-bold tracking-tight",
    heading3: "text-2xl md:text-3xl font-semibold",
    subtitle: "text-xl text-slate-400 dark:text-slate-300",
    paragraph: "text-base text-slate-600 dark:text-slate-300",
    gradientHeading:
      "bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-violet-600 font-bold",
  },
};

export default Colors;
