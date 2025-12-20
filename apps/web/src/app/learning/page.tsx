'use client';

import { Box, Typography, Paper, Chip, Button, LinearProgress } from '@mui/material';
import { MenuBook, Assignment, TrendingUp, EmojiEvents } from '@mui/icons-material';
import { DashboardLayout } from '@/components';

export default function LearningPage() {
  return (
    <DashboardLayout title="My Learning">
      <Box>
        {/* Header */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <MenuBook sx={{ color: 'primary.main', fontSize: 28 }} />
            <Typography variant="h4" fontWeight={600}>
              My Learning Journey
            </Typography>
            <Chip 
              label="Level 15" 
              color="primary" 
              sx={{ ml: 'auto' }}
            />
          </Box>
          <Typography variant="body1" color="text.secondary">
            Track your learning progress, manage assignments, view resources, and celebrate achievements.
          </Typography>
        </Paper>

        {/* Progress Overview */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Overall Progress
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Current Semester Progress
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              78%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={78}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                bgcolor: 'primary.main'
              }
            }}
          />
        </Paper>

        {/* Learning Categories */}
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
            <Assignment sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
            <Typography variant="h6" fontWeight={600}>Assignments</Typography>
            <Typography variant="body2" color="text.secondary">
              5 pending tasks
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
            <MenuBook sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6" fontWeight={600}>Resources</Typography>
            <Typography variant="body2" color="text.secondary">
              Learning materials
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
            <TrendingUp sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
            <Typography variant="h6" fontWeight={600}>Progress</Typography>
            <Typography variant="body2" color="text.secondary">
              Track your growth
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
            <EmojiEvents sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
            <Typography variant="h6" fontWeight={600}>Achievements</Typography>
            <Typography variant="body2" color="text.secondary">
              12 badges earned
            </Typography>
          </Paper>
        </Box>

        {/* Coming Soon Notice */}
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            🎓 Coming Soon
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            We&apos;re creating an immersive learning experience with interactive assignments, 
            personalized learning paths, progress analytics, and achievement systems.
          </Typography>
          <Button variant="outlined" color="primary">
            Stay Tuned
          </Button>
        </Paper>
      </Box>
    </DashboardLayout>
  );
}