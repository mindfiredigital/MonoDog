import { DashboardConfig } from "@/components/configuration/Configuration";

export const defaultConfig: DashboardConfig = {
  title: 'Monorepo Dashboard',
  description: 'Visual management and monitoring of your monorepo packages',
  packageTypes: ['app', 'lib', 'tool'],
  features: {
    healthChecks: true,
    ciIntegration: true,
    dependencyGraph: true,
    publishControl: true,
    searchAndFilter: true,
    configurationInspector: true,
  },
  branding: {
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
  },
};