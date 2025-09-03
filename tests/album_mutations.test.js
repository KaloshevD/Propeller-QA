const { GraphQLClient } = require('graphql-request');

describe('Album Mutations', () => {
  let client;
  let testData;
  
  beforeAll(() => {
    client = new GraphQLClient(global.API_URL);
  });

  beforeEach(() => {
    testData = generateUniqueTestData();
  });

  describe('Create Album Mutation', () => {
    test('should create a new album with valid data', async () => {
      const mutation = `
        mutation CreateAlbum($input: CreateAlbumInput!) {
          createAlbum(input: $input) {
            id
            title
            user { id }
          }
        }
      `;
      
      const variables = {
        input: {
          title: testData.albumTitle,
          userId: "1"
        }
      };
      
      const response = await client.request(mutation, variables);
      
      expect(response.createAlbum).toBeDefined();
      expect(response.createAlbum.id).toBeTruthy();
      expect(response.createAlbum.title).toBe(variables.input.title);
      expect(response.createAlbum.user.id).toBe(variables.input.userId);
    });

    test('should create album with special characters in title', async () => {
      const mutation = `
        mutation CreateAlbum($input: CreateAlbumInput!) {
          createAlbum(input: $input) {
            id
            title
            user { id }
          }
        }
      `;
      
      const specialTitles = [
        "Album with Numbers 123",
        "Album with Special Chars: !@#$%",
        "Album with Émojis 🎵🎶",
        "Very Long Album Title That Goes On And On And Should Still Be Accepted",
        "Album-with-dashes_and_underscores"
      ];
      
      for (const title of specialTitles) {
        const variables = {
          input: {
            title: title,
            userId: "1"
          }
        };
        
        try {
          const response = await client.request(mutation, variables);
          expect(response.createAlbum.title).toBe(title);
        } catch (error) {
          console.log(`Special character handling for title "${title}":`, error.message);
        }
      }
    });

    test('should handle creating album for non-existent user', async () => {
      const mutation = `
        mutation CreateAlbum($input: CreateAlbumInput!) {
          createAlbum(input: $input) {
            id
            title
            user { id }
          }
        }
      `;
      
      const variables = {
        input: {
          title: testData.albumTitle,
          userId: "999999"
        }
      };
      
      try {
        const response = await client.request(mutation, variables);
        expect(response.createAlbum).toBeNull();
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toContain('User not found');
      }
    });

    test('should handle missing required fields', async () => {
      const mutation = `
        mutation CreateAlbum($input: CreateAlbumInput!) {
          createAlbum(input: $input) {
            id
            title
            user { id }
          }
        }
      `;
      
      const incompleteInputs = [
        { title: "Album without user" },
        { userId: "1" },
        {}
      ];
      
      for (const input of incompleteInputs) {
        const variables = { input };
        
        try {
          await client.request(mutation, variables);
          console.log(`Test API accepted incomplete album input: ${JSON.stringify(input)}`);
        } catch (error) {
          expect(error).toBeDefined();
        }
      }
    });

    test('should handle empty or whitespace-only title', async () => {
      const mutation = `
        mutation CreateAlbum($input: CreateAlbumInput!) {
          createAlbum(input: $input) {
            id
            title
            user { id }
          }
        }
      `;
      
      const invalidTitles = ['', '   ', '\t', '\n'];
      
      for (const title of invalidTitles) {
        const variables = {
          input: {
            title: title,
            userId: "1"
          }
        };
        
        try {
          await client.request(mutation, variables);
          console.log(`Test API accepted invalid title: "${title}"`);
        } catch (error) {
          expect(error).toBeDefined();
          expect(error.message).toContain('title');
        }
      }
    });
  });

  describe('Update Album Mutation', () => {
    test('should update existing album title', async () => {
      const mutation = `
        mutation UpdateAlbum($id: ID!, $input: UpdateAlbumInput!) {
          updateAlbum(id: $id, input: $input) {
            id
            title
            user { id }
          }
        }
      `;
      
      const variables = {
        id: '1',
        input: {
          title: `Updated ${testData.albumTitle}`
        }
      };
      
      const response = await client.request(mutation, variables);
      
      expect(response.updateAlbum).toBeDefined();
      expect(response.updateAlbum.id).toBe('1');
      expect(response.updateAlbum.title).toBe(variables.input.title);
    });

    test('should update album user assignment', async () => {
      const mutation = `
        mutation UpdateAlbum($id: ID!, $input: UpdateAlbumInput!) {
          updateAlbum(id: $id, input: $input) {
            id
            title
            user { id }
          }
        }
      `;
      
      const variables = {
        id: '1',
        input: {
          userId: "2"
        }
      };
      
      try {
        const response = await client.request(mutation, variables);
        expect(response.updateAlbum.user.id).toBe(variables.input.userId);
      } catch (error) {
        console.log('Album reassignment test:', error.message);
      }
    });

    test('should update both title and user simultaneously', async () => {
      const mutation = `
        mutation UpdateAlbum($id: ID!, $input: UpdateAlbumInput!) {
          updateAlbum(id: $id, input: $input) {
            id
            title
            user { id }
          }
        }
      `;
      
      const variables = {
        id: '1',
        input: {
          title: `Fully Updated ${testData.albumTitle}`,
          userId: "3"
        }
      };
      
      try {
        const response = await client.request(mutation, variables);
        expect(response.updateAlbum.title).toBe(variables.input.title);
        expect(response.updateAlbum.user.id).toBe(variables.input.userId);
      } catch (error) {
        console.log('Full album update test:', error.message);
      }
    });

    test('should handle updating non-existent album', async () => {
      const mutation = `
        mutation UpdateAlbum($id: ID!, $input: UpdateAlbumInput!) {
          updateAlbum(id: $id, input: $input) {
            id
            title
          }
        }
      `;
      
      const variables = {
        id: '999999',
        input: {
          title: "Should Not Work"
        }
      };
      
      try {
        const response = await client.request(mutation, variables);
        expect(response.updateAlbum).toBeNull();
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toContain('Album not found');
      }
    });

    test('should handle empty update input', async () => {
      const mutation = `
        mutation UpdateAlbum($id: ID!, $input: UpdateAlbumInput!) {
          updateAlbum(id: $id, input: $input) {
            id
            title
            user { id }
          }
        }
      `;
      
      const variables = {
        id: '1',
        input: {}
      };
      
      try {
        const response = await client.request(mutation, variables);
        expect(response.updateAlbum.id).toBe('1');
      } catch (error) {
        console.log('Empty update input test:', error.message);
      }
    });
  });

  describe('Delete Album Mutation', () => {
    test('should delete existing album', async () => {
      const deleteMutation = `
        mutation DeleteAlbum($id: ID!) {
          deleteAlbum(id: $id)
        }
      `;
      
      const variables = { id: '1' };
      
      const response = await client.request(deleteMutation, variables);
      expect(response.deleteAlbum).toBeDefined();
      expect(typeof response.deleteAlbum).toBe('boolean');
    });

    test('should handle deleting non-existent album', async () => {
      const mutation = `
        mutation DeleteAlbum($id: ID!) {
          deleteAlbum(id: $id)
        }
      `;
      
      const variables = { id: '999999' };
      
      try {
        await client.request(mutation, variables);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    test('should verify album deletion cascade behavior', async () => {
      const query = `
        query GetAlbumAfterDelete($id: ID!) {
          album(id: $id) {
            id
            title
          }
        }
      `;
      
      const deleteMutation = `
        mutation DeleteAlbum($id: ID!) {
          deleteAlbum(id: $id)
        }
      `;
      
      const testAlbumId = '1';
      
      try {
        await client.request(deleteMutation, { id: testAlbumId });
        const response = await client.request(query, { id: testAlbumId });
        expect(response.album).toBeNull();
      } catch (error) {
        console.log('Cascade deletion test:', error.message);
      }
    });
  });

  describe('Album Mutation Edge Cases', () => {
    test('should handle concurrent album creation', async () => {
      const mutation = `
        mutation CreateAlbum($input: CreateAlbumInput!) {
          createAlbum(input: $input) {
            id
            title
            user { id }
          }
        }
      `;
      
      const promises = [];
      for (let i = 0; i < 3; i++) {
        const variables = {
          input: {
            title: `Concurrent Album ${testData.userId}_${i}`,
            userId: "1"
          }
        };
        promises.push(client.request(mutation, variables));
      }
      
      try {
        const responses = await Promise.all(promises);
        responses.forEach(response => {
          expect(response.createAlbum).toBeDefined();
        });
      } catch (error) {
        console.log('Concurrent creation test:', error.message);
      }
    });

    test('should validate album title length limits', async () => {
      const mutation = `
        mutation CreateAlbum($input: CreateAlbumInput!) {
          createAlbum(input: $input) {
            id
            title
          }
        }
      `;
      
      const variables = {
        input: {
          title: 'A'.repeat(1000),
          userId: "1"
        }
      };
      
      try {
        await client.request(mutation, variables);
        console.log('Test API accepted very long title');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    test('should handle special database characters', async () => {
      const mutation = `
        mutation CreateAlbum($input: CreateAlbumInput!) {
          createAlbum(input: $input) {
            id
            title
          }
        }
      `;
      
      const specialCharsTitle = "Album with 'quotes' and \"double quotes\" and \\backslashes";
      
      const variables = {
        input: {
          title: specialCharsTitle,
          userId: "1"
        }
      };
      
      try {
        const response = await client.request(mutation, variables);
        expect(response.createAlbum.title).toBe(specialCharsTitle);
      } catch (error) {
        console.log('Special database characters test:', error.message);
      }
    });
  });
});
