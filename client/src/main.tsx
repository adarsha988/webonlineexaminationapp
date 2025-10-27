import './index.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';

const queryClient = new QueryClient();
const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <App />
          </TooltipProvider>
        </QueryClientProvider>
      </Provider>
    </BrowserRouter>
  </React.StrictMode>
);
