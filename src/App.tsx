import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import ChatShell from "@/components/ChatShell";
import ChatView from "./pages/ChatView";
import Settings from "./pages/Settings";
import Verify from "./pages/Verify";
import InstallPrompt from "@/components/InstallPrompt";
import { ThemeProvider } from "next-themes";
const queryClient = new QueryClient();
const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <InstallPrompt />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/verify" element={<Verify />} />
            {}
            <Route element={<ChatShell />}>
              <Route path="/" element={<Index />} />
              <Route path="/chat/:id" element={<ChatView />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            {}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);
export default App;