export interface PackageStats {
  total: number;
  apps: number;
  libs: number;
  tools: number;
  custom: number;
  totalDependencies: number;
}

export interface StatsCardsProps {
  stats: PackageStats;
}
