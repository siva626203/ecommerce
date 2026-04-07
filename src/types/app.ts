export type UserRole = 'admin' | 'customer';

export interface AppUser {
  uid: string;
  email: string | null;
  role: UserRole;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string; // Legacy/Main image
  images?: string[]; // Multiple images support
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface FirestoreTimestampLike {
  seconds: number;
  nanoseconds?: number;
}

export interface OrderRecord {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: string;
  paymentStatus?: string;
  razorpayOrderId?: string;
  createdAt?: FirestoreTimestampLike;
}
