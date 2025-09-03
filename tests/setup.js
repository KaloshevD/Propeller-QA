// Global test setup and configuration
const { GraphQLClient } = require('graphql-request');

// Global configuration
global.API_URL = 'https://graphqlzero.almansi.me/api';
global.graphqlClient = new GraphQLClient(global.API_URL);

// Extend Jest timeout for API calls
jest.setTimeout(30000);

// // Custom matchers for GraphQL responses ne rabotat!!! DONT WORK!!! FIX WHEN YOU CAN
// expect.extend({
//   toHaveGraphQLData(received) {
//     const pass = received && typeof received === 'object' && received.data;
//     if (pass) {
//       return {
//         message: () => `Expected response not to have GraphQL data`,
//         pass: true,
//       };
//     } else {
//       return {
//         message: () => `Expected response to have GraphQL data but received: ${JSON.stringify(received)}`,
//         pass: false,
//       };
//     }
//   },
  
//   toHaveGraphQLErrors(received) {
//     const pass = received && received.errors && Array.isArray(received.errors);
//     if (pass) {
//       return {
//         message: () => `Expected response not to have GraphQL errors`,
//         pass: true,
//       };
//     } else {
//       return {
//         message: () => `Expected response to have GraphQL errors but received: ${JSON.stringify(received)}`,
//         pass: false,
//       };
//     }
//   }
// });

// Helper function to generate unique test data
global.generateUniqueTestData = () => {
  const timestamp = Date.now();
  const randomId = Math.floor(Math.random() * 10000);
  
  return {
    userId: randomId,
    userName: `testuser_${timestamp}`,
    userEmail: `test_${timestamp}@example.com`,
    albumTitle: `Test Album ${timestamp}`,
    albumId: randomId
  };
};

// Console log suppression for cleaner test output
const originalConsoleError = console.error;
console.error = (...args) => {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('GraphQL')) {
    // Suppress GraphQL error logs during tests unless in debug mode
    if (process.env.DEBUG_TESTS) {
      originalConsoleError.apply(console, args);
    }
  } else {
    originalConsoleError.apply(console, args);
  }
};