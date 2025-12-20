'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Avatar,
  Button,
  Divider,
  IconButton,
  Badge,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Announcement as AnnouncementIcon,
  PriorityHigh,
  Info,
  CheckCircle,
  School,
  Event,
  MoreVert,
  MarkEmailRead,
} from '@mui/icons-material';
import { useRecentAnnouncements, Announcement as APIAnnouncement } from '@/hooks/useAnnouncements';

interface AnnouncementDisplay extends APIAnnouncement {
  timestamp: string;
}

const formatAnnouncementTimestamp = (publishDate: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - publishDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 60) {
    return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  } else {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  }
};

const transformAnnouncement = (announcement: APIAnnouncement, isClient: boolean = false): AnnouncementDisplay => {
  // Format timestamp - only calculate relative time on client
  const publishDate = new Date(announcement.publishDate);
  const timestamp = isClient ? formatAnnouncementTimestamp(publishDate) : 'Just now';

  return {
    ...announcement,
    timestamp,
  };
};

const mockAnnouncementsBackup: unknown[] = [
  {
    id: 'announcement-1',
    title: 'Midterm Exam Schedule Released',
    content: 'The midterm examination schedule for all courses has been published. Please check your individual timetables.',
    author: 'Academic Office',
    course: 'General',
    timestamp: '2 hours ago',
    priority: 'high',
    type: 'urgent',
    isRead: false,
    hasAttachment: true
  },
  {
    id: 'announcement-2',
    title: 'Physics Lab Report Due Date Extended',
    content: 'Due to technical issues in the laboratory, the submission deadline has been extended to next Friday.',
    author: 'Prof. Michael Chen',
    course: 'Physics 101',
    timestamp: '4 hours ago',
    priority: 'medium',
    type: 'assignment',
    isRead: false
  },
  {
    id: 'announcement-3',
    title: 'Guest Lecture: AI in Modern Mathematics',
    content: 'Join us for an exciting guest lecture by Dr. Sarah Johnson on the applications of AI in mathematical research.',
    author: 'Dr. Sarah Wilson',
    course: 'Advanced Math',
    timestamp: '1 day ago',
    priority: 'medium',
    type: 'event',
    isRead: true,
    hasAttachment: false
  },
  {
    id: '4',
    title: 'Quiz Results Published',
    content: 'Results for Quiz #3 have been published. You can view your scores and feedback in the gradebook.',
    author: 'Dr. Emily Rodriguez',
    course: 'Computer Science',
    timestamp: '2 days ago',
    priority: 'low',
    type: 'grade',
    isRead: true
  },
  {
    id: '5',
    title: 'Library Hours Extended',
    content: 'The campus library will now be open 24/7 during the examination period to support your studies.',
    author: 'Library Administration',
    course: 'General',
    timestamp: '3 days ago',
    priority: 'low',
    type: 'general',
    isRead: true
  }
];

const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'high': return { bg: '#fecaca', color: '#991b1b', icon: PriorityHigh };
    case 'medium': return { bg: '#fef3c7', color: '#92400e', icon: Info };
    case 'low': return { bg: '#dcfce7', color: '#166534', icon: CheckCircle };
    default: return { bg: '#f3f4f6', color: '#374151', icon: Info };
  }
};

const getTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'assignment': return School;
    case 'event': return Event;
    case 'grade': return CheckCircle;
    case 'urgent': return PriorityHigh;
    default: return AnnouncementIcon;
  }
};

