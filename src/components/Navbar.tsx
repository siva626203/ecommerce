"use client";

import React from 'react';
import { AppBar, Toolbar, Typography, Button, Badge, Box, IconButton } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/redux/store';
import { auth } from '@/lib/firebase/config';
import { logoutUser } from '@/lib/redux/features/authSlice';
import { CartItem } from '@/types/app';

export default function Navbar() {
  const { user } = useSelector((state: RootState) => state.auth);
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch();
  const pathname = usePathname();

  const cartCount = cartItems.reduce((acc: number, item: CartItem) => acc + item.quantity, 0);

  const handleLogout = async () => {
    await auth.signOut();
    dispatch(logoutUser());
  };

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <AppBar position="fixed" sx={{ backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)', color: 'text.primary', boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)' }}>
      <Toolbar>
        <Typography variant="h6" component={Link} href="/" sx={{ flexGrow: 1, fontWeight: 'bold', textDecoration: 'none', color: 'inherit' }}>
          Commerce Canvas
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {user ? (
            <>
              {user.role === 'admin' && (
                <Button color="inherit" component={Link} href="/admin/dashboard">Admin Panel</Button>
              )}
              <Button color="inherit" component={Link} href="/orders">My Orders</Button>
              <Button color="inherit" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <Button color="inherit" component={Link} href="/login">Login</Button>
          )}
          <IconButton component={Link} href="/cart" color="primary">
            <Badge badgeContent={cartCount} color="secondary">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
