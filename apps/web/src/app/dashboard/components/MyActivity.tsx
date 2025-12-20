'use client';

import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Chip,
  Button,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  School,
  Quiz,
  Assignment,
  FilterList,
} from '@mui/icons-material';

interface ActivityData {
  week: number;
  classAttendance: number;
  quizAttendance: number;
  assignmentSubmission: number;
}

interface SemesterData {
  id: string;
  name: string;
  data: ActivityData[];
}

const mockSemesterData: SemesterData[] = [
  {
    id: 'current',
    name: 'Fall 2025 (Current)',
    data: [
      { week: 1, classAttendance: 95, quizAttendance: 100, assignmentSubmission: 90 },
      { week: 2, classAttendance: 88, quizAttendance: 85, assignmentSubmission: 95 },
      { week: 3, classAttendance: 92, quizAttendance: 90, assignmentSubmission: 88 },
      { week: 4, classAttendance: 85, quizAttendance: 95, assignmentSubmission: 92 },
      { week: 5, classAttendance: 90, quizAttendance: 88, assignmentSubmission: 85 },
      { week: 6, classAttendance: 95, quizAttendance: 92, assignmentSubmission: 98 },
      { week: 7, classAttendance: 88, quizAttendance: 85, assignmentSubmission: 90 },
      { week: 8, classAttendance: 92, quizAttendance: 90, assignmentSubmission: 95 },
    ]
  },
  {
    id: 'spring2025',
    name: 'Spring 2025',
    data: [
      { week: 1, classAttendance: 90, quizAttendance: 95, assignmentSubmission: 85 },
      { week: 2, classAttendance: 85, quizAttendance: 80, assignmentSubmission: 90 },
      { week: 3, classAttendance: 88, quizAttendance: 85, assignmentSubmission: 82 },
      { week: 4, classAttendance: 92, quizAttendance: 90, assignmentSubmission: 88 },
      { week: 5, classAttendance: 85, quizAttendance: 85, assignmentSubmission: 90 },
      { week: 6, classAttendance: 90, quizAttendance: 88, assignmentSubmission: 95 },
      { week: 7, classAttendance: 88, quizAttendance: 92, assignmentSubmission: 85 },
      { week: 8, classAttendance: 95, quizAttendance: 85, assignmentSubmission: 92 },
      { week: 9, classAttendance: 92, quizAttendance: 90, assignmentSubmission: 88 },
      { week: 10, classAttendance: 88, quizAttendance: 95, assignmentSubmission: 95 },
      { week: 11, classAttendance: 90, quizAttendance: 88, assignmentSubmission: 90 },
      { week: 12, classAttendance: 95, quizAttendance: 92, assignmentSubmission: 98 },
    ]
  },
  {
    id: 'fall2024',
    name: 'Fall 2024',
    data: [
      { week: 1, classAttendance: 85, quizAttendance: 90, assignmentSubmission: 80 },
      { week: 2, classAttendance: 88, quizAttendance: 85, assignmentSubmission: 85 },
      { week: 3, classAttendance: 82, quizAttendance: 88, assignmentSubmission: 78 },
      { week: 4, classAttendance: 90, quizAttendance: 82, assignmentSubmission: 85 },
      { week: 5, classAttendance: 85, quizAttendance: 90, assignmentSubmission: 88 },
      { week: 6, classAttendance: 88, quizAttendance: 85, assignmentSubmission: 90 },
      { week: 7, classAttendance: 92, quizAttendance: 88, assignmentSubmission: 85 },
      { week: 8, classAttendance: 85, quizAttendance: 90, assignmentSubmission: 92 },
      { week: 9, classAttendance: 90, quizAttendance: 85, assignmentSubmission: 88 },
      { week: 10, classAttendance: 88, quizAttendance: 92, assignmentSubmission: 90 },
      { week: 11, classAttendance: 85, quizAttendance: 88, assignmentSubmission: 85 },
      { week: 12, classAttendance: 92, quizAttendance: 90, assignmentSubmission: 95 },
    ]
  }
];

const activityTypes = [
  { 
    key: 'classAttendance', 
    label: 'Class Attendance', 
    color: '#667eea', 
    icon: School 
  },
  { 
    key: 'quizAttendance', 
    label: 'Quiz Attendance', 
    color: '#f59e0b', 
    icon: Quiz 
  },
  { 
    key: 'assignmentSubmission', 
    label: 'Assignment Submission', 
    color: '#10b981', 
    icon: Assignment 
  }
];

