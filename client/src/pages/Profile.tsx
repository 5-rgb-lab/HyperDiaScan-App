import { useAuth } from '@/contexts/AuthContext';
import UserProfile from '@/components/UserProfile';

export default function Profile() {
  const { user, userProfile, updateProfile, signOut } = useAuth();

  const handleSaveProfile = async (data: any) => {
    try {
      await updateProfile(data);
      console.log('Profile saved successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const profileUser = user ? {
    id: user.uid,
    name: user.displayName || userProfile?.name || 'User',
    email: user.email || '',
    photoURL: user.photoURL || undefined,
    profile: userProfile
  } : undefined;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 p-6 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-lg border">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent" data-testid="text-profile-title">
          User Profile
        </h1>
        <p className="text-muted-foreground">
          Manage your account settings and health information
        </p>
      </div>

      <UserProfile 
        user={profileUser}
        onSaveProfile={handleSaveProfile}
        onSignOut={signOut}
      />
    </div>
  );
}