module.exports = {
  projects: [
    {
      displayName: 'backend',
      preset: 'ts-jest',
      testEnvironment: 'node',
      roots: ['<rootDir>/src', '<rootDir>'],
      testMatch: ['<rootDir>/__tests__/**/*.test.ts', '<rootDir>/__tests__/**/*.integration.test.ts'],
      moduleFileExtensions: ['ts', 'js', 'json', 'node'],
      transform: {
        '^.+\\.tsx?$': ['ts-jest', {
          tsconfig: {
            esModuleInterop: true,
            allowSyntheticDefaultImports: true,
            isolatedModules: true,
          },
          diagnostics: {
            ignoreCodes: ['TS151002'],
          },
        }],
      },
      collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!__tests__/**',
      ],
    },
    {
      displayName: 'dashboard',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      roots: ['<rootDir>/monodog-dashboard/src', '<rootDir>/monodog-dashboard'],
      testMatch: ['<rootDir>/monodog-dashboard/__tests__/**/*.test.ts', '<rootDir>/monodog-dashboard/__tests__/**/*.test.tsx', '<rootDir>/monodog-dashboard/__tests__/**/*.integration.test.ts'],
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
      extensionsToTreatAsEsm: ['.ts', '.tsx'],
      moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
      },
      transform: {
        '^.+\\.tsx?$': ['ts-jest', {
          useESM: true,
          tsconfig: {
            esModuleInterop: true,
            allowSyntheticDefaultImports: true,
            isolatedModules: true,
            module: 'esnext',
            jsx: 'react-jsx',
          },
          diagnostics: {
            ignoreCodes: ['TS151002'],
          },
        }],
      },
      collectCoverageFrom: [
        'monodog-dashboard/src/**/*.ts',
        'monodog-dashboard/src/**/*.tsx',
        '!monodog-dashboard/src/**/*.d.ts',
        '!monodog-dashboard/__tests__/**',
      ],
    },
  ],
  coveragePathIgnorePatterns: ['/node_modules/'],
};
