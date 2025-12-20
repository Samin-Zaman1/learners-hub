import { createTheme, Theme } from '@mui/material/styles';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
}

export interface GradientConfig {
  enabled: boolean;
  startColor: string;
  endColor: string;
  angle: number;
}

export interface CustomThemeConfig {
  name: string;
  colors: ThemeColors;
  gradient: GradientConfig;
}

// Predefined themes
export const predefinedThemes: Record<string, CustomThemeConfig> = {
  academicBlue: {
    name: 'Academic Blue',
    colors: {
      primary: '#1e40af',
      secondary: '#3b82f6',
      accent: '#0ea5e9',
      background: '#f0f9ff',
      surface: '#ffffff',
      textPrimary: '#1e293b',
      textSecondary: '#64748b',
    },
    gradient: {
      enabled: false,
      startColor: '#1e40af',
      endColor: '#0ea5e9',
      angle: 135,
    },
  },
  calmTeal: {
    name: 'Calm Teal',
    colors: {
      primary: '#0d9488',
      secondary: '#14b8a6',
      accent: '#10b981',
      background: '#f0fdfa',
      surface: '#ffffff',
      textPrimary: '#134e4a',
      textSecondary: '#64748b',
    },
    gradient: {
      enabled: false,
      startColor: '#0d9488',
      endColor: '#10b981',
      angle: 135,
    },
  },
  grey: {
    name: 'Professional Grey',
    colors: {
      primary: '#6b7280',
      secondary: '#9ca3af',
      accent: '#4b5563',
      background: '#f9fafb',
      surface: '#ffffff',
      textPrimary: '#1f2937',
      textSecondary: '#6b7280',
    },
    gradient: {
      enabled: false,
      startColor: '#6b7280',
      endColor: '#4b5563',
      angle: 135,
    },
  },
  blue: {
    name: 'Bright Blue',
    colors: {
      primary: '#3b82f6',
      secondary: '#60a5fa',
      accent: '#2563eb',
      background: '#eff6ff',
      surface: '#ffffff',
      textPrimary: '#1e3a8a',
      textSecondary: '#64748b',
    },
    gradient: {
      enabled: false,
      startColor: '#3b82f6',
      endColor: '#2563eb',
      angle: 135,
    },
  },
  purple: {
    name: 'Creative Purple',
    colors: {
      primary: '#8b5cf6',
      secondary: '#a78bfa',
      accent: '#7c3aed',
      background: '#faf5ff',
      surface: '#ffffff',
      textPrimary: '#581c87',
      textSecondary: '#64748b',
    },
    gradient: {
      enabled: true,
      startColor: '#8b5cf6',
      endColor: '#ec4899',
      angle: 135,
    },
  },
  green: {
    name: 'Focus Green',
    colors: {
      primary: '#10b981',
      secondary: '#34d399',
      accent: '#059669',
      background: '#f0fdf4',
      surface: '#ffffff',
      textPrimary: '#064e3b',
      textSecondary: '#64748b',
    },
    gradient: {
      enabled: false,
      startColor: '#10b981',
      endColor: '#059669',
      angle: 135,
    },
  },
  orange: {
    name: 'Energetic Orange',
    colors: {
      primary: '#f97316',
      secondary: '#fb923c',
      accent: '#ea580c',
      background: '#fff7ed',
      surface: '#ffffff',
      textPrimary: '#7c2d12',
      textSecondary: '#64748b',
    },
    gradient: {
      enabled: true,
      startColor: '#f97316',
      endColor: '#dc2626',
      angle: 135,
    },
  },
};

