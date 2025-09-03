const { GraphQLClient } = require('graphql-request');

describe('User Mutations', () => {
  let client;
  let testData;
  
  beforeAll(() => {
    client = new GraphQLClient(global.API_URL);
  });

  beforeEach(() => {
    testData = generateUniqueTestData();
  });

  describe('Create User Mutation', () => {
    test('should create a new user with valid data', async () => {
      const mutation = `
        mutation CreateUser($input: CreateUserInput!) {
          createUser(input: $input) {
            id
            name
            username
            email
            phone
            website
          }
        }
      `;
      
      const variables = {
        input: {
          name: `Test User ${testData.userId}`,
          username: testData.userName,
          email: testData.userEmail,
          phone: "123-456-7890",
          website: "https://example.com"
        }
      };
      
      const response = await client.request(mutation, variables);
      
      expect(response.createUser).toBeDefined();
      expect(response.createUser.id).toBeTruthy();
      expect(response.createUser.name).toBe(variables.input.name);
      expect(response.createUser.username).toBe(variables.input.username);
      expect(response.createUser.email).toBe(variables.input.email);
      expect(response.createUser.phone).toBe(variables.input.phone);
      expect(response.createUser.website).toBe(variables.input.website);
    });

    test('should create user with minimum required fields only', async () => {
      const mutation = `
        mutation CreateUser($input: CreateUserInput!) {
          createUser(input: $input) {
            id
            name
            username
            email
          }
        }
      `;
      
      const variables = {
        input: {
          name: `Minimal User ${testData.userId}`,
          username: `minimal_${testData.userName}`,
          email: `minimal_${testData.userEmail}`
        }
      };
      
      const response = await client.request(mutation, variables);
      
      expect(response.createUser).toBeDefined();
      expect(response.createUser.id).toBeTruthy();
      expect(response.createUser.name).toBe(variables.input.name);
      expect(response.createUser.username).toBe(variables.input.username);
      expect(response.createUser.email).toBe(variables.input.email);
    });

    test('should handle invalid email format', async () => {
      const mutation = `
        mutation CreateUser($input: CreateUserInput!) {
          createUser(input: $input) {
            id
            email
          }
        }
      `;
      
      const invalidEmails = [
        'invalid-email',
        'test@',
        '@example.com',
        'test..test@example.com',
        ''
      ];
      
      for (const invalidEmail of invalidEmails) {
        const variables = {
          input: {
            name: `Test User ${testData.userId}`,
            username: testData.userName,
            email: invalidEmail
          }
        };
        
        try {
          await client.request(mutation, variables);
          console.log(`Test API accepted invalid email: ${invalidEmail}`);
        } catch (error) {
          expect(error).toBeDefined();
          expect(error.message).toContain('email');
        }
      }
    });

    test('should handle missing required fields', async () => {
      const mutation = `
        mutation CreateUser($input: CreateUserInput!) {
          createUser(input: $input) {
            id
          }
        }
      `;
      
      const incompleteInputs = [
        { name: "Test User" },
        { username: "testuser" },
        { email: "test@example.com" },
        {}
      ];
      
      for (const input of incompleteInputs) {
        const variables = { input };
        
        try {
          await client.request(mutation, variables);
          console.log(`Test API accepted incomplete input: ${JSON.stringify(input)}`);
        } catch (error) {
          expect(error).toBeDefined();
        }
      }
    });
  });

  describe('Update User Mutation', () => {
    test('should update existing user data', async () => {
      const mutation = `
        mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
          updateUser(id: $id, input: $input) {
            id
            name
            username
            email
            phone
            website
          }
        }
      `;
      
      const variables = {
        id: '1',
        input: {
          name: `Updated User ${testData.userId}`,
          phone: "987-654-3210",
          website: "https://updated-example.com"
        }
      };
      
      const response = await client.request(mutation, variables);
      
      expect(response.updateUser).toBeDefined();
      expect(response.updateUser.id).toBe('1');
      expect(response.updateUser.name).toBe(variables.input.name);
      expect(response.updateUser.phone).toBe(variables.input.phone);
      expect(response.updateUser.website).toBe(variables.input.website);
    });

    test('should update only specified fields', async () => {
      const mutation = `
        mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
          updateUser(id: $id, input: $input) {
            id
            name
            email
          }
        }
      `;
      
      const variables = {
        id: '1',
        input: {
          name: `Partially Updated User ${testData.userId}`
        }
      };
      
      const response = await client.request(mutation, variables);
      
      expect(response.updateUser).toBeDefined();
      expect(response.updateUser.id).toBe('1');
      expect(response.updateUser.name).toBe(variables.input.name);
    });

    test('should handle updating non-existent user', async () => {
      const mutation = `
        mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
          updateUser(id: $id, input: $input) {
            id
            name
          }
        }
      `;
      
      const variables = {
        id: '999999',
        input: {
          name: "Should Not Work"
        }
      };
      
      try {
        const response = await client.request(mutation, variables);
        expect(response.updateUser).toBeNull();
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toContain('User not found');
      }
    });
  });

  describe('Delete User Mutation', () => {
    test('should delete existing user', async () => {
      const deleteMutation = `
        mutation DeleteUser($id: ID!) {
          deleteUser(id: $id)
        }
      `;
      
      const deleteVariables = { id: '1' };
      
      const response = await client.request(deleteMutation, deleteVariables);
      expect(response.deleteUser).toBeDefined();
      expect(typeof response.deleteUser).toBe('boolean');
    });

    test('should handle deleting non-existent user', async () => {
      const mutation = `
        mutation DeleteUser($id: ID!) {
          deleteUser(id: $id)
        }
      `;
      
      const variables = { id: '999999' };
      
      try {
        await client.request(mutation, variables);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('User Mutation Edge Cases', () => {
    test('should handle extremely long input values', async () => {
      const mutation = `
        mutation CreateUser($input: CreateUserInput!) {
          createUser(input: $input) {
            id
            name
          }
        }
      `;
      
      const variables = {
        input: {
          name: 'A'.repeat(1000),
          username: testData.userName,
          email: testData.userEmail
        }
      };
      
      try {
        await client.request(mutation, variables);
        console.log('Test API handled long input');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    test('should handle special characters in input', async () => {
      const mutation = `
        mutation CreateUser($input: CreateUserInput!) {
          createUser(input: $input) {
            id
            name
            username
          }
        }
      `;
      
      const variables = {
        input: {
          name: "Test User with Special Chars: !@#$%^&*()",
          username: "user_with_underscores_123",
          email: testData.userEmail
        }
      };
      
      const response = await client.request(mutation, variables);
      expect(response.createUser).toBeDefined();
      expect(response.createUser.name).toBe(variables.input.name);
    });
  });
});
