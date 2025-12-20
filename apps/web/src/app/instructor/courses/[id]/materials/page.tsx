'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Alert,
  Chip,
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Edit,
  Delete,
  ExpandMore,
  VideoLibrary,
  PictureAsPdf,
  Description,
  Link as LinkIcon,
  Quiz,
  Assignment,
  AudioFile,
  FolderOpen,
} from '@mui/icons-material';
import { DashboardLayout } from '../../../../../components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../../../lib/api';
import { useRouter } from 'next/navigation';

interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  isPublished: boolean;
  materials: Material[];
}

interface Material {
  id: string;
  title: string;
  description: string;
  type: string;
  fileUrl: string;
  fileSize?: number;
  duration?: string;
  order: number;
  isPublished: boolean;
  module?: { id: string; title: string };
}

const materialTypeOptions = [
  { value: 'VIDEO', label: 'Video', icon: <VideoLibrary /> },
  { value: 'PDF', label: 'PDF Document', icon: <PictureAsPdf /> },
  { value: 'DOCUMENT', label: 'Document', icon: <Description /> },
  { value: 'LINK', label: 'External Link', icon: <LinkIcon /> },
  { value: 'AUDIO', label: 'Audio', icon: <AudioFile /> },
  { value: 'QUIZ', label: 'Quiz', icon: <Quiz /> },
  { value: 'ASSIGNMENT', label: 'Assignment', icon: <Assignment /> },
];

