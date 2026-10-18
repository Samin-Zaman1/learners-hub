# Learners Hub Theme System

## Overview

The Learners Hub theme system provides comprehensive theming capabilities with support for:
- **Dynamic color customization** with color pickers
- **Gradient support** for buttons, app bars, and backgrounds
- **Predefined themes** (Grey, Blue, Purple, Green, Orange)
- **Custom themes** with import/export functionality
- **Global application** across all components
- **Persistent storage** in localStorage

## Architecture

### Core Files

1. **`src/theme/themeConfig.ts`**
   - Theme configuration interfaces
   - Predefined theme definitions
   - MUI theme generator function
   - Gradient configuration

2. **`src/contexts/ThemeContext.tsx`**
   - React Context for theme state management
   - Theme persistence in localStorage
   - Theme update functions

3. **`src/app/providers.tsx`**
   - Wraps app with ThemeProvider and MuiThemeProvider
   - Dynamic theme generation based on current config

4. **`src/app/settings/theme/page.tsx`**
   - UI for theme customization
   - Color pickers, gradient controls
   - Theme preview components

## Usage

### Accessing Theme in Components

```tsx
import { useTheme } from '@/hooks/useTheme';

function MyComponent() {
  const { currentTheme, setThemeName, updateThemeColors } = useTheme();
  
  return (
    <Box sx={{ bgcolor: currentTheme.colors.primary }}>
      {/* Your content */}
    </Box>
  );
}
```

### Switching Predefined Themes

```tsx
const { setThemeName } = useTheme();

// Switch to blue theme
setThemeName('blue');

// Switch to purple theme
setThemeName('purple');
```

### Customizing Colors

```tsx
const { updateThemeColors } = useTheme();

// Update primary color
updateThemeColors({ primary: '#ff6b6b' });

// Update multiple colors
updateThemeColors({
  primary: '#ff6b6b',
  secondary: '#4ecdc4',
  accent: '#45b7d1',
});
```

### Enabling Gradients

```tsx
const { updateGradient } = useTheme();

// Enable gradient with custom colors
updateGradient({
  enabled: true,
  startColor: '#667eea',
  endColor: '#764ba2',
  angle: 135,
});
```

### Exporting/Importing Themes

Users can export their custom theme as JSON and import it later:

```json
{
  "name": "My Custom Theme",
  "colors": {
    "primary": "#667eea",
    "secondary": "#764ba2",
    "accent": "#f093fb",
    "background": "#f8f9fa",
    "surface": "#ffffff",
    "textPrimary": "#2c3e50",
    "textSecondary": "#7f8c8d"
  },
  "gradient": {
    "enabled": true,
    "startColor": "#667eea",
    "endColor": "#764ba2",
    "angle": 135
  }
}
```

## Predefined Themes

### Grey (Default)
- Primary: `#6b7280`
- Clean, professional appearance
- No gradients by default

### Blue
- Primary: `#3b82f6`
- Modern, trustworthy look
- Light blue backgrounds

### Purple
- Primary: `#8b5cf6`
- Creative, vibrant appearance
- Gradient enabled by default

### Green
- Primary: `#10b981`
- Fresh, natural feel
- Light green backgrounds

### Orange
- Primary: `#f97316`
- Energetic, warm appearance
- Gradient enabled by default

## Theme Components

### Colors Applied To:

1. **Buttons**
   - Primary color for contained buttons
   - Gradient overlay when enabled
   - Hover states with darker shades

2. **AppBar/Navigation**
   - Primary color background
   - Gradient overlay when enabled

3. **Paper/Cards**
   - Surface color background
   - Subtle gradient overlay (15% opacity) when enabled

4. **Text**
   - Primary text color for headings
   - Secondary text color for descriptions

5. **Form Fields**
   - Border colors match primary
   - Focus states use accent color

6. **Backgrounds**
   - Page background uses background color
   - Component surfaces use surface color

## Accessing Theme Settings

Navigate to **Dashboard → Settings → Theme** or click the palette icon in the navigation bar.

## Technical Details

### localStorage Keys
- `champius_theme` - Stores current theme configuration
- `champius_theme_name` - Stores selected theme name

### Theme Properties

```typescript
interface ThemeColors {
  primary: string;      // Main brand color
  secondary: string;    // Secondary brand color
  accent: string;       // Accent/highlight color
  background: string;   // Page background
  surface: string;      // Card/paper background
  textPrimary: string;  // Main text color
  textSecondary: string; // Secondary text color
}

interface GradientConfig {
  enabled: boolean;     // Enable/disable gradients
  startColor: string;   // Gradient start color
  endColor: string;     // Gradient end color
  angle: number;        // Gradient angle (0-360)
}
```

### Smooth Transitions

All theme changes include smooth CSS transitions:
- Background color: 0.3s ease
- Text color: 0.3s ease
- Component colors: handled by MUI

## Best Practices

1. **Test theme changes** - Use the preview section in theme settings
2. **Export custom themes** - Save your custom configurations
3. **Use semantic colors** - Follow the color hierarchy (primary > secondary > accent)
4. **Consider contrast** - Ensure text is readable on backgrounds
5. **Test gradients** - Preview buttons and app bars with gradients enabled

## Future Enhancements

- Dark mode support
- More predefined themes
- Theme scheduling (different themes for time of day)
- Per-role theme customization
- Theme marketplace/sharing

## Support

For theme-related issues or feature requests, contact the development team.
