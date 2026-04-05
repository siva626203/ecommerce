"use client";

import React, { useEffect, useState } from 'react';
import { Grid, Box, Typography, Card, CardContent } from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    orders: 0,
    revenue: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const productsSnap = await getDocs(collection(db, 'products'));
        const ordersSnap = await getDocs(collection(db, 'orders'));

        let totalRevenue = 0;
        ordersSnap.forEach((doc) => {
          totalRevenue += doc.data().total || 0;
        });

        setStats({
          users: usersSnap.size,
          products: productsSnap.size,
          orders: ordersSnap.size,
          revenue: totalRevenue,
        });
      } catch (error) {
        console.error("Error fetching admin stats", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Dashboard Overview
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Welcome to the administrator panel. Here's a snapshot of your store's performance.
      </Typography>

      <Grid container spacing={3}>
        {[
          { title: 'Total Customers', value: stats.users, prefix: '' },
          { title: 'Products Available', value: stats.products, prefix: '' },
          { title: 'Total Orders', value: stats.orders, prefix: '' },
          { title: 'Total Revenue', value: stats.revenue, prefix: '$' },
        ].map((stat, i) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
            <Card className="glass" sx={{ border: 'none' }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  {stat.title}
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'var(--primary)' }}>
                  {stat.prefix}{stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
