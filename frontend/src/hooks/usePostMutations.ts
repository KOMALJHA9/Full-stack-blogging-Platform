import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import {
  createPost, updatePost, togglePublish, deletePost,
  addComment, deleteComment,
} from '../api/postsApi';
import { addToast } from '../store/slices/toastSlice';

// ─────────────────────────────────────────────────────────
// Everything about invalidateQueries / setQueryData is
// UNCHANGED from the plain React Query version.
// The only addition: useDispatch() + dispatch(addToast(...))
// inside onSuccess/onError. React Query still owns all
// server-state caching — Redux only receives the notification.
// ─────────────────────────────────────────────────────────

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      dispatch(addToast('Post created', 'success'));
    },
    onError: () => {
      dispatch(addToast('Failed to create post', 'error'));
    },
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { title: string; content: string; tag: string } }) =>
      updatePost(id, data),
    onSuccess: (updatedPost) => {
      queryClient.invalidateQueries({ queryKey: ['posts', updatedPost.id] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      dispatch(addToast('Post updated', 'success'));
    },
    onError: () => {
      dispatch(addToast('Failed to update post', 'error'));
    },
  });
};

export const useTogglePublish = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: (id: number) => togglePublish(id),

    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ['posts', id] });
      const previousPost = queryClient.getQueryData(['posts', id]);
      queryClient.setQueryData(['posts', id], (old: any) => {
        if (!old) return old;
        return { ...old, published: !old.published };
      });
      return { previousPost };
    },

    onError: (_err, id, context: any) => {
      if (context?.previousPost) {
        queryClient.setQueryData(['posts', id], context.previousPost);
      }
      dispatch(addToast('Failed to update publish status', 'error'));
    },

    onSuccess: (updatedPost) => {
      dispatch(addToast(
        updatedPost.published ? 'Post published' : 'Post unpublished',
        'success'
      ));
    },

    onSettled: (_data, _error, id) => {
      queryClient.invalidateQueries({ queryKey: ['posts', id] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: (id: number) => deletePost(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: ['posts', id] });
      queryClient.removeQueries({ queryKey: ['posts', id, 'comments'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      dispatch(addToast('Post deleted', 'success'));
    },
    onError: () => {
      dispatch(addToast('Failed to delete post', 'error'));
    },
  });
};

export const useAddComment = (postId: number) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: (data: { body: string; author: string }) => addComment(postId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', postId, 'comments'] });
      queryClient.invalidateQueries({ queryKey: ['posts', postId] });
      dispatch(addToast('Comment added', 'success'));
    },
    onError: () => {
      dispatch(addToast('Failed to add comment', 'error'));
    },
  });
};

export const useDeleteComment = (postId: number) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: (commentId: number) => deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', postId, 'comments'] });
      queryClient.invalidateQueries({ queryKey: ['posts', postId] });
      dispatch(addToast('Comment deleted', 'success'));
    },
    onError: () => {
      dispatch(addToast('Failed to delete comment', 'error'));
    },
  });
};
