import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.tsx';

// Third-Party Library
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MainProvider from './context/main.tsx';

export const queryClient = new QueryClient();
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <MainProvider>
        <App />
      </MainProvider>
    </QueryClientProvider>
  </StrictMode>
);
