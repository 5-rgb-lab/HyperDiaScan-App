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

// ----------------------------
// Sign in / Sign up
// ----------------------------
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error('Error signing in with email:', error);
    throw error;
  }
};

export const signUpWithEmail = async (
  email: string,
  password: string,
  name: string,
  profileData?: Partial<UserProfile>
) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;

    await updateProfile(user, { displayName: name });

    // ✅ Create only minimal profile
    await createUserProfile(user, profileData);

    return user;
  } catch (error) {
    console.error('Error signing up with email:', error);
    throw error;
  }
};

// ----------------------------
// Create / Update / Fetch User Profile
// ----------------------------
export const createUserProfile = async (user: User, profileData?: Partial<UserProfile>) => {
  if (!user) return;

  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    // Accept either flat profileData (heightCm, weightKg, gender) or nested demographics.profileData
    const demographics = profileData?.demographics || {
      biologicalSex: (profileData as any)?.gender || (profileData as any)?.biologicalSex || 'Other',
      heightCm: (profileData as any)?.heightCm ?? null,
      weightKg: (profileData as any)?.weightKg ?? null,
      activityLevel: (profileData as any)?.activityLevel ?? null,
      bodyFatPercent: (profileData as any)?.bodyFatPercent ?? null,
      weightGoal: (profileData as any)?.weightGoal ?? null,
    };

    const baseProfile = {
      uid: user.uid,
      name: user.displayName || profileData?.name || '',
      email: user.email || '',
      age: profileData?.age ?? null,
      primaryCondition: profileData?.primaryCondition ?? null,
      demographics, 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(userRef, baseProfile);
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

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};
