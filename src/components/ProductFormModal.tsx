"use client";

import React, { useState } from 'react';
import { Button, TextField, Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress } from '@mui/material';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase/config';

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProductFormModal({ open, onClose, onSuccess }: ProductFormModalProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleAddProduct = async () => {
    if (!name || !price || !description || !image) return alert("Please fill all fields!");

    const storageRef = ref(storage, `products/${Date.now()}_${image.name}`);
    const uploadTask = uploadBytesResumable(storageRef, image);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload failed", error);
        alert("Upload failed.");
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        await addDoc(collection(db, 'products'), {
          name,
          price: parseFloat(price),
          description,
          imageUrl: downloadURL,
          createdAt: new Date()
        });
        
        // Reset form
        setName('');
        setPrice('');
        setDescription('');
        setImage(null);
        setUploadProgress(0);
        onSuccess();
        onClose();
      }
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add New Product</DialogTitle>
      <DialogContent>
        <TextField 
          fullWidth label="Product Name" margin="normal" 
          value={name} onChange={(e) => setName(e.target.value)} 
        />
        <TextField 
          fullWidth label="Price ($)" type="number" margin="normal" 
          value={price} onChange={(e) => setPrice(e.target.value)} 
        />
        <TextField 
          fullWidth label="Description" margin="normal" multiline rows={3}
          value={description} onChange={(e) => setDescription(e.target.value)} 
        />
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" component="label">
            Upload Image
            <input type="file" hidden accept="image/*" onChange={(e) => {
              if (e.target.files && e.target.files[0]) setImage(e.target.files[0]);
            }} />
          </Button>
          {image && <Typography sx={{ ml: 2, display: 'inline' }}>{image.name}</Typography>}
        </Box>
        {uploadProgress > 0 && uploadProgress < 100 && (
          <LinearProgress variant="determinate" value={uploadProgress} sx={{ mt: 2 }} />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleAddProduct} disabled={uploadProgress > 0 && uploadProgress < 100}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