export default function Announcements() {
  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all');
  const [isClient, setIsClient] = useState(false);
  
  // Set client flag after mount
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Fetch announcements from API
  const { data: apiAnnouncements, isLoading, error, refetch } = useRecentAnnouncements(20);

  // Transform API announcements to display format
  const announcements = apiAnnouncements ? apiAnnouncements.map(a => transformAnnouncement(a, isClient)) : [];
  
  const filteredAnnouncements = announcements.filter(announcement => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !announcement.isRead;
    if (filter === 'high') return announcement.priority === 'HIGH';
    return true;
  });

  const unreadCount = announcements.filter(a => !a.isRead).length;

  const markAsRead = (id: string) => {
    // In a real app, this would update the backend
    console.log(`Marking announcement ${id} as read`);
  };

  const markAllAsRead = () => {
    // In a real app, this would update all announcements in the backend
    console.log('Marking all announcements as read');
  };

  if (isLoading) {
    return (
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Alert severity="error">
          Failed to load announcements. Please try again later.
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Badge badgeContent={unreadCount} color="error">
            <AnnouncementIcon sx={{ color: '#667eea' }} />
          </Badge>
          <Typography variant="h6" fontWeight={600}>
            Announcements
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              sx={{
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#e2e8f0'
                }
              }}
            >
              <MenuItem value="all">All ({announcements.length})</MenuItem>
              <MenuItem value="unread">Unread ({unreadCount})</MenuItem>
              <MenuItem value="high">High Priority ({announcements.filter(a => a.priority === 'HIGH').length})</MenuItem>
            </Select>
          </FormControl>
          
          <IconButton size="small" onClick={markAllAsRead}>
            <MarkEmailRead fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Announcements List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 400, overflowY: 'auto' }}>
        {filteredAnnouncements.map((announcement, index) => {
          const priorityStyle = getPriorityColor(announcement.priority);
          const TypeIcon = getTypeIcon(announcement.type);
          
          return (
            <Box key={announcement.id}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid #e2e8f0',
                  bgcolor: announcement.isRead ? 'white' : '#f8fafc',
                  borderLeft: !announcement.isRead ? '4px solid #667eea' : '4px solid transparent',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: '#f8fafc',
                    borderColor: '#cbd5e1'
                  }
                }}
              >
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {/* Icon */}
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: '#f8fafc',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <TypeIcon fontSize="small" sx={{ color: '#667eea' }} />
                  </Avatar>

                  {/* Content */}
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography 
                          variant="subtitle2" 
                          fontWeight={announcement.isRead ? 500 : 700}
                          sx={{ mb: 0.5 }}
                        >
                          {announcement.title}
                          {announcement.attachments && announcement.attachments.length > 0 && (
                            <Chip
                              label="📎"
                              size="small"
                              sx={{
                                ml: 1,
                                height: 18,
                                fontSize: '0.6rem',
                                bgcolor: '#e8eafc',
                                color: '#635bff'
                              }}
                            />
                          )}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {announcement.author?.email || 'System'} • {announcement.course?.title || 'General'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={announcement.priority}
                          size="small"
                          sx={{
                            bgcolor: priorityStyle.bg,
                            color: priorityStyle.color,
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            height: 20
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {announcement.timestamp}
                        </Typography>
                        <IconButton size="small">
                          <MoreVert fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {announcement.content}
                    </Typography>

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: '#e2e8f0',
                          color: 'text.secondary',
                          fontSize: '0.75rem'
                        }}
                      >
                        Read More
                      </Button>
                      
                      {!announcement.isRead && (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => markAsRead(announcement.id)}
                          sx={{
                            bgcolor: '#667eea',
                            fontSize: '0.75rem',
                            '&:hover': { bgcolor: '#5a67d8' }
                          }}
                        >
                          Mark as Read
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>
              
              {index < filteredAnnouncements.length - 1 && (
                <Divider sx={{ my: 1, opacity: 0.3 }} />
              )}
            </Box>
          );
        })}
      </Box>

      {/* Empty State */}
      {filteredAnnouncements.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            No announcements found
          </Typography>
        </Box>
      )}

      {/* View All Button */}
      <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
        <Button
          variant="outlined"
          size="small"
          sx={{ borderColor: '#e2e8f0', color: 'text.secondary' }}
        >
          View All Announcements
        </Button>
      </Box>
    </Paper>
  );
}