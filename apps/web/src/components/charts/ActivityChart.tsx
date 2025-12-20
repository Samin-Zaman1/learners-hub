'use client';

import { useState, useEffect } from 'react';
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

export interface ActivityData {
  week: number;
  classAttendance: number;
  quizAttendance: number;
  assignmentSubmission: number;
  studyHours?: number;
  groupProjects?: number;
  [key: string]: number | undefined; // Allow custom activity types
}

export interface SemesterData {
  id: string;
  name: string;
  data: ActivityData[];
}

export interface ActivityType {
  key: string;
  label: string;
  color: string;
  icon: React.ComponentType<unknown>;
}

export interface ActivityChartProps {
  title?: string;
  data: SemesterData[];
  activityTypes?: ActivityType[];
  defaultSemester?: string;
  defaultActivities?: string[];
  showSummary?: boolean;
  height?: number;
  variant?: 'full' | 'compact';
  onDataChange?: (semester: string, activities: string[]) => void;
}

const defaultActivityTypes: ActivityType[] = [
  { 
    key: 'classAttendance', 
    label: 'Class Attendance', 
    color: '#6366f1', 
    icon: School 
  },
  { 
    key: 'quizAttendance', 
    label: 'Quiz Attendance', 
    color: '#06b6d4', 
    icon: Quiz 
  },
  { 
    key: 'assignmentSubmission', 
    label: 'Assignment Submission', 
    color: '#f59e0b', 
    icon: Assignment 
  },
  { 
    key: 'studyHours', 
    label: 'Study Hours', 
    color: '#8b5cf6', 
    icon: TrendingUp 
  },
  { 
    key: 'groupProjects', 
    label: 'Group Projects', 
    color: '#f97316', 
    icon: Assignment 
  }
];

