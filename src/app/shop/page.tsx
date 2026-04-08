"use client";

import React, { useEffect, useState } from 'react';
import { 
  Container, Typography, Box, Grid, Card, CardMedia, 
  CardContent, Button, LinearProgress, Chip, Stack, 
  TextField, InputAdornment
} from '@mui/material';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useDispatch } from 'react-redux';
import { addToCart } from '@/lib/redux/features/cartSlice';
import { Product } from '@/types/app';
import Link from 'next/link';
import SearchIcon from '@mui/icons-material/Search';

const CATEGORIES = ["All", "Electronics", "Fashion", "Home", "Beauty", "Others"];

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const data: Product[] = [];
        querySnapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() } as Product);
        });
        setProducts(data);
        setFilteredProducts(data);
      } catch (e) {
        console.error("Failed to load products", e);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    let result = products;

    if (category !== 'All') {
      result = result.filter(p => p.category === category);
    }

    if (search) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        p.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredProducts(result);
  }, [search, category, products]);

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
    <Container maxWidth="xl" sx={{ pt: 14, pb: 8 }}>
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>Shop Collection</Typography>
        <Typography variant="body1" color="text.secondary">Discover our wide range of premium products.</Typography>
      </Box>

      {/* Filters Bar */}
      <Box className="glass" sx={{ p: 3, mb: 6, borderRadius: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ bgcolor: 'white', borderRadius: 2 }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1 }}>
              {CATEGORIES.map((cat) => (
                <Chip
                  key={cat}
                  label={cat}
                  onClick={() => setCategory(cat)}
                  color={category === cat ? "primary" : "default"}
                  variant={category === cat ? "filled" : "outlined"}
                  sx={{ px: 1, fontWeight: 600 }}
                />
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Box>

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <LinearProgress />
          <Typography sx={{ mt: 2 }}>Loading products...</Typography>
        </Box>
      ) : filteredProducts.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography variant="h5" color="text.secondary">No products found matching your criteria.</Typography>
          <Button sx={{ mt: 2 }} onClick={() => {setCategory('All'); setSearch('');}}>Clear Filters</Button>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {filteredProducts.map((product) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product.id}>
              <Card className="glass" sx={{ border: 'none', height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' } }}>
                <CardMedia
                  component="img"
                  height="280"
                  image={(product.images && product.images.length > 0) ? product.images[0] : (product.imageUrl || 'https://via.placeholder.com/280')}
                  alt={product.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
                  <Typography variant="caption" color="primary" sx={{ fontWeight: 700, textTransform: 'uppercase', mb: 1 }}>
                    {product.category}
                  </Typography>
                  <Typography variant="h6" gutterBottom noWrap sx={{ fontWeight: 600 }}>{product.name}</Typography>
                  <Typography variant="h5" color="secondary" sx={{ fontWeight: 800, mb: 2 }}>₹{product.price.toLocaleString('en-IN')}</Typography>
                  
                  <Box sx={{ mt: 'auto', display: 'flex', gap: 1 }}>
                    <Button variant="outlined" color="primary" fullWidth component={Link} href={`/product/${product.id}`} sx={{ borderRadius: 3 }}>
                      View
                    </Button>
                    <Button variant="contained" color="secondary" fullWidth onClick={() => handleAddToCart(product)} sx={{ borderRadius: 3 }}>
                      Cart
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
