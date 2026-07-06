import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// Security headers - CSP is strict in production, relaxed in dev for HMR/source maps
const securityHeaders = [
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  ...(isProd
    ? [
        {
          key: "Content-Security-Policy",
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://*.clerk.accounts.dev",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com https://img.clerk.com https://*.clerk.com",
            "font-src 'self' data:",
            "connect-src 'self' https://*.pusher.com wss://*.pusher.com https://*.clerk.accounts.dev https://api.clerk.com https://*.public.blob.vercel-storage.com",
            "frame-src 'self' https://challenges.cloudflare.com https://*.clerk.accounts.dev",
            "worker-src 'self' blob:",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "upgrade-insecure-requests",
          ].join("; "),
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  async headers() {
    // Only apply security headers in production — they interfere with Turbopack HMR in dev
    if (!isProd) return [];

    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
