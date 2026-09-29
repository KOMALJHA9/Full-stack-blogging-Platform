import { useQuery } from '@tanstack/react-query';
import { fetchPostById } from '../api/postsApi';

// ─────────────────────────────────────────────────────────
// CONCEPT: Nested query keys
//
// ['posts', 1]  → cache entry for post with id 1
// ['posts', 2]  → cache entry for post with id 2
//
// When you invalidate ['posts'] (the prefix),
// ALL of these are invalidated too:
//   ['posts'] ['posts', {}] ['posts', 1] ['posts', 2] ...
//
// This is the power of key prefixes in invalidation.
// ─────────────────────────────────────────────────────────

export const usePost = (id: number) => {
  return useQuery({
    queryKey: ['posts', id],         // ['posts', 1] or ['posts', 2]
    queryFn:  () => fetchPostById(id),
    staleTime: 60_000,               // single post stays fresh 60s
    enabled: !!id,                   // only fetch if id is truthy
  });
};
