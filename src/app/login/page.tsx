"use client";

import React, { useState } from 'react';
import { Container, Box, Typography, TextField, Button, Divider, Alert } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setUser } from '@/lib/redux/features/authSlice';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Fetch user role from Firestore
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      const userData = userDoc.exists() ? userDoc.data() : { role: 'customer' };
      
      dispatch(setUser({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        role: userData.role,
      }));
      
      if (userData.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      // Check if user exists in Firestore, if not create
      const userRef = doc(db, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userRef);
      
      let userData = userDoc.exists() ? userDoc.data() : null;
      if (!userData) {
        userData = { role: 'customer', email: userCredential.user.email, name: userCredential.user.displayName };
        await setDoc(userRef, userData);
      }
      
      dispatch(setUser({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        role: userData.role,
      }));
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Failed to login with Google');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ pt: 10 }}>
      <Box className="glass" sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 600 }}>
          Welcome Back
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <form onSubmit={handleLogin}>
          <TextField 
            fullWidth label="Email" variant="outlined" margin="normal"
            value={email} onChange={(e) => setEmail(e.target.value)}
            required type="email"
          />
          <TextField 
            fullWidth label="Password" variant="outlined" margin="normal"
            value={password} onChange={(e) => setPassword(e.target.value)}
            required type="password"
          />
          <Button fullWidth variant="contained" color="primary" size="large" type="submit" sx={{ mt: 2, mb: 2, borderRadius: 5 }}>
            Login
          </Button>
        </form>
        
        <Divider sx={{ my: 2 }}>OR</Divider>
        
        <Button 
          fullWidth variant="outlined" color="primary" size="large"
          startIcon={<GoogleIcon />} onClick={handleGoogleLogin}
          sx={{ borderRadius: 5 }}
        >
          Sign in with Google
        </Button>
        
        <Typography align="center" sx={{ mt: 3 }}>
          Don't have an account? <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Register</Link>
        </Typography>
      </Box>
    </Container>
  );
}
