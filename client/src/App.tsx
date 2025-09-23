import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AppHeader from "@/components/AppHeader";
import Navigation from "@/components/Navigation";
import AuthForm from "@/components/AuthForm";
import Home from "@/pages/Home";
import Scanner from "@/pages/Scanner";
import History from "@/pages/History";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/not-found";
import { Loader2 } from "lucide-react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/scanner" component={Scanner} />
      <Route path="/history" component={History} />
      <Route path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthenticatedApp() {
  const { user, userProfile, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading HyperDiaScan...</p>
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

  return (
    <div className="min-h-screen bg-background">
      <AppHeader 
        user={{
          name: user.displayName || userProfile?.name || 'User',
          email: user.email || '',
          photoURL: user.photoURL || undefined
        }}
        onProfileClick={handleProfileClick}
        onSignOut={signOut}
      />
      
      <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
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
          <AuthenticatedApp />
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
