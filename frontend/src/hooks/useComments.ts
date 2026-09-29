import { useQuery } from '@tanstack/react-query';
import { fetchComments } from '../api/postsApi';

// ─────────────────────────────────────────────────────────
// CONCEPT: Deeply nested query keys
//
// ['posts', 1, 'comments']  → comments for post 1
// ['posts', 2, 'comments']  → comments for post 2
//
// Invalidating ['posts', 1] also invalidates
// ['posts', 1, 'comments'] because it starts with the same prefix.
//
// So when you delete/update post 1, its comments
// also get invalidated automatically — just by invalidating
// the parent key prefix.
// ─────────────────────────────────────────────────────────

export const useComments = (postId: number) => {
  return useQuery({
    queryKey: ['posts', postId, 'comments'],  // deeply nested key
    queryFn:  () => fetchComments(postId),
    staleTime: 20_000,
    enabled:   !!postId,
  });
};
