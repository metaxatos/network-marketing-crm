/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  
  // Disable CSP in development mode
  async headers() {
    if (process.env.NODE_ENV === 'development' || process.env.DISABLE_CSP === 'true') {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'Content-Security-Policy',
              value: "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; script-src * 'unsafe-inline' 'unsafe-eval'; object-src 'none';",
            },
          ],
        },
      ]
    }
    return []
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