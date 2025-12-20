'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useState } from 'react';
import { ThemeProvider, useTheme as useCustomTheme } from '@/contexts/ThemeContext';
import { createCustomTheme } from '@/theme/themeConfig';

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { currentTheme } = useCustomTheme();
  const theme = createCustomTheme(currentTheme);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time: how long data is considered fresh
            staleTime: 1000 * 60 * 5, // 5 minutes
            // Cache time: how long inactive data stays in cache
            gcTime: 1000 * 60 * 10, // 10 minutes
            // Retry failed requests
            retry: 1,
            // Refetch on window focus
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ThemeWrapper>{children}</ThemeWrapper>
      </ThemeProvider>
    </QueryClientProvider>
  );
}