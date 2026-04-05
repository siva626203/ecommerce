"use client";

import { useSelector } from 'react-redux';
import { RootState } from '../lib/redux/store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Box, CircularProgress, Typography, Container, Button } from '@mui/material';
import Link from 'next/link';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  if (user.role !== 'admin') {
    return (
      <Container sx={{ mt: 10, textAlign: 'center' }}>
        <Typography variant="h4" color="error" gutterBottom>Access Denied</Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>You need administrator privileges to access this page.</Typography>
        <Link href="/" passHref>
          <Button variant="contained" color="primary">Return Home</Button>
        </Link>
      </Container>
    );
  }

  return <>{children}</>;
}
