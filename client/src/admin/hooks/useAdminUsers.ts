import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface User {
  id: string;
  name: string;
  email: string;
  active: boolean;
  primaryCondition?: string;
  lastActive?: string;
}

export function useAdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'users'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedUsers = snapshot.docs.map(doc => {
        const data = doc.data() as any;
        return {
          id: doc.id,
          // Keep common fields explicit and provide sensible defaults
          name: data.name || data.displayName || 'Unknown',
          email: data.email || '',
          // If `active` isn't present, default to true so older docs don't appear inactive
          active: typeof data.active === 'boolean' ? data.active : true,
          primaryCondition: data.primaryCondition || data.profile?.primaryCondition || undefined,
          lastActive: data.lastActive || null,
          createdAt: data.createdAt || null,
          // spread remaining fields so UI can still access them
          ...data,
        } as User;
      });
      
      setUsers(fetchedUsers);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleUserStatus = async (userId: string, newStatus: boolean) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        active: newStatus,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw error;
    }
  };

  return { users, isLoading, toggleUserStatus };
}