export default function ActivityChart({
  title = "Activity Overview",
  data = [],
  activityTypes = defaultActivityTypes,
  defaultSemester = 'this-week',
  defaultActivities = activityTypes.slice(0, 3).map(t => t.key),
  showSummary = true,
  height = 280,
  variant = 'full',
  onDataChange
}: ActivityChartProps) {
  const [selectedSemester, setSelectedSemester] = useState(defaultSemester);
  const [selectedActivities, setSelectedActivities] = useState(defaultActivities);

  // Use demo data for now
  const demoData: ActivityData[] = [
    { week: 1, classAttendance: 85, assignmentSubmission: 95, quizAttendance: 90 },
    { week: 2, classAttendance: 75, assignmentSubmission: 88, quizAttendance: 82 },
    { week: 3, classAttendance: 92, assignmentSubmission: 78, quizAttendance: 95 },
    { week: 4, classAttendance: 68, assignmentSubmission: 85, quizAttendance: 72 }
  ];
  const currentData = demoData;
  
  // Update selected semester when data changes
  useEffect(() => {
    if (data.length > 0 && !data.find(sem => sem.id === selectedSemester)) {
      setSelectedSemester(data[0].id);
    }
  }, [data, selectedSemester]);
  
  const toggleActivity = (activityKey: string) => {
    const newActivities = selectedActivities.includes(activityKey) 
      ? selectedActivities.filter(key => key !== activityKey)
      : [...selectedActivities, activityKey];
    
    setSelectedActivities(newActivities);
    onDataChange?.(selectedSemester, newActivities);
  };

  const handleSemesterChange = (semester: string) => {
    setSelectedSemester(semester);
    onDataChange?.(semester, selectedActivities);
  };

  // Helper to create straight lines
  const getStraightLinePath = (points: Array<{x: number, y: number}>) => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x},${points[0].y}`;
    
    let path = `M ${points[0].x},${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x},${points[i].y}`;
    }
    
    return path;
  };

  const getPathData = (dataKey: string, chartData: ActivityData[]) => {
    if (chartData.length === 0) return '';
    
    const chartWidth = 500;
    const chartHeight = variant === 'compact' ? 120 : 300;
    const paddingLeft = 60;
    const paddingRight = 40;
    const paddingTop = 20;
    const paddingBottom = 35;
    
    const xStep = (chartWidth - paddingLeft - paddingRight) / Math.max(chartData.length - 1, 1);
    // Scale from 20 to 110 (90 point range)
    const yScale = (chartHeight - paddingTop - paddingBottom) / 90;
    
    const points = chartData.map((item, index) => {
      const x = paddingLeft + index * xStep;
      const value = Math.max(20, Math.min(110, item[dataKey] || 20));
      const y = chartHeight - paddingBottom - (value - 20) * yScale;
      return { x, y };
    });
    
    return getStraightLinePath(points);
  };

  const getPointsForActivity = (dataKey: string, chartData: ActivityData[]) => {
    const chartWidth = 500;
    const chartHeight = variant === 'compact' ? 120 : 300;
    const paddingLeft = 60;
    const paddingRight = 40;
    const paddingTop = 20;
    const paddingBottom = 35;
    
    const xStep = (chartWidth - paddingLeft - paddingRight) / Math.max(chartData.length - 1, 1);
    const yScale = (chartHeight - paddingTop - paddingBottom) / 90;
    
    return chartData.map((item, index) => {
      const value = Math.max(20, Math.min(110, item[dataKey] || 20));
      return {
        x: paddingLeft + index * xStep,
        y: chartHeight - paddingBottom - (value - 20) * yScale,
        value: item[dataKey] || 0,
        week: item.week
      };
    });
  };

  const chartHeight = variant === 'compact' ? 120 : 300;
  const showControls = variant === 'full';

  // Show loading state if no data
  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: variant === 'compact' ? 2 : 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <TrendingUp sx={{ color: '#667eea' }} />
          <Typography variant={variant === 'compact' ? 'subtitle1' : 'h6'} fontWeight={600}>
            {title}
          </Typography>
        </Box>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: height || 280,
          color: 'text.secondary' 
        }}>
          <Typography>Loading activity data...</Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ 
      p: 2, 
      borderRadius: 7, 
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 1.5
      }}>
        <Typography variant="h6" fontWeight={600}>
          {title}
        </Typography>
        
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <Select
            value={selectedSemester}
            onChange={(e) => handleSemesterChange(e.target.value)}
            sx={{
              borderRadius: 10,
              bgcolor: '#f8fafc',
              fontSize: '0.8rem',
              border: 'none',
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none'
              },
              '& .MuiSelect-select': {
                py: 0.5,
                px: 2
              }
            }}
          >
            <MenuItem value="this-month" sx={{ fontSize: '0.8rem' }}>This Month</MenuItem>
            <MenuItem value="this-week" sx={{ fontSize: '0.8rem' }}>This Week</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Chart Container */}
      <Box sx={{ width: '100%', height, position: 'relative', overflow: 'hidden' }}>
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 500 ${chartHeight}`}
          style={{ border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: 'white' }}
        >
          {/* Grid Lines - Horizontal only */}
          {[20, 40, 60, 80, 100].map((value) => {
            const y = chartHeight - 35 - ((value - 20) * (chartHeight - 55)) / 90;
            return (
              <g key={value}>
                <line
                  x1={60}
                  y1={y}
                  x2={460}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
                <text
                  x={45}
                  y={y + 3}
                  fontSize="10"
                  fill="#6b7280"
                  textAnchor="end"
                  fontWeight="500"
                >
                  {value}
                </text>
              </g>
            );
          })}
          
          {/* X-axis labels only */}
          {currentData.map((item, index) => {
            const x = 60 + (index * 400) / Math.max(currentData.length - 1, 1);
            return (
              <g key={item.week}>
                <text
                  x={x}
                  y={chartHeight - 15}
                  fontSize="11"
                  fill="#64748b"
                  textAnchor="middle"
                  fontWeight="500"
                >
                  Week {item.week}
                </text>
              </g>
            );
          })}

          {/* Data Lines */}
          {activityTypes.map((activity) => {
            if (!selectedActivities.includes(activity.key)) return null;
            
            const pathData = getPathData(activity.key, currentData);
            const points = getPointsForActivity(activity.key, currentData);
            
            return (
              <g key={activity.key}>
                {/* Line */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={activity.color}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                
                {/* Data Points */}
                {points.map((point, index) => (
                  <circle
                    key={index}
                    cx={point.x}
                    cy={point.y}
                    r={3}
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

      {/* Legend */}
      <Box sx={{ 
        mt: 2, 
        p: 1.5,
        bgcolor: '#f9fafb',
        borderRadius: 2,
        display: 'flex',
        gap: 3,
        justifyContent: 'center',
        flexWrap: 'wrap',
        border: '1px solid #e5e7eb'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ 
            width: 10, 
            height: 10, 
            borderRadius: '50%',
            bgcolor: '#6366f1' 
          }} />
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem', fontWeight: 500 }}>
            Class Attendance
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ 
            width: 10, 
            height: 10, 
            borderRadius: '50%',
            bgcolor: '#06b6d4' 
          }} />
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem', fontWeight: 500 }}>
            Quiz Attendance
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ 
            width: 10, 
            height: 10, 
            borderRadius: '50%',
            bgcolor: '#f59e0b' 
          }} />
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem', fontWeight: 500 }}>
            Assignment Submitted
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}