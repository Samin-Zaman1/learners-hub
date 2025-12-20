'use client';

import {
  Box,
  Paper,
  Typography,
} from '@mui/material';

export default function MyScheduleSimple() {
  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" fontWeight={600}>
        My Schedule
      </Typography>
      <Box sx={{ mt: 2, p: 2, bgcolor: '#f8fafc', borderRadius: 1 }}>
        <Typography variant="body2">
          Calendar component loading...
        </Typography>
      </Box>
    </Paper>
  );
}