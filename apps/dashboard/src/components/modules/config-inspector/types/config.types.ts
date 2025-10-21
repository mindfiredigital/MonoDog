// Shared types for config inspector module components

export interface ConfigSection {
  id: string;
  name: string;
  description: string;
  type: 'package' | 'workspace' | 'environment' | 'tool';
  status: 'active' | 'inactive' | 'error';
  lastModified: string;
  config: Record<string, any>;
  validation: ValidationResult[];
}

export interface ValidationResult {
  field: string;
  status: 'valid' | 'warning' | 'error';
  message: string;
}

export interface ConfigFile {
  id: string;
  name: string;
  path: string;
  type: string;
  content: string;
  size: number;
  lastModified: string;
  hasSecrets: boolean;
  isEditable: boolean;
  validation?: ValidationResult[];
}

export interface ConfigFilters {
  section: string;
  type: string;
  status: string;
  search: string;
}

export interface ConfigInspectorProps {
  onConfigChange?: (configId: string, newValue: any) => void;
  onValidationUpdate?: (
    configId: string,
    validation: ValidationResult[]
  ) => void;
}

export interface ConfigSidebarProps {
  configs: ConfigFile[];
  selectedConfig: string | null;
  onConfigSelect: (configId: string) => void;
  filters: ConfigFilters;
  onFiltersChange: (filters: ConfigFilters) => void;
}

export interface ConfigEditorProps {
  config: ConfigFile | null;
  isEditing: boolean;
  editValue: string;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onValueChange: (value: string) => void;
  showSecrets: boolean;
  onToggleSecrets: () => void;
}

export interface ConfigViewerProps {
  config: ConfigFile | null;
  showSecrets: boolean;
  onToggleSecrets: () => void;
  onStartEdit: () => void;
}

export interface ValidationPanelProps {
  validation: ValidationResult[];
  configName: string;
}

export interface ConfigToolbarProps {
  isEditing: boolean;
  canEdit: boolean;
  hasSecrets: boolean;
  showSecrets: boolean;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onToggleSecrets: () => void;
  onRefresh: () => void;
}

export interface ConfigPreviewProps {
  content: string;
  language: string;
  showSecrets: boolean;
  onToggleSecrets?: () => void;
}
