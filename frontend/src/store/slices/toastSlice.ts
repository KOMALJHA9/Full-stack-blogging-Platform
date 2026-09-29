import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Toast {
  id:      string;
  message: string;
  type:    'success' | 'error';
}

// Toasts array — also pure client state, never touches the server.
const initialState: Toast[] = [];

const toastSlice = createSlice({
  name: 'toasts',
  initialState,
  reducers: {
    addToast: {
      reducer: (state, action: PayloadAction<Toast>) => {
        state.push(action.payload);
      },
      // prepare() lets us generate the id at dispatch time
      // so every call site doesn't need to invent one itself
      prepare: (message: string, type: 'success' | 'error') => ({
        payload: { id: Date.now().toString() + Math.random(), message, type },
      }),
    },
    removeToast: (state, action: PayloadAction<string>) => {
      return state.filter(t => t.id !== action.payload);
    },
  },
});

export const { addToast, removeToast } = toastSlice.actions;
export default toastSlice.reducer;
