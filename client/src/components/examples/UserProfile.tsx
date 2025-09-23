import UserProfile from '../UserProfile';

export default function UserProfileExample() {
  //todo: remove mock functionality
  const mockUser = {
    id: '1',
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@example.com',
    photoURL: 'https://images.unsplash.com/photo-1494790108755-2616b332e234?w=150',
    profile: {
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@example.com',
      age: 45,
      primaryCondition: 'diabetes' as const,
      emergencyContact: '+1 (555) 123-4567'
    }
  };

  const handleSaveProfile = (data: any) => {
    console.log('Profile saved:', data);
  };

  const handleSignOut = () => {
    console.log('User signed out');
  };

  return (
    <UserProfile 
      user={mockUser} 
      onSaveProfile={handleSaveProfile}
      onSignOut={handleSignOut}
    />
  );
}