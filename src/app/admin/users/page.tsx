"use client";

import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid, Chip } from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

interface User {
  id: string;
  name?: string;
  email: string;
  role: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const data: User[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as User);
      });
      setUsers(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 4 }}>Manage Customers</Typography>

      {loading ? <Typography>Loading users...</Typography> : (
        <Grid container spacing={3}>
          {users.map((user) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={user.id}>
              <Card className="glass" sx={{ border: 'none' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">{user.name || 'Unnamed User'}</Typography>
                    <Chip 
                      label={user.role.toUpperCase()} 
                      color={user.role === 'admin' ? 'secondary' : 'primary'} 
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Email: {user.email}
                  </Typography>
                  <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1 }}>
                    ID: {user.id}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
