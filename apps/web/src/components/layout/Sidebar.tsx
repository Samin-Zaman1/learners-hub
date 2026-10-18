'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  Avatar,
  Collapse,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard,
  School,
  EventAvailable,
  LocalLibrary,
  Chat,
  MenuBook,
  ChevronLeft,
  ChevronRight,
  ExpandLess,
  ExpandMore,
  Person,
  Settings,
  Logout,
  Assignment,
  Class,
  GroupAdd,
  Analytics,
  VideoCall,
  CalendarToday,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

// Navigation menu structure
interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
  subItems?: Omit<NavItem, 'subItems'>[];
}

const navigationItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <Dashboard />,
    path: '/dashboard',
  },
  {
    id: 'tasks',
    label: 'Tasks',
    icon: <Assignment />,
    path: '/tasks',
  },
  {
    id: 'courses',
    label: 'My Courses',
    icon: <MenuBook />,
    path: '/courses',
    subItems: [
      { id: 'enroll', label: 'Enroll in Course', icon: <GroupAdd />, path: '/courses/enroll' },
    ],
  },
  {
    id: 'semester',
    label: 'My Semester',
    icon: <School />,
    path: '/semester',
    subItems: [
      { id: 'semester-status', label: 'Semester Status', icon: <School />, path: '/semester' },
      { id: 'schedule', label: 'Schedule', icon: <EventAvailable />, path: '/schedule' },
      { id: 'grades', label: 'Grades', icon: <School />, path: '/grades' },
    ],
  },
  {
    id: 'attendance',
    label: 'My Attendance',
    icon: <EventAvailable />,
    path: '/attendance',
  },
  {
    id: 'library',
    label: 'Library',
    icon: <LocalLibrary />,
    path: '/library',
  },
  {
    id: 'messages',
    label: 'Messages',
    icon: <Chat />,
    path: '/messages',
    badge: 3, // Example badge for unread messages
  },
  {
    id: 'learning',
    label: 'My Learning',
    icon: <MenuBook />,
    path: '/learning',
    subItems: [
      { id: 'assignments', label: 'Assignments', icon: <MenuBook />, path: '/learning/assignments' },
      { id: 'resources', label: 'Resources', icon: <LocalLibrary />, path: '/learning/resources' },
      { id: 'progress', label: 'Progress', icon: <Dashboard />, path: '/learning/progress' },
    ],
  },
];

