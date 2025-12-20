'use client';

import { Box, Typography, Paper, Chip, Button } from '@mui/material';
import { LocalLibrary, MenuBook, Download, Bookmark } from '@mui/icons-material';
import { DashboardLayout } from '@/components';

export default function LibraryPage() {
  return (
    <DashboardLayout title="Library">
      <Box>
        {/* Header */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <LocalLibrary sx={{ color: 'primary.main', fontSize: 28 }} />
            <Typography variant="h4" fontWeight={600}>
              Digital Library
            </Typography>
            <Chip 
              label="24/7 Access" 
              color="primary" 
              variant="outlined"
              sx={{ ml: 'auto' }}
            />
          </Box>
          <Typography variant="body1" color="text.secondary">
            Access digital resources, e-books, research papers, and study materials from our comprehensive library.
          </Typography>
        </Paper>

        {/* Library Services */}
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
          gap: 3,
          mb: 3
        }}>
          <Paper 
            sx={{ 
              p: 3, 
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 }
            }}
          >
            <MenuBook sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6" fontWeight={600}>E-Books</Typography>
            <Typography variant="body2" color="text.secondary">
              Access digital textbooks
            </Typography>
          </Paper>

          <Paper 
            sx={{ 
              p: 3, 
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 }
            }}
          >
            <Download sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6" fontWeight={600}>Resources</Typography>
            <Typography variant="body2" color="text.secondary">
              Download study materials
            </Typography>
          </Paper>

          <Paper 
            sx={{ 
              p: 3, 
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 }
            }}
          >
            <Bookmark sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6" fontWeight={600}>Bookmarks</Typography>
            <Typography variant="body2" color="text.secondary">
              Saved references
            </Typography>
          </Paper>

          <Paper 
            sx={{ 
              p: 3, 
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 }
            }}
          >
            <LocalLibrary sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6" fontWeight={600}>Research</Typography>
            <Typography variant="body2" color="text.secondary">
              Academic papers & journals
            </Typography>
          </Paper>
        </Box>

        {/* Coming Soon Notice */}
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            📚 Coming Soon
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            We&apos;re building a comprehensive digital library with advanced search, 
            personalized recommendations, and seamless integration with your coursework.
          </Typography>
          <Button variant="outlined" color="primary">
            Stay Tuned
          </Button>
        </Paper>
      </Box>
    </DashboardLayout>
  );
}