export default function CourseMaterialsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [materialDialogOpen, setMaterialDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  
  const [moduleForm, setModuleForm] = useState({
    title: '',
    description: '',
    order: 1
  });
  
  const [materialForm, setMaterialForm] = useState({
    title: '',
    description: '',
    type: 'VIDEO',
    fileUrl: '',
    fileSize: 0,
    duration: '',
    order: 1,
    moduleId: ''
  });

  // Fetch modules
  const { data: modules = [], isLoading: modulesLoading } = useQuery({
    queryKey: ['course-modules', params.id],
    queryFn: () => apiClient.get(`/instructor/courses/${params.id}/modules`).then(res => res.data)
  });

  // Fetch materials
  const { data: materials = [], isLoading: materialsLoading } = useQuery({
    queryKey: ['course-materials', params.id],
    queryFn: () => apiClient.get(`/instructor/courses/${params.id}/materials`).then(res => res.data)
  });

  // Create module mutation
  const createModuleMutation = useMutation({
    mutationFn: (data: any) => apiClient.post(`/instructor/courses/${params.id}/modules`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-modules', params.id] });
      queryClient.invalidateQueries({ queryKey: ['instructor-course', params.id] });
      setModuleDialogOpen(false);
      resetModuleForm();
    }
  });

  // Update module mutation
  const updateModuleMutation = useMutation({
    mutationFn: ({ id, data }: any) => apiClient.patch(`/instructor/modules/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-modules', params.id] });
      setModuleDialogOpen(false);
      setEditingModule(null);
      resetModuleForm();
    }
  });

  // Delete module mutation
  const deleteModuleMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/instructor/modules/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-modules', params.id] });
      queryClient.invalidateQueries({ queryKey: ['instructor-course', params.id] });
    }
  });

  // Create material mutation
  const createMaterialMutation = useMutation({
    mutationFn: (data: any) => apiClient.post(`/instructor/courses/${params.id}/materials`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-materials', params.id] });
      queryClient.invalidateQueries({ queryKey: ['course-modules', params.id] });
      queryClient.invalidateQueries({ queryKey: ['instructor-course', params.id] });
      setMaterialDialogOpen(false);
      resetMaterialForm();
    }
  });

  // Update material mutation
  const updateMaterialMutation = useMutation({
    mutationFn: ({ id, data }: any) => apiClient.patch(`/instructor/materials/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-materials', params.id] });
      queryClient.invalidateQueries({ queryKey: ['course-modules', params.id] });
      setMaterialDialogOpen(false);
      setEditingMaterial(null);
      resetMaterialForm();
    }
  });

  // Delete material mutation
  const deleteMaterialMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/instructor/materials/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-materials', params.id] });
      queryClient.invalidateQueries({ queryKey: ['course-modules', params.id] });
      queryClient.invalidateQueries({ queryKey: ['instructor-course', params.id] });
    }
  });

  const resetModuleForm = () => {
    setModuleForm({ title: '', description: '', order: modules.length + 1 });
  };

  const resetMaterialForm = () => {
    setMaterialForm({
      title: '',
      description: '',
      type: 'VIDEO',
      fileUrl: '',
      fileSize: 0,
      duration: '',
      order: 1,
      moduleId: ''
    });
  };

  const handleCreateModule = () => {
    setEditingModule(null);
    resetModuleForm();
    setModuleDialogOpen(true);
  };

  const handleEditModule = (module: Module) => {
    setEditingModule(module);
    setModuleForm({
      title: module.title,
      description: module.description || '',
      order: module.order
    });
    setModuleDialogOpen(true);
  };

  const handleSaveModule = () => {
    if (editingModule) {
      updateModuleMutation.mutate({ id: editingModule.id, data: moduleForm });
    } else {
      createModuleMutation.mutate(moduleForm);
    }
  };

  const handleDeleteModule = (id: string) => {
    if (confirm('Are you sure? This will delete all materials in this module.')) {
      deleteModuleMutation.mutate(id);
    }
  };

  const handleCreateMaterial = (moduleId?: string) => {
    setEditingMaterial(null);
    resetMaterialForm();
    if (moduleId) {
      setMaterialForm(prev => ({ ...prev, moduleId }));
    }
    setMaterialDialogOpen(true);
  };

  const handleEditMaterial = (material: Material) => {
    setEditingMaterial(material);
    setMaterialForm({
      title: material.title,
      description: material.description || '',
      type: material.type,
      fileUrl: material.fileUrl || '',
      fileSize: material.fileSize || 0,
      duration: material.duration || '',
      order: material.order,
      moduleId: material.module?.id || ''
    });
    setMaterialDialogOpen(true);
  };

  const handleSaveMaterial = () => {
    const data = {
      ...materialForm,
      moduleId: materialForm.moduleId || undefined
    };
    
    if (editingMaterial) {
      updateMaterialMutation.mutate({ id: editingMaterial.id, data });
    } else {
      createMaterialMutation.mutate(data);
    }
  };

  const handleDeleteMaterial = (id: string) => {
    if (confirm('Are you sure you want to delete this material?')) {
      deleteMaterialMutation.mutate(id);
    }
  };

  const getMaterialIcon = (type: string) => {
    const option = materialTypeOptions.find(opt => opt.value === type);
    return option?.icon || <Description />;
  };

  if (modulesLoading || materialsLoading) {
    return (
      <DashboardLayout title="Course Materials">
        <Box sx={{ p: 3 }}>
          <LinearProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Course Materials">
      <Box sx={{ flexGrow: 1, p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button startIcon={<ArrowBack />} onClick={() => router.push(`/instructor/courses/${params.id}`)}>
              Back to Course
            </Button>
            <Typography variant="h4">Manage Course Materials</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" startIcon={<FolderOpen />} onClick={handleCreateModule}>
              New Module
            </Button>
            <Button variant="contained" startIcon={<Add />} onClick={() => handleCreateMaterial()}>
              Add Material
            </Button>
          </Box>
        </Box>

        {/* Modules */}
        {modules.length === 0 && materials.filter((m: Material) => !m.module).length === 0 ? (
          <Alert severity="info">
            No modules or materials yet. Create a module to organize your content, or add materials directly.
          </Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {modules.map((module: Module) => (
              <Accordion key={module.id} defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 2 }}>
                    <Box>
                      <Typography variant="h6">{module.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {module.description}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          label={module.isPublished ? 'Published' : 'Draft'}
                          size="small"
                          color={module.isPublished ? 'success' : 'default'}
                        />
                        <Chip
                          label={`${module.materials.length} materials`}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    </Box>
                    <Box onClick={(e) => e.stopPropagation()}>
                      <IconButton onClick={() => handleEditModule(module)} size="small">
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteModule(module.id)} size="small" color="error">
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="subtitle2">Materials in this module:</Typography>
                    <Button size="small" startIcon={<Add />} onClick={() => handleCreateMaterial(module.id)}>
                      Add Material
                    </Button>
                  </Box>
                  <List>
                    {module.materials.length === 0 ? (
                      <Typography color="text.secondary" sx={{ py: 2 }}>
                        No materials in this module yet.
                      </Typography>
                    ) : (
                      module.materials.map((material: Material) => (
                        <ListItem key={material.id} divider>
                          <Box sx={{ mr: 2 }}>{getMaterialIcon(material.type)}</Box>
                          <ListItemText
                            primary={material.title}
                            secondary={
                              <Box>
                                <Typography variant="body2">{material.description}</Typography>
                                <Chip label={material.type} size="small" sx={{ mt: 0.5 }} />
                                {material.isPublished && (
                                  <Chip label="Published" size="small" color="success" sx={{ mt: 0.5, ml: 1 }} />
                                )}
                              </Box>
                            }
                          />
                          <ListItemSecondaryAction>
                            <IconButton edge="end" onClick={() => handleEditMaterial(material)} sx={{ mr: 1 }}>
                              <Edit />
                            </IconButton>
                            <IconButton edge="end" onClick={() => handleDeleteMaterial(material.id)} color="error">
                              <Delete />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))
                    )}
                  </List>
                </AccordionDetails>
              </Accordion>
            ))}

            {/* Standalone Materials */}
            {materials.filter((m: Material) => !m.module).length > 0 && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    General Materials (Not in any module)
                  </Typography>
                  <List>
                    {materials
                      .filter((m: Material) => !m.module)
                      .map((material: Material) => (
                        <ListItem key={material.id} divider>
                          <Box sx={{ mr: 2 }}>{getMaterialIcon(material.type)}</Box>
                          <ListItemText
                            primary={material.title}
                            secondary={
                              <Box>
                                <Typography variant="body2">{material.description}</Typography>
                                <Chip label={material.type} size="small" sx={{ mt: 0.5 }} />
                                {material.isPublished && (
                                  <Chip label="Published" size="small" color="success" sx={{ mt: 0.5, ml: 1 }} />
                                )}
                              </Box>
                            }
                          />
                          <ListItemSecondaryAction>
                            <IconButton edge="end" onClick={() => handleEditMaterial(material)} sx={{ mr: 1 }}>
                              <Edit />
                            </IconButton>
                            <IconButton edge="end" onClick={() => handleDeleteMaterial(material.id)} color="error">
                              <Delete />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                  </List>
                </CardContent>
              </Card>
            )}
          </Box>
        )}

        {/* Module Dialog */}
        <Dialog open={moduleDialogOpen} onClose={() => setModuleDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editingModule ? 'Edit Module' : 'Create New Module'}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
              <TextField
                label="Module Title"
                value={moduleForm.title}
                onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="Description"
                value={moduleForm.description}
                onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                fullWidth
                multiline
                rows={3}
              />
              <TextField
                label="Order"
                type="number"
                value={moduleForm.order}
                onChange={(e) => setModuleForm({ ...moduleForm, order: parseInt(e.target.value) })}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setModuleDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveModule} variant="contained" disabled={!moduleForm.title}>
              {editingModule ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Material Dialog */}
        <Dialog open={materialDialogOpen} onClose={() => setMaterialDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>{editingMaterial ? 'Edit Material' : 'Add New Material'}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
              <TextField
                label="Material Title"
                value={materialForm.title}
                onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="Description"
                value={materialForm.description}
                onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
                fullWidth
                multiline
                rows={2}
              />
              <FormControl fullWidth>
                <InputLabel>Material Type</InputLabel>
                <Select
                  value={materialForm.type}
                  label="Material Type"
                  onChange={(e) => setMaterialForm({ ...materialForm, type: e.target.value })}
                >
                  {materialTypeOptions.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {opt.icon}
                        {opt.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Module (Optional)</InputLabel>
                <Select
                  value={materialForm.moduleId}
                  label="Module (Optional)"
                  onChange={(e) => setMaterialForm({ ...materialForm, moduleId: e.target.value })}
                >
                  <MenuItem value="">
                    <em>None (General Material)</em>
                  </MenuItem>
                  {modules.map((module: Module) => (
                    <MenuItem key={module.id} value={module.id}>
                      {module.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="File URL or Link"
                value={materialForm.fileUrl}
                onChange={(e) => setMaterialForm({ ...materialForm, fileUrl: e.target.value })}
                fullWidth
                helperText="Enter the URL to the file or external resource"
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Duration (e.g., 30 min)"
                  value={materialForm.duration}
                  onChange={(e) => setMaterialForm({ ...materialForm, duration: e.target.value })}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Order"
                  type="number"
                  value={materialForm.order}
                  onChange={(e) => setMaterialForm({ ...materialForm, order: parseInt(e.target.value) })}
                  sx={{ flex: 1 }}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setMaterialDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveMaterial} variant="contained" disabled={!materialForm.title}>
              {editingMaterial ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
}
