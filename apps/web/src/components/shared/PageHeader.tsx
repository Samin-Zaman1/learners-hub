import React from 'react';
import { Box, Typography, Breadcrumbs, Link } from '@mui/material';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  action,
}) => {
  return (
    <Box
      className="animate-fadeIn"
      sx={{
        mb: 4,
        pb: 3,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ 
            mb: 2,
            '& .MuiBreadcrumbs-separator': {
              mx: 1,
            }
          }}
        >
          {breadcrumbs.map((crumb, index) => (
            crumb.href ? (
              <Link
                key={index}
                href={crumb.href}
                underline="hover"
                color="text.secondary"
                sx={{ 
                  fontSize: '0.875rem',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: 'primary.main',
                    transform: 'translateX(-2px)',
                  }
                }}
              >
                {crumb.label}
              </Link>
            ) : (
              <Typography
                key={index}
                color="text.primary"
                sx={{ fontSize: '0.875rem', fontWeight: 600 }}
              >
                {crumb.label}
              </Typography>
            )
          ))}
        </Breadcrumbs>
      )}

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.5rem', md: '2rem' },
              mb: description ? 1 : 0,
              color: 'text.primary',
              background: 'linear-gradient(135deg, currentColor 0%, currentColor 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
            }}
          >
            {title}
          </Typography>
          {description && (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: '0.9375rem', maxWidth: '800px' }}
            >
              {description}
            </Typography>
          )}
        </Box>

        {action && (
          <Box sx={{ flexShrink: 0 }}>
            {action}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PageHeader;
