import { useCallback, useEffect, useRef, useState } from 'react';

export interface SavedDraft<T> {
  data: T;
  savedAt: string;
}

export const useAutoSavedDraft = <T,>(storageKey: string) => {
  const [recoveryDraft, setRecoveryDraft] = useState<SavedDraft<T> | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const saveTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as SavedDraft<T>;
        if (parsed.data !== undefined && typeof parsed.savedAt === 'string') {
          setRecoveryDraft(parsed);
          setLastSavedAt(parsed.savedAt);
        }
      }
    } catch {
      setRecoveryDraft(null);
    }

    return () => {
      if (saveTimer.current !== undefined) window.clearTimeout(saveTimer.current);
    };
  }, [storageKey]);

  const save = useCallback((data: T) => {
    if (saveTimer.current !== undefined) window.clearTimeout(saveTimer.current);
    setIsSaving(true);
    setSaveError(false);
    saveTimer.current = window.setTimeout(() => {
      const savedAt = new Date().toISOString();
      try {
        window.localStorage.setItem(storageKey, JSON.stringify({ data, savedAt }));
        setLastSavedAt(savedAt);
        setRecoveryDraft(null);
      } catch {
        setSaveError(true);
      }
      setIsSaving(false);
    }, 500);
  }, [storageKey]);

  const restore = useCallback(() => {
    if (!recoveryDraft) return null;
    setLastSavedAt(recoveryDraft.savedAt);
    setRecoveryDraft(null);
    return recoveryDraft.data;
  }, [recoveryDraft]);

  const clear = useCallback(() => {
    if (saveTimer.current !== undefined) window.clearTimeout(saveTimer.current);
    saveTimer.current = undefined;
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      setSaveError(true);
    }
    setRecoveryDraft(null);
    setLastSavedAt(null);
    setIsSaving(false);
  }, [storageKey]);

  const discard = useCallback(() => {
    clear();
    setSaveError(false);
  }, [clear]);

  return { recoveryDraft, lastSavedAt, isSaving, saveError, save, restore, clear, discard };
};