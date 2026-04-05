"use client";

import React, { useEffect, useState } from 'react';
import { Container, Typography, Card, CardContent, Grid, Box, Chip } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import ProtectedRoute from '@/components/ProtectedRoute';
import { OrderRecord, OrderItem } from '@/types/app';

export default function MyOrders() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchOrders = async () => {
      try {
        const q = query(collection(db, 'orders'), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const data: OrderRecord[] = [];
        querySnapshot.forEach((doc) => {
          data.push({ id: doc.id, ...(doc.data() as Omit<OrderRecord, 'id'>) });
        });
        data.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
        setOrders(data);
      } catch (err) {
        console.error("Failed to fetch orders", err);
      }
      setLoading(false);
    };

    fetchOrders();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'processing': return 'info';
      case 'pending': return 'warning';
      case 'shipped': return 'primary';
      case 'delivered': return 'success';
      default: return 'default';
    }
  };

  return (
    <ProtectedRoute>
      <Container maxWidth="md" sx={{ pt: 12 }}>
        <Typography variant="h3" sx={{ fontWeight: 600, mb: 4 }}>My Orders</Typography>

        {loading ? <Typography>Loading...</Typography> : orders.length === 0 ? (
          <Typography variant="h6" color="text.secondary">You have no orders yet.</Typography>
        ) : (
          <Grid container spacing={3}>
            {orders.map(order => (
              <Grid size={{ xs: 12 }} key={order.id}>
                <Card className="glass" sx={{ border: 'none', p: 1 }}>
                  <CardContent sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 2 }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Order ID</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>#{order.id.substring(0, 8).toUpperCase()}</Typography>
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'Pending'}
                      </Typography>
                    </Box>

                    <Box sx={{ flexGrow: 1, px: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">Items</Typography>
                      {order.items.map((item: OrderItem) => (
                        <Typography key={item.id} variant="body2">{item.quantity}x {item.name}</Typography>
                      ))}
                    </Box>

                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h6" color="secondary" sx={{ fontWeight: 'bold', mb: 1 }}>
                        ${order.total.toFixed(2)}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Chip label={`Payment: ${order.paymentStatus ?? 'pending'}`} size="small" color={getStatusColor(order.paymentStatus ?? 'pending') as any} />
                        <Chip label={order.status.toUpperCase()} size="small" color={getStatusColor(order.status) as any} />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </ProtectedRoute>
  );
}
