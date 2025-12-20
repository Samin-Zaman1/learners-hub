'use client';

export default function AttendancePage() {
  return (
    <DashboardLayout title="My Attendance">
      <Box>
        {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <EventAvailable sx={{ color: 'primary.main', fontSize: 28 }} />
            <Typography variant="h4" fontWeight={600}>
              My Attendance
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Track your class attendance, view attendance history, and monitor your attendance rate.
          </Typography>
        </Paper>

        {/* Quick Stats */}
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: 3,
          mb: 3
        }}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Schedule sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
            <Typography variant="h6" fontWeight={600}>Present Days</Typography>
            <Typography variant="h4" color="success.main" fontWeight={700}>
              85
            </Typography>
          </Paper>

          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <EventAvailable sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
            <Typography variant="h6" fontWeight={600}>Absent Days</Typography>
            <Typography variant="h4" color="warning.main" fontWeight={700}>
              4
            </Typography>
          </Paper>

          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <TrendingUp sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6" fontWeight={600}>Attendance Rate</Typography>
            <Typography variant="h4" color="primary.main" fontWeight={700}>
              95%
            </Typography>
          </Paper>
        </Box>

        {/* Coming Soon Notice */}
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            📊 Coming Soon
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            We're building comprehensive attendance tracking with detailed analytics, 
            course-wise attendance breakdown, and automated notifications.
          </Typography>
          <Button variant="outlined" color="primary">
            Stay Tuned
          </Button>
        </Paper>
      </Box>
    </DashboardLayout>
  );
}