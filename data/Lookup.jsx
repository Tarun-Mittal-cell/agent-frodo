import dedent from "dedent";
export default {
  SUGGSTIONS: [
    "Create ToDo App in React",
    "Create Budget Track App",
    "Create Gym Managment Portal Dashboard",
    "Create Quizz App On History",
    "Create Login Signup Screen",
  ],
  HERO_HEADING: "What do you want to build?",
  HERO_DESC: "Prompt, run, edit, and deploy full-stack web apps.",
  INPUT_PLACEHOLDER: "What you want to build?",
  SIGNIN_HEADING: "Continue With Frodo.",
  SIGNIN_SUBHEADING:
    "To use Frodo you must log into an existing account or create one.",
  SIGNIn_AGREEMENT_TEXT:
    "By using Frodo, you agree to the collection of usage data for analytics.",
  DEFAULT_FILE: {
    "/public/index.html": {
      code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      // Helper script to fix image loading in preview
      document.addEventListener('DOMContentLoaded', function() {
        // Fix image loading paths
        document.addEventListener('error', function(e) {
          const target = e.target;
          if (target.tagName === 'IMG' && target.src) {
            // Try alternate paths for images if they fail to load
            if (target.src.includes('/images/') && !target.dataset.pathFixed) {
              target.dataset.pathFixed = true;
              const publicPath = '/public' + target.src.substring(target.src.indexOf('/images/'));
              console.log('Image failed to load, trying public path:', publicPath);
              target.src = publicPath;
            }
          }
        }, true);
      });
    </script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
    },
    "/App.css": {
      code: `
@tailwind base;
@tailwind components;
@tailwind utilities;`,
    },
    "/tailwind.config.js": {
      code: `
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`,
    },
    "/postcss.config.js": {
      code: `/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
  },
};
export default config;
`,
    },
    // Add default placeholder for public/images directory
    "/public/images/placeholder.jpg": {
      code: `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCAABAAEDAREAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACP/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AVMH/2Q==`,
      hidden: true,
    },
    // Add image utils to help with image loading
    "/imageUtils.js": {
      code: `// Simple utility to help with image loading in the preview
export const getImagePath = (path) => {
  // If path already starts with public, return as is
  if (path.startsWith('/public/')) {
    return path;
  }
  
  // If path starts with /images/, add public prefix
  if (path.startsWith('/images/')) {
    return \`/public\${path}\`;
  }
  
  // For other paths, return as is
  return path;
};

// Function to check if an image exists at a path
export const imageExists = async (path) => {
  try {
    const response = await fetch(path, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Function to get the first working image path from alternatives
export const getWorkingImagePath = async (originalPath) => {
  // Try original path first
  if (await imageExists(originalPath)) {
    return originalPath;
  }
  
  // Try with public prefix
  if (!originalPath.startsWith('/public/') && originalPath.includes('/images/')) {
    const publicPath = \`/public\${originalPath}\`;
    if (await imageExists(publicPath)) {
      return publicPath;
    }
  }
  
  // Try just the filename in public/images
  const filename = originalPath.split('/').pop();
  const fallbackPath = \`/public/images/\${filename}\`;
  if (await imageExists(fallbackPath)) {
    return fallbackPath;
  }
  
  // If all fails, return original path
  return originalPath;
};

export default {
  getImagePath,
  imageExists,
  getWorkingImagePath
};`,
    },
  },
  DEPENDANCY: {
    postcss: "^8",
    tailwindcss: "^3.4.1",
    autoprefixer: "^10.0.0",
    uuid4: "^2.0.3",
    "tailwind-merge": "^2.4.0",
    "tailwindcss-animate": "^1.0.7",
    "lucide-react": "^0.469.0",
    "react-router-dom": "^7.1.1",
    firebase: "^11.1.0",
    "@google/generative-ai": "^0.21.0",
    "date-fns": "^4.1.0",
    "react-chartjs-2": "^5.3.0",
    "chart.js": "^4.4.7",
    "file-saver": "^2.0.5",
    jszip: "^3.10.1",
  },
  PRICING_DESC:
    "Start with a free account to speed up your workflow on public projects or boost your entire team with instantly-opening production environments.",
  PRICING_OPTIONS: [
    {
      name: "Basic",
      tokens: "50K",
      value: 50000,
      desc: "Ideal for hobbyists and casual users for light, exploratory use.",
      price: 4.99,
    },
    {
      name: "Starter",
      tokens: "120K",
      value: 120000,
      desc: "Designed for professionals who need to use Frodo a few times per week.",
      price: 9.99,
    },
    {
      name: "Pro",
      tokens: "2.5M",
      value: 2500000,
      desc: "Designed for professionals who need to use Frodo a few times per week.",
      price: 19.99,
    },
    {
      name: "Unlimted (License)",
      tokens: "Unmited",
      value: 999999999,
      desc: "Designed for professionals who need to use Frodo a few times per week.",
      price: 49.99,
    },
  ],
};
