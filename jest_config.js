module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Test file patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.js'
  ],
  
  // Coverage configuration
  collectCoverage: false, // Enable with --coverage flag
  collectCoverageFrom: [
    'tests/**/*.js',
    '!tests/setup.js',
    '!**/node_modules/**'
  ],
  
  coverageDirectory: 'coverage',
  
  coverageReporters: [
    'text',
    'text-summary',
    'lcov',
    'html',
    'json'
  ],
  
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Test timeout
  testTimeout: 30000,
  
  // Verbose output
  verbose: true,
  
  // Error handling
  errorOnDeprecated: true,
  
  // Test execution
  maxWorkers: '50%', // Use half of available cores
  
  // Module directories
  moduleDirectories: ['node_modules', '<rootDir>'],
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true,
  
  // Reporters
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: './test-results',
      outputName: 'junit.xml'
    }]
  ],
  
  // Globals
  globals: {
    'ts-jest': {
      useESM: false
    }
  },
  
  // Transform files
  transform: {
    '^.+\\.jsx?$': 'babel-jest'
  },
  
  // Module file extensions
  moduleFileExtensions: ['js', 'json', 'jsx', 'ts', 'tsx', 'node'],
  
  // Test results processor
  testResultsProcessor: 'jest-sonar-reporter',
  
  // Notify mode (for watch mode)
  notify: false,
  notifyMode: 'failure-change',
  
  // Bail after first test suite failure in CI
  bail: process.env.CI ? 1 : 0,
  
  // Cache directory
  cacheDirectory: '<rootDir>/.jest-cache',
  
  // Watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ]
};