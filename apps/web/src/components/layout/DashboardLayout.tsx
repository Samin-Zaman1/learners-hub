'use client';

import { useState, useEffect } from 'react';
import { Box, AppBar, Toolbar, IconButton, Typography, useTheme, useMediaQuery } from '@mui/material';
import { Menu as MenuIcon, Notifications, AccountCircle } from '@mui/icons-material';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'), {
    noSsr: true, // Prevent SSR mismatch by only evaluating on client
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (!mounted) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }} suppressHydrationWarning>
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        variant={isMobile ? 'temporary' : 'permanent'}
      />

      {/* Main Content Area */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }} suppressHydrationWarning>
        {/* Top AppBar - Only show on mobile or when needed */}
        {isMobile && (
          <AppBar
            position="fixed"
            sx={{
              zIndex: theme.zIndex.drawer + 1,
              bgcolor: 'background.paper',
              color: 'text.primary',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <Toolbar>
              <IconButton
                edge="start"
                onClick={handleSidebarToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              
              <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
                {title || 'Champius'}
              </Typography>
              
              <IconButton>
                <Notifications />
              </IconButton>
              
              <IconButton>
                <AccountCircle />
              </IconButton>
            </Toolbar>
          </AppBar>
        )}

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            mt: isMobile ? 8 : 0, // Add top margin on mobile for AppBar
            bgcolor: 'background.default',
            minHeight: '100vh',
          }}
          suppressHydrationWarning
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}