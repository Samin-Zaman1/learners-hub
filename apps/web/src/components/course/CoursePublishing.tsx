'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Warning,
  Info,
  Publish,
  Drafts,
  Archive,
  Visibility,
  VisibilityOff,
  School,
  Assignment,
  VideoLibrary,
  People,
} from '@mui/icons-material';

interface Course {
  id: string;
  title: string;
  description: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  modules: CourseModule[];
  enrolledStudents: number;
}

interface CourseModule {
  id: string;
  title: string;
  description: string;
  materials: CourseMaterial[];
}

interface CourseMaterial {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  checklist: ChecklistItem[];
}

interface ChecklistItem {
  id: string;
  label: string;
  isValid: boolean;
  severity: 'error' | 'warning' | 'info';
  description?: string;
}

interface CoursePublishingProps {
  course: Course;
  open: boolean;
  onClose: () => void;
  onPublish: (courseId: string) => Promise<void>;
  onUnpublish: (courseId: string) => Promise<void>;
  onArchive: (courseId: string) => Promise<void>;
}

export default function CoursePublishing({
  course,
  open,
  onClose,
  onPublish,
  onUnpublish,
  onArchive,
}: CoursePublishingProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const validateCourse = (): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const checklist: ChecklistItem[] = [];

    // Basic information validation
    if (!course.title.trim()) {
      errors.push('Course title is required');
    }
    if (!course.description.trim()) {
      errors.push('Course description is required');
    }
    if (course.description.length < 50) {
      warnings.push('Course description should be at least 50 characters');
    }

    checklist.push({
      id: 'title',
      label: 'Course has a clear title',
      isValid: !!course.title.trim(),
      severity: 'error',
      description: 'A descriptive title helps students find your course'
    });

    checklist.push({
      id: 'description',
      label: 'Course has a detailed description',
      isValid: course.description.length >= 50,
      severity: course.description.length > 0 ? 'warning' : 'error',
      description: 'A good description explains what students will learn'
    });

    // Content validation
    const hasModules = course.modules.length > 0;
    const totalMaterials = course.modules.reduce((acc, module) => acc + module.materials.length, 0);
    const hasVideoContent = course.modules.some(module => 
      module.materials.some(material => material.type === 'VIDEO')
    );
    const hasPDFContent = course.modules.some(module => 
      module.materials.some(material => material.type === 'PDF')
    );

    if (!hasModules) {
      errors.push('Course must have at least one module');
    }
    if (totalMaterials === 0) {
      errors.push('Course must have learning materials');
    }
    if (totalMaterials < 3) {
      warnings.push('Consider adding more learning materials for better student experience');
    }

    checklist.push({
      id: 'modules',
      label: `Course has ${course.modules.length} module(s)`,
      isValid: hasModules,
      severity: 'error',
      description: 'Organize your content into logical modules'
    });

    checklist.push({
      id: 'materials',
      label: `Course has ${totalMaterials} learning material(s)`,
      isValid: totalMaterials > 0,
      severity: 'error',
      description: 'Students need materials to learn from'
    });

    checklist.push({
      id: 'video',
      label: 'Course includes video content',
      isValid: hasVideoContent,
      severity: 'info',
      description: 'Video content improves student engagement'
    });

    checklist.push({
      id: 'pdf',
      label: 'Course includes downloadable resources',
      isValid: hasPDFContent,
      severity: 'info',
      description: 'PDFs and documents provide reference materials'
    });

    // Quality checks
    const allModulesHaveContent = course.modules.every(module => module.materials.length > 0);
    const allModulesHaveDescriptions = course.modules.every(module => module.description.trim().length > 0);

    checklist.push({
      id: 'module-content',
      label: 'All modules have learning materials',
      isValid: allModulesHaveContent,
      severity: 'warning',
      description: 'Empty modules provide poor learning experience'
    });

    checklist.push({
      id: 'module-descriptions',
      label: 'All modules have descriptions',
      isValid: allModulesHaveDescriptions,
      severity: 'info',
      description: 'Module descriptions help students understand the content'
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      checklist
    };
  };

  const validation = validateCourse();

  const handlePublish = async () => {
    if (!validation.isValid || !agreedToTerms) return;
    
    setLoading(true);
    try {
      await onPublish(course.id);
      onClose();
    } catch (error) {
      console.error('Failed to publish course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnpublish = async () => {
    setLoading(true);
    try {
      await onUnpublish(course.id);
      onClose();
    } catch (error) {
      console.error('Failed to unpublish course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    setLoading(true);
    try {
      await onArchive(course.id);
      onClose();
    } catch (error) {
      console.error('Failed to archive course:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStepIcon = (step: number) => {
    switch (step) {
      case 0: return <Assignment />;
      case 1: return <CheckCircle />;
      case 2: return <Publish />;
      default: return <Info />;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return <Error color="error" />;
      case 'warning': return <Warning color="warning" />;
      case 'info': return <Info color="info" />;
      default: return <CheckCircle color="success" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'success';
    }
  };

  const renderPublishingWorkflow = () => (
    <Stepper activeStep={activeStep} orientation="vertical">
      <Step>
        <StepLabel icon={getStepIcon(0)}>
          Review Course Content
        </StepLabel>
        <StepContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Ensure your course has all necessary content and materials before publishing.
          </Typography>
          
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Course Overview
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Chip icon={<School />} label={`${course.modules.length} Modules`} />
                <Chip icon={<VideoLibrary />} label={`${course.modules.reduce((acc, m) => acc + m.materials.length, 0)} Materials`} />
                <Chip icon={<People />} label={`${course.enrolledStudents} Students`} />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {course.description}
              </Typography>
            </CardContent>
          </Card>

          <Button
            variant="contained"
            onClick={() => setActiveStep(1)}
            sx={{ mt: 1, mr: 1 }}
          >
            Continue
          </Button>
        </StepContent>
      </Step>

      <Step>
        <StepLabel icon={getStepIcon(1)}>
          Validation & Quality Check
        </StepLabel>
        <StepContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Review the validation results to ensure your course meets quality standards.
          </Typography>

          {validation.errors.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Please fix these issues before publishing:
              </Typography>
              <List dense>
                {validation.errors.map((error, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={error} />
                  </ListItem>
                ))}
              </List>
            </Alert>
          )}

          {validation.warnings.length > 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Consider addressing these warnings:
              </Typography>
              <List dense>
                {validation.warnings.map((warning, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={warning} />
                  </ListItem>
                ))}
              </List>
            </Alert>
          )}

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quality Checklist
              </Typography>
              <List>
                {validation.checklist.map((item) => (
                  <ListItem key={item.id}>
                    <ListItemIcon>
                      {item.isValid ? <CheckCircle color="success" /> : getSeverityIcon(item.severity)}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      secondary={item.description}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          <Button
            variant="contained"
            onClick={() => setActiveStep(2)}
            disabled={!validation.isValid}
            sx={{ mt: 1, mr: 1 }}
          >
            Continue to Publishing
          </Button>
          <Button onClick={() => setActiveStep(0)} sx={{ mt: 1, mr: 1 }}>
            Back
          </Button>
        </StepContent>
      </Step>

      <Step>
        <StepLabel icon={getStepIcon(2)}>
          Publish Course
        </StepLabel>
        <StepContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Ready to publish your course! Students will be able to enroll and access the content.
          </Typography>

          <Alert severity="info" sx={{ mb: 2 }}>
            Once published, students can enroll in your course. You can still edit the content, but major changes should be communicated to enrolled students.
          </Alert>

          <FormControlLabel
            control={
              <Checkbox
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
              />
            }
            label="I confirm that this course content is ready for students and complies with platform guidelines"
          />

          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handlePublish}
              disabled={!validation.isValid || !agreedToTerms || loading}
              startIcon={loading ? <LinearProgress /> : <Publish />}
              sx={{ mr: 1 }}
            >
              {loading ? 'Publishing...' : 'Publish Course'}
            </Button>
            <Button onClick={() => setActiveStep(1)} sx={{ mr: 1 }}>
              Back
            </Button>
          </Box>
        </StepContent>
      </Step>
    </Stepper>
  );

  const renderStatusActions = () => {
    switch (course.status) {
      case 'PUBLISHED':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity="success">
              <Typography variant="subtitle2">Course is Published</Typography>
              <Typography variant="body2">
                Students can enroll and access this course. You have {course.enrolledStudents} enrolled students.
              </Typography>
            </Alert>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<VisibilityOff />}
                onClick={handleUnpublish}
                disabled={loading}
              >
                Unpublish
              </Button>
              <Button
                variant="outlined"
                startIcon={<Archive />}
                onClick={handleArchive}
                disabled={loading}
                color="warning"
              >
                Archive Course
              </Button>
            </Box>
          </Box>
        );

      case 'ARCHIVED':
        return (
          <Alert severity="info">
            <Typography variant="subtitle2">Course is Archived</Typography>
            <Typography variant="body2">
              This course is no longer available for new enrollments. Existing students can still access the content.
            </Typography>
          </Alert>
        );

      default:
        return renderPublishingWorkflow();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '70vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {course.status === 'PUBLISHED' ? <Visibility /> : 
           course.status === 'ARCHIVED' ? <Archive /> : <Drafts />}
          Course Publishing - {course.title}
          <Chip 
            label={course.status} 
            color={course.status === 'PUBLISHED' ? 'success' : 
                   course.status === 'ARCHIVED' ? 'default' : 'warning'}
            size="small"
          />
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {renderStatusActions()}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}