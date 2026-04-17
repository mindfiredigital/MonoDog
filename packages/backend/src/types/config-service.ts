/**
 * Configuration file interface
 */
export interface ConfigFile {
  id: string;
  name: string;
  path: string;
  type: string;
  content: string;
  size: number;
  lastModified: string;
  hasSecrets: boolean;
}

/**
 * Transformed configuration file with editability info
 */
export interface TransformedConfigFile extends ConfigFile {
  isEditable: boolean;
}
