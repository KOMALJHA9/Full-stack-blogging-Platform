import { useQuery } from '@tanstack/react-query';
import { fetchPosts } from '../api/postsApi';
import { PostFilters } from '../types';

// ─────────────────────────────────────────────────────────
// CONCEPT: Query keys as arrays
//
// ['posts']                    → all posts, no filter
// ['posts', { tag: 'react' }]  → only react posts
// ['posts', { author: 'komal' }] → only komal's posts
// ['posts', { tag: 'react', author: 'komal' }] → both filters
//
// Each combination is a SEPARATE cache entry.
// React Query treats the entire array as the cache key.
// ─────────────────────────────────────────────────────────

export const usePosts = (filters: PostFilters = {}) => {
  return useQuery({
    // Array key: ['posts'] or ['posts', { tag, author }]
    // When filters is empty {} → key is ['posts', {}]
    // React Query deep-compares objects inside the array
    queryKey: ['posts', filters],

    queryFn:  () => fetchPosts(filters),

    // Paginated page changes should always request the selected page from the API.
    staleTime: filters.page ? 0 : 30_000,
  });
};
