import React from 'react';
import DashboardLayout from './DashboardLayout';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return <DashboardLayout>{children}</DashboardLayout>;
}