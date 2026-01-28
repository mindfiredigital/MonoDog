import type {
  ConfigFile,
  ConfigFilters,
  ValidationResult,
} from '../types/config.types';
import yaml from 'js-yaml';
import { FolderIcon } from '../../../../icons/heroicons';
import { Cog6ToothIcon } from '../../../../icons/heroicons';
import { DocumentIcon } from '../../../../icons/heroicons';

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

// Enhanced language detection
export const detectLanguage = (filename: string): string => {
  const extension = filename.split('.').pop()?.toLowerCase();

  const languageMap: { [key: string]: string } = {
    json: 'json',
    yaml: 'yaml',
    yml: 'yaml',
    js: 'javascript',
    mjs: 'javascript',
    cjs: 'javascript',
    ts: 'typescript',
    mts: 'typescript',
    cts: 'typescript',
    env: 'env',
    config: 'text',
    rc: 'text',
    lock: 'text',
    md: 'markdown',
    txt: 'text',
  };

  // Special case for known config files
  if (filename === 'package.json') return 'json';
  if (filename === 'docker-compose.yml' || filename === 'docker-compose.yaml')
    return 'yaml';
  if (filename === '.eslintrc.js' || filename === '.prettierrc.js')
    return 'javascript';
  if (filename === 'tsconfig.json') return 'json';

  return languageMap[extension || ''] || 'text';
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
// export const validateConfig = (
//   content: string,
//   filename: string
// ): ValidationResult[] => {
//   const results: ValidationResult[] = [];
//   const language = detectLanguage(filename);

//   try {
//     switch (language) {
//       case 'json':
//         JSON.parse(content);
//         results.push({
//           field: filename,
//           status: 'valid',
//           message: 'Valid JSON syntax',
//         });
//         break;
//       case 'yaml':
//         // Basic YAML validation (would use a proper YAML parser in real implementation)
//         if (content.includes('\t')) {
//           results.push({
//             field: filename,
//             status: 'warning',
//             message: 'YAML files should use spaces instead of tabs',
//           });
//         } else {
//           results.push({
//             field: filename,
//             status: 'valid',
//             message: 'Valid YAML syntax',
//           });
//         }
//         break;
//       default:
//         results.push({
//           field: filename,
//           status: 'valid',
//           message: 'File format appears valid',
//         });
//     }
//   } catch (error) {
//     results.push({
//       field: filename,
//       status: 'error',
//       message: `Invalid ${language.toUpperCase()} syntax: ${error}`,
//     });
//   }

//   // Check for security issues
//   if (containsSecrets(content) && !filename.includes('.env')) {
//     results.push({
//       field: filename,
//       status: 'warning',
//       message: 'File may contain sensitive information',
//     });
//   }

//   // Check for common issues
//   if (content.includes('TODO') || content.includes('FIXME')) {
//     results.push({
//       field: filename,
//       status: 'warning',
//       message: 'File contains TODO or FIXME comments',
//     });
//   }

//   return results;
// };

export const validateConfig = (
  content: string,
  filename: string
): ValidationResult[] => {
  const results: ValidationResult[] = [];
  const language = detectLanguage(filename);

  try {
    switch (language) {
      case 'json':
        validateJSON(content, filename, results);
        break;
      case 'yaml':
        validateYAML(content, filename, results);
        break;
      case 'javascript':
      case 'typescript':
        validateJavaScript(content, filename, results);
        break;
      case 'env':
        validateEnv(content, filename, results);
        break;
      default:
        validateGeneric(content, filename, results);
    }
  } catch (error) {
    results.push({
      field: filename,
      status: 'error',
      message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }

  // Common validations for all file types
  validateCommonIssues(content, filename, results);

  return results;
};

// JSON Validation
const validateJSON = (
  content: string,
  filename: string,
  results: ValidationResult[]
) => {
  try {
    const parsed = JSON.parse(content);

    // Basic syntax validation
    results.push({
      field: filename,
      status: 'valid',
      message: 'Valid JSON syntax',
    });

    // Package.json specific validations
    if (filename === 'package.json') {
      validatePackageJSON(parsed, results);
    }

    // Additional JSON structure validations
    if (typeof parsed === 'object') {
      validateJSONStructure(parsed, filename, results);
    }
  } catch (error) {
    results.push({
      field: filename,
      status: 'error',
      message: `Invalid JSON: ${error instanceof Error ? error.message : 'Syntax error'}`,
    });
  }
};

// Package.json specific validations
const validatePackageJSON = (pkg: any, results: ValidationResult[]) => {
  const requiredFields = ['name', 'version'];

  requiredFields.forEach(field => {
    if (!pkg[field]) {
      results.push({
        field: field,
        status: 'error',
        message: `Required field '${field}' is missing`,
      });
    }
  });

  // Validate name format
  if (pkg.name && typeof pkg.name === 'string') {
    if (
      !/^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(pkg.name)
    ) {
      results.push({
        field: 'name',
        status: 'warning',
        message: 'Package name may not follow npm naming conventions',
      });
    }
  }

  // Validate version format
  if (pkg.version && typeof pkg.version === 'string') {
    if (!/^\d+\.\d+\.\d+(-[a-z0-9.-]+)?$/.test(pkg.version)) {
      results.push({
        field: 'version',
        status: 'warning',
        message: 'Version format may not follow semver conventions',
      });
    }
  }

  // Validate scripts
  if (pkg.scripts && typeof pkg.scripts === 'object') {
    Object.entries(pkg.scripts).forEach(([scriptName, command]) => {
      if (typeof command !== 'string') {
        results.push({
          field: `scripts.${scriptName}`,
          status: 'error',
          message: `Script '${scriptName}' must be a string`,
        });
      }
    });
  }

  // Validate dependencies
  ['dependencies', 'devDependencies', 'peerDependencies'].forEach(depType => {
    if (pkg[depType] && typeof pkg[depType] === 'object') {
      Object.entries(pkg[depType]).forEach(([depName, version]) => {
        if (typeof version !== 'string') {
          results.push({
            field: `${depType}.${depName}`,
            status: 'error',
            message: `Dependency version for '${depName}' must be a string`,
          });
        }
      });
    }
  });
};

// YAML Validation
const validateYAML = (
  content: string,
  filename: string,
  results: ValidationResult[]
) => {
  try {
    const parsed = yaml.load(content);

    results.push({
      field: filename,
      status: 'valid',
      message: 'Valid YAML syntax',
    });

    // Check for tabs (YAML should use spaces)
    if (content.includes('\t')) {
      results.push({
        field: filename,
        status: 'warning',
        message: 'YAML files should use spaces instead of tabs',
      });
    }

    // Check for common YAML issues
    if (content.match(/^[ ]*\t+/m)) {
      results.push({
        field: filename,
        status: 'error',
        message: 'Mixed tabs and spaces in indentation',
      });
    }

    // Validate specific YAML file types
    if (
      filename.includes('docker-compose') ||
      filename === 'compose.yaml' ||
      filename === 'compose.yml'
    ) {
      validateDockerCompose(parsed, results);
    }
  } catch (error) {
    results.push({
      field: filename,
      status: 'error',
      message: `Invalid YAML: ${error instanceof Error ? error.message : 'Syntax error'}`,
    });
  }
};

// Docker Compose specific validation
const validateDockerCompose = (compose: any, results: ValidationResult[]) => {
  if (compose && typeof compose === 'object') {
    if (!compose.version && !compose.services) {
      results.push({
        field: 'structure',
        status: 'warning',
        message:
          'Docker Compose file may be missing version or services section',
      });
    }

    if (compose.services && typeof compose.services === 'object') {
      Object.keys(compose.services).forEach(serviceName => {
        const service = compose.services[serviceName];
        if (service && typeof service === 'object') {
          if (!service.image && !service.build) {
            results.push({
              field: `services.${serviceName}`,
              status: 'warning',
              message: `Service '${serviceName}' should have either 'image' or 'build' defined`,
            });
          }
        }
      });
    }
  }
};

// JavaScript/TypeScript Validation (basic syntax)
const validateJavaScript = (
  content: string,
  filename: string,
  results: ValidationResult[]
) => {
  try {
    // Basic syntax check - in a real implementation, you might use a proper parser
    if (content.trim() && !content.match(/console\.log/)) {
      results.push({
        field: filename,
        status: 'valid',
        message: 'JavaScript/TypeScript syntax appears valid',
      });
    }

    // Check for common issues
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      // Check for == instead of ===
      if (line.includes(' == ') && !line.includes(' === ')) {
        results.push({
          field: `Line ${index + 1}`,
          status: 'warning',
          message: 'Consider using === instead of == for strict equality',
        });
      }

      // Check for console.log in production configs
      if (line.includes('console.log') && filename.includes('config')) {
        results.push({
          field: `Line ${index + 1}`,
          status: 'warning',
          message: 'console.log found in configuration file',
        });
      }
    });
  } catch (error) {
    results.push({
      field: filename,
      status: 'error',
      message: `JavaScript validation error: ${error instanceof Error ? error.message : 'Syntax error'}`,
    });
  }
};

// Environment file validation
const validateEnv = (
  content: string,
  filename: string,
  results: ValidationResult[]
) => {
  const lines = content
    .split('\n')
    .filter(line => line.trim() && !line.trim().startsWith('#'));

  let isValid = true;

  lines.forEach((line, index) => {
    // Basic env format validation: KEY=VALUE
    if (!line.includes('=')) {
      results.push({
        field: `Line ${index + 1}`,
        status: 'error',
        message: 'Invalid environment variable format (missing =)',
      });
      isValid = false;
    } else {
      const [key] = line.split('=');
      if (!key || !key.trim()) {
        results.push({
          field: `Line ${index + 1}`,
          status: 'error',
          message: 'Environment variable key is empty',
        });
        isValid = false;
      }
    }
  });

  if (isValid && lines.length > 0) {
    results.push({
      field: filename,
      status: 'valid',
      message: 'Valid environment file format',
    });
  }
};

// Generic file validation
const validateGeneric = (
  content: string,
  filename: string,
  results: ValidationResult[]
) => {
  // Basic file content checks
  if (content.trim().length === 0) {
    results.push({
      field: filename,
      status: 'warning',
      message: 'File appears to be empty',
    });
  } else {
    results.push({
      field: filename,
      status: 'valid',
      message: 'File content appears valid',
    });
  }
};

// Common issues across all file types
const validateCommonIssues = (
  content: string,
  filename: string,
  results: ValidationResult[]
) => {
  // Security checks
  if (containsSecrets(content) && !filename.includes('.env')) {
    results.push({
      field: filename,
      status: 'warning',
      message: 'File may contain sensitive information (secrets detected)',
    });
  }

  // TODO/FIXME comments
  const todoMatches = content.match(/(TODO|FIXME|HACK|XXX):?\s*(.*)/gi);
  if (todoMatches) {
    results.push({
      field: filename,
      status: 'warning',
      message: `File contains ${todoMatches.length} TODO/FIXME comment(s)`,
    });
  }

  // Long lines
  // const lines = content.split('\n');
  // const longLines = lines.filter(line => line.length > 120);
  // if (longLines.length > 0) {
  //   results.push({
  //     field: filename,
  //     status: 'warning',
  //     message: `File contains ${longLines.length} long line(s) (over 120 characters)`,
  //   });
  // }

  // Trailing whitespace
  // const trailingWhitespaceLines = lines.filter(
  //   (line, index) => line.trim() !== line && line.trim().length > 0
  // );
  // if (trailingWhitespaceLines.length > 0) {
  //   results.push({
  //     field: filename,
  //     status: 'warning',
  //     message: `File contains ${trailingWhitespaceLines.length} line(s) with trailing whitespace`,
  //   });
  // }
};

// JSON structure validation
const validateJSONStructure = (
  obj: any,
  filename: string,
  results: ValidationResult[]
) => {
  // Check for circular references (basic check)
  try {
    JSON.stringify(obj);
  } catch (error) {
    if (error instanceof Error && error.message.includes('circular')) {
      results.push({
        field: filename,
        status: 'error',
        message: 'JSON contains circular references',
      });
    }
  }

  // Check for duplicate keys (basic check)
  const jsonString = JSON.stringify(obj);
  const keyCounts: { [key: string]: number } = {};

  const countKeys = (obj: any, path: string = '') => {
    if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(key => {
        const fullPath = path ? `${path}.${key}` : key;
        keyCounts[fullPath] = (keyCounts[fullPath] || 0) + 1;
        countKeys(obj[key], fullPath);
      });
    }
  };

  countKeys(obj);

  Object.entries(keyCounts).forEach(([key, count]) => {
    if (count > 1) {
      results.push({
        field: key,
        status: 'warning',
        message: `Key appears multiple times in structure`,
      });
    }
  });
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
      return <DocumentIcon className="w-6 h-6 text-primary-600" />;
    case 'yaml':
      return <DocumentIcon className="w-6 h-6 text-primary-600" />;
    case 'javascript':
    case 'typescript':
      return <Cog6ToothIcon className="w-6 h-6 text-primary-600" />;
    case 'env':
      return '🔐';
    case 'markdown':
      return '📝';
    default:
      return <FolderIcon className="w-6 h-6 text-primary-600" />;
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
