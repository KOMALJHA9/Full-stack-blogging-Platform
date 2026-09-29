import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Provider } from 'react-redux';
import { store } from './store';

import PostsPage      from './pages/PostsPage';
import PostDetailPage from './pages/PostDetailPage';
import CreatePostPage from './pages/CreatePostPage';
import EditPostPage   from './pages/EditPostPage';
import ToastContainer from './components/ToastContainer';
import AiChatWidget from './components/AiChatWidget';

// ─────────────────────────────────────────────────────────
// TWO providers now, nested. Order doesn't matter between
// them since they don't depend on each other, but Redux's
// Provider is conventionally placed outermost.
//
// QueryClient: owns posts, comments, loading, error, cache
// Redux store: owns filters + toasts ONLY
// ─────────────────────────────────────────────────────────

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:            30_000,
      retry:                1,
      refetchOnWindowFocus: true,
    },
  },
});

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/"               element={<PostsPage />} />
            <Route path="/create"         element={<CreatePostPage />} />
            <Route path="/posts/:id"      element={<PostDetailPage />} />
            <Route path="/posts/:id/edit" element={<EditPostPage />} />
          </Routes>
        </BrowserRouter>

        {/* Reads from Redux — mounted once, shows toasts from any mutation */}
        <ToastContainer />
        <AiChatWidget />

        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </Provider>
  );
};

export default App;
