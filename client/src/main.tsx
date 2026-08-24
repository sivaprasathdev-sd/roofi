import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "@/context/session-context";
import { SettingsProvider } from "@/context/settings-context";
import { ThemeProvider } from "@/context/theme-context";
import { LeadsProvider } from "@/context/leads-context";
import { Toaster } from "@/components/ui/sonner";
import App from "./App";
import "./styles.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SessionProvider>
          <SettingsProvider>
            <LeadsProvider>
              <BrowserRouter>
                <App />
                <Toaster position="top-right" richColors />
              </BrowserRouter>
            </LeadsProvider>
          </SettingsProvider>
        </SessionProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
);
