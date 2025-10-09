# HyperDiaScan - Food Analyzer for Health Management

## Overview
HyperDiaScan is a modern web application designed to help users with diabetes and hypertension make informed food choices through AI-powered nutrition label analysis. The app features instant OCR scanning, personalized health assessments, and comprehensive scan history tracking.

## Recent Changes (October 2025)
- ✅ Integrated Cohere AI chatbot with multi-turn conversation support and medical disclaimers
- ✅ Implemented product naming functionality for scanned items in history
- ✅ Created comprehensive admin login system with role-based access control
- ✅ Built admin dashboard with user statistics and activity tracking
- ✅ Added activity logging system for user actions (login, scans, deletions)
- ✅ Implemented brute-force protection and session timeout for admin access
- ✅ Created secure admin API endpoints with Firebase Admin SDK
- ✅ Set up Firebase Admin authentication with role verification
- ✅ Enhanced security with admin middleware and route protection
- ✅ Fixed bottom navigation positioning with proper content padding

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
- **Authentication**: Firebase Auth + Firebase Admin SDK for role verification
- **Database**: Firebase Firestore for real-time data
- **AI Integration**: Cohere API (command-r-08-2024) for health assistant
- **Activity Logging**: Comprehensive tracking of user actions and scans
- **Admin Security**: JWT verification, rate limiting, session management
- **Development**: TSX for hot reloading and development

### Key Features
1. **Landing Page**: Modern welcome experience with feature highlights
2. **Authentication**: Secure sign-in/sign-up with Firebase
3. **Dashboard**: Daily summary, health insights, and quick actions
4. **Scanner**: OCR-powered nutrition label analysis with custom product naming
5. **History**: Comprehensive scan tracking and filtering
6. **Profile**: User management and health condition settings
7. **Chat**: AI-powered health assistant using Cohere (command-r-08-2024)
8. **Admin Portal**: Secure admin system with:
   - Role-based access control (admin/user roles)
   - Activity logging and monitoring
   - User management dashboard
   - Real-time statistics and analytics
   - Brute-force protection (5 attempts, 15-min lockout)
   - Session timeout (15 minutes of inactivity)
   - Protected admin routes with Firebase Admin SDK

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
│   │   └── admin/     # Admin portal pages
│   ├── contexts/      # React contexts
│   ├── lib/          # Utilities and configurations
│   └── hooks/        # Custom React hooks
server/
├── index.ts          # Express server entry point
├── routes.ts         # API route definitions (includes admin routes)
├── storage.ts        # Data storage interface
├── lib/
│   ├── firebase.ts   # Firebase Admin SDK setup
│   ├── activityLogger.ts  # Activity logging service
│   └── openai.ts     # Cohere AI integration
└── middleware/
    └── adminAuth.ts  # Admin authentication middleware
shared/
└── schema.ts         # Shared type definitions
```

### Development Workflow
- Start development server: `npm run dev`
- Build for production: `npm run build`
- Deploy to production: Use Replit's publish feature

## Admin System Setup

### Creating an Admin User
To create an admin user, manually set the `role` field to `admin` in Firebase Firestore:
1. Go to Firebase Console → Firestore Database
2. Navigate to the `users` collection
3. Find or create a user document
4. Add/update field: `role` = `admin`
5. Admin can now access `/admin` route

### Admin Features
- **Dashboard**: Real-time stats (users, scans, activity)
- **Activity Logs**: Track all user actions with search/filter
- **User Management**: View and manage all registered users
- **Security**: Brute-force protection, session timeout, role verification
- **Analytics**: Users by condition (diabetes/hypertension)

### Admin API Endpoints
- `POST /api/admin/login` - Admin authentication (rate-limited)
- `GET /api/admin/stats` - Dashboard statistics (protected)
- `GET /api/admin/logs` - Activity logs with filters (protected)
- `DELETE /api/admin/logs/:id` - Delete activity log (protected)
- `GET /api/admin/users` - List all users (protected)

## Next Steps
- Complete admin logs viewer with advanced search and export (CSV/XLSX)
- Implement user management features in admin dashboard
- Add admin settings panel
- Implement OCR scanning functionality with Tesseract.js
- Add health analytics and insights visualization
- Create user onboarding flow
- Implement push notifications for health reminders