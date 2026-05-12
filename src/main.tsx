import { StrictMode } from "react";
import { createRoot, Root } from "react-dom/client";

import App from "./App.tsx";
import "./styles/fonts.ts";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MainProvider from "./context/main.tsx";
import { Provider } from "react-redux";
import { store } from "./reducers/index.tsx";

import { BrowserRouter } from "react-router-dom"; // ✅ ADD THIS
import { TypographyProvider } from "./context/TypographyContext.tsx";

export const queryClient = new QueryClient();

declare global {
  interface Window {
    __root?: Root;
  }
}

const rootElement = document.getElementById("root")!;
const root = window.__root || (window.__root = createRoot(rootElement));

root.render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter> {/* ✅ FIX IS HERE */}
          <MainProvider>
            <TypographyProvider>
            <App />
            </TypographyProvider>
          </MainProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  </StrictMode>,
);