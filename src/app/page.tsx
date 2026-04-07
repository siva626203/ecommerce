"use client";

import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Grid, Card, CardMedia, CardContent, Button, LinearProgress } from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useDispatch } from 'react-redux';
import { addToCart } from '@/lib/redux/features/cartSlice';
import { Product } from '@/types/app';
import Link from 'next/link';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const data: Product[] = [];
        querySnapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() } as Product);
        });
        setProducts(data);
      } catch (e) {
        console.error("Failed to load products", e);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    dispatch(addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl
    }));
  };

  return (
    <Container maxWidth="xl" sx={{ pt: 12 }}>
      <Box className="glass" sx={{ p: 6, textAlign: 'center', mb: 8 }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700, background: 'linear-gradient(45deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Welcome to Commerce Canvas
        </Typography>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          The next generation premium e-commerce platform.
        </Typography>
      </Box>

      {loading ? <LinearProgress /> : (
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {products.map((product) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product.id}>
              <Card className="glass" sx={{ border: 'none', height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)' } }}>
                <CardMedia
                  component="img"
                  height="250"
                  image={(product.images && product.images.length > 0) ? product.images[0] : (product.imageUrl || 'https://via.placeholder.com/250')}
                  alt={product.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" gutterBottom noWrap>{product.name}</Typography>
                  <Typography variant="h5" color="secondary" sx={{ fontWeight: 'bold', mb: 1 }}>₹{product.price.toFixed(2)}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                    {product.description.length > 80 ? `${product.description.slice(0, 80)}...` : product.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="outlined" color="primary" fullWidth component={Link} href={`/product/${product.id}`}>
                      View
                    </Button>
                    <Button variant="contained" color="secondary" fullWidth onClick={() => handleAddToCart(product)}>
                      Add to Cart
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
