import { DashboardConfig } from '@/components/configuration/Configuration';

export interface HeaderProps {
  config: DashboardConfig;
  onShowSetupGuide: () => void;
  onShowConfig: () => void;
  onRefresh: () => void;
}
