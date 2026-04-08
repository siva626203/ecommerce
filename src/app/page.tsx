"use client";

import React, { useEffect, useState } from 'react';
import { 
  Container, Typography, Box, Grid, Card, CardMedia, 
  CardContent, Button, Stack, Paper
} from '@mui/material';
import { collection, getDocs, query, limit, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Product } from '@/types/app';
import Link from 'next/link';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import VerifiedIcon from '@mui/icons-material/Verified';
import PaymentIcon from '@mui/icons-material/Payment';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const q = query(collection(db, 'products'), limit(4), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const data: Product[] = [];
        querySnapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() } as Product);
        });
        setFeaturedProducts(data);
      } catch (e) {
        console.error("Failed to load featured products", e);
      }
    };
    fetchFeatured();
  }, []);

  const features = [
    { icon: <LocalShippingIcon fontSize="large" color="primary" />, title: "Free Shipping", desc: "On all orders over ₹1,000" },
    { icon: <VerifiedIcon fontSize="large" color="primary" />, title: "Quality Guarantee", desc: "100% genuine premium products" },
    { icon: <PaymentIcon fontSize="large" color="primary" />, title: "Secure Payment", desc: "Safe & encrypted transactions" },
  ];

  const categories = [
    { name: "Electronics", img: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80" },
    { name: "Fashion", img: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80" },
    { name: "Home", img: "https://images.unsplash.com/photo-1513584684374-8bdb74838a0f?w=800&q=80" },
  ];

  return (
    <Box sx={{ pb: 10 }}>
      {/* Hero Section */}
      <Box sx={{ 
        height: '90vh', 
        width: '100%', 
        background: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(https://images.unsplash.com/photo-1555527371-7c09a602315a?w=1600&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        color: 'white',
        mb: 8
      }}>
        <Container maxWidth="lg">
          <Box sx={{ maxWidth: 650 }}>
            <Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: 4, mb: 2, display: 'block', color: 'rgba(255,255,255,0.8)' }}>
              NEW COLLECTION 2026
            </Typography>
            <Typography variant="h1" sx={{ fontWeight: 900, mb: 3, lineHeight: 1.1 }}>
              Elevate Your <span style={{ color: 'var(--secondary)' }}>Canvas</span> Of Life
            </Typography>
            <Typography variant="h5" sx={{ mb: 5, opacity: 0.9 }}>
              Experience the art of premium shopping. Crafted for quality, designed for style.
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button 
                variant="contained" color="secondary" size="large" 
                component={Link} href="/shop"
                sx={{ borderRadius: 10, px: 5, py: 2, fontSize: '1.1rem', fontWeight: 700 }}
              >
                Shop Now
              </Button>
              <Button 
                variant="outlined" size="large" 
                sx={{ borderRadius: 10, px: 5, py: 2, fontSize: '1.1rem', fontWeight: 700, color: 'white', borderColor: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
              >
                Learn More
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Trust Banners */}
      <Container maxWidth="lg" sx={{ mb: 12 }}>
        <Grid container spacing={4}>
          {features.map((f, i) => (
            <Grid size={{ xs: 12, md: 4 }} key={i}>
              <Paper className="glass" sx={{ p: 4, textAlign: 'center', border: 'none', borderRadius: 6, height: '100%' }}>
                <Box sx={{ mb: 2 }}>{f.icon}</Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>{f.title}</Typography>
                <Typography color="text.secondary">{f.desc}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Featured Collections */}
      <Container maxWidth="lg" sx={{ mb: 12 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, textAlign: 'center', mb: 1 }}>Top Categories</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mb: 6 }}>Explore our most popular collections</Typography>
        <Grid container spacing={3}>
          {categories.map((cat, i) => (
            <Grid size={{ xs: 12, md: 4 }} key={i}>
              <Box 
                component={Link} href={`/shop?category=${cat.name}`}
                sx={{ 
                  position: 'relative', 
                  height: 350, 
                  borderRadius: 6, 
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'end',
                  p: 4,
                  textDecoration: 'none',
                  color: 'white',
                  '&:hover img': { transform: 'scale(1.1)' },
                  '&::after': { 
                    content: '""', 
                    position: 'absolute', top: 0, left: 0, 
                    width: '100%', height: '100%', 
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                    zIndex: 1
                  }
                }}
              >
                <Box 
                  component="img" src={cat.img} 
                  sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transition: '0.6s' }} 
                />
                <Box sx={{ zIndex: 2 }}>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>{cat.name}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>Explore Collection →</Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Featured Products */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>New Arrivals</Typography>
            <Typography variant="body1" color="text.secondary">The latest additions to our platform</Typography>
          </Box>
          <Button component={Link} href="/shop" color="primary" sx={{ fontWeight: 700 }}>
            View All Products →
          </Button>
        </Box>

        <Grid container spacing={4}>
          {featuredProducts.map((product) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={product.id}>
              <Card className="glass" sx={{ border: 'none', height: '100%', display: 'flex', flexDirection: 'column', transition: '0.3s', '&:hover': { transform: 'translateY(-5px)' } }}>
                <CardMedia
                  component="img"
                  height="220"
                  image={(product.images && product.images.length > 0) ? product.images[0] : (product.imageUrl || 'https://via.placeholder.com/220')}
                  alt={product.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, mb: 1 }}>{product.category}</Typography>
                  <Typography variant="h6" gutterBottom noWrap sx={{ fontWeight: 600 }}>{product.name}</Typography>
                  <Typography variant="h6" color="secondary" sx={{ fontWeight: 800 }}>₹{product.price.toLocaleString('en-IN')}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
