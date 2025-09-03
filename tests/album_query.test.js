const { GraphQLClient } = require('graphql-request');

describe('Album Queries', () => {
  let client;
  
  beforeAll(() => {
    client = new GraphQLClient(global.API_URL);
  });

  describe('Single Album Query', () => {
    test('should fetch an album by ID with all basic fields', async () => {
      const query = `
        query GetAlbum($id: ID!) {
          album(id: $id) {
            id
            title
            user {
              id
              name
              username
            }
          }
        }
      `;
      
      const variables = { id: '1' };
      const { album } = await client.request(query, variables);
      
      expect(album).toBeDefined();
      expect(album.id).toBe('1');
      expect(album.title).toBeTruthy();
      expect(album.user).toBeDefined();
      expect(album.user.id).toBeTruthy();
    });

    test('should return null for non-existent album', async () => {
      const query = `
        query GetAlbum($id: ID!) {
          album(id: $id) {
            id
            title
          }
        }
      `;
      
      const variables = { id: '999999' };
      const { album } = await client.request(query, variables);
      
      expect(album).toBeNull();
    });

    test('should handle invalid album ID format', async () => {
      const query = `
        query GetAlbum($id: ID!) {
          album(id: $id) {
            id
            title
          }
        }
      `;
      
      const invalidIds = ['invalid', '-1', '0', ''];
      
      for (const invalidId of invalidIds) {
        const variables = { id: invalidId };
        const { album } = await client.request(query, variables);
        expect(album).toBeNull();
      }
    });

    test('should fetch album with nested user details', async () => {
      const query = `
        query GetAlbumWithUser($id: ID!) {
          album(id: $id) {
            id
            title
            user {
              id
              name
              username
              email
              phone
              website
            }
          }
        }
      `;
      
      const variables = { id: '1' };
      const { album } = await client.request(query, variables);
      
      expect(album).toBeDefined();
      expect(album.user).toBeDefined();
      expect(album.user.name).toBeTruthy();
      expect(album.user.username).toBeTruthy();
      expect(album.user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });
  });

  describe('Multiple Albums Query', () => {
    test('should fetch albums with pagination options', async () => {
      const query = `
        query GetAlbums($options: PageQueryOptions) {
          albums(options: $options) {
            data {
              id
              title
              user {
                id
              }
            }
            meta {
              totalCount
            }
          }
        }
      `;
      
      const variables = {
        options: {
          paginate: {
            page: 1,
            limit: 5
          }
        }
      };
      
      const { albums } = await client.request(query, variables);
      
      expect(albums).toBeDefined();
      expect(albums.data).toBeInstanceOf(Array);
      expect(albums.data.length).toBeLessThanOrEqual(5);
      expect(albums.meta).toBeDefined();
      expect(albums.meta.totalCount).toBeGreaterThan(0);
    });

    test('should fetch all albums without pagination', async () => {
      const query = `
        query GetAllAlbums {
          albums {
            data {
              id
              title
              user {
                id
              }
            }
          }
        }
      `;
      
      const { albums } = await client.request(query);
      
      expect(albums).toBeDefined();
      expect(albums.data).toBeInstanceOf(Array);
      expect(albums.data.length).toBeGreaterThan(0);
      
      albums.data.forEach(album => {
        expect(album.id).toBeTruthy();
        expect(album.title).toBeTruthy();
        expect(album.user).toBeDefined();
      });
    });

    test('should fetch albums with user information', async () => {
      const query = `
        query GetAlbumsWithUsers($options: PageQueryOptions) {
          albums(options: $options) {
            data {
              id
              title
              user {
                id
                name
                username
              }
            }
          }
        }
      `;
      
      const variables = {
        options: {
          paginate: {
            page: 1,
            limit: 3
          }
        }
      };
      
      const { albums } = await client.request(query, variables);
      
      expect(albums).toBeDefined();
      expect(albums.data).toBeInstanceOf(Array);
      
      albums.data.forEach(album => {
        expect(album.user).toBeDefined();
        expect(album.user.id).toBeTruthy();
        expect(album.user.name).toBeTruthy();
        expect(album.user.username).toBeTruthy();
      });
    });

    test('should handle empty pagination results', async () => {
      const query = `
        query GetAlbums($options: PageQueryOptions) {
          albums(options: $options) {
            data {
              id
              title
            }
            meta {
              totalCount
            }
          }
        }
      `;
      
      const variables = {
        options: {
          paginate: {
            page: 999,
            limit: 10
          }
        }
      };
      
      const { albums } = await client.request(query, variables);
      
      expect(albums).toBeDefined();
      expect(albums.data).toBeInstanceOf(Array);
      expect(albums.data.length).toBe(0);
    });
  });

  describe('Albums by User Query', () => {
    test('should fetch albums for specific user', async () => {
      const query = `
        query GetUserAlbums($userId: ID!) {
          user(id: $userId) {
            id
            name
            albums {
              data {
                id
                title
              }
            }
          }
        }
      `;
      
      const variables = { userId: '1' };
      const { user } = await client.request(query, variables);
      
      expect(user).toBeDefined();
      expect(user.albums).toBeDefined();
      expect(user.albums.data).toBeInstanceOf(Array);
    });

    test('should fetch albums for user with pagination', async () => {
      const query = `
        query GetUserAlbumsWithPagination($userId: ID!, $options: PageQueryOptions) {
          user(id: $userId) {
            id
            albums(options: $options) {
              data {
                id
                title
              }
              meta {
                totalCount
              }
            }
          }
        }
      `;
      
      const variables = {
        userId: '1',
        options: {
          paginate: {
            page: 1,
            limit: 2
          }
        }
      };
      
      const { user } = await client.request(query, variables);
      
      expect(user).toBeDefined();
      expect(user.albums).toBeDefined();
      expect(user.albums.data).toBeInstanceOf(Array);
      expect(user.albums.data.length).toBeLessThanOrEqual(2);
      expect(user.albums.meta).toBeDefined();
    });

    test('should return albums array for user', async () => {
      const query = `
        query GetUserAlbums($userId: ID!) {
          user(id: $userId) {
            id
            albums {
              data {
                id
                title
              }
            }
          }
        }
      `;
      
      const variables = { userId: '10' };
      const { user } = await client.request(query, variables);
      
      if (user) {
        expect(user.albums).toBeDefined();
        expect(user.albums.data).toBeInstanceOf(Array);
      }
    });
  });

  describe('Album Query Edge Cases', () => {
    test('should handle missing required variables', async () => {
      const query = `
        query GetAlbum($id: ID!) {
          album(id: $id) {
            id
            title
          }
        }
      `;
      
      try {
        await client.request(query, {}); 
        fail('Expected GraphQL error for missing variable');
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toContain('Variable "$id" of required type "ID!" was not provided');
      }
    });

    test('should validate field selection', async () => {
      const query = `
        query GetAlbum($id: ID!) {
          album(id: $id) {
            id
            title
            nonExistentField
          }
        }
      `;
      
      try {
        const variables = { id: '1' };
        await client.request(query, variables);
        fail('Expected GraphQL error for invalid field');
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toContain('Cannot query field "nonExistentField"');
      }
    });

    test('should handle complex nested queries', async () => {
      const query = `
        query GetComplexAlbumData($id: ID!) {
          album(id: $id) {
            id
            title
            user {
              id
              name
              username
              albums {
                data {
                  id
                  title
                }
              }
            }
          }
        }
      `;
      
      const variables = { id: '1' };
      const { album } = await client.request(query, variables);
      
      expect(album).toBeDefined();
      expect(album.user).toBeDefined();
      expect(album.user.albums).toBeDefined();
      expect(album.user.albums.data).toBeInstanceOf(Array);
    });

    test('should handle multiple album queries in single request', async () => {
      const query = `
        query GetMultipleAlbums {
          album1: album(id: "1") {
            id
            title
          }
          album2: album(id: "2") {
            id
            title
          }
          album3: album(id: "999999") {
            id
            title
          }
        }
      `;
      
      const { album1, album2, album3 } = await client.request(query);
      
      expect(album1).toBeDefined();
      expect(album2).toBeDefined();
      expect(album3).toBeNull();
    });
  });
});
