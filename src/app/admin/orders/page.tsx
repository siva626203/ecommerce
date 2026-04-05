"use client";

import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid, Chip, Button, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: string;
  razorpayOrderId?: string;
  createdAt: any;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'orders'));
      const data: Order[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Order);
      });
      // Sort by newest first
      data.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
      setOrders(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (e) {
      console.error("Failed to update status", e);
      alert("Failed to update status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'shipped': return 'info';
      case 'delivered': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 4 }}>Manage Orders</Typography>

      {loading ? <Typography>Loading orders...</Typography> : (
        <Grid container spacing={3}>
          {orders.map((order) => (
            <Grid size={{ xs: 12 }} key={order.id}>
              <Card className="glass" sx={{ border: 'none' }}>
                <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                  <Box>
                    <Typography variant="h6">Order #{order.id.substring(0, 8).toUpperCase()}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Date: {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleString() : 'N/A'}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1, fontWeight: 'bold' }}>
                      Total: ${order.total.toFixed(2)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ flexGrow: 1, px: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Items:</Typography>
                    {order.items.map((item, idx) => (
                      <Typography key={idx} variant="body2">
                        {item.quantity}x {item.name}
                      </Typography>
                    ))}
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip label={order.status.toUpperCase()} color={getStatusColor(order.status) as any} />
                    
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={order.status}
                        label="Status"
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                      >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="shipped">Shipped</MenuItem>
                        <MenuItem value="delivered">Delivered</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
