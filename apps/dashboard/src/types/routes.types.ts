/**
 * Routing Types
 */

export interface RouteConfig {
  path: string;
  name: string;
  component: any;
  title?: string;
  description?: string;
  exact?: boolean;
  protected?: boolean;
  icon?: React.ComponentType<any>;
  requiredPermission?: string;
  allowedRoles?: string[];
  children?: RouteConfig[];
}
