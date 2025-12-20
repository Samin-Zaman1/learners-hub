'use client';

import React from 'react';
import { Box, Skeleton as MuiSkeleton, Card, CardContent, Grid } from '@mui/material';

export const SkeletonCard: React.FC = () => {
  return (
    <Card>
      <CardContent>
        <MuiSkeleton variant="text" width="60%" height={32} />
        <MuiSkeleton variant="text" width="100%" height={20} sx={{ mt: 1 }} />
        <MuiSkeleton variant="text" width="80%" height={20} />
        <MuiSkeleton variant="rectangular" width="100%" height={120} sx={{ mt: 2, borderRadius: 1 }} />
      </CardContent>
    </Card>
  );
};

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <Box>
      {Array.from({ length: rows }).map((_, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            gap: 2,
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <MuiSkeleton variant="circular" width={40} height={40} />
          <Box sx={{ flex: 1 }}>
            <MuiSkeleton variant="text" width="40%" height={24} />
            <MuiSkeleton variant="text" width="60%" height={20} />
          </Box>
          <MuiSkeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
        </Box>
      ))}
    </Box>
  );
};

export const SkeletonGrid: React.FC<{ items?: number }> = ({ items = 6 }) => {
  return (
    <Grid container spacing={3}>
      {Array.from({ length: items }).map((_, index) => (
        <Grid key={index} item xs={12} sm={6} md={4}>
          <SkeletonCard />
        </Grid>
      ))}
    </Grid>
  );
};

export const SkeletonList: React.FC<{ items?: number }> = ({ items = 5 }) => {
  return (
    <Box>
      {Array.from({ length: items }).map((_, index) => (
        <Box
          key={index}
          sx={{
            p: 2,
            mb: 2,
            borderRadius: 2,
            backgroundColor: 'background.paper',
          }}
        >
          <MuiSkeleton variant="text" width="70%" height={24} />
          <MuiSkeleton variant="text" width="100%" height={20} sx={{ mt: 1 }} />
          <MuiSkeleton variant="text" width="50%" height={20} />
        </Box>
      ))}
    </Box>
  );
};

export default SkeletonCard;
