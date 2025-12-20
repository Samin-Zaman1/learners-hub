'use client';

import { Box, Typography, Paper, Chip } from '@mui/material';
import { Analytics, TrendingUp, Assessment } from '@mui/icons-material';
import { 
  ActivityChart, 
  ScheduleComponent,
  useActivityDataForPage,
  useScheduleDataForPage 
} from '../../components';

export default function AnalyticsPage() {
  // Use hooks with analytics configuration (using 'dashboard' since 'analytics' isn't defined)
  const { data: activityData, loading: activityLoading, config: activityConfig } = useActivityDataForPage('dashboard');
  const { events: scheduleEvents, loading: scheduleLoading, config: scheduleConfig } = useScheduleDataForPage('dashboard');

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', p: 3 }}>
      {/* Page Header */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Analytics sx={{ color: '#667eea', fontSize: 32 }} />
          <Typography variant="h4" fontWeight={600}>
            Student Analytics
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Comprehensive view of your academic performance and engagement metrics
        </Typography>
      </Paper>

      {/* Analytics Grid */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
        gap: 3,
        mb: 3
      }}>
        {/* Full Activity Chart */}
        <ActivityChart
          title="Performance Analytics"
          data={activityData}
          {...activityConfig}
          variant="full"
          showSummary={true}
          height={400}
          onDataChange={(semester, activities) => {
            console.log('Analytics view - filter changed:', { semester, activities });
          }}
        />

        {/* Schedule Overview */}
        <ScheduleComponent
          title="Schedule Overview"
          events={scheduleEvents}
          variant="compact"
          defaultView="month"
          showControls={true}
          onEventClick={(event) => {
            console.log('Analytics view - event clicked:', event);
          }}
        />
      </Box>

      {/* Compact Activity Charts - Different Views */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
        gap: 3,
        mb: 3
      }}>
        <ActivityChart
          title="Class Attendance Trend"
          data={activityData}
          variant="compact"
          defaultActivities={['classAttendance']}
          showSummary={false}
          height={200}
        />

        <ActivityChart
          title="Quiz Performance"
          data={activityData}
          variant="compact"
          defaultActivities={['quizAttendance']}
          showSummary={false}
          height={200}
        />

        <ActivityChart
          title="Assignment Submissions"
          data={activityData}
          variant="compact"
          defaultActivities={['assignmentSubmission']}
          showSummary={false}
          height={200}
        />
      </Box>

      {/* Performance Summary */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Assessment sx={{ color: '#667eea' }} />
          <Typography variant="h6" fontWeight={600}>
            Performance Summary
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip 
            label="Overall Grade: A-" 
            sx={{ bgcolor: '#10b981', color: 'white', fontWeight: 600 }}
          />
          <Chip 
            label="Attendance: 92%" 
            sx={{ bgcolor: '#667eea', color: 'white', fontWeight: 600 }}
          />
          <Chip 
            label="On-time Submissions: 95%" 
            sx={{ bgcolor: '#f59e0b', color: 'white', fontWeight: 600 }}
          />
          <Chip 
            label="Improvement Trend: ↗ 8%" 
            sx={{ bgcolor: '#10b981', color: 'white', fontWeight: 600 }}
          />
        </Box>
      </Paper>
    </Box>
  );
}