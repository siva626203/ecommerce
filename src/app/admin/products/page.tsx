"use client";

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Grid, Card, CardMedia, CardContent, LinearProgress } from '@mui/material';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import dynamic from 'next/dynamic';

const ProductFormModal: any = dynamic(() => import('@/components/ProductFormModal'), {
  ssr: false,
});

import { Product } from '@/types/app';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    const querySnapshot = await getDocs(collection(db, 'products'));
    const data: Product[] = [];
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() } as Product);
    });
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);



  const handleDelete = async (id: string) => {
    if (confirm("Are you sure?")) {
      await deleteDoc(doc(db, 'products', id));
      fetchProducts();
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>Products</Typography>
        <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
          Add New Product
        </Button>
      </Box>

      {/* Product List */}
      {loading ? <LinearProgress /> : (
        <Grid container spacing={3}>
          {products.map((item) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
              <Card className="glass" sx={{ border: 'none', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={(item.images && item.images.length > 0) ? item.images[0] : (item.imageUrl || 'https://via.placeholder.com/250')}
                  alt={item.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>{item.name}</Typography>
                  <Typography variant="h5" color="secondary" gutterBottom>₹{item.price.toFixed(2)}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{item.description}</Typography>
                  <Button variant="outlined" color="error" size="small" onClick={() => handleDelete(item.id)}>
                    Delete
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Product Dialog via dynamic import */}
      {open && (
        <ProductFormModal 
          open={open} 
          onClose={() => setOpen(false)} 
          onSuccess={fetchProducts} 
        />
      )}
    </Box>
  );
}
