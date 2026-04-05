"use client";

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { setUser, logoutUser } from '@/lib/redux/features/authSlice';
import { UserRole } from '@/types/app';

export default function AuthListener({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        let role: UserRole = 'customer';
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const userRole = userDoc.data()?.role;
          if (userDoc.exists() && (userRole === 'admin' || userRole === 'customer')) {
            role = userRole;
          }
        } catch (error) {
          console.error("Error fetching user role", error);
        }
        
        dispatch(setUser({
          uid: user.uid,
          email: user.email,
          role,
        }));
      } else {
        dispatch(logoutUser());
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return <>{children}</>;
}