export const createCustomTheme = (config: CustomThemeConfig): Theme => {
  const { colors, gradient } = config;

  return createTheme({
    palette: {
      primary: {
        main: colors.primary,
        light: colors.secondary,
        dark: colors.accent,
      },
      secondary: {
        main: colors.secondary,
      },
      background: {
        default: colors.background,
        paper: colors.surface,
      },
      text: {
        primary: colors.textPrimary,
        secondary: colors.textSecondary,
      },
    },
    typography: {
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: 13,
      h1: { fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
      h2: { fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
      h3: { fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
      h4: { fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
      h5: { fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
      h6: { fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
      subtitle1: { fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '0.9rem' },
      subtitle2: { fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '0.85rem' },
      body1: { fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '0.875rem' },
      body2: { fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '0.8125rem' },
      button: { fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '0.85rem', textTransform: 'none' },
      caption: { fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '0.75rem' },
      overline: { fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            backgroundColor: colors.background,
          },
        },
      },
      MuiContainer: {
        styleOverrides: {
          root: {
            maxWidth: '1400px !important',
          },
        },
      },
      MuiPaper: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: {
            backgroundImage: gradient.enabled
              ? `linear-gradient(${gradient.angle}deg, ${gradient.startColor}15, ${gradient.endColor}15)`
              : 'none',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
            borderRadius: 7,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          },
          elevation1: {
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08), 0 2px 3px rgba(0, 0, 0, 0.06)',
          },
          elevation2: {
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
          },
          elevation3: {
            boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
            borderRadius: 7,
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            border: `1px solid ${colors.background}`,
            overflow: 'hidden',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 10px 20px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08)',
            },
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          size: 'small',
        },
        styleOverrides: {
          root: {
            '& .MuiInputBase-input': {
              fontSize: '0.875rem',
            },
            '& .MuiInputLabel-root': {
              fontSize: '0.875rem',
            },
            '& .MuiOutlinedInput-root': {
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.secondary,
              },
              '&.Mui-focused': {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderWidth: 2,
                  boxShadow: `0 0 0 3px ${colors.primary}15`,
                },
              },
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 7,
            backgroundColor: colors.surface,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              backgroundColor: colors.background,
            },
          },
          input: {
            padding: '10px 14px',
          },
          notchedOutline: {
            borderColor: `${colors.textSecondary}30`,
          },
        },
      },
      MuiButton: {
        defaultProps: {
          size: 'medium',
          disableElevation: false,
        },
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 7,
            padding: '8px 20px',
            fontWeight: 500,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-1px)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
          },
          contained: {
            backgroundImage: gradient.enabled
              ? `linear-gradient(${gradient.angle}deg, ${gradient.startColor}, ${gradient.endColor})`
              : 'none',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
            '&:hover': {
              backgroundImage: gradient.enabled
                ? `linear-gradient(${gradient.angle}deg, ${gradient.startColor}dd, ${gradient.endColor}dd)`
                : 'none',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)',
            },
            '&:active': {
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
            },
          },
          outlined: {
            borderWidth: 1.5,
            '&:hover': {
              borderWidth: 1.5,
              backgroundColor: `${colors.primary}08`,
            },
          },
          text: {
            '&:hover': {
              backgroundColor: `${colors.primary}08`,
            },
          },
          sizeMedium: {
            padding: '9px 20px',
            fontSize: '0.875rem',
          },
          sizeSmall: {
            padding: '6px 14px',
            fontSize: '0.8125rem',
          },
          sizeLarge: {
            padding: '12px 28px',
            fontSize: '0.9375rem',
          },
        },
      },
      MuiSelect: {
        defaultProps: {
          size: 'small',
        },
      },
      MuiFormControl: {
        defaultProps: {
          size: 'small',
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            fontSize: '0.875rem',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontSize: '0.8125rem',
            fontWeight: 500,
            borderRadius: 7,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          },
          filled: {
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: gradient.enabled
              ? `linear-gradient(${gradient.angle}deg, ${gradient.startColor}, ${gradient.endColor})`
              : 'none',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'scale(1.1)',
              backgroundColor: `${colors.primary}15`,
            },
            '&:active': {
              transform: 'scale(0.95)',
            },
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: 7,
            margin: '2px 8px',
            transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              backgroundColor: `${colors.primary}12`,
              transform: 'translateX(4px)',
            },
            '&.Mui-selected': {
              backgroundColor: `${colors.primary}20`,
              '&:hover': {
                backgroundColor: `${colors.primary}30`,
              },
            },
          },
        },
      },
      MuiList: {
        styleOverrides: {
          root: {
            padding: '8px',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 7,
            margin: '2px 0',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              backgroundColor: `${colors.primary}12`,
              transform: 'translateX(4px)',
            },
            '&.Mui-selected': {
              backgroundColor: `${colors.primary}20`,
              '&:hover': {
                backgroundColor: `${colors.primary}30`,
              },
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${colors.background}`,
            padding: '14px 16px',
          },
          head: {
            fontWeight: 600,
            backgroundColor: colors.background,
            color: colors.textPrimary,
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              backgroundColor: `${colors.primary}08`,
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 7,
            boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15), 0 10px 10px rgba(0, 0, 0, 0.08)',
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 7,
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: colors.textPrimary,
            fontSize: '0.8125rem',
            borderRadius: 7,
            padding: '8px 12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.15)',
          },
          arrow: {
            color: colors.textPrimary,
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            height: 6,
            backgroundColor: `${colors.primary}20`,
          },
          bar: {
            borderRadius: 4,
            backgroundImage: gradient.enabled
              ? `linear-gradient(${gradient.angle}deg, ${gradient.startColor}, ${gradient.endColor})`
              : 'none',
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            border: `2px solid ${colors.surface}`,
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiBadge: {
        styleOverrides: {
          badge: {
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
            border: `2px solid ${colors.surface}`,
          },
        },
      },
    },
  });
};
