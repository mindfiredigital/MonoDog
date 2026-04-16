export interface HealthMetric {
  name: string;
  value: number;
  status: 'healthy' | 'warning' | 'error';
  description: string;
}
