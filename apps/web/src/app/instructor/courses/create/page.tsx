'use client';

import React, { useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  TextField,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { DashboardLayout } from '../../../../components';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../../lib/api';

interface CourseModule {
  id: string;
  title: string;
  description: string;
}

interface CourseMaterial {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

interface CourseFormData {
  title: string;
  code: string;
  description: string;
  category: string;
  semester: string;
  credits: number;
  color: string;
  tags: string[];
  modules: CourseModule[];
  materials: CourseMaterial[];
}

const steps = ['Basic Information', 'Course Structure', 'Materials & Settings'];

const categories = [
  'Programming',
  'Design',
  'Marketing',
  'Business',
  'Data Science',
  'Personal Development',
  'Photography',
  'Music',
  'Health & Fitness',
  'Language Learning',
  'Test Preparation',
  'Teaching & Academics',
];

const materialTypes = [
  { value: 'PDF', label: 'PDF Document' },
  { value: 'VIDEO', label: 'Video' },
  { value: 'AUDIO', label: 'Audio' },
  { value: 'IMAGE', label: 'Image' },
  { value: 'DOCUMENT', label: 'Document' },
];

export default function CreateCourse() {
  const queryClient = useQueryClient();
  
  // Helper function to determine file type
  const getFileType = (mimeType: string): 'PDF' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'LINK' => {
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('video')) return 'VIDEO';
    if (mimeType.includes('audio')) return 'AUDIO';
    return 'DOCUMENT';
  };
  
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    code: '',
    description: '',
    category: '',
    semester: 'Spring 2024',
    credits: 3,
    color: '#667eea',
    tags: [],
    modules: [],
    materials: [],
  });

  const [moduleInput, setModuleInput] = useState({ title: '', description: '' });
  const [tagInput, setTagInput] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const createCourseMutation = useMutation({
    mutationFn: (data: CourseFormData) => {
      // Transform data to match backend DTO
      const courseData = {
        title: data.title,
        code: data.code,
        description: data.description,
        color: data.color,
        credits: data.credits,
        semester: data.semester,
      };
      console.log('Sending course data:', courseData);
      return apiClient.post('/instructor/courses', courseData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-courses'] });
      window.history.back();
    },
    onError: (error: any) => {
      console.error('Course creation error:', error);
      console.error('Error response:', error?.response);
      const message = error?.response?.data?.message || error?.message || 'Failed to create course';
      setValidationErrors([message]);
    },
  });

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddModule = () => {
    if (moduleInput.title.trim()) {
      const newModule: CourseModule = {
        id: crypto.randomUUID(),
        title: moduleInput.title.trim(),
        description: moduleInput.description.trim(),
      };
      setFormData(prev => ({
        ...prev,
        modules: [...prev.modules, newModule]
      }));
      setModuleInput({ title: '', description: '' });
    }
  };

  const handleRemoveModule = (moduleId: string) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.filter(module => module.id !== moduleId)
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newMaterials: CourseMaterial[] = [];
      const maxFileSize = 100 * 1024 * 1024; // 100MB limit
      const allowedTypes = [
        'application/pdf',
        'video/mp4',
        'video/webm',
        'audio/mp3',
        'audio/wav',
        'audio/mpeg',
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ];

      Array.from(files).forEach((file, index) => {
        // Validate file size
        if (file.size > maxFileSize) {
          setValidationErrors(prev => [...prev, `File "${file.name}" is too large. Maximum size is 100MB.`]);
          return;
        }

        // Validate file type
        if (!allowedTypes.includes(file.type) && !file.name.endsWith('.pdf')) {
          setValidationErrors(prev => [...prev, `File "${file.name}" has an unsupported format.`]);
          return;
        }

        const materialId = crypto.randomUUID();
        
        // Simulate upload progress
        setUploadProgress(prev => ({ ...prev, [materialId]: 0 }));
        
        const material: CourseMaterial = {
          id: materialId,
          name: file.name,
          type: getFileType(file.type),
          size: file.size,
          url: URL.createObjectURL(file),
        };

        newMaterials.push(material);

        // Simulate upload progress
        const interval = setInterval(() => {
          setUploadProgress(prev => {
            const currentProgress = prev[materialId] || 0;
            if (currentProgress >= 100) {
              clearInterval(interval);
              return prev;
            }
            return { ...prev, [materialId]: currentProgress + 10 };
          });
        }, 200);
      });

      if (newMaterials.length > 0) {
        setFormData(prev => ({
          ...prev,
          materials: [...prev.materials, ...newMaterials]
        }));
      }
    }
  };

  const validateStep = (step: number): boolean => {
    const errors: string[] = [];
    
    switch (step) {
      case 0: // Basic Information
        if (!formData.title.trim()) errors.push('Course title is required');
        if (!formData.code.trim()) errors.push('Course code is required');
        if (!formData.description.trim()) errors.push('Course description is required');
        if (!formData.category) errors.push('Course category is required');
        if (formData.description.length < 20) errors.push('Course description should be at least 20 characters');
        if (formData.credits < 1 || formData.credits > 6) errors.push('Credits must be between 1 and 6');
        break;
      
      case 1: // Course Structure
        // Modules are optional for now
        break;
      
      case 2: // Materials & Settings
        // Materials are optional for now
        break;
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleRemoveMaterial = (materialId: string) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter(material => material.id !== materialId)
    }));
  };

  const isStepComplete = (step: number) => {
    switch (step) {
      case 0:
        return formData.title.trim() !== '' && 
               formData.code.trim() !== '' && 
               formData.description.trim() !== '' && 
               formData.category !== '';
      case 1:
        return true; // Modules optional
      case 2:
        return true; // Materials optional
      default:
        return false;
    }
  };

  const handleSubmit = () => {
    createCourseMutation.mutate(formData);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Course Basic Information
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                label="Course Title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
                placeholder="e.g., Advanced Web Development"
              />
              
              <TextField
                fullWidth
                label="Course Code"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                required
                placeholder="e.g., CS301"
                helperText="Unique course code (letters and numbers)"
              />
              
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Course Description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
                placeholder="Describe what students will learn in this course..."
              />
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 300px' }}>
                  <FormControl fullWidth required>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      label="Category"
                    >
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                
                <TextField
                  label="Semester"
                  value={formData.semester}
                  onChange={(e) => setFormData(prev => ({ ...prev, semester: e.target.value }))}
                  sx={{ flex: '1 1 200px' }}
                  placeholder="e.g., Spring 2024"
                />
                
                <TextField
                  type="number"
                  label="Credits"
                  value={formData.credits}
                  onChange={(e) => setFormData(prev => ({ ...prev, credits: parseInt(e.target.value) || 3 }))}
                  sx={{ flex: '0 1 150px' }}
                  inputProps={{ min: 1, max: 6 }}
                />
                
                <Box sx={{ flex: '0 1 150px' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Course Color
                  </Typography>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    style={{ width: '100%', height: '40px', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}
                  />
                </Box>
              </Box>
              
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Tags (Optional)
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    size="small"
                    label="Add a tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="e.g., JavaScript"
                  />
                  <Button onClick={handleAddTag} variant="outlined">
                    Add
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => handleRemoveTag(tag)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Course Structure
            </Typography>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Add Course Module
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <TextField
                      fullWidth
                      label="Module Title"
                      value={moduleInput.title}
                      onChange={(e) => setModuleInput(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <TextField
                      fullWidth
                      label="Module Description"
                      value={moduleInput.description}
                      onChange={(e) => setModuleInput(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 100%', mt: 1 }}>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleAddModule}
                      disabled={!moduleInput.title.trim()}
                    >
                      Add Module
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Typography variant="subtitle1" gutterBottom>
              Course Modules ({formData.modules.length})
            </Typography>
            {formData.modules.map((module, index) => (
              <Card key={module.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <Box>
                      <Typography variant="h6">
                        {index + 1}. {module.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {module.description}
                      </Typography>
                    </Box>
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveModule(module.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            ))}
            {formData.modules.length === 0 && (
              <Alert severity="info">
                Add at least one module to structure your course content.
              </Alert>
            )}
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Upload Course Materials
            </Typography>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ textAlign: 'center', p: 3, border: '2px dashed', borderColor: 'grey.300', borderRadius: 1 }}>
                  <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Upload Course Materials
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Drag and drop files here or click to browse
                  </Typography>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.mp3,.jpg,.jpeg,.png,.gif"
                  />
                  <label htmlFor="file-upload">
                    <Button variant="contained" component="span">
                      Choose Files
                    </Button>
                  </label>
                </Box>
              </CardContent>
            </Card>

            {formData.materials.length > 0 && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Uploaded Materials ({formData.materials.length})
                  </Typography>
                  {formData.materials.map((material) => (
                    <Box key={material.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, mb: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {material.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {(material.size / 1024 / 1024).toFixed(2)} MB
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveMaterial(material.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Course Summary
                </Typography>
                <Typography variant="subtitle2" gutterBottom>
                  Title: {formData.title}
                </Typography>
                <Typography variant="subtitle2" gutterBottom>
                  Category: {formData.category}
                </Typography>
                <Typography variant="subtitle2" gutterBottom>
                  Tags: {formData.tags.join(', ')}
                </Typography>
                <Typography variant="subtitle2" gutterBottom>
                  Modules: {formData.modules.length}
                </Typography>
                <Typography variant="subtitle2" gutterBottom>
                  Materials: {formData.materials.length}
                </Typography>
              </CardContent>
            </Card>
            <Alert severity="info">
              Your course will be created as a draft. You can publish it later when you&apos;re ready.
            </Alert>
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <DashboardLayout title="Create Course">
      <Box sx={{ flexGrow: 1, p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
          <IconButton
            onClick={() => window.history.back()}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" component="h1">
              Create New Course
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Set up your course content and structure
            </Typography>
          </Box>
        </Box>

        {/* Progress */}
        {createCourseMutation.isPending && (
          <Box sx={{ mb: 3 }}>
            <LinearProgress />
          </Box>
        )}

        {/* Stepper */}
        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setValidationErrors([])}>
            <Typography variant="subtitle2" gutterBottom>
              Please fix the following errors:
            </Typography>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </Alert>
        )}

        {/* Content */}
        <Card>
          <CardContent sx={{ p: 4 }}>
            {renderStepContent(activeStep)}
          </CardContent>
        </Card>

        {/* Navigation */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={createCourseMutation.isPending}
              >
                {createCourseMutation.isPending ? 'Creating...' : 'Create Course'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!isStepComplete(activeStep)}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </DashboardLayout>
  );
}