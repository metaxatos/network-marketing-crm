/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
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
          style-src 'self' 'unsafe-inline';
          img-src 'self' blob: data: https:;
          font-src 'self' data:;
          connect-src 'self' https://*.supabase.co https://*.supabase.io;
          frame-src 'self' https://js.stripe.com;
          object-src 'none';
        `.replace(/\s+/g, ' ').trim()

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspPolicy,
          },
        ],
      },
    ]
  },
  
  // Remove custom webpack devtool configuration to avoid performance issues
  
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
  
  // Add output configuration for Netlify
  ...(process.env.NETLIFY && { output: 'standalone' }),
}

module.exports = nextConfig 