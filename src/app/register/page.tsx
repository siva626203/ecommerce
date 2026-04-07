"use client";

import React, { useState } from 'react';
import { Container, Box, Typography, TextField, Button, Divider, Alert, CircularProgress } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setUser } from '@/lib/redux/features/authSlice';
import { UserRole } from '@/types/app';
import { determineRole } from '@/lib/authUtils';
import Link from 'next/link';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Update display name
      await updateProfile(userCredential.user, { displayName: name });
      
      // Setup user in Firestore
      const userRef = doc(db, 'users', userCredential.user.uid);
      const role = determineRole(userCredential.user.email);
      const userData = { role, email: userCredential.user.email, name };
      await setDoc(userRef, userData);
      
      dispatch(setUser({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        role: userData.role,
      }));
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Failed to register');
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      // Check if user exists in Firestore, if not create
      const userRef = doc(db, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userRef);
      
      const userData = userDoc.exists() ? userDoc.data() : null;
      const role = determineRole(userCredential.user.email, userData?.role);
      
      if (!userData) {
        await setDoc(userRef, { role, email: userCredential.user.email, name: userCredential.user.displayName });
      }
      
      dispatch(setUser({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        role: role,
      }));
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Failed to login with Google');
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ pt: 10 }}>
      <Box className="glass" sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 600 }}>
          Create an Account
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <form onSubmit={handleRegister}>
          <TextField 
            fullWidth label="Full Name" variant="outlined" margin="normal"
            value={name} onChange={(e) => setName(e.target.value)}
            required
          />
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
           <Button 
            fullWidth variant="contained" color="secondary" size="large" type="submit" 
            disabled={isLoading}
            sx={{ mt: 2, mb: 2, borderRadius: 5, height: 56 }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
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
          Already have an account? <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Login</Link>
        </Typography>
      </Box>
    </Container>
  );
}
