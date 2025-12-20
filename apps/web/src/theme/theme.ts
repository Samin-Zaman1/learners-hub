import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: 13, // Reduced from default 14
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
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          maxWidth: '1400px !important', // Limit overall container width
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          '&.form-container': {
            maxWidth: 600,
            margin: '0 auto',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small', // Make all text fields smaller by default
      },
      styleOverrides: {
        root: {
          '& .MuiInputBase-input': {
            fontSize: '0.875rem', // Smaller input text
          },
          '& .MuiInputLabel-root': {
            fontSize: '0.875rem', // Smaller label text
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 7, // Consistent rounded corners
        },
        input: {
          padding: '10px 14px', // Reduce padding
        },
      },
    },
    MuiButton: {
      defaultProps: {
        size: 'medium', // Default button size
      },
      styleOverrides: {
        root: {
          textTransform: 'none', // Remove uppercase
          borderRadius: 7,
          padding: '8px 16px',
        },
        sizeMedium: {
          padding: '8px 16px',
          fontSize: '0.875rem',
        },
        sizeSmall: {
          padding: '6px 12px',
          fontSize: '0.8125rem',
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
        },
      },
    },
  },
});

export default theme;
