"use client";

import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, CardMedia, CircularProgress, Container, Stack, Typography } from '@mui/material';
import { doc, getDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase/config';
import { addToCart } from '@/lib/redux/features/cartSlice';
import { useDispatch } from 'react-redux';
import { Product } from '@/types/app';

export default function ProductDetailsPage() {
  const params = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!params?.id) {
        return;
      }

      try {
        setLoading(true);
        setError('');

        const snapshot = await getDoc(doc(db, 'products', params.id));
        if (!snapshot.exists()) {
          setProduct(null);
          setError('This product could not be found.');
          return;
        }

        const data = { id: snapshot.id, ...(snapshot.data() as Omit<Product, 'id'>) };
        setProduct(data);
        setSelectedImage(data.images?.[0] || data.imageUrl || null);
      } catch (fetchError) {
        console.error('Failed to fetch product', fetchError);
        setError('We could not load this product right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params?.id]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ pt: 14, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="md" sx={{ pt: 14 }}>
        <Alert severity="warning">{error || 'This product could not be found.'}</Alert>
      </Container>
    );
  }

  const handleAddToCart = () => {
    dispatch(addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl,
    }));
  };

  const images = product.images && product.images.length > 0 ? product.images : [product.imageUrl];

  return (
    <Container maxWidth="lg" sx={{ pt: 14 }}>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      <Card className="glass" sx={{ border: 'none', overflow: 'hidden' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr' } }}>
          <Box sx={{ p: 2 }}>
            <CardMedia
              component="img"
              image={selectedImage || 'https://via.placeholder.com/700x700'}
              alt={product.name}
              sx={{ 
                width: '100%', 
                height: { xs: 320, md: 500 }, 
                objectFit: 'cover', 
                borderRadius: 2,
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)'
              }}
            />
            {images.length > 1 && (
              <Stack direction="row" spacing={1} sx={{ mt: 2, overflowX: 'auto', pb: 1 }}>
                {images.map((img, idx) => (
                  <Box 
                    key={idx}
                    component="img"
                    src={img}
                    onClick={() => setSelectedImage(img)}
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      objectFit: 'cover', 
                      borderRadius: 1, 
                      cursor: 'pointer',
                      border: selectedImage === img ? '2px solid var(--secondary)' : '2px solid transparent',
                      transition: '0.2s',
                      '&:hover': { opacity: 0.8 }
                    }}
                  />
                ))}
              </Stack>
            )}
          </Box>
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="overline" color="text.secondary">
                  Product details
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {product.name}
                </Typography>
              </Box>
              <Typography variant="h4" color="secondary" sx={{ fontWeight: 700 }}>
                ₹{product.price.toFixed(2)}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                {product.description}
              </Typography>
              <Button variant="contained" color="secondary" size="large" onClick={handleAddToCart} sx={{ borderRadius: 8, height: 55 }}>
                Add to Cart
              </Button>
            </Stack>
          </CardContent>
        </Box>
      </Card>
    </Container>
  );
}
