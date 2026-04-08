"use client";

import React, { useState, useRef } from 'react';
import { 
  Button, TextField, Box, Typography, Dialog, DialogTitle, 
  DialogContent, DialogActions, CircularProgress, Grid, 
  IconButton, Alert, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase/config';
import DeleteIcon from '@mui/icons-material/Delete';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

const CATEGORIES = ["All", "Electronics", "Fashion", "Home", "Beauty", "Others"];

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProductFormModal({ open, onClose, onSuccess }: ProductFormModalProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[1]); // Default to Electronics
  const [stock, setStock] = useState('10');
  const [brand, setBrand] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setImages(prev => [...prev, ...selectedFiles]);
      
      const selectedPreviews = selectedFiles.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...selectedPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      const newPreviews = prev.filter((_, i) => i !== index);
      // Revoke the URL to avoid memory leaks
      URL.revokeObjectURL(prev[index]);
      return newPreviews;
    });
  };

  const handleAddProduct = async () => {
    if (!name || !price || !description || !category || !stock || images.length === 0) {
      setError("Please fill all required fields and upload at least one image!");
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 1. Upload all images concurrently
      const uploadPromises = images.map(async (file) => {
        const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        return getDownloadURL(snapshot.ref);
      });

      const imageUrls = await Promise.all(uploadPromises);

      // 2. Save product to Firestore
      await addDoc(collection(db, 'products'), {
        name,
        price: parseFloat(price),
        description,
        category,
        stock: parseInt(stock),
        brand,
        imageUrl: imageUrls[0], // Main image
        images: imageUrls, // All images array
        createdAt: new Date()
      });
      
      // Cleanup previews
      previews.forEach(url => URL.revokeObjectURL(url));
      
      // Reset form
      setName('');
      setPrice('');
      setDescription('');
      setCategory(CATEGORIES[1]);
      setStock('10');
      setBrand('');
      setImages([]);
      setPreviews([]);
      setIsLoading(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Failed to add product", err);
      setError(err.message || "Failed to add product. Please check your connection.");
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={isLoading ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add New Product</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <TextField 
          fullWidth label="Product Name" margin="normal" 
          value={name} onChange={(e) => setName(e.target.value)} 
          disabled={isLoading}
        />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField 
              fullWidth label="Price (₹)" type="number" margin="normal" 
              value={price} onChange={(e) => setPrice(e.target.value)} 
              disabled={isLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField 
              fullWidth label="Stock Quantity" type="number" margin="normal" 
              value={stock} onChange={(e) => setStock(e.target.value)} 
              disabled={isLoading}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                label="Category"
                onChange={(e) => setCategory(e.target.value)}
                disabled={isLoading}
              >
                {CATEGORIES.filter(c => c !== "All").map(cat => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField 
              fullWidth label="Brand" margin="normal" 
              value={brand} onChange={(e) => setBrand(e.target.value)} 
              disabled={isLoading}
            />
          </Grid>
        </Grid>

        <TextField 
          fullWidth label="Description" margin="normal" multiline rows={3}
          value={description} onChange={(e) => setDescription(e.target.value)} 
          disabled={isLoading}
        />
        
        <Box sx={{ mt: 3, mb: 1 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
            Product Images
          </Typography>
          <Button 
            variant="outlined" 
            component="label" 
            startIcon={<AddPhotoAlternateIcon />}
            disabled={isLoading}
            fullWidth
            sx={{ borderStyle: 'dashed', py: 2 }}
          >
            Select Images
            <input 
              type="file" 
              hidden 
              accept="image/*" 
              multiple 
              onChange={handleFileChange} 
              ref={fileInputRef}
            />
          </Button>
        </Box>

        {/* Previews Grid */}
        <Grid container spacing={1} sx={{ mt: 1 }}>
          {previews.map((url, index) => (
            <Grid size={{ xs: 4, sm: 3 }} key={index}>
              <Box sx={{ position: 'relative', pt: '100%' }}>
                <Box 
                  component="img" 
                  src={url} 
                  sx={{ 
                    position: 'absolute', top: 0, left: 0, 
                    width: '100%', height: '100%', 
                    objectFit: 'cover', borderRadius: 1,
                    border: '1px solid #ddd'
                  }} 
                />
                <IconButton 
                  size="small" 
                  onClick={() => removeImage(index)}
                  sx={{ 
                    position: 'absolute', top: 2, right: 2, 
                    bgcolor: 'rgba(255,255,255,0.8)',
                    '&:hover': { bgcolor: 'white' }
                  }}
                  disabled={isLoading}
                >
                  <DeleteIcon fontSize="inherit" color="error" />
                </IconButton>
              </Box>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={isLoading}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handleAddProduct} 
          disabled={isLoading}
          sx={{ minWidth: 100, borderRadius: 5, height: 45 }}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Save Product'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
