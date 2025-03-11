// UI Generation System for modern web applications
// A comprehensive system for generating consistent and beautiful UI components

import { cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import { cn } from "@/lib/utils";

// Color palette system with extensive options
const ColorSystem = {
  // Primary themes - multiple options
  primary: {
    indigo: {
      gradient: "bg-gradient-to-r from-indigo-500 to-violet-600",
      text: "text-indigo-500",
      textGradient:
        "bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-600",
      hover: "hover:bg-indigo-600",
      border: "border-indigo-500",
      light: "bg-indigo-100",
      dark: "bg-indigo-800",
      focusRing: "focus:ring-indigo-500",
    },
    blue: {
      gradient: "bg-gradient-to-r from-blue-500 to-sky-600",
      text: "text-blue-500",
      textGradient:
        "bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-sky-600",
      hover: "hover:bg-blue-600",
      border: "border-blue-500",
      light: "bg-blue-100",
      dark: "bg-blue-800",
      focusRing: "focus:ring-blue-500",
    },
    purple: {
      gradient: "bg-gradient-to-r from-purple-500 to-fuchsia-600",
      text: "text-purple-500",
      textGradient:
        "bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-fuchsia-600",
      hover: "hover:bg-purple-600",
      border: "border-purple-500",
      light: "bg-purple-100",
      dark: "bg-purple-800",
      focusRing: "focus:ring-purple-500",
    },
    teal: {
      gradient: "bg-gradient-to-r from-teal-500 to-emerald-600",
      text: "text-teal-500",
      textGradient:
        "bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-emerald-600",
      hover: "hover:bg-teal-600",
      border: "border-teal-500",
      light: "bg-teal-100",
      dark: "bg-teal-800",
      focusRing: "focus:ring-teal-500",
    },
    rose: {
      gradient: "bg-gradient-to-r from-rose-500 to-pink-600",
      text: "text-rose-500",
      textGradient:
        "bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-pink-600",
      hover: "hover:bg-rose-600",
      border: "border-rose-500",
      light: "bg-rose-100",
      dark: "bg-rose-800",
      focusRing: "focus:ring-rose-500",
    },
  },

  // Secondary color schemes
  secondary: {
    emerald: {
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
    cyan: {
      gradient: "bg-gradient-to-r from-cyan-400 to-sky-500",
      text: "text-cyan-500",
      textGradient:
        "bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-sky-500",
      hover: "hover:bg-cyan-600",
      border: "border-cyan-500",
      light: "bg-cyan-100",
      dark: "bg-cyan-800",
      focusRing: "focus:ring-cyan-500",
    },
    amber: {
      gradient: "bg-gradient-to-r from-amber-400 to-yellow-500",
      text: "text-amber-500",
      textGradient:
        "bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-yellow-500",
      hover: "hover:bg-amber-600",
      border: "border-amber-500",
      light: "bg-amber-100",
      dark: "bg-amber-800",
      focusRing: "focus:ring-amber-500",
    },
    fuchsia: {
      gradient: "bg-gradient-to-r from-fuchsia-400 to-pink-500",
      text: "text-fuchsia-500",
      textGradient:
        "bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-pink-500",
      hover: "hover:bg-fuchsia-600",
      border: "border-fuchsia-500",
      light: "bg-fuchsia-100",
      dark: "bg-fuchsia-800",
      focusRing: "focus:ring-fuchsia-500",
    },
    lime: {
      gradient: "bg-gradient-to-r from-lime-400 to-green-500",
      text: "text-lime-500",
      textGradient:
        "bg-clip-text text-transparent bg-gradient-to-r from-lime-400 to-green-500",
      hover: "hover:bg-lime-600",
      border: "border-lime-500",
      light: "bg-lime-100",
      dark: "bg-lime-800",
      focusRing: "focus:ring-lime-500",
    },
  },

  // Accent color schemes
  accent: {
    orange: {
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
    pink: {
      gradient: "bg-gradient-to-r from-pink-400 to-rose-500",
      text: "text-pink-500",
      textGradient:
        "bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-rose-500",
      hover: "hover:bg-pink-600",
      border: "border-pink-500",
      light: "bg-pink-100",
      dark: "bg-pink-800",
      focusRing: "focus:ring-pink-500",
    },
    violet: {
      gradient: "bg-gradient-to-r from-violet-400 to-purple-500",
      text: "text-violet-500",
      textGradient:
        "bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-purple-500",
      hover: "hover:bg-violet-600",
      border: "border-violet-500",
      light: "bg-violet-100",
      dark: "bg-violet-800",
      focusRing: "focus:ring-violet-500",
    },
    red: {
      gradient: "bg-gradient-to-r from-red-400 to-rose-500",
      text: "text-red-500",
      textGradient:
        "bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-rose-500",
      hover: "hover:bg-red-600",
      border: "border-red-500",
      light: "bg-red-100",
      dark: "bg-red-800",
      focusRing: "focus:ring-red-500",
    },
    green: {
      gradient: "bg-gradient-to-r from-green-400 to-emerald-500",
      text: "text-green-500",
      textGradient:
        "bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-500",
      hover: "hover:bg-green-600",
      border: "border-green-500",
      light: "bg-green-100",
      dark: "bg-green-800",
      focusRing: "focus:ring-green-500",
    },
  },

  // Neutral themes with multiple options
  neutral: {
    // Modern light themes
    light: {
      slate: {
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
      gray: {
        background: "bg-white",
        backgroundGradient: "bg-gradient-to-br from-gray-50 to-gray-100",
        card: "bg-white",
        cardGlass: "bg-white/80 backdrop-blur-md",
        border: "border-gray-200",
        text: {
          primary: "text-gray-900",
          secondary: "text-gray-600",
          tertiary: "text-gray-400",
        },
      },
      zinc: {
        background: "bg-white",
        backgroundGradient: "bg-gradient-to-br from-zinc-50 to-zinc-100",
        card: "bg-white",
        cardGlass: "bg-white/80 backdrop-blur-md",
        border: "border-zinc-200",
        text: {
          primary: "text-zinc-900",
          secondary: "text-zinc-600",
          tertiary: "text-zinc-400",
        },
      },
      cream: {
        background: "bg-amber-50",
        backgroundGradient: "bg-gradient-to-br from-amber-50 to-orange-50",
        card: "bg-white",
        cardGlass: "bg-white/80 backdrop-blur-md",
        border: "border-amber-200",
        text: {
          primary: "text-amber-900",
          secondary: "text-amber-700",
          tertiary: "text-amber-500",
        },
      },
      mint: {
        background: "bg-emerald-50",
        backgroundGradient: "bg-gradient-to-br from-emerald-50 to-teal-50",
        card: "bg-white",
        cardGlass: "bg-white/80 backdrop-blur-md",
        border: "border-emerald-200",
        text: {
          primary: "text-emerald-900",
          secondary: "text-emerald-700",
          tertiary: "text-emerald-500",
        },
      },
    },
    // Dark themes
    dark: {
      slate: {
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
      gray: {
        background: "bg-gray-900",
        backgroundGradient: "bg-gradient-to-br from-gray-900 to-gray-800",
        card: "bg-gray-800",
        cardGlass: "bg-gray-800/50 backdrop-blur-md",
        border: "border-gray-700",
        text: {
          primary: "text-white",
          secondary: "text-gray-300",
          tertiary: "text-gray-400",
        },
      },
      zinc: {
        background: "bg-zinc-900",
        backgroundGradient: "bg-gradient-to-br from-zinc-900 to-zinc-800",
        card: "bg-zinc-800",
        cardGlass: "bg-zinc-800/50 backdrop-blur-md",
        border: "border-zinc-700",
        text: {
          primary: "text-white",
          secondary: "text-zinc-300",
          tertiary: "text-zinc-400",
        },
      },
      blue: {
        background: "bg-blue-950",
        backgroundGradient: "bg-gradient-to-br from-blue-950 to-indigo-900",
        card: "bg-blue-900",
        cardGlass: "bg-blue-900/50 backdrop-blur-md",
        border: "border-blue-800",
        text: {
          primary: "text-white",
          secondary: "text-blue-300",
          tertiary: "text-blue-400",
        },
      },
      purple: {
        background: "bg-purple-950",
        backgroundGradient: "bg-gradient-to-br from-purple-950 to-violet-900",
        card: "bg-purple-900",
        cardGlass: "bg-purple-900/50 backdrop-blur-md",
        border: "border-purple-800",
        text: {
          primary: "text-white",
          secondary: "text-purple-300",
          tertiary: "text-purple-400",
        },
      },
    },
  },

  // Status and feedback colors
  status: {
    success: {
      bg: "bg-green-500",
      gradient: "bg-gradient-to-r from-green-500 to-emerald-600",
      text: "text-green-500",
      border: "border-green-500",
      light: "bg-green-100",
    },
    warning: {
      bg: "bg-amber-500",
      gradient: "bg-gradient-to-r from-amber-500 to-orange-600",
      text: "text-amber-500",
      border: "border-amber-500",
      light: "bg-amber-100",
    },
    error: {
      bg: "bg-red-500",
      gradient: "bg-gradient-to-r from-red-500 to-rose-600",
      text: "text-red-500",
      border: "border-red-500",
      light: "bg-red-100",
    },
    info: {
      bg: "bg-sky-500",
      gradient: "bg-gradient-to-r from-sky-500 to-blue-600",
      text: "text-sky-500",
      border: "border-sky-500",
      light: "bg-sky-100",
    },
    neutral: {
      bg: "bg-slate-500",
      gradient: "bg-gradient-to-r from-slate-500 to-gray-600",
      text: "text-slate-500",
      border: "border-slate-500",
      light: "bg-slate-100",
    },
  },

  // Glass effects with different intensities and colors
  glass: {
    light: {
      white: "bg-white/10 backdrop-blur-md border border-white/20",
      dark: "bg-black/10 backdrop-blur-md border border-black/20",
      blue: "bg-blue-500/10 backdrop-blur-md border border-blue-500/20",
      purple: "bg-purple-500/10 backdrop-blur-md border border-purple-500/20",
      emerald:
        "bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20",
      rose: "bg-rose-500/10 backdrop-blur-md border border-rose-500/20",
    },
    medium: {
      white: "bg-white/20 backdrop-blur-md border border-white/30",
      dark: "bg-black/20 backdrop-blur-md border border-black/30",
      blue: "bg-blue-500/20 backdrop-blur-md border border-blue-500/30",
      purple: "bg-purple-500/20 backdrop-blur-md border border-purple-500/30",
      emerald:
        "bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30",
      rose: "bg-rose-500/20 backdrop-blur-md border border-rose-500/30",
    },
    heavy: {
      white: "bg-white/30 backdrop-blur-lg border border-white/40",
      dark: "bg-black/30 backdrop-blur-lg border border-black/40",
      blue: "bg-blue-500/30 backdrop-blur-lg border border-blue-500/40",
      purple: "bg-purple-500/30 backdrop-blur-lg border border-purple-500/40",
      emerald:
        "bg-emerald-500/30 backdrop-blur-lg border border-emerald-500/40",
      rose: "bg-rose-500/30 backdrop-blur-lg border border-rose-500/40",
    },
    gradient: {
      white:
        "bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-md border border-white/20",
      dark: "bg-gradient-to-br from-black/20 to-black/5 backdrop-blur-md border border-black/20",
      blue: "bg-gradient-to-br from-blue-500/20 to-blue-500/5 backdrop-blur-md border border-blue-500/20",
      purple:
        "bg-gradient-to-br from-purple-500/20 to-purple-500/5 backdrop-blur-md border border-purple-500/20",
      emerald:
        "bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 backdrop-blur-md border border-emerald-500/20",
      rose: "bg-gradient-to-br from-rose-500/20 to-rose-500/5 backdrop-blur-md border border-rose-500/20",
    },
  },
};

// Button variants with class-variance-authority for dynamic styling
const buttonVariants = cva(
  "rounded-lg font-medium transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-blue-500 to-violet-600 text-white hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105 active:scale-100",
        secondary:
          "bg-gradient-to-r from-slate-800 to-slate-700 text-white hover:shadow-lg hover:shadow-slate-500/25 active:scale-95",
        outline: "border bg-transparent hover:text-white",
        ghost: "hover:bg-slate-100 dark:hover:bg-slate-800 bg-transparent",
        link: "bg-transparent underline-offset-4 hover:underline text-slate-900 dark:text-slate-100 hover:bg-transparent",
        glass:
          "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20",
        soft: "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700",
        danger:
          "bg-gradient-to-r from-red-500 to-rose-600 text-white hover:shadow-lg hover:shadow-red-500/25 active:scale-95",
        success:
          "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/25 active:scale-95",
      },
      size: {
        sm: "text-xs px-3 py-1.5",
        md: "text-sm px-4 py-2",
        lg: "text-base px-5 py-2.5",
        xl: "text-lg px-6 py-3",
      },
      rounded: {
        default: "rounded-lg",
        full: "rounded-full",
        none: "rounded-none",
      },
      width: {
        auto: "w-auto",
        full: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      rounded: "default",
      width: "auto",
    },
  }
);

// Input variants for form controls
const inputVariants = cva(
  "rounded-lg transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default:
          "border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500",
        outline:
          "border border-slate-300 dark:border-slate-700 bg-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50",
        ghost:
          "border-0 bg-slate-100 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500/50",
        underline:
          "border-0 border-b-2 border-slate-300 dark:border-slate-700 rounded-none bg-transparent focus:border-blue-500",
        glass:
          "border border-white/20 bg-white/10 backdrop-blur-md text-white placeholder:text-white/70 focus:ring-2 focus:ring-white/50",
      },
      size: {
        sm: "text-xs px-3 py-1.5",
        md: "text-sm px-4 py-2",
        lg: "text-base px-5 py-2.5",
        xl: "text-lg px-6 py-3",
      },
      width: {
        auto: "w-auto",
        full: "w-full",
      },
      validation: {
        default: "",
        error:
          "border-red-500 focus:ring-red-500 focus:border-red-500 text-red-500 dark:text-red-400 placeholder:text-red-400/70",
        success: "border-green-500 focus:ring-green-500 focus:border-green-500",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      width: "full",
      validation: "default",
    },
  }
);

// Card variants for content containers
const cardVariants = cva("transition-all duration-300", {
  variants: {
    variant: {
      default: "bg-white dark:bg-slate-800 shadow-md",
      outline:
        "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800",
      ghost: "bg-transparent",
      glass: "bg-white/10 backdrop-blur-md border border-white/20 shadow-xl",
      raised: "bg-white dark:bg-slate-800 shadow-xl hover:shadow-2xl",
      interactive:
        "bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl hover:scale-[1.02] cursor-pointer",
      glassInteractive:
        "bg-white/10 backdrop-blur-md border border-white/20 shadow-lg hover:shadow-xl hover:scale-[1.02] hover:bg-white/15 cursor-pointer",
    },
    padding: {
      none: "p-0",
      sm: "p-3",
      md: "p-6",
      lg: "p-8",
      xl: "p-10",
    },
    rounded: {
      none: "rounded-none",
      sm: "rounded-md",
      md: "rounded-lg",
      lg: "rounded-xl",
      full: "rounded-2xl",
    },
    border: {
      none: "border-0",
      default: "border border-slate-200 dark:border-slate-700",
      colored: "border border-blue-500 dark:border-blue-400",
    },
  },
  defaultVariants: {
    variant: "default",
    padding: "md",
    rounded: "lg",
    border: "none",
  },
});

// Badge variants for labels and indicators
const badgeVariants = cva(
  "inline-flex items-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900",
        primary: "bg-blue-500 text-white",
        secondary:
          "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100",
        outline: "bg-transparent border text-slate-900 dark:text-slate-100",
        ghost:
          "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100",
        success: "bg-green-500 text-white",
        danger: "bg-red-500 text-white",
        warning: "bg-amber-500 text-white",
        info: "bg-sky-500 text-white",
        gradient: "bg-gradient-to-r from-blue-500 to-violet-600 text-white",
        glass: "bg-white/10 backdrop-blur-md border border-white/20 text-white",
        soft: "bg-blue-100 dark:bg-blue-900 text-blue-500 dark:text-blue-200",
      },
      size: {
        xs: "h-5 px-1.5 text-[10px]",
        sm: "h-6 px-2 text-xs",
        md: "h-7 px-2.5 text-sm",
        lg: "h-8 px-3 text-base",
      },
      rounded: {
        default: "rounded-md",
        full: "rounded-full",
        none: "rounded-none",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      rounded: "default",
    },
  }
);

