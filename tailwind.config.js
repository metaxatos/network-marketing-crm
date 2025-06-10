/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm and friendly color palette from MegaDesign
        'text-primary': '#2D3748',       // Main headings
        'text-secondary': '#4A5568',     // Body text
        'text-light': '#718096',         // Secondary info
        'text-white': '#FFFFFF',         // On colored backgrounds

        // Action Colors - Vibrant & Friendly
        'action-teal': '#4ECDC4',        // Contact/Communication
        'action-coral': '#FF6B6B',       // Follow-ups/Urgent
        'action-purple': '#A78BFA',      // Meetings/Events
        'action-golden': '#FFD93D',      // Achievements/Training
        'action-green': '#4ADE80',       // Success/Complete
        'action-blue': '#60A5FA',        // Information/Links

        // Background Colors
        'bg-white': '#FFFFFF',           // Cards
        'bg-soft': '#FAFBFC',           // Subtle backgrounds
        'bg-hover': '#F7F9FB',          // Hover states

        // Legacy color compatibility
        primary: {
          400: '#64748B', // Light Slate
          500: '#475569', // Medium Slate
          600: '#334155', // Dark Slate
          700: '#1E293B', // Navy
          900: '#0F172A', // Deep Navy
        },
        action: {
          primary: '#A78BFA',   // Updated to action-purple
          hover: '#8B5CF6',     // Darker purple for hover
          success: '#4ADE80',   // Updated to action-green
          warning: '#FF6B6B',   // Updated to action-coral
        },
        bg: {
          primary: '#FFFFFF',    // White - Cards
          secondary: '#F8FAFC',  // Off-white - Page background
          tertiary: '#F1F5F9',   // Light gray - Sections
          hover: '#E2E8F0',      // Hover backgrounds
        },
        accent: {
          gold: '#FFD93D',       // Updated to action-golden
          purple: '#A78BFA',     // Updated to action-purple
          blue: '#60A5FA',       // Updated to action-blue
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#4ADE80', // Updated to match action-green
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        warm: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        }
      },
      scale: {
        '102': '1.02',
        '105': '1.05',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Poppins', 'Inter', 'sans-serif'], // Updated to Poppins for headers
      },
      fontSize: {
        // Updated font sizes from MegaDesign for better readability
        'xs': ['13px', { lineHeight: '16px' }],      // Small labels
        'sm': ['15px', { lineHeight: '20px' }],      // Secondary text
        'base': ['17px', { lineHeight: '24px' }],    // Body text (larger for readability)
        'lg': ['20px', { lineHeight: '28px' }],      // Emphasized text
        'xl': ['26px', { lineHeight: '32px' }],      // Section headers
        '2xl': ['34px', { lineHeight: '40px' }],     // Page headers
        '3xl': ['42px', { lineHeight: '48px' }],     // Hero text
        '4xl': ['48px', { lineHeight: '56px' }],
      },
      spacing: {
        // Touch-friendly spacing from MegaDesign
        'touch': '44px',
        'touch-lg': '56px',
        'touch-xl': '64px',
        // MegaDesign spacing system
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
      },
      borderRadius: {
        // Friendly border radius from MegaDesign
        'sm': '8px',      // Small elements
        'DEFAULT': '12px', // Buttons, inputs
        'md': '12px',     // Buttons, inputs
        'lg': '16px',     // Cards
        'xl': '24px',     // Feature cards
        '2xl': '32px',
        'full': '50%',    // Circular elements
      },
      boxShadow: {
        // Soft, colorful shadows from MegaDesign
        'sm': '0 2px 8px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 16px 0 rgba(0, 0, 0, 0.08)',
        'lg': '0 8px 24px 0 rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        // Colored shadows for action cards
        'colored': '0 8px 24px -4px',
        // Legacy shadows for compatibility
        'soft': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'medium': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'large': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        // Smooth & Pleasant animations from MegaDesign
        'bounce-gentle': 'bounce 1s ease-in-out 2',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'celebration': 'celebration 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        celebration: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200px 0' },
          '100%': { backgroundPosition: 'calc(200px + 100%) 0' },
        },
      },
      transitionTimingFunction: {
        // Smooth transitions from MegaDesign
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [],
} 