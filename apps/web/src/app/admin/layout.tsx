'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  IconButton,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  Logout as LogoutIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { usePathname } from 'next/navigation';

const drawerWidth = 260;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
  { text: 'Users', icon: <PeopleIcon />, path: '/admin/users' },
  { text: 'Courses', icon: <SchoolIcon />, path: '/admin/courses' },
  { text: 'Enrollments', icon: <AssignmentIcon />, path: '/admin/enrollments' },
  { text: 'Analytics', icon: <AnalyticsIcon />, path: '/admin/analytics' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/admin/settings' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Fetch user profile to check admin role
  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => api.get('/auth/profile').then(res => res.data),
  });

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && profile) {
      const userRole = (profile as any)?.role;
      if (userRole !== 'ADMIN') {
        router.push('/dashboard');
      }
    }
  }, [profile, isLoading, router]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    router.push('/login');
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo/Header */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
        }}
      >
        <AdminIcon sx={{ fontSize: 32 }} />
        <Box>
          <Typography variant="h6" fontWeight="bold">
            Admin Panel
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            LMS Management
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Navigation Menu */}
      <List sx={{ flex: 1, py: 2 }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5, px: 1.5 }}>
              <ListItemButton
                onClick={() => router.push(item.path)}
                sx={{
                  borderRadius: '8px',
                  backgroundColor: isActive
                    ? alpha(theme.palette.primary.main, 0.1)
                    : 'transparent',
                  color: isActive ? theme.palette.primary.main : 'text.primary',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? theme.palette.primary.main : 'text.secondary',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 400,
                    fontSize: '0.9rem',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* User Info & Logout */}
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 1.5,
            borderRadius: '8px',
            backgroundColor: alpha(theme.palette.primary.main, 0.05),
            mb: 1,
          }}
        >
          <Avatar
            sx={{
              bgcolor: theme.palette.primary.main,
              width: 36,
              height: 36,
              fontSize: '0.9rem',
            }}
          >
            {(profile as any)?.firstName?.charAt(0) || 'A'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight="600" noWrap>
              {(profile as any)?.firstName || 'Admin'} {(profile as any)?.lastName || ''}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {(profile as any)?.email}
            </Typography>
          </Box>
        </Box>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: '8px',
            color: 'error.main',
            '&:hover': {
              backgroundColor: alpha(theme.palette.error.main, 0.08),
            },
          }}
        >
          <ListItemIcon sx={{ color: 'error.main', minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{ fontSize: '0.9rem' }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  // Show loading or unauthorized state
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!profile || (profile as any)?.role !== 'ADMIN') {
    return null; // Will redirect in useEffect
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      {/* App Bar for mobile */}
      <AppBar
        position="fixed"
        sx={{
          display: { xs: 'block', md: 'none' },
          width: '100%',
          backgroundColor: 'background.paper',
          color: 'text.primary',
          boxShadow: 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Admin Panel
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Drawer for desktop */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: 7, md: 0 },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
