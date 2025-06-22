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
          script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com https://www.youtube.com https://player.vimeo.com https://vimeo.com https://f.vimeocdn.com https://fast.wistia.com https://fast.wistia.net;
          style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://player.vimeo.com https://vimeo.com https://fast.wistia.com;
          style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com https://player.vimeo.com https://vimeo.com https://fast.wistia.com;
          img-src 'self' blob: data: https: https://*.vimeocdn.com https://vimeo.com https://player.vimeo.com https://i.vimeocdn.com https://*.wistia.com https://*.wistia.net;
          font-src 'self' data: https://fonts.gstatic.com https://player.vimeo.com https://fast.wistia.com;
          connect-src 'self' https://*.supabase.co https://*.supabase.io wss://*.supabase.co wss://*.supabase.io https://vimeo.com https://player.vimeo.com https://*.vimeocdn.com https://*.wistia.com https://*.wistia.net;
          frame-src 'self' https://js.stripe.com https://www.youtube.com https://player.vimeo.com https://vimeo.com https://fast.wistia.com https://fast.wistia.net;
          object-src 'none';
          media-src 'self' blob: https: https://*.vimeocdn.com https://vimeo.com https://player.vimeo.com https://*.wistia.com https://*.wistia.net;
          worker-src 'self' blob: https://player.vimeo.com https://fast.wistia.com;
          child-src 'self' https://player.vimeo.com https://vimeo.com https://fast.wistia.com;
        `.replace(/\s+/g, ' ').trim()

    // CSP Monitoring: Enable report-only mode to catch edge-case violations
    // Set CSP_REPORT_ONLY=true in environment to enable 24h monitoring
    const cspHeaderName = process.env.CSP_REPORT_ONLY === 'true' 
      ? 'Content-Security-Policy-Report-Only'
      : 'Content-Security-Policy'

    // Add report URI if monitoring is enabled
    const finalPolicy = process.env.CSP_REPORT_ONLY === 'true'
      ? `${cspPolicy}; report-uri /api/csp-violations`
      : cspPolicy

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: cspHeaderName,
            value: finalPolicy,
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ],
      },
    ]
  },
  
  // Add image domains for Vimeo
  images: {
    domains: ['i.vimeocdn.com', 'vimeo.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.vimeo.com',
      },
      {
        protocol: 'https',
        hostname: '**.vimeocdn.com',
      },
    ],
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
        net: false,
        tls: false,
      }
    }
    
    // Ensure React is properly resolved
    config.resolve.alias = {
      ...config.resolve.alias,
      'react/jsx-dev-runtime': require.resolve('react/jsx-dev-runtime'),
      'react/jsx-runtime': require.resolve('react/jsx-runtime'),
    }
    
    return config
  },
  
  // Netlify handles the output configuration automatically
}

module.exports = nextConfig
