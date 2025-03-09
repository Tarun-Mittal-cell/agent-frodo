// next.config.mjs
const nextConfig = {
  images: {
    domains: [], // Add specific domains if needed
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "**",
        pathname: "/**",
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24,
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: false,
  },
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  experimental: {
    scrollRestoration: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        "fs/promises": false,
        child_process: false,
        net: false,
        tls: false,
        https: false,
        http: false,
        path: false,
        os: false,
        util: false,
        stream: false,
        buffer: false,
        zlib: false,
        url: false,
        querystring: false,
        readline: false,
        crypto: false,
      };
    }

    config.performance = {
      ...config.performance,
      maxAssetSize: 2 * 1024 * 1024,
      maxEntrypointSize: 2 * 1024 * 1024,
    };

    return config;
  },
  async headers() {
    try {
      return [
        {
          source: "/(.*)",
          headers: [
            { key: "X-Content-Type-Options", value: "nosniff" },
            { key: "X-Frame-Options", value: "DENY" },
            { key: "X-XSS-Protection", value: "1; mode=block" },
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
    } catch (error) {
      console.error("Error in headers configuration:", error);
      return [];
    }
  },
  serverRuntimeConfig: {
    PROJECT_ROOT: process.cwd(),
  },
};

export default nextConfig;
