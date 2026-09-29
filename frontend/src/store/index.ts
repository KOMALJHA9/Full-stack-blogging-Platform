import { configureStore } from '@reduxjs/toolkit';
import filtersReducer from './slices/filtersSlice';
import toastsReducer  from './slices/toastSlice';

// Notice: no "posts" reducer here. Posts, comments, loading,
// error — all of that stays in React Query's cache.
// Redux only holds pure client state: filters and toasts.
export const store = configureStore({
  reducer: {
    filters: filtersReducer,
    toasts:  toastsReducer,
  },
});

export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
