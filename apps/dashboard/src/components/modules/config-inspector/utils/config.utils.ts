import type {
  ConfigFile,
  ConfigFilters,
  ValidationResult,
} from '../types/config.types';

// Get status color classes
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'inactive':
      return 'bg-gray-100 text-gray-800';
    case 'error':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Get type color classes
export const getTypeColor = (type: string): string => {
  switch (type) {
    case 'workspace':
      return 'bg-blue-100 text-blue-800';
    case 'package':
      return 'bg-green-100 text-green-800';
    case 'environment':
      return 'bg-purple-100 text-purple-800';
    case 'tool':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Get validation status color
export const getValidationColor = (status: string): string => {
  switch (status) {
    case 'valid':
      return 'bg-green-100 text-green-800';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800';
    case 'error':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Filter configurations based on criteria
export const filterConfigs = (
  configs: ConfigFile[],
  filters: ConfigFilters
): ConfigFile[] => {
  return configs.filter(config => {
    const matchesSection =
      filters.section === 'all' || config.id === filters.section;
    const matchesType = filters.type === 'all' || config.type === filters.type;
    const matchesStatus =
      filters.status === 'all' ||
      (filters.status === 'secrets' && config.hasSecrets) ||
      (filters.status === 'standard' && !config.hasSecrets);
    const matchesSearch =
      !filters.search ||
      config.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      config.path.toLowerCase().includes(filters.search.toLowerCase());

    return matchesSection && matchesType && matchesStatus && matchesSearch;
  });
};

// Get unique values for filter options
export const getUniqueTypes = (configs: ConfigFile[]): string[] => {
  return [...new Set(configs.map(config => config.type))];
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Format date
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Detect file language from extension
export const detectLanguage = (filename: string): string => {
  const extension = filename.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'json':
      return 'json';
    case 'yaml':
    case 'yml':
      return 'yaml';
    case 'js':
      return 'javascript';
    case 'ts':
      return 'typescript';
    case 'env':
      return 'env';
    case 'md':
      return 'markdown';
    case 'xml':
      return 'xml';
    case 'toml':
      return 'toml';
    default:
      return 'text';
  }
};

// Check if content contains secrets
export const containsSecrets = (content: string): boolean => {
  const secretPatterns = [
    /password/i,
    /secret/i,
    /key/i,
    /token/i,
    /auth/i,
    /credential/i,
    /api_key/i,
    /private_key/i,
  ];

  return secretPatterns.some(pattern => pattern.test(content));
};

// Mask sensitive values
export const maskSecrets = (content: string): string => {
  // Common patterns for secrets in different formats
  const patterns = [
    // Environment variables: KEY=value
    /^([A-Z_]+(?:PASSWORD|SECRET|KEY|TOKEN|AUTH)[A-Z_]*)\s*=\s*(.+)$/gim,
    // JSON: "key": "value"
    /"([^"]*(?:password|secret|key|token|auth)[^"]*)"\s*:\s*"([^"]+)"/gi,
    // YAML: key: value
    /^(\s*[^:\s]*(?:password|secret|key|token|auth)[^:\s]*)\s*:\s*(.+)$/gim,
  ];

  let maskedContent = content;
  patterns.forEach(pattern => {
    maskedContent = maskedContent.replace(pattern, (match, key, value) => {
      const maskedValue = '*'.repeat(Math.min(value.length, 8));
      return match.replace(value, maskedValue);
    });
  });

  return maskedContent;
};

// Validate configuration content
export const validateConfig = (
  content: string,
  filename: string
): ValidationResult[] => {
  const results: ValidationResult[] = [];
  const language = detectLanguage(filename);

  try {
    switch (language) {
      case 'json':
        JSON.parse(content);
        results.push({
          field: filename,
          status: 'valid',
          message: 'Valid JSON syntax',
        });
        break;
      case 'yaml':
        // Basic YAML validation (would use a proper YAML parser in real implementation)
        if (content.includes('\t')) {
          results.push({
            field: filename,
            status: 'warning',
            message: 'YAML files should use spaces instead of tabs',
          });
        } else {
          results.push({
            field: filename,
            status: 'valid',
            message: 'Valid YAML syntax',
          });
        }
        break;
      default:
        results.push({
          field: filename,
          status: 'valid',
          message: 'File format appears valid',
        });
    }
  } catch (error) {
    results.push({
      field: filename,
      status: 'error',
      message: `Invalid ${language.toUpperCase()} syntax: ${error}`,
    });
  }

  // Check for security issues
  if (containsSecrets(content) && !filename.includes('.env')) {
    results.push({
      field: filename,
      status: 'warning',
      message: 'File may contain sensitive information',
    });
  }

  // Check for common issues
  if (content.includes('TODO') || content.includes('FIXME')) {
    results.push({
      field: filename,
      status: 'warning',
      message: 'File contains TODO or FIXME comments',
    });
  }

  return results;
};

// Pretty print JSON
export const formatJson = (content: string): string => {
  try {
    const parsed = JSON.parse(content);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return content;
  }
};

// Get config file icon
export const getConfigIcon = (filename: string): string => {
  const language = detectLanguage(filename);
  switch (language) {
    case 'json':
      return '📄';
    case 'yaml':
      return '📋';
    case 'javascript':
    case 'typescript':
      return '⚙️';
    case 'env':
      return '🔐';
    case 'markdown':
      return '📝';
    default:
      return '📁';
  }
};

// Sort configurations
export const sortConfigs = (
  configs: ConfigFile[],
  sortBy: 'name' | 'type' | 'size' | 'modified'
): ConfigFile[] => {
  return [...configs].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'type':
        return a.type.localeCompare(b.type);
      case 'size':
        return b.size - a.size;
      case 'modified':
        return (
          new Date(b.lastModified).getTime() -
          new Date(a.lastModified).getTime()
        );
      default:
        return 0;
    }
  });
};
