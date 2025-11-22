import React, { Suspense } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AdminProvider, useAdmin } from "@/admin/context/AdminContext";
import { AppHeader, Navigation } from "@/components/layout";
import FullScreenLoader from "@/components/ui/FullScreenLoader";
import { AuthForm } from "@/components/auth";

import Home from "@/pages/Home";
import Scanner from "@/pages/Scanner";
import History from "@/pages/History";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/not-found";

// Lazy load admin components
const AdminLayout = React.lazy(() => import("@/admin/components/AdminLayout"));
const Dashboard = React.lazy(() => import("@/admin/pages/Dashboard"));
const Users = React.lazy(() => import("@/admin/pages/Users"));
const AuditLogs = React.lazy(() => import("@/admin/pages/AuditLogs"));

/* ------------------------------------------------------------
  ROUTER — Includes guards for admin routes
------------------------------------------------------------ */
function Router({ isAdmin }: { isAdmin: boolean }) {
  return (
    <Switch>
      {/* User Routes first */}
      <Route path="/" component={Home} />
      <Route path="/scanner" component={Scanner} />
      <Route path="/history" component={History} />
      <Route path="/profile" component={Profile} />

      {/* Admin Routes */}
      <Route path="/admin">{() => (isAdmin ? <Dashboard /> : <NotFound />)}</Route>
      <Route path="/admin/users">{() => (isAdmin ? <Users /> : <NotFound />)}</Route>
      <Route path="/admin/audit-logs">{() => (isAdmin ? <AuditLogs /> : <NotFound />)}</Route>

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

/* ------------------------------------------------------------
  MAIN APP LOGIC
------------------------------------------------------------ */
function AuthenticatedApp() {
  const { user, userProfile, loading, signOut } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const [location, setLocation] = useLocation();

  // Ensure we never call setLocation during render — perform redirects in an effect
  React.useEffect(() => {
    if (!loading && user && isAdmin && !location.startsWith('/admin')) {
      setLocation('/admin');
    }
  }, [loading, user, isAdmin, location, setLocation]);

  // If a regular (non-admin) user signs in while the app is on an admin path,
  // redirect them to the app home to avoid showing NotFound for admin-only routes.
  React.useEffect(() => {
    if (!loading && user && !isAdmin && location.startsWith('/admin')) {
      setLocation('/');
    }
  }, [loading, user, isAdmin, location, setLocation]);

  // Block UI until auth + admin check finishes
  if (loading || adminLoading) return <FullScreenLoader message="" />;

  // If not logged in, show AuthForm
  if (!user) return <AuthForm />;

  // Admin users: prioritize admin dashboard
  if (isAdmin) {
    return (
      <Suspense fallback={<FullScreenLoader message="Loading admin UI..." />}>
        <AdminLayout>
          <Router isAdmin={isAdmin} />
        </AdminLayout>
      </Suspense>
    );
  }

  // Regular user dashboard
  const handleProfileClick = () => setLocation("/profile");

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        user={{
          name: user?.displayName || userProfile?.name || "User",
          email: user?.email || "",
          photoURL: user?.photoURL || undefined,
        }}
        onProfileClick={handleProfileClick}
        onSignOut={signOut}
      />

      <main className="container mx-auto px-4 py-6 pb-24">
        <Router isAdmin={isAdmin} />

      </main>

      <Navigation />
    </div>
  );
}

/* ------------------------------------------------------------
  ROOT APP WRAPPER
------------------------------------------------------------ */
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
