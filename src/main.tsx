import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";

// Third-Party Library
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MainProvider from "./context/main.tsx";
import { Provider } from "react-redux";
import store from "./store.tsx";

export const queryClient = new QueryClient();
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <MainProvider>
          <App />
        </MainProvider>
      </QueryClientProvider>
    </Provider>
  </StrictMode>
);
