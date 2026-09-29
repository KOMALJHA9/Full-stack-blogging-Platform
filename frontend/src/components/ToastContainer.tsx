import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/useAppHooks';
import { removeToast } from '../store/slices/toastSlice';

// This is the ONLY place in the app that reads the toasts slice.
// Any mutation anywhere can dispatch(addToast(...)) and this
// component — mounted once in App.tsx — will show it, no matter
// which page dispatched it. That's the win Redux gives here:
// no prop drilling, no lifting state up through every page.
const ToastContainer: React.FC = () => {
  const toasts   = useAppSelector((s) => s.toasts);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      dispatch(removeToast(toasts[0].id));
    }, 3000);
    return () => clearTimeout(timer);
  }, [toasts, dispatch]);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="false">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast toast-${t.type}`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