// Layout components for common UI patterns

// Layout Component Templates
const LayoutTemplates = {
  // Page layouts
  page: {
    default: `
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800">
          <div className="container mx-auto px-4 py-4">
            {/* Header content */}
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          {/* Main content */}
        </main>
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800">
          <div className="container mx-auto px-4 py-6">
            {/* Footer content */}
          </div>
        </footer>
      </div>
    `,
    dashboard: `
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
        <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-4">
          {/* Sidebar content */}
        </aside>
        <div className="flex-1 flex flex-col">
          <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800">
            <div className="px-6 py-4">
              {/* Header content */}
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            {/* Main content */}
          </main>
        </div>
      </div>
    `,
    appShell: `
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
        <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            {/* Header content */}
          </div>
        </header>
        <div className="flex flex-1">
          <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-4 hidden md:block">
            {/* Sidebar content */}
          </aside>
          <main className="flex-1 p-6">
            {/* Main content */}
          </main>
        </div>
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800">
          <div className="container mx-auto px-4 py-4">
            {/* Footer content */}
          </div>
        </footer>
      </div>
    `,
    landingPage: `
      <div className="min-h-screen bg-white dark:bg-slate-900">
        <header className="sticky top-0 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            {/* Header content */}
          </div>
        </header>
        <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <div className="container mx-auto px-4">
            {/* Hero section */}
          </div>
        </section>
        <main>
          {/* Additional sections */}
        </main>
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-12">
          <div className="container mx-auto px-4">
            {/* Footer content */}
          </div>
        </footer>
      </div>
    `,
  },

  // Navigation components
  navigation: {
    navbar: `
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img className="h-8 w-auto" src="/logo.svg" alt="Logo" />
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <a href="#" className="text-blue-600 dark:text-blue-400 font-medium">Home</a>
                  <a href="#" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400">Features</a>
                  <a href="#" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400">Pricing</a>
                  <a href="#" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400">About</a>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center space-x-3">
                <button className="px-4 py-2 text-sm rounded-md text-slate-700 dark:text-slate-200">Sign In</button>
                <button className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700">Sign Up</button>
              </div>
            </div>
            <div className="md:hidden">
              <button className="text-slate-600 dark:text-slate-300">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>
    `,
    sidebar: `
      <aside className="w-64 h-screen bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <img className="h-8 w-auto" src="/logo.svg" alt="Logo" />
        </div>
        <nav className="p-4 space-y-1">
          <a href="#" className="block px-3 py-2 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium">Dashboard</a>
          <a href="#" className="block px-3 py-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">Projects</a>
          <a href="#" className="block px-3 py-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">Team</a>
          <a href="#" className="block px-3 py-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">Calendar</a>
          <a href="#" className="block px-3 py-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">Reports</a>
        </nav>
      </aside>
    `,
    tabbed: `
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="flex space-x-8">
          <a href="#" className="py-4 px-1 border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 font-medium">Dashboard</a>
          <a href="#" className="py-4 px-1 border-b-2 border-transparent text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600">Team</a>
          <a href="#" className="py-4 px-1 border-b-2 border-transparent text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600">Projects</a>
          <a href="#" className="py-4 px-1 border-b-2 border-transparent text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600">Calendar</a>
        </nav>
      </div>
    `,
    breadcrumbs: `
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <a href="#" className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">Home</a>
          </li>
          <li>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
              </svg>
              <a href="#" className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 ml-1 md:ml-2">Projects</a>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
              </svg>
              <span className="text-sm text-slate-500 dark:text-slate-400 ml-1 md:ml-2 font-medium">Current Project</span>
            </div>
          </li>
        </ol>
      </nav>
    `,
  },

  // Form templates
  forms: {
    simple: `
      <form className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email address</label>
          <input type="email" id="email" name="email" className="w-full px-4 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
          <input type="password" id="password" name="password" className="w-full px-4 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input type="checkbox" id="remember-me" name="remember-me" className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">Remember me</label>
          </div>
          <a href="#" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Forgot your password?</a>
        </div>
        <div>
          <button type="submit" className="w-full py-2.5 px-4 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Sign in</button>
        </div>
      </form>
    `,
    stacked: `
      <form className="space-y-8">
        <div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">Personal Information</h3>
          <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
            <div>
              <label htmlFor="first-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">First name</label>
              <input type="text" id="first-name" name="first-name" className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="last-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Last name</label>
              <input type="text" id="last-name" name="last-name" className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email address</label>
              <input type="email" id="email" name="email" className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="company" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Company</label>
              <input type="text" id="company" name="company" className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">Address</h3>
          <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
            <div className="sm:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Street address</label>
              <input type="text" id="address" name="address" className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-slate-700 dark:text-slate-300">City</label>
              <input type="text" id="city" name="city" className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="postal-code" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Postal code</label>
              <input type="text" id="postal-code" name="postal-code" className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>
        <div className="pt-4">
          <button type="submit" className="py-2.5 px-4 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Save information</button>
        </div>
      </form>
    `,
    inline: `
      <form className="flex items-center space-x-4">
        <div className="flex-1">
          <label htmlFor="email" className="sr-only">Email address</label>
          <input type="email" id="email" name="email" placeholder="Email address" className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
        </div>
        <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Subscribe</button>
      </form>
    `,
    search: `
      <form className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <svg className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>
        <input type="text" name="search" id="search" className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 py-2 pl-10 pr-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 sm:text-sm" placeholder="Search" />
      </form>
    `,
  },

  // Card templates
  cards: {
    basic: `
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Card Title</h3>
          <p className="mt-2 text-slate-600 dark:text-slate-300">This is a basic card with title and content.</p>
        </div>
      </div>
    `,
    withImage: `
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
        <img src="https://images.unsplash.com/photo-1522252234503-e356532cafd5" alt="Card image" className="w-full h-48 object-cover" />
        <div className="p-6">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Card with Image</h3>
          <p className="mt-2 text-slate-600 dark:text-slate-300">This card includes an image at the top.</p>
          <div className="mt-4">
            <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">Learn more</a>
          </div>
        </div>
      </div>
    `,
    horizontal: `
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden flex flex-col md:flex-row">
        <img src="https://images.unsplash.com/photo-1522252234503-e356532cafd5" alt="Card image" className="w-full md:w-1/3 h-48 md:h-auto object-cover" />
        <div className="p-6">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Horizontal Card</h3>
          <p className="mt-2 text-slate-600 dark:text-slate-300">This card has a horizontal layout on medium and larger screens.</p>
          <div className="mt-4">
            <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">Learn more</a>
          </div>
        </div>
      </div>
    `,
    feature: `
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
          <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Feature Card</h3>
        <p className="mt-2 text-slate-600 dark:text-slate-300">A feature card with an icon and description.</p>
      </div>
    `,
    pricing: `
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Basic Plan</h3>
          <p className="mt-1 text-slate-600 dark:text-slate-300">For individuals getting started</p>
          <div className="mt-4 flex items-baseline">
            <span className="text-4xl font-bold text-slate-900 dark:text-white">$9</span>
            <span className="ml-1 text-slate-600 dark:text-slate-300">/month</span>
          </div>
          <ul className="mt-6 space-y-3">
            <li className="flex items-center">
              <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="ml-2 text-slate-600 dark:text-slate-300">5 Projects</span>
            </li>
            <li className="flex items-center">
              <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="ml-2 text-slate-600 dark:text-slate-300">2GB Storage</span>
            </li>
            <li className="flex items-center">
              <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="ml-2 text-slate-600 dark:text-slate-300">Email Support</span>
            </li>
          </ul>
          <div className="mt-6">
            <button className="w-full py-2.5 px-4 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Get Started</button>
          </div>
        </div>
      </div>
    `,
    testimonial: `
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <img className="h-12 w-12 rounded-full object-cover" src="https://randomuser.me/api/portraits/women/32.jpg" alt="Avatar" />
          <div className="ml-4">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white">Jane Smith</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300">Marketing Director at Company</p>
          </div>
        </div>
        <p className="text-slate-600 dark:text-slate-300">"This product has saved us countless hours of work and has truly transformed how we manage our projects."</p>
        <div className="mt-4 flex">
          <svg className="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <svg className="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <svg className="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <svg className="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <svg className="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
      </div>
    `,
    stats: `
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-slate-900 dark:text-white">8,000+</p>
            <p className="mt-1 text-slate-600 dark:text-slate-300">Users</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-slate-900 dark:text-white">900+</p>
            <p className="mt-1 text-slate-600 dark:text-slate-300">Projects</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-slate-900 dark:text-white">99.9%</p>
            <p className="mt-1 text-slate-600 dark:text-slate-300">Uptime</p>
          </div>
        </div>
      </div>
    `,
  },

  // Grid layouts for common content patterns
  grids: {
    twoColumn: `
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Column 1</h3>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Content for the first column.</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Column 2</h3>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Content for the second column.</p>
        </div>
      </div>
    `,
    threeColumn: `
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Column 1</h3>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Content for the first column.</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Column 2</h3>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Content for the second column.</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Column 3</h3>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Content for the third column.</p>
        </div>
      </div>
    `,
    fourColumn: `
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Column 1</h3>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Content for the first column.</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Column 2</h3>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Content for the second column.</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Column 3</h3>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Content for the third column.</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Column 4</h3>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Content for the fourth column.</p>
        </div>
      </div>
    `,
    mainWithSidebar: `
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Main Content</h2>
            <p className="text-slate-600 dark:text-slate-300">This is the main content area which takes up 3/4 of the width on large screens.</p>
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Sidebar</h3>
            <p className="text-slate-600 dark:text-slate-300">This is the sidebar area which takes up 1/4 of the width on large screens.</p>
          </div>
        </div>
      </div>
    `,
    hero: `
      <div className="relative bg-gradient-to-r from-blue-600 to-violet-600 text-white overflow-hidden">
        <div className="absolute inset-0">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="rgba(255, 255, 255, 0.1)" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,106.7C672,85,768,75,864,90.7C960,107,1056,149,1152,154.7C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">Welcome to Our Platform</h1>
          <p className="mt-6 text-xl max-w-3xl">Transform your workflow with our cutting-edge tools and solutions.</p>
          <div className="mt-10 max-w-sm">
            <button className="w-full px-8 py-3 rounded-md bg-white text-blue-600 font-medium hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-600 focus:ring-white">Get Started</button>
          </div>
        </div>
      </div>
    `,
    features: `
      <div className="py-12 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">Our Features</h2>
            <p className="mt-4 max-w-2xl text-xl text-slate-600 dark:text-slate-300 mx-auto">Everything you need to streamline your workflow</p>
          </div>
          <div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <div className="h-12 w-12 rounded-md bg-blue-500 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-slate-900 dark:text-white">Easy Customization</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-300">Effortlessly customize every aspect of your project to match your brand and requirements.</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <div className="h-12 w-12 rounded-md bg-blue-500 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-slate-900 dark:text-white">Secure Payments</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-300">Implement secure payment processing with support for all major payment methods.</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <div className="h-12 w-12 rounded-md bg-blue-500 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-slate-900 dark:text-white">Advanced Analytics</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-300">Gain valuable insights with comprehensive analytics and reporting tools.</p>
            </div>
          </div>
        </div>
      </div>
    `,
  },

  // Alert and notification components
  alerts: {
    success: `
      <div className="rounded-md bg-green-50 dark:bg-green-900/30 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400 dark:text-green-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800 dark:text-green-300">Success!</h3>
            <div className="mt-2 text-sm text-green-700 dark:text-green-400">
              <p>Your changes have been saved successfully.</p>
            </div>
          </div>
        </div>
      </div>
    `,
    error: `
      <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400 dark:text-red-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Error!</h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-400">
              <p>There was an error processing your request. Please try again later.</p>
            </div>
          </div>
        </div>
      </div>
    `,
    warning: `
      <div className="rounded-md bg-amber-50 dark:bg-amber-900/30 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-amber-400 dark:text-amber-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">Warning!</h3>
            <div className="mt-2 text-sm text-amber-700 dark:text-amber-400">
              <p>This action will permanently delete this data. Please confirm that you want to proceed.</p>
            </div>
          </div>
        </div>
      </div>
    `,
    info: `
      <div className="rounded-md bg-blue-50 dark:bg-blue-900/30 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400 dark:text-blue-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Information</h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
              <p>This feature is currently in beta. Please provide feedback if you encounter any issues.</p>
            </div>
          </div>
        </div>
      </div>
    `,
    toast: `
      <div className="fixed top-4 right-4 max-w-sm w-full bg-white dark:bg-slate-800 shadow-lg rounded-lg pointer-events-auto ring-1 ring-slate-400/20 dark:ring-slate-600/40 overflow-hidden">
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <p className="text-sm font-medium text-slate-900 dark:text-white">Successfully saved!</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Your changes have been saved successfully.</p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button className="bg-white dark:bg-slate-800 rounded-md inline-flex text-slate-400 hover:text-slate-500 focus:outline-none">
                <span className="sr-only">Close</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    `,
  },

  // Modal dialogs
  modals: {
    simple: `
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 sm:p-0">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
        <div className="relative bg-white dark:bg-slate-800 rounded-lg max-w-lg w-full mx-auto shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">Modal Title</h3>
          </div>
          <div className="p-6">
            <p className="text-slate-600 dark:text-slate-300">This is the modal content where you can put any information or form elements.</p>
          </div>
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-end space-x-3">
            <button className="px-4 py-2 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">Cancel</button>
            <button className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">Confirm</button>
          </div>
        </div>
      </div>
    `,
    confirmation: `
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 sm:p-0">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
        <div className="relative bg-white dark:bg-slate-800 rounded-lg max-w-md w-full mx-auto shadow-xl overflow-hidden">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 dark:bg-red-900/30 rounded-full p-2">
                <svg className="h-6 w-6 text-red-600 dark:text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">Delete Item</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Are you sure you want to delete this item? This action cannot be undone.</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button className="px-4 py-2 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">Cancel</button>
              <button className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      </div>
    `,
    form: `
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 sm:p-0">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
        <div className="relative bg-white dark:bg-slate-800 rounded-lg max-w-lg w-full mx-auto shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">Edit Profile</h3>
          </div>
          <div className="p-6">
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
                <input type="text" id="name" name="name" className="w-full px-4 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email address</label>
                <input type="email" id="email" name="email" className="w-full px-4 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="about" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">About</label>
                <textarea id="about" name="about" rows="3" className="w-full px-4 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"></textarea>
              </div>
            </form>
          </div>
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-end space-x-3">
            <button className="px-4 py-2 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">Cancel</button>
            <button className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">Save Changes</button>
          </div>
        </div>
      </div>
    `,
  },

  // Table templates
  tables: {
    simple: `
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Title</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Edit</span></th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Active</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">Admin</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <a href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">Edit</a>
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <img className="h-10 w-10 rounded-full" src="https://randomuser.me/api/portraits/men/40.jpg" alt="" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-slate-900 dark:text-white">John Doe</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">john.doe@example.com</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-slate-900 dark:text-white">Frontend Developer</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Development</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Pending</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">Developer</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <a href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">Edit</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `,
    withPagination: `
      <div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Title</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Edit</span></th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
              {/* Table rows */}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <a href="#" className="relative inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700">Previous</a>
            <a href="#" className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700">Next</a>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of <span className="font-medium">97</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700">
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="relative inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">1</a>
                <a href="#" className="relative inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 bg-blue-50 dark:bg-blue-900/20 text-sm font-medium text-blue-600 dark:text-blue-400">2</a>
                <a href="#" className="relative inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">3</a>
                <span className="relative inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300">...</span>
                <a href="#" className="relative inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">8</a>
                <a href="#" className="relative inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">9</a>
                <a href="#" className="relative inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">10</a>
                <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700">
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </a>
              </nav>
            </div>
          </div>
        </div>
      </div>
    `,
    withSorting: `
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <div className="flex items-center cursor-pointer">
                  Name
                  <svg className="h-4 w-4 ml-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <div className="flex items-center cursor-pointer">
                  Title
                  <svg className="h-4 w-4 ml-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <div className="flex items-center cursor-pointer">
                  Status
                  <svg className="h-4 w-4 ml-1 transform rotate-180" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Edit</span></th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
            {/* Table rows */}
          </tbody>
        </table>
      </div>
    `,
  },

  // Loading states and spinners
  loaders: {
    spinner: `
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    `,
    dots: `
      <div className="flex justify-center items-center space-x-2">
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-75"></div>
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-150"></div>
      </div>
    `,
    skeleton: `
      <div className="space-y-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 animate-pulse"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6 animate-pulse"></div>
      </div>
    `,
    buttonLoading: `
      <button className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center justify-center" disabled>
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading...
      </button>
    `,
    progress: `
      <div className="w-full">
        <div className="bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
          <div className="bg-blue-600 h-2.5 rounded-full w-1/2"></div>
        </div>
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
          <div>50%</div>
          <div>Uploading...</div>
        </div>
      </div>
    `,
  },

  // Pagination components
  pagination: {
    simple: `
      <div className="flex items-center justify-center mt-6">
        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
          <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700">
            <span className="sr-only">Previous</span>
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </a>
          <a href="#" className="relative inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">1</a>
          <a href="#" className="relative inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 bg-blue-50 dark:bg-blue-900/20 text-sm font-medium text-blue-600 dark:text-blue-400">2</a>
          <a href="#" className="relative inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">3</a>
          <span className="relative inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300">...</span>
          <a href="#" className="relative inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">8</a>
          <a href="#" className="relative inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">9</a>
          <a href="#" className="relative inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">10</a>
          <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700">
            <span className="sr-only">Next</span>
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </a>
        </nav>
      </div>
    `,
    simplified: `
      <div className="flex items-center justify-between mt-6">
        <a href="#" className="inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700">
          <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Previous
        </a>
        <span className="text-sm text-slate-700 dark:text-slate-300">Page 2 of 10</span>
        <a href="#" className="inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700">
          Next
          <svg className="h-5 w-5 ml-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </a>
      </div>
    `,
  },

  // Special UI sections
  sections: {
    callToAction: `
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-indigo-100 max-w-2xl text-center">
            Join thousands of companies that trust our platform to power their business.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button className="px-6 py-3 rounded-md bg-white text-blue-600 font-medium hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-600 focus:ring-white shadow-md">
              Get Started
            </button>
            <button className="px-6 py-3 rounded-md border border-white text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-600 focus:ring-white">
              Learn More
            </button>
          </div>
        </div>
      </div>
    `,
    testimonialSlider: `
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
            What Our Customers Say
          </h2>
          <p className="mt-4 text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Don't just take our word for it. Hear what our customers have to say.
          </p>
        </div>
        <div className="mt-12 max-w-3xl mx-auto px-4">
          <div className="bg-white dark:bg-slate-800 shadow-xl rounded-2xl p-8 relative">
            <div className="text-xl text-slate-600 dark:text-slate-300 italic mb-6">
              "This platform has completely transformed how we operate. The ease of use, powerful features, and exceptional customer support have made it an invaluable tool for our team."
            </div>
            <div className="flex items-center">
              <img className="h-12 w-12 rounded-full object-cover" src="https://randomuser.me/api/portraits/women/32.jpg" alt="Avatar" />
              <div className="ml-4">
                <h4 className="text-lg font-semibold text-slate-900 dark:text-white">Jane Smith</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">CTO at Company</p>
              </div>
            </div>
            <div className="absolute top-6 right-8">
              <svg className="h-10 w-10 text-blue-100 dark:text-blue-900" fill="currentColor" viewBox="0 0 32 32">
                <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
              </svg>
            </div>
            <div className="flex justify-center mt-8">
              <button className="w-2 h-2 mx-1 rounded-full bg-blue-300 dark:bg-blue-700"></button>
              <button className="w-2 h-2 mx-1 rounded-full bg-blue-500"></button>
              <button className="w-2 h-2 mx-1 rounded-full bg-blue-300 dark:bg-blue-700"></button>
            </div>
          </div>
        </div>
      </div>
    `,
    stats: `
      <div className="bg-slate-50 dark:bg-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">Trusted by companies worldwide</h2>
            <p className="mt-4 text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">Our platform is trusted by companies of all sizes, from startups to Fortune 500 companies.</p>
          </div>
          <div className="mt-12">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white dark:bg-slate-700 pt-5 px-4 pb-6 sm:px-6 shadow-lg rounded-lg overflow-hidden">
                <div className="text-center">
                  <span className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">8,000+</span>
                  <p className="mt-2 text-lg font-medium text-slate-600 dark:text-slate-300">Customers</p>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-700 pt-5 px-4 pb-6 sm:px-6 shadow-lg rounded-lg overflow-hidden">
                <div className="text-center">
                  <span className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">3.5M+</span>
                  <p className="mt-2 text-lg font-medium text-slate-600 dark:text-slate-300">API Requests Daily</p>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-700 pt-5 px-4 pb-6 sm:px-6 shadow-lg rounded-lg overflow-hidden">
                <div className="text-center">
                  <span className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">99.99%</span>
                  <p className="mt-2 text-lg font-medium text-slate-600 dark:text-slate-300">Uptime</p>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-700 pt-5 px-4 pb-6 sm:px-6 shadow-lg rounded-lg overflow-hidden">
                <div className="text-center">
                  <span className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">24/7</span>
                  <p className="mt-2 text-lg font-medium text-slate-600 dark:text-slate-300">Support</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
    FAQ: `
      <div className="bg-white dark:bg-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">Frequently Asked Questions</h2>
            <p className="mt-4 text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Answers to the most commonly asked questions.
            </p>
          </div>
          <div className="mt-12 max-w-3xl mx-auto divide-y divide-slate-200 dark:divide-slate-700">
            <div className="py-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">How do I get started?</h3>
                <button className="text-blue-600 dark:text-blue-400">
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              <div className="mt-2 text-base text-slate-600 dark:text-slate-300">
                Getting started is easy! Simply sign up for an account, and our onboarding wizard will guide you through the process. You can be up and running in less than 5 minutes.
              </div>
            </div>
            <div className="py-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">Is there a free trial?</h3>
                <button className="text-blue-600 dark:text-blue-400">
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="py-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">What payment methods do you accept?</h3>
                <button className="text-blue-600 dark:text-blue-400">
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
    features: `
      <div className="py-16 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">Features That Set Us Apart</h2>
            <p className="mt-4 text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Everything you need to streamline your workflow and boost productivity.
            </p>
          </div>
          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="h-12 w-12 rounded-md bg-blue-500 flex items-center justify-center mb-4">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-slate-900 dark:text-white">Highly Customizable</h3>
                  <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
                    Tailor the platform to your specific needs with our flexible customization options.
                  </p>
                  <div className="mt-4">
                    <a href="#" className="text-base font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">
                      Learn more <span aria-hidden="true">&rarr;</span>
                    </a>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="h-12 w-12 rounded-md bg-blue-500 flex items-center justify-center mb-4">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-slate-900 dark:text-white">Lightning Fast</h3>
                  <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
                    Experience unparalleled speed with our optimized performance architecture.
                  </p>
                  <div className="mt-4">
                    <a href="#" className="text-base font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">
                      Learn more <span aria-hidden="true">&rarr;</span>
                    </a>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="h-12 w-12 rounded-md bg-blue-500 flex items-center justify-center mb-4">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-slate-900 dark:text-white">Enterprise Security</h3>
                  <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
                    Best-in-class security features to keep your data safe and compliant.
                  </p>
                  <div className="mt-4">
                    <a href="#" className="text-base font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">
                      Learn more <span aria-hidden="true">&rarr;</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
  },
};

// Typography presets with comprehensive options
const Typography = {
  heading1: "text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight",
  heading2: "text-3xl md:text-4xl font-bold tracking-tight",
  heading3: "text-2xl md:text-3xl font-semibold",
  heading4: "text-xl md:text-2xl font-semibold",
  subtitle: "text-xl text-slate-500 dark:text-slate-400",
  paragraph: "text-base text-slate-600 dark:text-slate-300",
  small: "text-sm text-slate-500 dark:text-slate-400",
  tiny: "text-xs text-slate-500 dark:text-slate-400",
  gradientHeadings: {
    blue: "bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600 font-bold",
    purple:
      "bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-600 font-bold",
    teal: "bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-emerald-600 font-bold",
    amber:
      "bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-600 font-bold",
    rose: "bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-pink-600 font-bold",
  },
  links: {
    default: "text-blue-600 dark:text-blue-400 hover:underline",
    subtle:
      "text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400",
    button:
      "px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 inline-block",
    underlined:
      "text-slate-900 dark:text-white border-b-2 border-blue-500 hover:border-blue-700",
  },
  lists: {
    unordered:
      "list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2",
    ordered:
      "list-decimal list-inside text-slate-600 dark:text-slate-300 space-y-2",
    custom: "space-y-2",
    iconList: "space-y-3",
  },
};

// Animation presets
const Animations = {
  fade: {
    in: "animate-fade-in",
    out: "animate-fade-out",
  },
  slide: {
    up: "animate-slide-up",
    down: "animate-slide-down",
    left: "animate-slide-left",
    right: "animate-slide-right",
  },
  scale: {
    in: "animate-scale-in",
    out: "animate-scale-out",
  },
  bounce: "animate-bounce",
  spin: "animate-spin",
  ping: "animate-ping",
  pulse: "animate-pulse",
  hover: {
    scale: "transition-transform duration-300 hover:scale-105",
    lift: "transition-transform duration-300 hover:-translate-y-1",
    glow: "transition-all duration-300 hover:shadow-md hover:shadow-blue-500/20",
  },
};

// Helper functions for UI generation
const UIUtils = {
  // Merge multiple classes with Tailwind Merge to avoid conflicts
  cn: (...classes) => {
    return twMerge(classes.filter(Boolean).join(" "));
  },

  // Generate random ID for form elements
  randomId: (prefix = "id") => {
    return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
  },

  // Get color scheme from theme
  getColorScheme: (theme, variant, type = "primary") => {
    const colorSystem = ColorSystem[type] || {};
    return (
      colorSystem[theme]?.[variant] ||
      colorSystem[Object.keys(colorSystem)[0]]?.[variant]
    );
  },

  // Function to generate a complete UI kit with consistent styling
  generateUIKit: (colorTheme = "blue", mode = "light") => {
    const primary = ColorSystem.primary[colorTheme] || ColorSystem.primary.blue;
    const neutral = ColorSystem.neutral[mode].slate;

    return {
      colors: {
        primary,
        neutral,
      },
      components: {
        button: buttonVariants({ variant: "primary", size: "md" }),
        secondaryButton: buttonVariants({ variant: "secondary", size: "md" }),
        outlineButton: buttonVariants({ variant: "outline", size: "md" }),
        input: inputVariants({ variant: "default", size: "md" }),
        card: cardVariants({
          variant: "default",
          padding: "md",
          rounded: "lg",
        }),
        badge: badgeVariants({ variant: "primary", size: "sm" }),
      },
      typography: Typography,
      animations: Animations,
    };
  },
};

// Export all UI components and utilities
export {
  ColorSystem,
  buttonVariants,
  inputVariants,
  cardVariants,
  badgeVariants,
  LayoutTemplates,
  Typography,
  Animations,
  UIUtils,
};

// Default export for the full UI system
export default {
  colors: ColorSystem,
  buttons: buttonVariants,
  inputs: inputVariants,
  cards: cardVariants,
  badges: badgeVariants,
  layouts: LayoutTemplates,
  typography: Typography,
  animations: Animations,
  utils: UIUtils,
};
