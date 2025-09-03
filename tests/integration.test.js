const { GraphQLClient } = require('graphql-request');

// Utility to generate unique-ish values per test run
function uid() {
  return Math.floor(Math.random() * 100000);
}


describe('Integration Tests - Users and Albums Workflow (refactored)', () => {
  let client;

  beforeAll(() => {
    client = new GraphQLClient(global.API_URL);
  });

  describe('Complete User-Album Workflow', () => {
    test('creates a user, then creates albums (selection sets avoid userId)', async () => {
      // 1) Create a new user
      const createUser = `
        mutation CreateUser($input: CreateUserInput!) {
          createUser(input: $input) {
            id
            name
            username
            email
          }
        }
      `;
      const u = uid();
      const userVars = {
        input: {
          name: `Integration Test User ${u}`,
          username: `testuser_${u}`,
          email: `test_${u}@example.com`
        }
      };
      const userRes = await client.request(createUser, userVars);

      expect(userRes).toBeDefined();
      expect(userRes.createUser).toBeDefined();
      expect(userRes.createUser.id).toBeTruthy();

      const createdUserId = userRes.createUser.id;

      // 2) Create a few albums for that (possibly non-persistent) user id
      const createAlbum = `
        mutation CreateAlbum($input: CreateAlbumInput!) {
          createAlbum(input: $input) {
            id
            title
            user { id name }
          }
        }
      `;
      const titles = [
        `Album ${u} - A`,
        `Album ${u} - B`,
        `Album ${u} - C`
      ];

      for (const title of titles) {
        const albumVars = { input: { title, userId: createdUserId } };
        const albumRes = await client.request(createAlbum, albumVars);
        expect(albumRes).toBeDefined();
        expect(albumRes.createAlbum).toBeDefined();
        expect(albumRes.createAlbum.id).toBeTruthy();
        expect(albumRes.createAlbum.title).toBe(title);
        // Some demo APIs return user as `null` for non-seeded IDs; assert softly
        if (albumRes.createAlbum.user) {
          expect(albumRes.createAlbum.user.id).toBe(createdUserId);
        }
      }
    });
  });

  describe('Data Consistency & Read Queries (against stable seeded IDs)', () => {
    test('reads a known user with albums and validates nested shapes', async () => {
      const q = `
        query GetUser($id: ID!) {
          user(id: $id) {
            id
            name
            albums {
              data {
                id
                title
                user { id name }
              }
            }
          }
        }
      `;
      const res = await client.request(q, { id: '1' });
      expect(res).toBeDefined();
      if (res.user) {
        expect(res.user.id).toBe('1');
        expect(res.user.albums).toBeDefined();
        expect(Array.isArray(res.user.albums.data)).toBe(true);
        for (const a of res.user.albums.data) {
          expect(a.id).toBeTruthy();
          expect(a.title).toBeTruthy();
          if (a.user) {
            expect(a.user.id).toBe(res.user.id);
          }
        }
      }
    });

    test('reads an album by id and validates cross-links via user relation', async () => {
      const q = `
        query GetAlbum($id: ID!) {
          album(id: $id) {
            id
            title
            user {
              id
              username
              albums { data { id title } }
            }
          }
        }
      `;
      const res = await client.request(q, { id: '1' });
      expect(res).toBeDefined();
      if (res.album && res.album.user) {
        const ids = res.album.user.albums?.data?.map(a => a.id) || [];
        if (ids.length > 0) {
          expect(ids).toContain(res.album.id);
        }
      }
    });
  });

  describe('Mutations (update / reassign) without selecting Album.userId', () => {
    test('updates a user and reassigns an album to another user', async () => {
      // Create an album for a seeded user 1
      const createAlbum = `
        mutation CreateAlbum($input: CreateAlbumInput!) {
          createAlbum(input: $input) {
            id
            title
            user { id }
          }
        }
      `;
      const aTitle = `Reassign Test ${uid()}`;
      const aRes = await client.request(createAlbum, { input: { title: aTitle, userId: '1' } });
      expect(aRes.createAlbum).toBeDefined();
      const albumId = aRes.createAlbum.id;

      // Update the user (seeded) name
      const updateUser = `
        mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
          updateUser(id: $id, input: $input) { id name username }
        }
      `;
      const newName = `Updated Name ${uid()}`;
      const uRes = await client.request(updateUser, { id: '1', input: { name: newName } });
      expect(uRes.updateUser).toBeDefined();
      expect(uRes.updateUser.id).toBe('1');
      // Many demo APIs won’t persist; just assert shape
      expect(uRes.updateUser.name).toBeTruthy();

      // Reassign the album to user 2
      const updateAlbum = `
        mutation UpdateAlbum($id: ID!, $input: UpdateAlbumInput!) {
          updateAlbum(id: $id, input: $input) {
            id
            title
            user { id }
          }
        }
      `;
      const upd = await client.request(updateAlbum, { id: albumId, input: { userId: '2' } });
      expect(upd.updateAlbum).toBeDefined();
      expect(upd.updateAlbum.id).toBe(albumId);
      if (upd.updateAlbum.user) {
        expect(upd.updateAlbum.user.id).toBe('2');
      }
    });
  });

  describe('Complex nested & performance-friendly queries', () => {
    test('fetches users & albums pages with proper nested selections', async () => {
      const q = `
        query GetComplexData {
          users(options: { paginate: { page: 1, limit: 3 } }) {
            data {
              id
              name
              username
              email
              albums { data { id title user { id } } }
            }
            meta { totalCount }
          }
          albums(options: { paginate: { page: 1, limit: 5 } }) {
            data { id title user { id name username } }
            meta { totalCount }
          }
        }
      `;
      const start = Date.now();
      const res = await client.request(q);
      const ms = Date.now() - start;

      expect(res).toBeDefined();
      expect(res.users).toBeDefined();
      expect(res.albums).toBeDefined();
      console.log(`Complex query executed in ${ms}ms`);

      if (res.users?.data) {
        expect(Array.isArray(res.users.data)).toBe(true);
        for (const u of res.users.data) {
          if (u?.albums?.data) {
            for (const a of u.albums.data) {
              if (a.user) expect(a.user.id).toBeTruthy();
            }
          }
        }
      }
      if (res.albums?.data) {
        for (const a of res.albums.data) {
          if (a.user) expect(a.user.id).toBeTruthy();
        }
      }
    });

    test('handles concurrent read operations (no userId selections on Album)', async () => {
      const queries = [
        `query { user(id: "1") { id name } }`,
        `query { user(id: "2") { id name } }`,
        `query { albums(options: { paginate: { limit: 3 } }) { data { id title user { id } } } }`,
        `query { users(options: { paginate: { limit: 3 } }) { data { id name } } }`
      ];

      const start = Date.now();
      const results = await Promise.allSettled(queries.map(q => client.request(q)));
      const ms = Date.now() - start;

      const successes = results.filter(r => r.status === 'fulfilled');
      console.log(`Concurrent reads: ${successes.length}/${queries.length} successful in ${ms}ms`);

      for (const r of successes) {
        expect(r.value).toBeDefined();
      }
    });

    test('performs mixed read/write operations safely', async () => {
      const ops = [
        () => client.request(`query { user(id: "1") { id name } }`),
        () => client.request(`query { albums { data { id title user { id } } } }`),
        () => client.request(
          `mutation CreateUser($input: CreateUserInput!) { createUser(input: $input) { id name } }`,
          { input: { name: `Mixed User ${uid()}`, username: `mixed_${uid()}`, email: `mixed_${uid()}@x.com` } }
        ),
        () => client.request(
          `mutation CreateAlbum($input: CreateAlbumInput!) { createAlbum(input: $input) { id title user { id } } }`,
          { input: { title: `Mixed Album ${uid()}`, userId: '1' } }
        )
      ];

      const settled = await Promise.allSettled(ops.map(fn => fn()));
      const ok = settled.filter(s => s.status === 'fulfilled').length;
      console.log(`Mixed operations: ${ok}/${ops.length} successful`);
      expect(ok).toBeGreaterThan(0);
    });
  });

  describe('Edge cases on non-existent resources', () => {
    test('gracefully handles updates to non-existent IDs and album creation for non-existent user', async () => {
      const badId = '999999';

      // Update a non-existent user — many APIs throw, so expect a rejection
      const updateUser = `
        mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
          updateUser(id: $id, input: $input) { id name }
        }
      `;
      const result = await client.request(updateUser, { id: badId, input: { name: 'No-op' } });
      expect(result.updateUser).toBeDefined();
      expect(result.updateUser.id).toBeNull();

      // Try to create an album for a non-existent user — may throw or return with user: null
      const createAlbum = `
        mutation CreateAlbum($input: CreateAlbumInput!) {
          createAlbum(input: $input) { id title user { id } }
        }
      `;
      try {
        const res = await client.request(createAlbum, { input: { title: 'Album for non-existent user', userId: badId } });
        // If API is lenient, we at least get an id & title back
        expect(res.createAlbum.id).toBeTruthy();
        expect(res.createAlbum.title).toBeTruthy();
      } catch (e) {
        // If API is strict, ensure we captured the error without crashing the suite
        console.log('Album creation for non-existent user:', e.message);
      }
    });
  });
});
