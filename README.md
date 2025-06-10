# Network Marketing CRM 🌟

A celebration-focused, user-friendly CRM designed specifically for network marketers. Built with simplicity and success in mind.

## 🎯 Project Vision

**"Make network marketing feel as simple as texting a friend"**

This CRM strips away complexity and focuses on what matters most:
- 👥 **Managing relationships** (contacts)
- ✉️ **Staying in touch** (simple email templates)
- 🎓 **Learning & growing** (bite-sized training)

## ✨ Key Features

### 🎉 Celebration-Focused Design
- Confetti animations for achievements
- Progress celebrations and milestones
- Encouraging, never overwhelming interface

### 📱 Mobile-First Experience
- 44px minimum touch targets
- One-thumb navigation
- Works perfectly offline

### 🎨 User-Friendly Interface
- Large, readable fonts (18px minimum)
- Warm, welcoming color palette
- Zero learning curve design

## 🛠 Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom design system
- **TypeScript**: Full type safety
- **State Management**: Zustand (planned)
- **Backend**: Supabase (planned)
- **Email**: Resend API (planned)
- **Deployment**: Netlify

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd network-marketing-crm
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Environment Variables

Create a `.env.local` file with:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email
RESEND_API_KEY=your_resend_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Network Marketing CRM"
```

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run Jest tests
- `npm run test:e2e` - Run Playwright E2E tests

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   └── globals.css     # Global styles
├── components/         # Reusable UI components
├── lib/               # Utility functions
├── types/             # TypeScript type definitions
├── actions/           # Server actions (planned)
└── stores/            # Zustand stores (planned)
```

## 🎨 Design System

### Color Palette
- **Primary**: Soft, trusting blues (#3b82f6)
- **Success**: Energizing greens (#22c55e)
- **Celebration**: Warm golds (#f59e0b)
- **Warm**: Professional grays (#78716c)

### Typography
- **Font**: Inter (Google Fonts)
- **Minimum size**: 18px for body text
- **Touch targets**: 44px minimum

### Components
- **Buttons**: Celebration animations on interaction
- **Cards**: Soft shadows with hover effects
- **Forms**: Large, touch-friendly inputs
- **Navigation**: Bottom-fixed mobile navigation

## 🎯 Target Audience

**Network marketers who are:**
- Not technical (relationship builders, not software experts)
- Busy entrepreneurs juggling multiple responsibilities
- Mobile-first (always on the go)
- Motivated by growth and progress
- Team-oriented (success through helping others)

## 🌟 User Experience Principles

### Emotional Goals
Users should feel:
- ✅ **Confident**: "I know exactly what to do next"
- ✅ **Supported**: "The app is helping me succeed"
- ✅ **Accomplished**: "Look at all I've done today!"
- ✅ **Connected**: "My relationships are growing"

### What Users Never Feel
- ❌ Overwhelmed by options
- ❌ Confused by terminology
- ❌ Ashamed of inactivity
- ❌ Lost in navigation

## 🚀 Deployment

This app is configured for deployment on Netlify.

### Prerequisites
- GitHub account
- Netlify account
- Supabase project
- Resend API key

### Quick Deploy

1. **Fork this repository**
2. **Connect to Netlify**
   - Go to [Netlify](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Choose GitHub and select your repository
3. **Configure build settings**
   - Build command: `npm run build`
   - Publish directory: `.next`
4. **Set environment variables**
   - Add all variables from `.env.example`
   - Use your production values
5. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete

### Manual Deployment

For more control over the deployment process:

```bash
# Build for production
npm run build

# Test production build locally
npm run start
```

## 🔮 Upcoming Features

### Phase 1: Foundation ✅
- [x] Project setup and configuration
- [x] Design system and UI components
- [x] Basic page structure

### Phase 2: Core Features (Next)
- [ ] User authentication with Supabase
- [ ] Contact management system
- [ ] Dashboard with metrics
- [ ] Simple email templates

### Phase 3: Advanced Features
- [ ] Training video system
- [ ] Landing page builder
- [ ] Analytics and reporting
- [ ] Mobile app (PWA)

## 🤝 Contributing

This project follows the principle of **celebration over administration**. Every feature should:

1. **Reduce complexity** for the end user
2. **Celebrate achievements** with animations/feedback
3. **Use large, touch-friendly** interface elements
4. **Provide clear next steps** at all times

## 📄 License

This project is private and proprietary.

---

**Built with ❤️ for network marketers who want to focus on relationships, not software.**
