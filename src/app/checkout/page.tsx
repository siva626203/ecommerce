"use client";

import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, Card, TextField, Button, Alert, CircularProgress, InputAdornment } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/redux/store';
import { clearCart } from '@/lib/redux/features/cartSlice';
import { useRouter } from 'next/navigation';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import ProtectedRoute from '@/components/ProtectedRoute';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      on: (event: string, callback: (response: any) => void) => void;
      open: () => void;
    };
  }
}

export default function Checkout() {
  const { items, total } = useSelector((state: RootState) => state.cart);
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const dispatch = useDispatch();

  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  // Load Razorpay Script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!address) {
      setError("Please fill in your delivery address");
      return;
    }
    if (phone.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Create Order via Next.js API
      const response = await fetch('/api/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Using INR as requested by the user
        body: JSON.stringify({ amount: total, currency: "INR" }),
      });
      
      const data = await response.json();
      if (!data.order) throw new Error(data.error);

      // 2. Pre-create the order in Firestore with pending status
      const orderRef = await addDoc(collection(db, 'orders'), {
        userId: user.uid,
        items,
        total,
        status: 'pending',
        paymentStatus: 'pending',
        razorpayOrderId: data.order.id,
        shipping: { address, phone },
        createdAt: new Date()
      });

      // 3. Open Razorpay Checkot
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_SZkoMgIuVOh74m',
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Commerce Canvas",
        description: "Payment for your order",
        order_id: data.order.id,
        handler: async function (response: any) {
          // You could optionally verify the signature on client side here as well 
          // or rely on webhook. We rely on webhook, but we also update local state for fast UX:
          dispatch(clearCart());
          router.push(`/orders`);
        },
        prefill: {
          name: user.email,
          email: user.email,
          contact: phone
        },
        theme: {
          color: "#6c63ff"
        }
      };

      if (!window.Razorpay) {
        throw new Error('Payment gateway failed to load. Please refresh and try again.');
      }

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any){
        setError(`Payment failed: ${response.error.description}`);
      });
      rzp.open();
    } catch (err: any) {
      setError(err.message || 'Payment initiation failed');
    }
    setLoading(false);
  };

  if (items.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ pt: 12, textAlign: 'center' }}>
        <Typography variant="h5">Your cart is empty.</Typography>
      </Container>
    );
  }

  return (
    <ProtectedRoute>
      <Container maxWidth="md" sx={{ pt: 12 }}>
        <Typography variant="h3" sx={{ fontWeight: 600, mb: 4 }}>Checkout</Typography>
        
        {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Card className="glass" sx={{ p: 3, border: 'none' }}>
              <Typography variant="h5" gutterBottom>Shipping Details</Typography>
              <TextField 
                fullWidth label="Delivery Address" margin="normal" rows={3} multiline
                value={address} onChange={(e) => setAddress(e.target.value)}
              />
               <TextField 
                fullWidth label="Phone Number" margin="normal"
                value={phone} 
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, ''); // Only digits
                  if (val.length <= 10) setPhone(val);
                }}
                placeholder="9876543210"
                helperText={phone.length > 0 && phone.length < 10 ? "Must be 10 digits" : ""}
                error={phone.length > 0 && phone.length < 10}
                InputProps={{
                  startAdornment: <InputAdornment position="start">+91</InputAdornment>,
                }}
              />
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Card className="glass" sx={{ p: 3, border: 'none' }}>
              <Typography variant="h5" gutterBottom>Payment</Typography>
              <Box sx={{ mb: 3 }}>
                {items.map(i => (
                  <Typography key={i.id} variant="body2">{i.quantity}x {i.name}</Typography>
                ))}
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3, color: 'var(--primary)' }}>
                Total: ₹{total.toFixed(2)}
              </Typography>
              <Button 
                variant="contained" color="secondary" fullWidth size="large" 
                onClick={handlePayment} disabled={loading}
                sx={{ borderRadius: 8, height: 50 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Pay with Razorpay'}
              </Button>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </ProtectedRoute>
  );
}
