"use client";

import React from 'react';
import { Container, Typography, Box, Grid, Card, IconButton, Button, Divider } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/redux/store';
import { removeFromCart, addToCart, decreaseCartItem } from '@/lib/redux/features/cartSlice';
import { CartItem } from '@/types/app';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import Link from 'next/link';

export default function Cart() {
  const { items, total } = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();

  const handleIncrease = (item: CartItem) => {
    dispatch(addToCart({ ...item, quantity: 1 }));
  };

  const handleDecrease = (id: string) => {
    dispatch(decreaseCartItem(id));
  };

  const handleRemove = (id: string) => {
    dispatch(removeFromCart(id));
  };

  return (
    <Container maxWidth="lg" sx={{ pt: 12 }}>
      <Typography variant="h3" sx={{ fontWeight: 600, mb: 4 }}>Shopping Cart</Typography>

      {items.length === 0 ? (
        <Box className="glass" sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h5" color="text.secondary" gutterBottom>Your cart is empty.</Typography>
          <Button variant="contained" color="primary" component={Link} href="/" sx={{ mt: 2 }}>
            Start Shopping
          </Button>
        </Box>
      ) : (
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 8 }}>
            {items.map((item) => (
              <Card className="glass" sx={{ border: 'none', mb: 2, display: 'flex', alignItems: 'center', p: 2 }} key={item.id}>
                {item.imageUrl && (
                  <Box component="img" src={item.imageUrl} sx={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 1, mr: 2 }} />
                )}
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6">{item.name}</Typography>
                  <Typography variant="body1" color="secondary" sx={{ fontWeight: 'bold' }}>₹{item.price.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton onClick={() => handleDecrease(item.id)}><RemoveIcon /></IconButton>
                  <IconButton onClick={() => handleIncrease(item)}><AddIcon /></IconButton>
                  <Typography>{item.quantity}</Typography>
                  <IconButton color="error" onClick={() => handleRemove(item.id)}><DeleteIcon /></IconButton>
                </Box>
              </Card>
            ))}
          </Grid>
          
          <Grid size={{ xs: 12, md: 4 }}>
            <Card className="glass" sx={{ border: 'none', p: 3, position: 'sticky', top: 100 }}>
              <Typography variant="h5" gutterBottom>Order Summary</Typography>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Subtotal</Typography>
                <Typography>₹{total.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Shipping</Typography>
                <Typography>Free</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6" color="secondary">₹{total.toFixed(2)}</Typography>
              </Box>
              <Button variant="contained" color="primary" fullWidth size="large" component={Link} href="/checkout" sx={{ borderRadius: 8 }}>
                Proceed to Checkout
              </Button>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}
