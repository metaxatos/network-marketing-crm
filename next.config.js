/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  
  // Configure CSP for both development and production
  async headers() {
    const cspPolicy = process.env.NODE_ENV === 'development' || process.env.DISABLE_CSP === 'true'
      ? "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; script-src * 'unsafe-inline' 'unsafe-eval'; object-src 'none';"
      : `
          default-src 'self';
          script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com;
          style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
          style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com;
          img-src 'self' blob: data: https:;
          font-src 'self' data: https://fonts.gstatic.com;
          connect-src 'self' https://*.supabase.co https://*.supabase.io wss://*.supabase.co wss://*.supabase.io;
          frame-src 'self' https://js.stripe.com;
          object-src 'none';
          media-src 'self' blob:;
          worker-src 'self' blob:;
        `.replace(/\s+/g, ' ').trim()

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspPolicy,
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
  
  // Experimental features for Next.js 15
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001', 'localhost:3002', 'ourteammlm.netlify.app', 'ourteam.gr'],
    },
    optimizePackageImports: ['@supabase/supabase-js'],
  },
  
  // Optimize CSS loading
  modularizeImports: {
    '@supabase/supabase-js': {
      transform: '@supabase/supabase-js/{{member}}',
    },
  },
  
  // Ensure proper routing
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  
  // Webpack configuration to handle server-only modules
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'fs' module on the client-side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      }
    }
    return config
  },
  
  // Add output configuration for Netlify
  ...(process.env.NETLIFY && { output: 'standalone' }),
}

module.exports = nextConfig
