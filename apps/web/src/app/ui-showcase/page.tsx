'use client';

import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  List,
  ListItemButton,
  ListItemText,
  Chip,
  Avatar,
  IconButton,
} from '@mui/material';
import {
  People,
  School,
  Assignment,
  TrendingUp,
  Add,
  Edit,
  Delete,
  Favorite,
} from '@mui/icons-material';
import { PageHeader, StatsCard, EmptyState } from '@/components';

export default function UIShowcasePage() {
  return (
    <Box sx={{ p: 3 }} className="animate-fadeIn">
      <PageHeader
        title="UI Enhancement Showcase"
        description="Experience the beautiful, consistent design system throughout Champius"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'UI Showcase' },
        ]}
        action={
          <Button variant="contained" startIcon={<Add />}>
            Create New
          </Button>
        }
      />

      {/* Stats Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Beautiful Stats Cards
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatsCard
              title="Total Students"
              value={2534}
              icon={<People />}
              color="primary"
              trend={{ value: 12, direction: 'up' }}
              subtitle="Active this semester"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatsCard
              title="Courses"
              value={48}
              icon={<School />}
              color="secondary"
              trend={{ value: 5, direction: 'up' }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatsCard
              title="Assignments"
              value={156}
              icon={<Assignment />}
              color="info"
              trend={{ value: 3, direction: 'down' }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatsCard
              title="Completion Rate"
              value="94%"
              icon={<TrendingUp />}
              color="success"
              trend={{ value: 8, direction: 'up' }}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Interactive Cards */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Hover Effects on Cards
        </Typography>
        <Grid container spacing={3}>
          {[1, 2, 3].map((item) => (
            <Grid size={{ xs: 12, md: 4 }} key={item}>
              <Card className="hover-lift card-interactive">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <School />
                    </Avatar>
                    <Typography variant="h6" fontWeight={600}>
                      Course {item}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    This card lifts up smoothly on hover with enhanced shadows
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip label="Active" color="success" size="small" />
                    <Chip label="24 Students" size="small" />
                    <Chip label="8 Weeks" size="small" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Buttons */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Enhanced Buttons
        </Typography>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button variant="contained" startIcon={<Add />}>
                Contained
              </Button>
              <Button variant="outlined" startIcon={<Edit />}>
                Outlined
              </Button>
              <Button variant="text" startIcon={<Delete />}>
                Text
              </Button>
              <Button variant="contained" color="success" size="small">
                Small
              </Button>
              <Button variant="contained" color="error" size="large">
                Large
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Form Fields */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Beautiful Form Fields
        </Typography>
        <Card>
          <CardContent>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label="First Name" fullWidth placeholder="Enter your first name" />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label="Last Name" fullWidth placeholder="Enter your last name" />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Email Address"
                  fullWidth
                  type="email"
                  placeholder="your.email@example.com"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Message"
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Write your message here..."
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      {/* Interactive Lists */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Smooth List Interactions
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Recent Activities
                </Typography>
                <List>
                  {[
                    'Assignment submitted',
                    'New course enrolled',
                    'Grade updated',
                    'Announcement posted',
                  ].map((item, index) => (
                    <ListItemButton
                      key={index}
                      className="animate-slideIn"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <ListItemText primary={item} secondary={`${index + 1} hour ago`} />
                    </ListItemButton>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label="Mark as Read"
                    onClick={() => {}}
                    color="primary"
                    className="hover-scale"
                  />
                  <Chip
                    label="Archive"
                    onClick={() => {}}
                    color="default"
                    className="hover-scale"
                  />
                  <Chip
                    label="Favorite"
                    onClick={() => {}}
                    color="error"
                    icon={<Favorite />}
                    className="hover-scale"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Icon Buttons */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Icon Button Animations
        </Typography>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <IconButton color="primary">
                <Edit />
              </IconButton>
              <IconButton color="error">
                <Delete />
              </IconButton>
              <IconButton color="success">
                <Favorite />
              </IconButton>
              <IconButton color="info">
                <Add />
              </IconButton>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              Hover over icons to see smooth scale animations
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Empty State */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Empty State Component
        </Typography>
        <Card>
          <EmptyState
            title="No Items Yet"
            description="Get started by creating your first item. It only takes a minute!"
            action={{
              label: 'Create First Item',
              onClick: () => alert('Create action!'),
            }}
          />
        </Card>
      </Box>

      {/* Glass Effect */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Glass Morphism Effect
        </Typography>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            p: 4,
            borderRadius: 2,
            position: 'relative',
          }}
        >
          <Box className="glass" sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Beautiful Glass Effect
            </Typography>
            <Typography variant="body2">
              This card uses backdrop blur and transparency for a modern glass effect
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
