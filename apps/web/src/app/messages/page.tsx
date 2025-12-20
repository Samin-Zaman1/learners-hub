'use client';

import { Box, Typography, Paper, Chip, Button, Badge } from '@mui/material';
import { Chat, Group, Announcement, Support } from '@mui/icons-material';
import { DashboardLayout } from '@/components';

export default function MessagesPage() {
  return (
    <DashboardLayout title="Messages">
      <Box>
        {/* Header */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Chat sx={{ color: 'primary.main', fontSize: 28 }} />
            <Typography variant="h4" fontWeight={600}>
              Messages
            </Typography>
            <Badge badgeContent={3} color="error" sx={{ ml: 'auto' }}>
              <Chip 
                label="3 Unread" 
                color="error" 
                variant="outlined"
              />
            </Badge>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Stay connected with instructors, classmates, and support staff through our messaging system.
          </Typography>
        </Paper>

        {/* Message Categories */}
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
            <Badge badgeContent={2} color="error">
              <Chat sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            </Badge>
            <Typography variant="h6" fontWeight={600}>Direct Messages</Typography>
            <Typography variant="body2" color="text.secondary">
              Personal conversations
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
            <Badge badgeContent={1} color="error">
              <Group sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            </Badge>
            <Typography variant="h6" fontWeight={600}>Group Chats</Typography>
            <Typography variant="body2" color="text.secondary">
              Course discussions
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
            <Announcement sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6" fontWeight={600}>Announcements</Typography>
            <Typography variant="body2" color="text.secondary">
              Official notifications
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
            <Support sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6" fontWeight={600}>Support</Typography>
            <Typography variant="body2" color="text.secondary">
              Help & assistance
            </Typography>
          </Paper>
        </Box>

        {/* Coming Soon Notice */}
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            💬 Coming Soon
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            We&apos;re developing a comprehensive messaging platform with real-time chat, 
            file sharing, voice messages, and integration with your courses.
          </Typography>
          <Button variant="outlined" color="primary">
            Stay Tuned
          </Button>
        </Paper>
      </Box>
    </DashboardLayout>
  );
}