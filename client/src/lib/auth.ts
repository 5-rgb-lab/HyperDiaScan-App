import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { FirebaseUser, UserProfile } from '@shared/schema';

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error('Error signing in with email:', error);
    throw error;
  }
};

export const signUpWithEmail = async (email: string, password: string, name: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
    
    // Update the user's display name
    await updateProfile(user, {
      displayName: name
    });
    
    // Create user profile in Firestore
    await createUserProfile(user);
    
    return user;
  } catch (error) {
    console.error('Error signing up with email:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const createUserProfile = async (user: User) => {
  if (!user) return;

  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    const defaultProfile: UserProfile = {
      name: user.displayName || 'Unknown User',
      email: user.email || '',
      primaryCondition: 'diabetes',
    };
    
    await setDoc(userRef, {
      ...defaultProfile,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
};

export const updateUserProfile = async (userId: string, profile: Partial<UserProfile>) => {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, {
    ...profile,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return userSnap.data() as UserProfile;
  }
  return null;
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};