'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Slider,
  Chip,
  Stack,
} from '@mui/material';
import { PageHeader } from '@/components';
import { useTheme } from '@/contexts/ThemeContext';
import { predefinedThemes, CustomThemeConfig } from '@/theme/themeConfig';

export default function ThemeSettingsPage() {
  const { currentTheme, setTheme, themeName, setThemeName, updateThemeColors, updateGradient, resetTheme } =
    useTheme();
  const [localColors, setLocalColors] = useState(currentTheme.colors);
  const [localGradient, setLocalGradient] = useState(currentTheme.gradient);

  const handleColorChange = (colorKey: keyof typeof localColors, value: string) => {
    const newColors = { ...localColors, [colorKey]: value };
    setLocalColors(newColors);
    updateThemeColors({ [colorKey]: value });
  };

  const handleGradientChange = (key: keyof typeof localGradient, value: unknown) => {
    const newGradient = { ...localGradient, [key]: value };
    setLocalGradient(newGradient);
    updateGradient({ [key]: value });
  };

  const applyPredefinedTheme = (themeKey: string) => {
    const theme = predefinedThemes[themeKey];
    setTheme(theme);
    setThemeName(themeKey);
    setLocalColors(theme.colors);
    setLocalGradient(theme.gradient);
  };

  const exportTheme = () => {
    const themeConfig = JSON.stringify(currentTheme, null, 2);
    const blob = new Blob([themeConfig], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'champius-theme.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const theme = JSON.parse(e.target?.result as string) as CustomThemeConfig;
          setTheme(theme);
          setLocalColors(theme.colors);
          setLocalGradient(theme.gradient);
          setThemeName('custom');
        } catch (error) {
          console.error('Failed to import theme:', error);
          alert('Invalid theme file');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        title="Theme Settings"
        description="Customize the appearance of the system with colors and gradients"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Settings', href: '/settings' },
          { label: 'Theme' },
        ]}
      />

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Predefined Themes */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Predefined Themes
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select a theme to get started
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              {Object.entries(predefinedThemes).map(([key, theme]) => (
                <Card
                  key={key}
                  sx={{
                    minWidth: 180,
                    cursor: 'pointer',
                    border: themeName === key ? 2 : 0,
                    borderColor: 'primary.main',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                  onClick={() => applyPredefinedTheme(key)}
                >
                  <CardContent>
                    <Box
                      sx={{
                        height: 60,
                        borderRadius: 1,
                        mb: 1,
                        background: theme.gradient.enabled
                          ? `linear-gradient(${theme.gradient.angle}deg, ${theme.gradient.startColor}, ${theme.gradient.endColor})`
                          : theme.colors.primary,
                      }}
                    />
                    <Typography variant="subtitle2" fontWeight="bold">
                      {theme.name}
                    </Typography>
                    <Stack direction="row" spacing={0.5} sx={{ mt: 1 }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          bgcolor: theme.colors.primary,
                          border: '2px solid white',
                          boxShadow: 1,
                        }}
                      />
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          bgcolor: theme.colors.secondary,
                          border: '2px solid white',
                          boxShadow: 1,
                        }}
                      />
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          bgcolor: theme.colors.accent,
                          border: '2px solid white',
                          boxShadow: 1,
                        }}
                      />
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* Color Customization */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Color Customization
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Pick custom colors for your theme
            </Typography>

            <Grid container spacing={2}>
              {Object.entries(localColors).map(([key, value]) => (
                <Grid item xs={12} sm={6} key={key}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <input
                        type="color"
                        value={value}
                        onChange={(e) => handleColorChange(key as keyof typeof localColors, e.target.value)}
                        style={{
                          width: 60,
                          height: 40,
                          border: 'none',
                          borderRadius: 6,
                          cursor: 'pointer',
                        }}
                      />
                      <TextField
                        value={value}
                        onChange={(e) => handleColorChange(key as keyof typeof localColors, e.target.value)}
                        size="small"
                        fullWidth
                        placeholder="#000000"
                      />
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Gradient Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Gradient Settings
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Add gradients to buttons, app bars, and papers
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={localGradient.enabled}
                  onChange={(e) => handleGradientChange('enabled', e.target.checked)}
                />
              }
              label="Enable Gradients"
              sx={{ mb: 2 }}
            />

            {localGradient.enabled && (
              <>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                    Start Color
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <input
                      type="color"
                      value={localGradient.startColor}
                      onChange={(e) => handleGradientChange('startColor', e.target.value)}
                      style={{
                        width: 60,
                        height: 40,
                        border: 'none',
                        borderRadius: 6,
                        cursor: 'pointer',
                      }}
                    />
                    <TextField
                      value={localGradient.startColor}
                      onChange={(e) => handleGradientChange('startColor', e.target.value)}
                      size="small"
                      fullWidth
                      placeholder="#000000"
                    />
                  </Box>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                    End Color
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <input
                      type="color"
                      value={localGradient.endColor}
                      onChange={(e) => handleGradientChange('endColor', e.target.value)}
                      style={{
                        width: 60,
                        height: 40,
                        border: 'none',
                        borderRadius: 6,
                        cursor: 'pointer',
                      }}
                    />
                    <TextField
                      value={localGradient.endColor}
                      onChange={(e) => handleGradientChange('endColor', e.target.value)}
                      size="small"
                      fullWidth
                      placeholder="#000000"
                    />
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    Gradient Angle: {localGradient.angle}°
                  </Typography>
                  <Slider
                    value={localGradient.angle}
                    onChange={(_, value) => handleGradientChange('angle', value as number)}
                    min={0}
                    max={360}
                    step={15}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Box>

                <Box
                  sx={{
                    mt: 2,
                    height: 80,
                    borderRadius: 1,
                    background: `linear-gradient(${localGradient.angle}deg, ${localGradient.startColor}, ${localGradient.endColor})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                    Gradient Preview
                  </Typography>
                </Box>
              </>
            )}
          </Paper>
        </Grid>

        {/* Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Theme Actions
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button variant="contained" onClick={exportTheme}>
                Export Theme
              </Button>
              <Button variant="outlined" component="label">
                Import Theme
                <input type="file" hidden accept=".json" onChange={importTheme} />
              </Button>
              <Button variant="outlined" color="warning" onClick={resetTheme}>
                Reset to Default
              </Button>
            </Stack>
          </Paper>
        </Grid>

        {/* Preview */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Component Preview
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Button variant="contained" fullWidth>
                  Contained Button
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button variant="outlined" fullWidth>
                  Outlined Button
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button variant="text" fullWidth>
                  Text Button
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Chip label="Chip Component" color="primary" />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Text Field" placeholder="Type something..." fullWidth />
              </Grid>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Card Component</Typography>
                    <Typography variant="body2" color="text.secondary">
                      This is how cards will look with your theme applied
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
