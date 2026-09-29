import { useEffect, useState } from 'react';

const STORAGE_KEY = 'rq-blog:bookmarks';

export const useBookmarks = () => {
  const [postIds, setPostIds] = useState<number[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setPostIds(parsed.filter((id): id is number => Number.isInteger(id) && id > 0));
        }
      }
    } catch {
      setPostIds([]);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(postIds));
    } catch {
      // Keep the in-memory bookmarks available if browser storage is unavailable.
    }
  }, [isLoaded, postIds]);

  const toggleBookmark = (postId: number) => {
    setPostIds(current => current.includes(postId)
      ? current.filter(id => id !== postId)
      : [...current, postId]);
  };

  return {
    postIds,
    isLoaded,
    isBookmarked: (postId: number) => postIds.includes(postId),
    toggleBookmark,
  };
};