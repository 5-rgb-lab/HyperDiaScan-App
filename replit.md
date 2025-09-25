# HyperDiaScan - Food Analyzer for Health Management

## Overview
HyperDiaScan is a modern web application designed to help users with diabetes and hypertension make informed food choices through AI-powered nutrition label analysis. The app features instant OCR scanning, personalized health assessments, and comprehensive scan history tracking.

## Recent Changes (January 2025)
- ✅ Set up Replit environment with proper configuration
- ✅ Fixed Firebase API key security by moving to environment variables
- ✅ Created modern landing page with gradients and professional design
- ✅ Enhanced authentication form with improved styling
- ✅ Redesigned navigation with fixed bottom positioning and active states
- ✅ Added daily summary dashboard with progress tracking
- ✅ Implemented rotating health tips with smooth animations
- ✅ Created quick actions section for easy access to core features
- ✅ Improved overall UI with modern design patterns and Inter font
- ✅ Configured deployment for production use
- ✅ Enhanced responsive design for mobile and desktop

## User Preferences
- **Design Style**: Modern, clean, professional healthcare aesthetic
- **Color Scheme**: Medical blues and health greens with gradients
- **Font**: Inter for better readability and professional appearance
- **Interactions**: Smooth transitions, hover effects, and micro-animations
- **Navigation**: Fixed bottom navigation for mobile-first experience

## Project Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with Vite
- **Styling**: TailwindCSS with custom healthcare color palette
- **UI Components**: Custom component library with Radix UI primitives
- **Icons**: Lucide React for consistent iconography
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React hooks with Context API for authentication

### Backend (Express + TypeScript)
- **Server**: Express.js with TypeScript
- **Authentication**: Firebase Auth integration
- **Database**: Firebase Firestore for real-time data
- **Development**: TSX for hot reloading and development

### Key Features
1. **Landing Page**: Modern welcome experience with feature highlights
2. **Authentication**: Secure sign-in/sign-up with Firebase
3. **Dashboard**: Daily summary, health insights, and quick actions
4. **Scanner**: OCR-powered nutrition label analysis (planned)
5. **History**: Comprehensive scan tracking and filtering
6. **Profile**: User management and health condition settings

### Environment Configuration
- Firebase credentials stored as Replit secrets
- Development server configured for Replit proxy
- Production deployment ready with auto-scaling

### File Structure
```
client/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Route components
│   ├── contexts/      # React contexts
│   ├── lib/          # Utilities and configurations
│   └── hooks/        # Custom React hooks
server/
├── index.ts          # Express server entry point
├── routes.ts         # API route definitions
└── storage.ts        # Data storage interface
shared/
└── schema.ts         # Shared type definitions
```

### Development Workflow
- Start development server: `npm run dev`
- Build for production: `npm run build`
- Deploy to production: Use Replit's publish feature

## Next Steps
- Implement OCR scanning functionality
- Add health analytics and insights
- Create user onboarding flow
- Add data export capabilities
- Implement push notifications for health reminders