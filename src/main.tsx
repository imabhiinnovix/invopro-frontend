import { StrictMode } from "react";
import { createRoot, Root } from "react-dom/client";

import App from "./App.tsx";
import "./styles/fonts";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MainProvider from "./context/main.tsx";
import { Provider } from "react-redux";
import { store } from "./reducers";

export const queryClient = new QueryClient();

declare global {
  interface Window {
    __root?: Root;
  }
}

const rootElement = document.getElementById("root")!;

// Type-safe root creation
const root = window.__root || (window.__root = createRoot(rootElement));

root.render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <MainProvider>
          <App />
        </MainProvider>
      </QueryClientProvider>
    </Provider>
  </StrictMode>,
);