export default function MyActivity() {
  const [selectedSemester, setSelectedSemester] = useState('current');
  const [selectedActivities, setSelectedActivities] = useState(['classAttendance', 'quizAttendance', 'assignmentSubmission']);

  const currentData = mockSemesterData.find(sem => sem.id === selectedSemester)?.data || [];
  
  const toggleActivity = (activityKey: string) => {
    setSelectedActivities(prev => 
      prev.includes(activityKey) 
        ? prev.filter(key => key !== activityKey)
        : [...prev, activityKey]
    );
  };

  const getPathData = (dataKey: keyof ActivityData, data: ActivityData[]) => {
    if (data.length === 0) return '';
    
    const chartWidth = 500;
    const chartHeight = 200;
    const padding = 40;
    
    const xStep = (chartWidth - 2 * padding) / Math.max(data.length - 1, 1);
    const yScale = (chartHeight - 2 * padding) / 100; // Scale for 0-100 range
    
    const points = data.map((item, index) => {
      const x = padding + index * xStep;
      const y = chartHeight - padding - (item[dataKey] as number) * yScale;
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };

  const getPointsForActivity = (dataKey: keyof ActivityData, data: ActivityData[]) => {
    const chartWidth = 500;
    const chartHeight = 200;
    const padding = 40;
    
    const xStep = (chartWidth - 2 * padding) / Math.max(data.length - 1, 1);
    const yScale = (chartHeight - 2 * padding) / 100;
    
    return data.map((item, index) => ({
      x: padding + index * xStep,
      y: chartHeight - padding - (item[dataKey] as number) * yScale,
      value: item[dataKey] as number,
      week: item.week
    }));
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUp sx={{ color: '#667eea' }} />
          <Typography variant="h6" fontWeight={600}>
            My Activity
          </Typography>
        </Box>
        
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <Select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            sx={{
              borderRadius: 2,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#e2e8f0'
              }
            }}
          >
            {mockSemesterData.map((semester) => (
              <MenuItem key={semester.id} value={semester.id}>
                {semester.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Activity Type Toggles */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        {activityTypes.map((activity) => {
          const Icon = activity.icon;
          const isSelected = selectedActivities.includes(activity.key);
          
          return (
            <Chip
              key={activity.key}
              icon={<Icon fontSize="small" />}
              label={activity.label}
              onClick={() => toggleActivity(activity.key)}
              variant={isSelected ? 'filled' : 'outlined'}
              sx={{
                bgcolor: isSelected ? activity.color : 'transparent',
                color: isSelected ? 'white' : activity.color,
                borderColor: activity.color,
                '&:hover': {
                  bgcolor: isSelected ? activity.color : `${activity.color}20`,
                  filter: 'brightness(0.9)'
                }
              }}
            />
          );
        })}
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Chart Container */}
      <Box sx={{ width: '100%', height: 280, position: 'relative', overflow: 'hidden' }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 500 200"
          style={{ border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#fafafa' }}
        >
          {/* Grid Lines */}
          {/* Y-axis grid lines */}
          {[0, 20, 40, 60, 80, 100].map((value) => {
            const y = 160 - (value * 120) / 100; // 160 is bottom, 120 is chart height
            return (
              <g key={value}>
                <line
                  x1={40}
                  y1={y}
                  x2={460}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth={value === 0 ? 2 : 1}
                />
                <text
                  x={25}
                  y={y + 4}
                  fontSize="12"
                  fill="#6b7280"
                  textAnchor="end"
                >
                  {value}
                </text>
              </g>
            );
          })}
          
          {/* X-axis grid lines and labels */}
          {currentData.map((item, index) => {
            const x = 40 + (index * 420) / Math.max(currentData.length - 1, 1);
            return (
              <g key={item.week}>
                <line
                  x1={x}
                  y1={40}
                  x2={x}
                  y2={160}
                  stroke="#e2e8f0"
                  strokeWidth={1}
                  opacity={0.5}
                />
                <text
                  x={x}
                  y={175}
                  fontSize="12"
                  fill="#6b7280"
                  textAnchor="middle"
                >
                  Week {item.week}
                </text>
              </g>
            );
          })}

          {/* Data Lines */}
          {activityTypes.map((activity) => {
            if (!selectedActivities.includes(activity.key)) return null;
            
            const pathData = getPathData(activity.key as keyof ActivityData, currentData);
            const points = getPointsForActivity(activity.key as keyof ActivityData, currentData);
            
            return (
              <g key={activity.key}>
                {/* Line */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={activity.color}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                
                {/* Data Points */}
                {points.map((point, index) => (
                  <circle
                    key={index}
                    cx={point.x}
                    cy={point.y}
                    r={4}
                    fill={activity.color}
                    stroke="white"
                    strokeWidth={2}
                    style={{ cursor: 'pointer' }}
                  >
                    <title>{`${activity.label}: ${point.value}% (Week ${point.week})`}</title>
                  </circle>
                ))}
              </g>
            );
          })}
        </svg>
      </Box>

      {/* Statistics Summary */}
      <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #e2e8f0' }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
          Current Semester Summary
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
          {activityTypes.map((activity) => {
            const data = currentData;
            const values = data.map(item => item[activity.key as keyof ActivityData] as number);
            const average = values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
            const trend = values.length > 1 ? values[values.length - 1] - values[values.length - 2] : 0;
            
            return (
              <Box
                key={activity.key}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid #e2e8f0',
                  bgcolor: selectedActivities.includes(activity.key) ? `${activity.color}10` : '#f8fafc'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <activity.icon sx={{ fontSize: 16, color: activity.color }} />
                  <Typography variant="caption" color="text.secondary">
                    {activity.label}
                  </Typography>
                </Box>
                
                <Typography variant="h6" fontWeight={600} sx={{ color: activity.color }}>
                  {average}%
                </Typography>
                
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: trend >= 0 ? '#10b981' : '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}
                >
                  {trend >= 0 ? '↗' : '↘'} {Math.abs(trend)}% from last week
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Paper>
  );
}