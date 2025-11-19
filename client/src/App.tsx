import React, { useState, Suspense } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AdminProvider } from "@/admin/context/AdminContext";
import { AppHeader, Navigation } from "@/components/layout";
import { AuthForm, LandingPage } from "@/components/auth";
import Home from "@/pages/Home";
import Scanner from "@/pages/Scanner";
import History from "@/pages/History";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/not-found";
import { Loader2 } from "lucide-react";

// Lazy load admin components
const AdminLayout = React.lazy(() => import('@/admin/components/AdminLayout'));
const Dashboard = React.lazy(() => import('@/admin/pages/Dashboard'));
const Users = React.lazy(() => import('@/admin/pages/Users'));
const AuditLogs = React.lazy(() => import('@/admin/pages/AuditLogs'));

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/scanner" component={Scanner} />
      <Route path="/history" component={History} />
      <Route path="/profile" component={Profile} />
      
      {/* Admin Routes (explicit top-level routes so subpaths match) */}
      <Route path="/admin">
        {() => (
          <Suspense fallback={<div>Loading...</div>}>
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          </Suspense>
        )}
      </Route>

      <Route path="/admin/users">
        {() => (
          <Suspense fallback={<div>Loading...</div>}>
            <AdminLayout>
              <Users />
            </AdminLayout>
          </Suspense>
        )}
      </Route>

      <Route path="/admin/audit-logs">
        {() => (
          <Suspense fallback={<div>Loading...</div>}>
            <AdminLayout>
              <AuditLogs />
            </AdminLayout>
          </Suspense>
        )}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function AuthenticatedApp() {
  const { user, userProfile, loading, signOut } = useAuth();
  const [location] = useLocation();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-6">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-900"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>
          <div
            className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-500 animate-spin"
            style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
          ></div>
          <div
            className="absolute inset-4 rounded-full border-4 border-transparent border-t-teal-500 animate-spin"
            style={{ animationDuration: '1s' }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-10 h-10 heartbeat"
              viewBox="0 0 512 512"
              fill="url(#grad1)"
            >
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4ef2c3" />
                  <stop offset="100%" stopColor="#3aa9ff" />
                </linearGradient>
              </defs>
              <path d="M496 232h-73.4l-40.9-102.4c-4.8-12.1-16.5-19.6-29.4-19.6s-24.5 7.6-29.3 19.6l-71.5 179.2-45.8-91.7c-5.3-10.5-15.9-17.1-27.7-17.1-11.8 0-22.4 6.6-27.7 17.2l-37.7 75.1H16c-8.8 0-16 7.2-16 16s7.2 16 16 16h117.6c12 0 22.8-6.9 28-17.8l23.8-47.4 46 92c5.2 10.3 15.5 16.9 27.1 17.1h.6c11.4 0 21.8-6.7 26.9-17.4l70.9-177.2 27.4 68.6c4.8 12.1 16.5 19.6 29.4 19.6H496c8.8 0 16-7.2 16-16s-7.2-16-16-16z" />
            </svg>
          </div>
        </div>
      </div>

    );
  }

  if (!user) {
    return <AuthForm />;
  }

  const handleProfileClick = () => {
    // Navigate to profile using wouter
    window.history.pushState({}, '', '/profile');
  };

  // If the current path is an admin route, render only the admin Router
  if (location.startsWith('/admin')) {
    return <Router />;
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader 
        user={{
          name: user?.displayName || userProfile?.name || 'User',
          email: user?.email || '',
          photoURL: user?.photoURL || undefined
        }}
        onProfileClick={handleProfileClick}
        onSignOut={signOut}
      />
      
      <main className="container mx-auto px-4 py-6 pb-24">
        <Router />
      </main>
      
      <Navigation />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AdminProvider>
            <AuthenticatedApp />
          </AdminProvider>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;