'use client';

import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Switch,
  Button,
  Divider,
  FormControlLabel,
} from '@mui/material';
import {
  Save as SaveIcon,
} from '@mui/icons-material';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    siteName: 'Champius LMS',
    siteUrl: 'https://champius.com',
    adminEmail: 'admin@champius.com',
    allowRegistration: true,
    requireEmailVerification: true,
    enableCourseReviews: true,
    enableNotifications: true,
    maxUploadSize: '10',
    sessionTimeout: '30',
  });

  const handleChange = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log('Saving settings:', settings);
    // TODO: Implement API call to save settings
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            System Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure platform-wide settings and preferences
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          sx={{ textTransform: 'none' }}
        >
          Save Changes
        </Button>
      </Box>

      {/* General Settings */}
      <Paper sx={{ p: 3, mb: 3, boxShadow: 2 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          General Settings
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Box sx={{ display: 'grid', gap: 3 }}>
          <TextField
            label="Site Name"
            value={settings.siteName}
            onChange={(e) => handleChange('siteName', e.target.value)}
            fullWidth
          />
          <TextField
            label="Site URL"
            value={settings.siteUrl}
            onChange={(e) => handleChange('siteUrl', e.target.value)}
            fullWidth
          />
          <TextField
            label="Admin Email"
            type="email"
            value={settings.adminEmail}
            onChange={(e) => handleChange('adminEmail', e.target.value)}
            fullWidth
            helperText="Primary contact email for system notifications"
          />
        </Box>
      </Paper>

      {/* User Settings */}
      <Paper sx={{ p: 3, mb: 3, boxShadow: 2 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          User Settings
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Box sx={{ display: 'grid', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.allowRegistration}
                onChange={(e) => handleChange('allowRegistration', e.target.checked)}
              />
            }
            label="Allow New User Registration"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.requireEmailVerification}
                onChange={(e) => handleChange('requireEmailVerification', e.target.checked)}
              />
            }
            label="Require Email Verification"
          />
        </Box>
      </Paper>

      {/* Course Settings */}
      <Paper sx={{ p: 3, mb: 3, boxShadow: 2 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Course Settings
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Box sx={{ display: 'grid', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.enableCourseReviews}
                onChange={(e) => handleChange('enableCourseReviews', e.target.checked)}
              />
            }
            label="Enable Course Reviews"
          />
          <TextField
            label="Maximum Upload Size (MB)"
            type="number"
            value={settings.maxUploadSize}
            onChange={(e) => handleChange('maxUploadSize', e.target.value)}
            sx={{ mt: 2 }}
            helperText="Maximum file size for course materials"
          />
        </Box>
      </Paper>

      {/* System Settings */}
      <Paper sx={{ p: 3, boxShadow: 2 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          System Settings
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Box sx={{ display: 'grid', gap: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.enableNotifications}
                onChange={(e) => handleChange('enableNotifications', e.target.checked)}
              />
            }
            label="Enable Email Notifications"
          />
          <TextField
            label="Session Timeout (minutes)"
            type="number"
            value={settings.sessionTimeout}
            onChange={(e) => handleChange('sessionTimeout', e.target.value)}
            helperText="User session timeout duration"
          />
        </Box>
      </Paper>
    </Box>
  );
}
