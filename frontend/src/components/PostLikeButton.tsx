import React, { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { setPostLike } from '../api/postsApi';
import { addToast } from '../store/slices/toastSlice';
import { useAppDispatch } from '../hooks/useAppHooks';

const CLIENT_ID_KEY = 'rq-blog:like-client-id';
const LIKED_POSTS_KEY = 'rq-blog:liked-posts';

const createClientId = () => {
  const bytes = new Uint8Array(16);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
};

interface PostLikeButtonProps {
  postId: number;
}

const PostLikeButton: React.FC<PostLikeButtonProps> = ({ postId }) => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const [clientId, setClientId] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      let storedClientId = window.localStorage.getItem(CLIENT_ID_KEY);
      if (!storedClientId) {
        storedClientId = createClientId();
        window.localStorage.setItem(CLIENT_ID_KEY, storedClientId);
      }
      setClientId(storedClientId);

      const storedLikes = window.localStorage.getItem(LIKED_POSTS_KEY);
      const likedPostIds: unknown = storedLikes ? JSON.parse(storedLikes) : [];
      setIsLiked(Array.isArray(likedPostIds) && likedPostIds.includes(postId));
    } catch {
      setClientId(createClientId());
      setIsLiked(false);
    }
    setIsReady(true);
  }, [postId]);

  useEffect(() => {
    const syncLikedState = (event: StorageEvent) => {
      if (event.key !== LIKED_POSTS_KEY) return;
      try {
        const likedPostIds: unknown = event.newValue ? JSON.parse(event.newValue) : [];
        setIsLiked(Array.isArray(likedPostIds) && likedPostIds.includes(postId));
      } catch {
        setIsLiked(false);
      }
    };
    window.addEventListener('storage', syncLikedState);
    return () => window.removeEventListener('storage', syncLikedState);
  }, [postId]);

  const likeMutation = useMutation({
    mutationFn: (liked: boolean) => setPostLike(postId, clientId, liked),
    onSuccess: (_result, liked) => {
      setIsLiked(liked);
      try {
        const storedLikes = window.localStorage.getItem(LIKED_POSTS_KEY);
        const currentIds: unknown = storedLikes ? JSON.parse(storedLikes) : [];
        const likedPostIds = new Set(Array.isArray(currentIds)
          ? currentIds.filter((id): id is number => Number.isInteger(id))
          : []);
        if (liked) likedPostIds.add(postId);
        else likedPostIds.delete(postId);
        window.localStorage.setItem(LIKED_POSTS_KEY, JSON.stringify([...likedPostIds]));
      } catch {
        dispatch(addToast('Like saved on the server, but browser state could not be updated', 'error'));
      }
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: () => dispatch(addToast('Could not update like. Try again.', 'error')),
  });

  return (
    <button
      className={`text-button like-button${isLiked ? ' is-liked' : ''}`}
      type="button"
      aria-label={isLiked ? 'Unlike post' : 'Like post'}
      title={isLiked ? 'Unlike this post' : 'Like this post'}
      aria-pressed={isLiked}
      disabled={!isReady || likeMutation.isPending}
      onClick={() => likeMutation.mutate(!isLiked)}
    >
      <span className="like-icon" aria-hidden="true">{isLiked ? '♥' : '♡'}</span>
    </button>
  );
};

export default PostLikeButton;