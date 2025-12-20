'use client';

import React from 'react';
import { Card, CardContent, Box, Typography, Avatar } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  subtitle?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color = 'primary',
  trend,
  subtitle,
}) => {
  return (
    <Card
      className="hover-lift"
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'visible',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom fontWeight={500}>
              {title}
            </Typography>
            <Typography
              variant="h4"
              component="div"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.75rem', md: '2.125rem' },
                mb: 0.5,
                color: `${color}.main`,
              }}
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          {icon && (
            <Avatar
              sx={{
                bgcolor: `${color}.main`,
                width: 56,
                height: 56,
                boxShadow: `0 4px 14px ${color === 'primary' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(0, 0, 0, 0.2)'}`,
              }}
            >
              {icon}
            </Avatar>
          )}
        </Box>

        {trend && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              mt: 2,
              pt: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            {trend.direction === 'up' ? (
              <TrendingUp sx={{ fontSize: 18, color: 'success.main' }} />
            ) : (
              <TrendingDown sx={{ fontSize: 18, color: 'error.main' }} />
            )}
            <Typography
              variant="body2"
              sx={{
                color: trend.direction === 'up' ? 'success.main' : 'error.main',
                fontWeight: 600,
              }}
            >
              {trend.value}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              vs last period
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;
