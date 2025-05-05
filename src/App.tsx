
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Diagnostico from "./pages/Diagnostico";
import NotFound from "./pages/NotFound";
import QuemSomos from "./pages/QuemSomos";
import Servicos from "./pages/Servicos";
import ServicosDetalhe from "./pages/ServicosDetalhe";
import Cases from "./pages/Cases";
import CasesDetalhe from "./pages/CasesDetalhe";
import Downloads from "./pages/Downloads";
import Materials from "./pages/Materials";
import Comunidade from "./pages/Comunidade";
import Booking from "./pages/Booking";
import PartnerDetail from "./pages/PartnerDetail";
import PartnerEnics from "./pages/PartnerEnics";
import TermosDeUso from "./pages/TermosDeUso";
import Privacidade from "./pages/Privacidade";
import SecureBooking from "./pages/SecureBooking";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/diagnostico" element={<Diagnostico />} />
          <Route path="/quem-somos" element={<QuemSomos />} />
          <Route path="/servicos" element={<Servicos />} />
          <Route path="/servicos/:slug" element={<ServicosDetalhe />} />
          <Route path="/cases" element={<Cases />} />
          <Route path="/cases/:slug" element={<CasesDetalhe />} />
          <Route path="/partners/:slug" element={<PartnerDetail />} />
          <Route path="/partners/enics" element={<PartnerEnics />} />
          <Route path="/downloads" element={<Downloads />} />
          <Route path="/materiais" element={<Materials />} />
          <Route path="/comunidade" element={<Comunidade />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/termos-de-uso" element={<TermosDeUso />} />
          <Route path="/privacidade" element={<Privacidade />} />
          <Route path="/agenda/giulliano" element={<SecureBooking />} />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
