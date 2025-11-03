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
import { UserProfile, userProfileSchema } from '@shared/schema';

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
    const baseProfile: UserProfile = {
      name: user.displayName || profileData?.name || '',
      email: user.email || '',
      age: profileData?.age ?? 18,
      primaryCondition: profileData?.primaryCondition ?? 'diabetes',
      primaryMedical: {
        diabetesType: 'None',
        hypertensionType: 'None'
      },
      diabetesStatus: {
        latestHbA1c: 0,
        hypoglycemiaFrequency: 'Rare'
      },
      hypertensionStatus: {
        currentBP: {
          systolic: 120,
          diastolic: 80
        }
      },
      treatmentManagement: {
        diabetesManagement: {
          insulinUse: false,
          insulinType: 'Short-acting',
          insulinTiming: 'Before Meals'
        },
        hypertensionManagement: {
          antihypertensiveMeds: [],
          medicationTiming: 'Morning'
        }
      },
      nutrientTargets: {
        dailyCalorieTarget: 2000,
        dailyCarbLimit: 200,
        dailySodiumLimit: 2300,
        dailySatFatLimit: 20
      },
      demographics: {
        biologicalSex: profileData?.demographics?.biologicalSex || 'Male',
        heightCm: profileData?.demographics?.heightCm || 170,
        weightKg: profileData?.demographics?.weightKg || 70,
        activityLevel: profileData?.demographics?.activityLevel || 'Sedentary'
      }
    };

    // Save the validated profile
    await setDoc(userRef, {
      ...baseProfile,
      uid: user.uid, // Add UID for reference
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
};

export const updateUserProfile = async (userId: string, profile: UserProfile) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  const defaultProfile: UserProfile = {
    name: '',
    email: '',
    age: 18,
    primaryCondition: 'diabetes',
    primaryMedical: {
      diabetesType: 'None',
      hypertensionType: 'None'
    },
    diabetesStatus: {
      latestHbA1c: 0,
      hypoglycemiaFrequency: 'Rare'
    },
    hypertensionStatus: {
      currentBP: {
        systolic: 120,
        diastolic: 80
      }
    },
    treatmentManagement: {
      diabetesManagement: {
        insulinUse: false,
        insulinType: 'Short-acting',
        insulinTiming: 'Before Meals'
      },
      hypertensionManagement: {
        antihypertensiveMeds: [],
        medicationTiming: 'Morning'
      }
    },
    nutrientTargets: {
      dailyCalorieTarget: 2000,
      dailyCarbLimit: 200,
      dailySodiumLimit: 2300,
      dailySatFatLimit: 20
    },
    demographics: {
      biologicalSex: 'Male',
      heightCm: 170,
      weightKg: 70,
      activityLevel: 'Sedentary'
    }
  };

  // Get existing data or use default profile
  const existingData = userSnap.exists() ? userSnap.data() as UserProfile : defaultProfile;
  
  // Merge the new profile data with existing data
  const updatedProfile = {
    ...existingData,
    ...profile,
    updatedAt: new Date().toISOString()
  };

  // Validate the profile against the schema
  try {
    const validatedProfile = userProfileSchema.parse(updatedProfile);
    
    // Save the validated profile
    await setDoc(userRef, validatedProfile, { merge: true });
    
    // Fetch and return the updated profile
    const updatedSnap = await getDoc(userRef);
    return updatedSnap.exists() ? updatedSnap.data() as UserProfile : null;
  } catch (error) {
    console.error('Profile validation failed:', error);
    throw error;
  }
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
