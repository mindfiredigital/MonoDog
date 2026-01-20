module.exports = {
  projects: [
    {
      displayName: 'backend',
      testEnvironment: 'node',
      roots: ['<rootDir>/src', '<rootDir>'],
      testMatch: ['<rootDir>/__tests__/**/*.test.ts'],
      moduleFileExtensions: ['ts', 'js', 'json', 'node'],
      globals: {
        'ts-jest': {
          tsconfig: {
            esModuleInterop: true,
            allowSyntheticDefaultImports: true,
            isolatedModules: true,
          },
        },
      },
      transform: {
        '^.+\\.tsx?$': 'ts-jest',
      },
      collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!__tests__/**',
      ],
    },
    {
      displayName: 'dashboard',
      testEnvironment: 'jsdom',
      roots: ['<rootDir>/monodog-dashboard/src', '<rootDir>/monodog-dashboard'],
      testMatch: ['<rootDir>/monodog-dashboard/__tests__/**/*.test.ts', '<rootDir>/monodog-dashboard/__tests__/**/*.test.tsx'],
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
      extensionsToTreatAsEsm: ['.ts', '.tsx'],
      moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
      },
      globals: {
        'ts-jest': {
          useESM: true,
          tsconfig: {
            esModuleInterop: true,
            allowSyntheticDefaultImports: true,
            isolatedModules: true,
            module: 'esnext',
            jsx: 'react-jsx',
          },
        },
      },
      transform: {
        '^.+\\.tsx?$': 'ts-jest',
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
