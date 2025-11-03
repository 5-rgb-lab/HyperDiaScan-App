import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { onAuthChange, signInWithEmail, signUpWithEmail, signOut, getUserProfile, updateUserProfile } from '@/lib/auth';
import { UserProfile } from '@shared/schema';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, profile?: Partial<UserProfile>) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profile: UserProfile) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    try {
      await signInWithEmail(email, password);
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    }
  };

  const handleSignUp = async (
    email: string,
    password: string,
    name: string,
    profile?: Partial<UserProfile>
  ) => {
    try {
      await signUpWithEmail(email, password, name, profile);
    } catch (error) {
      console.error('Sign up failed:', error);
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      setUserProfile(null);
    } catch (error) {   
      console.error('Sign out failed:', error);
      throw error;
    }
  };

  // Persist profile to Firestore and update local context
  const updateProfile = async (profile: UserProfile) => {
    if (!user) throw new Error('No authenticated user');
    try {
      const updated = await updateUserProfile(user.uid, profile);
      if (updated) setUserProfile(updated);
    } catch (error) {
      console.error('Failed to update profile in AuthContext:', error);
      throw error;
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    signIn: handleSignIn,
  signUp: handleSignUp,
    signOut: handleSignOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};