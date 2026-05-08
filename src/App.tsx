import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import WatchPage from "./pages/Watch";
import SearchPage from "./pages/Search";
import LoginPage from "./pages/Login";
import PremiumPage from "./pages/Premium";
import PremiumContentPage from "./pages/PremiumContent";
import AdminPage from "./pages/Admin";
import AdminUsersPage from "./pages/AdminUsers";
import AdminUploadPage from "./pages/AdminUpload";
import NotFound from "./pages/NotFound";
import { AdminRoute } from "./components/AdminRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/watch/:id" element={<WatchPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/premium" element={<PremiumPage />} />
          <Route path="/premium-content" element={<PremiumContentPage />} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
          <Route path="/admin/videos" element={<AdminRoute><AdminPage /></AdminRoute>} />
          <Route path="/admin/upload" element={<AdminRoute><AdminUploadPage /></AdminRoute>} />
          <Route path="/admin/categories" element={<AdminRoute><AdminPage /></AdminRoute>} />
          <Route path="/admin/analytics" element={<AdminRoute><AdminPage /></AdminRoute>} />
          <Route path="/admin/premium" element={<AdminRoute><AdminPage /></AdminRoute>} />
          <Route path="/admin/settings" element={<AdminRoute><AdminPage /></AdminRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
