import AppHeader from '../AppHeader';

export default function AppHeaderExample() {
  //todo: remove mock functionality
  const mockUser = {
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@example.com',
    photoURL: 'https://images.unsplash.com/photo-1494790108755-2616b332e234?w=150'
  };

  const handleProfileClick = () => {
    console.log('Profile clicked');
  };

  const handleSignOut = () => {
    console.log('Sign out clicked');
  };

  return (
    <AppHeader 
      user={mockUser}
      onProfileClick={handleProfileClick}
      onSignOut={handleSignOut}
    />
  );
}