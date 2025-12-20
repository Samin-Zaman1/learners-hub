'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  LinearProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Fab,
  Paper,
  Divider,
  CircularProgress,
  Badge,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  ArrowBack,
  PlayArrow,
  Download,
  Assignment,
  Quiz,
  Description,
  ExpandMore,
  CheckCircle,
  Lock,
  PictureAsPdf,
  VideoLibrary,
  AudioFile,
  SmartToy,
  Send,
  AttachFile,
  Close,
  Help,
  ExitToApp,
} from '@mui/icons-material';
import { DashboardLayout } from '@/components';
import { useRouter } from 'next/navigation';
import { useUnenrollCourse } from '@/hooks/useCourses';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`course-tabpanel-${index}`}
      aria-labelledby={`course-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [unenrollDialogOpen, setUnenrollDialogOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [aiQuery, setAiQuery] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your AI assistant for this course. I can help you with questions about the course materials, assignments, and concepts. What would you like to know?',
      timestamp: new Date(),
    }
  ]);

  // Unenroll mutation
  const unenrollMutation = useUnenrollCourse();

  const handleUnenroll = async () => {
    try {
      await unenrollMutation.mutateAsync(params.id);
      setSnackbarMessage('Successfully unenrolled from course');
      setUnenrollDialogOpen(false);
      setTimeout(() => router.push('/courses'), 1500);
    } catch (error: any) {
      setSnackbarMessage(error.response?.data?.message || 'Failed to unenroll from course');
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAiQuery = async () => {
    if (!aiQuery.trim()) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: aiQuery,
      timestamp: new Date(),
    };
    setChatMessages(prev => [...prev, userMessage]);
    
    setIsLoadingAI(true);
    setAiQuery('');
    
    // Simulate AI response - replace with actual AI API call
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `Based on the course materials for "Advanced React Development", here's my response:\n\n${generateAIResponse(userMessage.content)}`,
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, aiMessage]);
      setIsLoadingAI(false);
    }, 2000);
  };

  const generateAIResponse = (query: string): string => {
    // Simple response generation based on keywords - replace with actual AI
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('react') || lowerQuery.includes('component')) {
      return 'React components are the building blocks of a React application. They are reusable pieces of code that return JSX elements. Based on your course materials, you\'ve learned about functional and class components. Would you like me to explain any specific concept?';
    } else if (lowerQuery.includes('state') || lowerQuery.includes('usestate')) {
      return 'State in React allows components to create and manage their own data. The useState hook is the most common way to add state to functional components. According to your course materials in Module 2, state updates trigger re-renders.';
    } else if (lowerQuery.includes('props')) {
      return 'Props (properties) are how you pass data from parent to child components in React. They are read-only and help make components reusable. Check out the examples in your PDF materials for practical implementations.';
    } else if (lowerQuery.includes('assignment') || lowerQuery.includes('homework')) {
      return 'I can help you with your assignments! Please share the specific question or concept you\'re struggling with, and I\'ll guide you through it using the course materials as reference.';
    } else {
      return 'I understand you\'re asking about: "' + query + '". Could you be more specific? I can help you with React concepts, course materials, assignments, or any other topic covered in this course.';
    }
  };

  // Fetch course data from backend
  const { data: courseData, isLoading: courseLoading } = useQuery({
    queryKey: ['student-course', params.id],
    queryFn: () => apiClient.get(`/courses/${params.id}`).then(res => res.data)
  });
  
  if (courseLoading) {
    return (
      <DashboardLayout title="Loading...">
        <Box sx={{ p: 3 }}>
          <LinearProgress />
        </Box>
      </DashboardLayout>
    );
  }
  
  if (!courseData) {
    return (
      <DashboardLayout title="Course Not Found">
        <Alert severity="error" sx={{ m: 3 }}>
          Course not found or you don't have access to it.
        </Alert>
      </DashboardLayout>
    );
  }

  const course = {
    id: courseData.id,
    title: courseData.title,
    code: courseData.code,
    instructor: `${courseData.instructorUser.firstName} ${courseData.instructorUser.lastName}`,
    description: courseData.description,
    color: courseData.color || '#667eea',
    progress: 65, // TODO: Calculate actual progress
    totalLessons: courseData.modules.reduce((sum: number, mod: any) => sum + (mod.materials?.length || 0), 0) + (courseData.materials?.length || 0),
    completedLessons: 0, // TODO: Track completion
    enrolledStudents: courseData._count.enrollments,
    duration: courseData.semester || '12 weeks',
    level: courseData.level || 'Intermediate',
    prerequisites: [], // TODO: Add if needed
    nextLesson: 'Continue Learning'
  };

  const modules = courseData.modules.map((mod: any) => ({
    id: mod.id,
    title: mod.title,
    lessons: mod.materials?.length || 0,
    completed: 0, // TODO: Track completion
    isCompleted: false,
    materials: mod.materials?.map((mat: any) => ({
      id: mat.id,
      title: mat.title,
      type: mat.type?.toLowerCase() || 'document',
      url: mat.url,
      description: mat.description,
      completed: false // TODO: Track completion
    })) || []
  }));

  const assignments = [
    { id: 1, title: 'Custom Hook Implementation', dueDate: '2024-11-20', status: 'submitted', grade: 95 },
    { id: 2, title: 'Redux Todo Application', dueDate: '2024-12-01', status: 'pending', grade: null },
    { id: 3, title: 'Performance Optimization Project', dueDate: '2024-12-08', status: 'not-started', grade: null }
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'video': return <VideoLibrary sx={{ color: '#ef4444' }} />;
      case 'pdf': return <PictureAsPdf sx={{ color: '#dc2626' }} />;
      case 'audio': return <AudioFile sx={{ color: '#7c3aed' }} />;
      case 'quiz': return <Quiz sx={{ color: '#059669' }} />;
      case 'assignment': return <Assignment sx={{ color: '#d97706' }} />;
      default: return <Description sx={{ color: '#6b7280' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'not-started': return '#6b7280';
      default: return '#6b7280';
    }
  };

  return (
    <DashboardLayout title={course.title}>
      <Box>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => router.back()}
            >
              Back to Courses
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<ExitToApp />}
              onClick={() => setUnenrollDialogOpen(true)}
            >
              Unenroll from Course
            </Button>
          </Box>
          
          <Card sx={{ p: 4, bgcolor: `${course.color}10`, border: `2px solid ${course.color}20` }}>
            <Box sx={{ display: 'flex', gap: 4, alignItems: 'center', flexDirection: { xs: 'column', md: 'row' } }}>
              <Box sx={{ flex: 1, width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: course.color, mr: 2, width: 56, height: 56 }}>
                    <PlayArrow />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight={600} sx={{ mb: 1 }}>
                      {course.title}
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                      {course.code} • {course.instructor}
                    </Typography>
                  </Box>
                </Box>
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  {course.description}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                  <Chip label={`${course.level} Level`} variant="outlined" />
                  <Chip label={`${course.duration}`} variant="outlined" />
                  <Chip label={`${course.enrolledStudents} Students`} variant="outlined" />
                </Box>
              </Box>
              
              <Box sx={{ width: { xs: '100%', md: 'auto' } }}>
                <Card sx={{ p: 3, textAlign: 'center', minWidth: 250 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                    Course Progress
                  </Typography>
                  <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                    <Box
                      sx={{
                        width: 100,
                        height: 100,
                        borderRadius: '50%',
                        background: `conic-gradient(${course.color} ${course.progress * 3.6}deg, #e5e7eb 0deg)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: '50%',
                          bgcolor: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Typography variant="h5" fontWeight={600} color={course.color}>
                          {course.progress}%
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {course.completedLessons} of {course.totalLessons} lessons completed
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<PlayArrow />}
                    fullWidth
                    sx={{ mt: 2, bgcolor: course.color }}
                  >
                    Continue: {course.nextLesson}
                  </Button>
                </Card>
              </Box>
            </Box>
          </Card>
        </Box>

        {/* Course Content Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="course content tabs">
            <Tab label="Course Content" />
            <Tab label="Assignments" />
            <Tab label="Resources" />
            <Tab label="Discussion" />
          </Tabs>
        </Box>

        {/* Course Content */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {modules.map((module: any) => (
              <Accordion key={module.id} defaultExpanded={!module.isCompleted}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={600}>
                        Module {module.id}: {module.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {module.completed} of {module.lessons} lessons completed
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 2 }}>
                      {module.isCompleted && (
                        <CheckCircle sx={{ color: '#10b981' }} />
                      )}
                      <LinearProgress
                        variant="determinate"
                        value={(module.completed / module.lessons) * 100}
                        sx={{ width: 100, height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    {module.materials.map((material: any, index: number) => (
                      <ListItem key={material.id} disablePadding>
                        <ListItemButton disabled={!material.completed && index > 0 && !module.materials[index - 1].completed}>
                          <ListItemIcon>
                            {material.completed ? (
                              <CheckCircle sx={{ color: '#10b981' }} />
                            ) : material.completed || index === 0 || module.materials[index - 1].completed ? (
                              getFileIcon(material.type)
                            ) : (
                              <Lock sx={{ color: '#9ca3af' }} />
                            )}
                          </ListItemIcon>
                          <ListItemText
                            primary={material.title}
                            secondary={
                              material.type === 'video' ? `${material.duration}` :
                              material.type === 'pdf' ? `PDF • ${material.size}` :
                              material.type === 'quiz' ? `${material.questions} questions` :
                              material.type === 'assignment' ? `Due: ${material.dueDate}` :
                              'Click to view'
                            }
                          />
                          <IconButton>
                            <Download />
                          </IconButton>
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </TabPanel>

        {/* Assignments */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {assignments.map((assignment) => (
              <Card key={assignment.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                        {assignment.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Due: {assignment.dueDate}
                      </Typography>
                      <Chip 
                        label={assignment.status.replace('-', ' ')}
                        sx={{ 
                          bgcolor: getStatusColor(assignment.status) + '20',
                          color: getStatusColor(assignment.status),
                          textTransform: 'capitalize'
                        }}
                      />
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      {assignment.grade && (
                        <Typography variant="h5" fontWeight={600} color="#10b981">
                          {assignment.grade}/100
                        </Typography>
                      )}
                      <Button
                        variant={assignment.status === 'not-started' ? 'contained' : 'outlined'}
                        sx={{ mt: 1 }}
                      >
                        {assignment.status === 'submitted' ? 'View Submission' :
                         assignment.status === 'pending' ? 'Edit Submission' :
                         'Start Assignment'}
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </TabPanel>

        {/* Resources */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" sx={{ mb: 2 }}>Course Resources</Typography>
          <Typography variant="body2" color="text.secondary">
            Additional resources and materials will be available here.
          </Typography>
        </TabPanel>

        {/* Discussion */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" sx={{ mb: 2 }}>Course Discussion</Typography>
          <Typography variant="body2" color="text.secondary">
            Discussion forum and Q&A section will be available here.
          </Typography>
        </TabPanel>

        {/* AI Assistant FAB */}
        <Fab
          color="primary"
          aria-label="AI Assistant"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            bgcolor: course.color,
            '&:hover': { bgcolor: course.color + 'dd' }
          }}
          onClick={() => setAiDialogOpen(true)}
        >
          <Badge badgeContent={chatMessages.length > 1 ? '!' : 0} color="error">
            <SmartToy />
          </Badge>
        </Fab>

        {/* AI Assistant Chat Dialog */}
        <Dialog 
          open={aiDialogOpen} 
          onClose={() => setAiDialogOpen(false)} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: { height: '80vh', display: 'flex', flexDirection: 'column' }
          }}
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SmartToy sx={{ color: course.color }} />
              <Box>
                <Typography variant="h6">Course AI Assistant</Typography>
                <Typography variant="caption" color="text.secondary">
                  Powered by course materials • {course.title}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setAiDialogOpen(false)}>
              <Close />
            </IconButton>
          </DialogTitle>
          
          <DialogContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0 }}>
            {/* Chat Messages */}
            <Box sx={{ 
              flex: 1, 
              overflow: 'auto', 
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}>
              {chatMessages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    display: 'flex',
                    justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <Paper
                    sx={{
                      p: 2,
                      maxWidth: '80%',
                      bgcolor: message.type === 'user' ? course.color : '#f5f5f5',
                      color: message.type === 'user' ? 'white' : 'text.primary',
                    }}
                  >
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                      {message.content}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: 'block', 
                        mt: 1, 
                        opacity: 0.8,
                        fontSize: '0.75rem'
                      }}
                    >
                      {message.timestamp.toLocaleTimeString()}
                    </Typography>
                  </Paper>
                </Box>
              ))}
              
              {/* Loading indicator */}
              {isLoadingAI && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={16} />
                      <Typography variant="body2">AI is thinking...</Typography>
                    </Box>
                  </Paper>
                </Box>
              )}
            </Box>
            
            <Divider />
            
            {/* Input Area */}
            <Box sx={{ p: 2 }}>
              <Alert severity="info" sx={{ mb: 2, fontSize: '0.875rem' }}>
                <strong>Tip:</strong> Ask me about course concepts, assignments, or specific materials. I have access to all course content!
              </Alert>
              
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={4}
                  placeholder="Ask about course materials, concepts, assignments..."
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAiQuery();
                    }
                  }}
                  variant="outlined"
                  size="small"
                />
                <IconButton
                  onClick={handleAiQuery}
                  disabled={!aiQuery.trim() || isLoadingAI}
                  sx={{
                    bgcolor: course.color,
                    color: 'white',
                    '&:hover': { bgcolor: course.color + 'dd' },
                    '&:disabled': { bgcolor: 'grey.300' }
                  }}
                >
                  <Send />
                </IconButton>
              </Box>
              
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Press Enter to send, Shift+Enter for new line
              </Typography>
            </Box>
          </DialogContent>
        </Dialog>

        {/* Unenroll Confirmation Dialog */}
        <Dialog
          open={unenrollDialogOpen}
          onClose={() => setUnenrollDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Confirm Unenrollment</DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Are you sure you want to unenroll from <strong>{course.title}</strong>?
            </Alert>
            <Typography variant="body2" color="text.secondary">
              You will lose access to:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="• All course materials and videos" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Your progress and completion status" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Access to assignments and quizzes" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Course discussions and AI assistant" />
              </ListItem>
            </List>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              You can re-enroll later if you have the invitation code.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUnenrollDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUnenroll}
              color="error"
              variant="contained"
              disabled={unenrollMutation.isPending}
            >
              {unenrollMutation.isPending ? 'Unenrolling...' : 'Unenroll'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={!!snackbarMessage}
          autoHideDuration={3000}
          onClose={() => setSnackbarMessage('')}
          message={snackbarMessage}
        />
      </Box>
    </DashboardLayout>
  );
}