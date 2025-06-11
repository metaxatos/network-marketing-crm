# Network Marketing CRM

A modern CRM system designed specifically for network marketing professionals.

## 🚀 Live Demo

[https://ourteammlm.netlify.app](https://ourteammlm.netlify.app)

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Netlify account (for deployment)

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Network Marketing CRM

# Email (Optional)
RESEND_API_KEY=your_resend_api_key

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/metaxatos/network-marketing-crm.git
cd network-marketing-crm
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (see above)

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

### Deployment to Netlify

1. Fork this repository to your GitHub account

2. Log in to [Netlify](https://app.netlify.com)

3. Click "Add new site" → "Import an existing project"

4. Connect your GitHub account and select your forked repository

5. **Important**: Add environment variables in Netlify:
   - Go to Site settings → Environment variables
   - Add all the required environment variables from `.env.example`
   - For the OurTeam 2.0 Supabase project:
     - `NEXT_PUBLIC_SUPABASE_URL`: `https://utvasathtyasoxelnxuf.supabase.co`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Get from Supabase dashboard
     - `SUPABASE_SERVICE_ROLE_KEY`: Get from Supabase dashboard (Settings → API)

6. Deploy the site

### Troubleshooting

If you encounter authentication issues:

1. Visit `/debug-auth` to check environment variable configuration
2. Visit `/api/check-env` for API endpoint diagnostics
3. Ensure all required environment variables are set in Netlify
4. Check the [setup guide](./NETLIFY_ENV_SETUP.md) for detailed instructions

## 🏗️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Netlify
- **Email**: Resend (optional)

## 📁 Project Structure

```
src/
├── app/              # Next.js app directory
├── components/       # React components
├── lib/             # Utility functions and configurations
├── stores/          # Zustand state management
├── types/           # TypeScript type definitions
└── styles/          # Global styles
```

## 🔑 Key Features

- Contact management
- Email campaigns
- Landing page builder
- Training course system
- Team hierarchy visualization
- Analytics dashboard
- Multi-company support

## 🎯 Target Audience

Network marketers who are:
- Not technical (relationship builders, not software experts)
- Busy entrepreneurs juggling multiple responsibilities
- Mobile-first (always on the go)
- Motivated by growth and progress
- Team-oriented (success through helping others)

## 🎨 Design Principles

- **Celebration-focused**: Confetti animations for achievements
- **Mobile-first**: 44px minimum touch targets, one-thumb navigation
- **User-friendly**: Large, readable fonts (18px minimum)
- **Warm and welcoming**: Professional yet approachable design

## 📝 License

This project is proprietary software. All rights reserved.

## 🤝 Support

For issues or questions, please open an issue on GitHub or contact support.
