"use client";

import React from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, CssBaseline, ListItemButton, Divider } from '@mui/material';
import { 
  Dashboard as DashboardIcon, 
  Inventory as InventoryIcon, 
  People as PeopleIcon, 
  ShoppingCart as ShoppingCartIcon, 
  Logout as LogoutIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import AdminRoute from '../../components/AdminRoute';
import { useRouter, usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../lib/redux/store';
import { logoutUser } from '../../lib/redux/features/authSlice';
import { auth } from '../../lib/firebase/config';

const drawerWidth = 240;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      dispatch(logoutUser());
      router.push('/login');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <AdminRoute>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', color: 'text.primary', borderBottom: '1px solid rgba(0,0,0,0.1)', boxShadow: 'none' }}>
          <Toolbar>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
              Commerce Admin
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', borderRight: '1px solid rgba(0,0,0,0.1)', backgroundColor: 'transparent' },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto' }}>
            <List>
              {[
                { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
                { text: 'Products', icon: <InventoryIcon />, path: '/admin/products' },
                { text: 'Orders', icon: <ShoppingCartIcon />, path: '/admin/orders' },
                { text: 'Customers', icon: <PeopleIcon />, path: '/admin/users' },
              ].map((item) => (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton 
                    selected={pathname === item.path}
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(108, 99, 255, 0.1)',
                        borderRight: '3px solid var(--primary)',
                      }
                    }}
                  >
                    <ListItemIcon sx={{ color: pathname === item.path ? 'var(--primary)' : 'inherit' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            <Divider />
            <List>
              <ListItem disablePadding>
                  <ListItemButton onClick={handleLogout}>
                    <ListItemIcon><LogoutIcon color="error"/></ListItemIcon>
                    <ListItemText primary="Logout" sx={{ color: 'error.main' }}/>
                  </ListItemButton>
                </ListItem>
            </List>
          </Box>
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, p: 3, pt: 10 }}>
          {children}
        </Box>
      </Box>
    </AdminRoute>
  );
}
