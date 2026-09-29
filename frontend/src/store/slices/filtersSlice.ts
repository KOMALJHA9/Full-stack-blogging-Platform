import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Pure client state — the server never knows about these.
// This is exactly why it belongs in Redux, not React Query.

interface FiltersState {
  tag:    string;
  author: string;
  search: string;
  sort:   'newest' | 'oldest' | 'title-asc' | 'title-desc';
  page:   number;
}

const initialState: FiltersState = {
  tag:    '',
  author: '',
  search: '',
  sort:   'newest',
  page:   1,
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setTag: (state, action: PayloadAction<string>) => {
      state.tag = action.payload;
      state.page = 1;
    },
    setAuthor: (state, action: PayloadAction<string>) => {
      state.author = action.payload;
      state.page = 1;
    },
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
      state.page = 1;
    },
    setSort: (state, action: PayloadAction<FiltersState['sort']>) => {
      state.sort = action.payload;
      state.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    resetFilters: (state) => {
      state.tag    = '';
      state.author = '';
      state.search = '';
      state.sort   = 'newest';
      state.page   = 1;
    },
  },
});

export const { setTag, setAuthor, setSearch, setSort, setPage, resetFilters } = filtersSlice.actions;
export default filtersSlice.reducer;
