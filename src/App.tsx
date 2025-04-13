import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { Layout } from "./components/Layout";
import Quote from "./pages/Quote";
import ClientList from "./pages/ClientList";
import ProjectList from "./pages/ProjectList";
import QuoteList from "./pages/QuoteList";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/devis" replace />} />
              <Route path="devis" element={<QuoteList />} />
              <Route path="devis/new" element={<Quote />} />
              <Route path="devis/:id" element={<Quote />} />
              <Route path="clients" element={<ClientList />} />
              <Route path="chantiers" element={<ProjectList />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
