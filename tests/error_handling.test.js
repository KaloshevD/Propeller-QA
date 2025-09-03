const { GraphQLClient } = require('graphql-request');

let client;

beforeAll(() => {
  client = new GraphQLClient(global.API_URL);
});

describe('Error Handling', () => {
  describe('Variable Validation Errors', () => {
    test('should handle missing required variables', async () => {
      const query = `
        query GetUser($id: ID!, $required: String!) {
          user(id: $id) {
            id
            name
          }
        }
      `;
      try {
        await client.request(query, { id: "1" });
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toMatch(/Variable "\$required".*(not provided|never used)/);
      }
    });
  });

  describe('Mutation Error Scenarios', () => {
    test('should handle invalid input structure for mutations', async () => {
      const mutation = `
        mutation CreateUser($input: CreateUserInput!) {
          createUser(input: $input) {
            id
            name
          }
        }
      `;
      try {
        await client.request(mutation, { input: { name: "Test User", invalidField: "should cause error" } });
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toMatch(/Field "invalidField"|Field "username"|Field "email"/);
      }
    });
  });

  describe('Authentication and Authorization Errors', () => {
    test('should handle invalid authentication headers', async () => {
      const badClient = new GraphQLClient(global.API_URL, {
        headers: { Authorization: "Bearer invalid_token" }
      });

      const query = `
        query {
          user(id: "1") {
            id
            email
          }
        }
      `;
      try {
        await badClient.request(query);
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message.toLowerCase()).toContain('authentication');
      }
    });
  });

  describe('Error Recovery and Resilience', () => {
    test('should handle connection recovery after errors', async () => {
      const validQuery = `
        query {
          user(id: "1") {
            id
            name
          }
        }
      `;
      let validResponse = await client.request(validQuery);
      expect(validResponse.user).toBeDefined();
      expect(validResponse.user.id).toBe("1");

      const invalidQuery = `
        query {
          invalidField
        }
      `;
      try {
        await client.request(invalidQuery);
      } catch (error) {
        expect(error).toBeDefined();
      }

      // Recovery with valid request
      validResponse = await client.request(validQuery);
      expect(validResponse.user).toBeDefined();
      expect(validResponse.user.name).toBeTruthy();
    });
  });

  describe('Large Query Response Handling', () => {
    test('should handle user with albums and nested fields', async () => {
      const query = `
        query {
          users {
            data {
              id
              name
              username
              email
              phone
              website
              albums {
                data {
                  id
                  title
                  user { id }
                }
              }
            }
          }
        }
      `;
      const response = await client.request(query);
      expect(response.users).toBeDefined();
      expect(Array.isArray(response.users.data)).toBe(true);
    });
  });

  describe('Unicode Handling', () => {
    test('should create user with unicode characters', async () => {
      const mutation = `
        mutation CreateUser($input: CreateUserInput!) {
          createUser(input: $input) {
            id
            name
          }
        }
      `;
      const variables = { input: { name: "用户测试 🌟 Ñiño José François Müller", username: "unicodeUser", email: "unicode@example.com" } };
      const response = await client.request(mutation, variables);
      expect(response.createUser).toBeDefined();
      expect(response.createUser.name).toContain("用户测试");
    });
  });
});
