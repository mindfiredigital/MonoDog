/**
 * Routing Types
 */

export interface RouteConfig {
  path: string;
  name: string;
  component: React.ComponentType<any>;
  icon?: React.ComponentType<any>;
  requiredPermission?: string;
  children?: RouteConfig[];
}
