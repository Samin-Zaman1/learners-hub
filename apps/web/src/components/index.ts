// Layout Components
export { default as Sidebar } from './layout/Sidebar';
export { default as DashboardLayout } from './layout/DashboardLayout';

// Shared Components
export { default as ScheduleComponent } from './shared/ScheduleComponent';
export type { ScheduleEvent, ScheduleComponentProps } from './shared/ScheduleComponent';
export { default as PageHeader } from './shared/PageHeader';
export { ThemeToggleButton } from './shared/ThemeToggleButton';
export { Loading } from './shared/Loading';
export { EmptyState } from './shared/EmptyState';
export { SkeletonCard, SkeletonTable, SkeletonGrid, SkeletonList } from './shared/Skeletons';
export { StatsCard } from './shared/StatsCard';

// Chart Components  
export { default as ActivityChart } from './charts/ActivityChart';
export type { 
  ActivityData, 
  SemesterData, 
  ActivityType, 
  ActivityChartProps 
} from './charts/ActivityChart';

// Data Hooks
export { useActivityData, useActivityDataForPage } from '../hooks/useActivityData';
export { useScheduleData, useScheduleDataForPage } from '../hooks/useScheduleData';