const instructorNavigationItems: NavItem[] = [
  {
    id: 'instructor-dashboard',
    label: 'Instructor Dashboard',
    icon: <Class />,
    path: '/instructor',
  },
  {
    id: 'my-courses',
    label: 'My Courses',
    icon: <School />,
    path: '/instructor/courses',
    subItems: [
      { id: 'create-course', label: 'Create Course', icon: <GroupAdd />, path: '/instructor/courses/create' },
    ],
  },
  {
    id: 'classes',
    label: 'Live Classes',
    icon: <VideoCall />,
    path: '/instructor/classes',
  },
  {
    id: 'students',
    label: 'Students',
    icon: <Person />,
    path: '/instructor/students',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: <Analytics />,
    path: '/instructor/analytics',
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: <CalendarToday />,
    path: '/instructor/calendar',
  },
  {
    id: 'messages',
    label: 'Messages',
    icon: <Chat />,
    path: '/messages',
    badge: 3,
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  variant?: 'permanent' | 'persistent' | 'temporary';
}

const SIDEBAR_WIDTH = 280;
const SIDEBAR_COLLAPSED_WIDTH = 64;

export default function Sidebar({ open, onClose, variant = 'permanent' }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'), {
    noSsr: true, // Prevent SSR mismatch
  });
  const { user, logout } = useAuth();
  
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['semester', 'learning']);

  // Determine navigation items based on user role
  const currentNavigationItems = user?.role === 'INSTRUCTOR' 
    ? instructorNavigationItems 
    : navigationItems;

  // Determine if a nav item is active
  const isActiveItem = (item: NavItem): boolean => {
    if (item.path === pathname) return true;
    if (item.subItems) {
      return item.subItems.some(subItem => subItem.path === pathname);
    }
    return pathname.startsWith(item.path) && item.path !== '/';
  };

  // Handle navigation
  const handleNavigation = (path: string) => {
    router.push(path);
    if (isMobile) {
      onClose();
    }
  };

  // Handle sub-menu expansion
  const handleExpand = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Toggle sidebar collapse (desktop only)
  const handleToggleCollapse = () => {
    if (!isMobile) {
      setCollapsed(!collapsed);
    }
  };

  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header with Logo */}
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          minHeight: 72,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        {!collapsed ? (
          <Box
            component="img"
            src="/logo.svg"
            alt="Learners Hub Logo"
            sx={{
              height: 40,
              width: 'auto',
            }}
          />
        ) : (
          <Box
            component="img"
            src="/logo.svg"
            alt="Learners Hub"
            sx={{
              height: 32,
              width: 'auto',
            }}
          />
        )}
      </Box>

      {/* Quick Access Title */}
      {!collapsed && (
        <Box sx={{ px: 2.5, pt: 3, pb: 1 }}>
          <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
            Quick Access
          </Typography>
        </Box>
      )}

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
        <List sx={{ px: 1 }}>
          {currentNavigationItems.map((item) => (
            <Box key={item.id}>
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => {
                    if (item.subItems) {
                      handleExpand(item.id);
                    } else {
                      handleNavigation(item.path);
                    }
                  }}
                  sx={{
                    borderRadius: 2,
                    minHeight: 48,
                    bgcolor: isActiveItem(item) ? 'primary.main' : 'transparent',
                    color: isActiveItem(item) ? 'primary.contrastText' : 'text.primary',
                    '&:hover': {
                      bgcolor: isActiveItem(item) ? 'primary.dark' : 'action.hover',
                    },
                    px: collapsed ? 1.5 : 2,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: 'inherit',
                      minWidth: collapsed ? 'auto' : 40,
                      justifyContent: 'center',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  
                  {!collapsed && (
                    <>
                      <ListItemText 
                        primary={item.label}
                        primaryTypographyProps={{
                          fontSize: 14,
                          fontWeight: 500,
                        }}
                      />
                      
                      {/* Badge for notifications */}
                      {item.badge && (
                        <Box
                          sx={{
                            bgcolor: 'error.main',
                            color: 'error.contrastText',
                            borderRadius: '50%',
                            width: 20,
                            height: 20,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 10,
                            fontWeight: 600,
                            mr: 1,
                          }}
                        >
                          {item.badge}
                        </Box>
                      )}
                      
                      {/* Expand/Collapse icon for sub-menus */}
                      {item.subItems && (
                        expandedItems.includes(item.id) ? <ExpandLess /> : <ExpandMore />
                      )}
                    </>
                  )}
                </ListItemButton>
              </ListItem>

              {/* Sub-menu items */}
              {item.subItems && !collapsed && (
                <Collapse in={expandedItems.includes(item.id)} timeout="auto">
                  <List disablePadding sx={{ pl: 2 }}>
                    {item.subItems.map((subItem) => (
                      <ListItem key={subItem.id} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                          onClick={() => handleNavigation(subItem.path)}
                          sx={{
                            borderRadius: 2,
                            minHeight: 40,
                            bgcolor: pathname === subItem.path ? 'primary.main' : 'transparent',
                            color: pathname === subItem.path ? 'primary.contrastText' : 'text.secondary',
                            '&:hover': {
                              bgcolor: pathname === subItem.path ? 'primary.dark' : 'action.hover',
                            },
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              color: 'inherit',
                              minWidth: 32,
                              fontSize: 20,
                            }}
                          >
                            {subItem.icon}
                          </ListItemIcon>
                          <ListItemText 
                            primary={subItem.label}
                            primaryTypographyProps={{
                              fontSize: 13,
                              fontWeight: 400,
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              )}
            </Box>
          ))}
        </List>
      </Box>

      {/* Footer Actions */}
      <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider' }}>
        <List>
          {/* Role Toggle */}
          {!collapsed && user && (
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  if (user.role === 'INSTRUCTOR') {
                    router.push('/dashboard');
                  } else {
                    router.push('/instructor');
                  }
                }}
                sx={{
                  borderRadius: 2,
                  minHeight: 48,
                  px: 2,
                  bgcolor: 'secondary.light',
                  color: 'secondary.contrastText',
                  '&:hover': {
                    bgcolor: 'secondary.main',
                  },
                  mb: 1,
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                  {user.role === 'INSTRUCTOR' ? <Person /> : <Class />}
                </ListItemIcon>
                <ListItemText 
                  primary={user.role === 'INSTRUCTOR' ? 'Switch to Student View' : 'Switch to Instructor View'}
                  primaryTypographyProps={{ fontSize: 12, fontWeight: 600 }}
                />
              </ListItemButton>
            </ListItem>
          )}
          
          <ListItem disablePadding>
            <ListItemButton
              sx={{
                borderRadius: 2,
                minHeight: 48,
                px: collapsed ? 1.5 : 2,
              }}
            >
              <ListItemIcon sx={{ color: 'text.secondary', minWidth: collapsed ? 'auto' : 40 }}>
                <Settings />
              </ListItemIcon>
              {!collapsed && (
                <ListItemText 
                  primary="Settings"
                  primaryTypographyProps={{ fontSize: 14 }}
                />
              )}
            </ListItemButton>
          </ListItem>
          
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                logout();
                router.push('/login');
              }}
              sx={{
                borderRadius: 2,
                minHeight: 48,
                px: collapsed ? 1.5 : 2,
                color: 'error.main',
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: collapsed ? 'auto' : 40 }}>
                <Logout />
              </ListItemIcon>
              {!collapsed && (
                <ListItemText 
                  primary="Logout"
                  primaryTypographyProps={{ fontSize: 14 }}
                />
              )}
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : variant}
      open={isMobile ? open : true}
      onClose={onClose}
      sx={{
        width: sidebarWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: sidebarWidth,
          boxSizing: 'border-box',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: 'hidden',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
      ModalProps={{
        keepMounted: true, // Better mobile performance
      }}
    >
      {drawerContent}
    </Drawer>
  );
}