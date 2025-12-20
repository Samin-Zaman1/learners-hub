'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  Divider,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  PictureAsPdf,
  VideoLibrary,
  AudioFile,
  Assignment,
  DragIndicator,
} from '@mui/icons-material';
import { DashboardLayout } from '../../../../../components';

interface CourseFormData {
  title: string;
  description: string;
  category: string;
  tags: string[];
  modules: CourseModule[];
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

interface CourseModule {
  id: string;
  title: string;
  description: string;
  materials: CourseMaterial[];
  order: number;
}

interface CourseMaterial {
  id: string;
  name: string;
  type: 'PDF' | 'VIDEO' | 'AUDIO' | 'IMAGE' | 'DOCUMENT';
  size: number;
  url: string;
  uploadedAt: string;
}

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

export default function EditCourse({ params }: { params: { id: string } }) {
  const [activeStep, setActiveStep] = useState(0);
  const [tagInput, setTagInput] = useState('');
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [materialDialogOpen, setMaterialDialogOpen] = useState(false);
  const [currentModuleId, setCurrentModuleId] = useState<string | null>(null);
  const [newModule, setNewModule] = useState({ title: '', description: '' });

  // Mock data - replace with actual API calls
  const [formData, setFormData] = useState<CourseFormData>({
    title: 'React Fundamentals',
    description: 'Learn the basics of React development including components, state, and props.',
    category: 'Programming',
    tags: ['React', 'JavaScript', 'Frontend'],
    status: 'DRAFT',
    modules: [
      {
        id: '1',
        title: 'Introduction to React',
        description: 'Getting started with React development',
        order: 1,
        materials: [
          {
            id: '1',
            name: 'React Basics.pdf',
            type: 'PDF',
            size: 2048000,
            url: '/materials/react-basics.pdf',
            uploadedAt: '2024-01-10',
          },
          {
            id: '2',
            name: 'React Tutorial Video.mp4',
            type: 'VIDEO',
            size: 104857600,
            url: '/materials/react-tutorial.mp4',
            uploadedAt: '2024-01-10',
          },
        ],
      },
      {
        id: '2',
        title: 'Components and JSX',
        description: 'Understanding React components and JSX syntax',
        order: 2,
        materials: [
          {
            id: '3',
            name: 'Components Guide.pdf',
            type: 'PDF',
            size: 1536000,
            url: '/materials/components-guide.pdf',
            uploadedAt: '2024-01-12',
          },
        ],
      },
    ],
  });

  const steps = ['Basic Information', 'Course Modules', 'Review & Save'];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSave = () => {
    // TODO: Implement save course API call
    console.log('Saving course:', formData);
    // Navigate back to course detail
    window.location.href = `/instructor/courses/${params.id}`;
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
    if (newModule.title.trim()) {
      const module: CourseModule = {
        id: crypto.randomUUID(),
        title: newModule.title.trim(),
        description: newModule.description.trim(),
        order: formData.modules.length + 1,
        materials: [],
      };
      setFormData(prev => ({
        ...prev,
        modules: [...prev.modules, module]
      }));
      setNewModule({ title: '', description: '' });
      setModuleDialogOpen(false);
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
    if (files && currentModuleId) {
      const newMaterials: CourseMaterial[] = Array.from(files).map(file => ({
        id: crypto.randomUUID(),
        name: file.name,
        type: getFileType(file.type),
        size: file.size,
        url: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString(),
      }));

      setFormData(prev => ({
        ...prev,
        modules: prev.modules.map(module =>
          module.id === currentModuleId
            ? { ...module, materials: [...module.materials, ...newMaterials] }
            : module
        )
      }));
      setMaterialDialogOpen(false);
      setCurrentModuleId(null);
    }
  };

  const getFileType = (mimeType: string): CourseMaterial['type'] => {
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('video')) return 'VIDEO';
    if (mimeType.includes('audio')) return 'AUDIO';
    if (mimeType.includes('image')) return 'IMAGE';
    return 'DOCUMENT';
  };

  const getMaterialIcon = (type: CourseMaterial['type']) => {
    switch (type) {
      case 'PDF':
        return <PictureAsPdf color="error" />;
      case 'VIDEO':
        return <VideoLibrary color="primary" />;
      case 'AUDIO':
        return <AudioFile color="info" />;
      default:
        return <Assignment />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Course Title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Course Description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
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
              <Box sx={{ flex: '1 1 300px' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    label="Add Tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  />
                  <Button variant="outlined" onClick={handleAddTag}>
                    Add
                  </Button>
                </Box>
                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => handleRemoveTag(tag)}
                      size="small"
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Course Modules ({formData.modules.length})
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setModuleDialogOpen(true)}
              >
                Add Module
              </Button>
            </Box>

            {formData.modules.map((module, index) => (
              <Card key={module.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DragIndicator color="action" />
                      <Box>
                        <Typography variant="h6">
                          {index + 1}. {module.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {module.description}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => {
                          setCurrentModuleId(module.id);
                          setMaterialDialogOpen(true);
                        }}
                      >
                        Add Material
                      </Button>
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveModule(module.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Module Materials */}
                  {module.materials.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Materials ({module.materials.length})
                      </Typography>
                      <List dense>
                        {module.materials.map((material) => (
                          <ListItem key={material.id}>
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: 'transparent' }}>
                                {getMaterialIcon(material.type)}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={material.name}
                              secondary={`${material.type} • ${formatFileSize(material.size)}`}
                            />
                            <ListItemSecondaryAction>
                              <IconButton
                                edge="end"
                                color="error"
                                onClick={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    modules: prev.modules.map(m =>
                                      m.id === module.id
                                        ? { ...m, materials: m.materials.filter(mat => mat.id !== material.id) }
                                        : m
                                    )
                                  }));
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}

            {formData.modules.length === 0 && (
              <Alert severity="info">
                No modules added yet. Add at least one module to structure your course content.
              </Alert>
            )}
          </Box>
        );

      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6">Course Summary</Typography>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  {formData.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {formData.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  {formData.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" />
                  ))}
                </Box>
                <Typography variant="body2">
                  Category: {formData.category}
                </Typography>
                <Typography variant="body2">
                  Modules: {formData.modules.length}
                </Typography>
                <Typography variant="body2">
                  Total Materials: {formData.modules.reduce((acc, module) => acc + module.materials.length, 0)}
                </Typography>
              </CardContent>
            </Card>
            <Alert severity="info">
              Review your course information before saving. You can always edit it later.
            </Alert>
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <DashboardLayout title="Edit Course">
      <Box sx={{ flexGrow: 1, p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
          <IconButton
            onClick={() => window.history.back()}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4" component="h1">
              Edit Course
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Update your course content and settings
            </Typography>
          </Box>
        </Box>

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
                startIcon={<Save />}
                onClick={handleSave}
              >
                Save Changes
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>

        {/* Add Module Dialog */}
        <Dialog open={moduleDialogOpen} onClose={() => setModuleDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add New Module</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                fullWidth
                label="Module Title"
                value={newModule.title}
                onChange={(e) => setNewModule(prev => ({ ...prev, title: e.target.value }))}
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Module Description"
                value={newModule.description}
                onChange={(e) => setNewModule(prev => ({ ...prev, description: e.target.value }))}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setModuleDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleAddModule}
              variant="contained"
              disabled={!newModule.title.trim()}
            >
              Add Module
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Material Dialog */}
        <Dialog open={materialDialogOpen} onClose={() => setMaterialDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add Course Materials</DialogTitle>
          <DialogContent>
            <Box sx={{ textAlign: 'center', p: 3, border: '2px dashed', borderColor: 'grey.300', borderRadius: 1, mt: 1 }}>
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
                id="file-upload-edit"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.mp3,.jpg,.jpeg,.png,.gif"
              />
              <label htmlFor="file-upload-edit">
                <Button variant="contained" component="span">
                  Choose Files
                </Button>
              </label>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setMaterialDialogOpen(false)}>Cancel</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
}