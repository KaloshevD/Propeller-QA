const { GraphQLClient, gql } = require('graphql-request');

const client = new GraphQLClient(global.API_URL); 

describe('User Queries', () => {
  //
  // Single user query tests
  //
  describe('Single User Query', () => {
    it('should fetch a user by ID with all basic fields', async () => {
      const query = gql`
        query GetUser($id: ID!) {
          user(id: $id) {
            id
            name
            username
            email
            phone
            website
          }
        }
      `;
      const variables = { id: '1' };

      const response = await client.request(query, variables);

      expect(response.user).toBeDefined();
      expect(response.user.id).toBe('1');
      expect(response.user.name).toBeTruthy();
    });

    it('should return user object with null fields for non-existent user', async () => {
      const query = gql`
        query GetUser($id: ID!) {
          user(id: $id) {
            id
            name
          }
        }
      `;
      const variables = { id: '9999' }; // something not in dataset

      const response = await client.request(query, variables);

      //  The API returns { user: { id: null, name: null } }, not user: null
      expect(response.user).toBeDefined();
      expect(response.user.id).toBeNull();
      expect(response.user.name).toBeNull();
    });

    it('should handle invalid user ID format', async () => {
      const query = gql`
        query GetUser($id: ID!) {
          user(id: $id) {
            id
            name
          }
        }
      `;
      const variables = { id: 'invalid-id' };

      const response = await client.request(query, variables);

      expect(response.user).toBeDefined();
      expect(response.user.id).toBeNull();
      expect(response.user.name).toBeNull();
    });

    it('should fetch user with nested album data', async () => {
      const query = gql`
        query GetUserWithAlbums($id: ID!) {
          user(id: $id) {
            id
            name
            albums {
              data {
                id
                title
                # ✅ Fixed: replaced userId with user { id }
                user {
                  id
                }
              }
            }
          }
        }
      `;
      const variables = { id: '1' };

      const response = await client.request(query, variables);

      expect(response.user).toBeDefined();
      expect(response.user.albums).toBeDefined();
      expect(response.user.albums.data).toBeInstanceOf(Array);
    });
  });

  //
  // Multiple users query tests
  //
  describe('Multiple Users Query', () => {
    it('should fetch users with pagination options', async () => {
      const query = gql`
        query GetUsers($options: PageQueryOptions) {
          users(options: $options) {
            data {
              id
              name
              username
              email
            }
            meta {
              totalCount
            }
          }
        }
      `;
      const variables = { options: { paginate: { page: 1, limit: 5 } } };

      const response = await client.request(query, variables);

      expect(response.users).toBeDefined();
      expect(response.users.data).toBeInstanceOf(Array);
      expect(response.users.data.length).toBeLessThanOrEqual(5);
    });

    it('should fetch all users without pagination', async () => {
      const query = gql`
        query GetAllUsers {
          users {
            data {
              id
              name
              username
              email
            }
          }
        }
      `;
      // ✅ Fix: removed variables since not needed
      const response = await client.request(query);

      expect(response.users).toBeDefined();
      expect(response.users.data).toBeInstanceOf(Array);
    });

    it('should handle empty pagination results', async () => {
      const query = gql`
        query GetUsers($options: PageQueryOptions) {
          users(options: $options) {
            data {
              id
              name
            }
            meta {
              totalCount
            }
          }
        }
      `;
      // set page so high it exceeds total count
      const variables = { options: { paginate: { page: 999, limit: 10 } } };

      const response = await client.request(query, variables);

      expect(response.users).toBeDefined();
      expect(response.users.data).toBeInstanceOf(Array);
      expect(response.users.data.length).toBe(0);
    });
  });
});
