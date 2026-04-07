import { UserRole } from '@/types/app';

/**
 * Checks if the given email is eligible for administrator privileges.
 */
export const isAdminEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;
  const lowerEmail = email.toLowerCase();
  // Primary admin email from user request
  const isDefaultAdmin = lowerEmail === 'superadmin123@gmail.com';
  // Also include any email containing "admin" for consistency with existing logic
  return isDefaultAdmin || lowerEmail.includes('admin');
};

/**
 * Determines the final role based on the email and any existing database role.
 * This provides a fallback if Firestore is offline.
 */
export const determineRole = (email: string | null | undefined, storeRole?: string): UserRole => {
  if (isAdminEmail(email)) return 'admin';
  return (storeRole === 'admin' || storeRole === 'customer') ? storeRole : 'customer';
};
