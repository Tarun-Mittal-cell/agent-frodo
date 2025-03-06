// next.config.mjs
const nextConfig = {
  images: {
    domains: [
      // Fallback option for any domains that might be missed in remotePatterns
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        pathname: "/**",
      },
      // This is a wildcard pattern that allows ALL domains - critical for image generation
      {
        protocol: "http",
        hostname: "**",
        pathname: "/**",
      },
    ],
    // Optimized image sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Increased caching duration for better performance
    minimumCacheTTL: 60 * 60 * 24, // 24 hours
    // Format optimization - only allowed formats
    formats: ["image/avif", "image/webp"],
    // Allow SVG images
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Disable the unoptimized option to ensure all images go through optimization
    unoptimized: false,
  },
  // Performance optimizations
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  experimental: {
    // Only include stable experimental features
    scrollRestoration: true,
    // Remove potentially problematic experimental features
    // optimizeServerReact: true, // This might cause issues in newer Next.js versions
  },
  // Add custom headers to improve security and performance
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
      {
        source: "/(.*).(jpg|jpeg|png|webp|avif|ico|svg)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  // Configure webpack to prevent issues with large files
  webpack: (config) => {
    // Increase size limit for images
    config.performance = {
      ...config.performance,
      maxAssetSize: 2 * 1024 * 1024, // 2MB - increased from 1MB
      maxEntrypointSize: 2 * 1024 * 1024, // 2MB - increased from 1MB
    };

    // Optimize asset loading
    if (config.module) {
      config.module.rules.push({
        test: /\.(jpe?g|png|svg|gif|webp|avif)$/i,
        use: [
          {
            loader: "image-webpack-loader",
            options: {
              mozjpeg: {
                progressive: true,
                quality: 80,
              },
              optipng: {
                enabled: true,
              },
              pngquant: {
                quality: [0.65, 0.9],
                speed: 4,
              },
              gifsicle: {
                interlaced: false,
              },
              webp: {
                quality: 80,
              },
            },
          },
        ],
      });
    }

    return config;
  },
};

export default nextConfig;
