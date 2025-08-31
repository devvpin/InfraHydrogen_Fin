import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MapInfo from "./pages/MapInfo";
import CarbonCalculator from "./pages/CarbonCalculator";
import Prediction from "./pages/Prediction";
import PredictedSites from "./pages/PredictedSites";
import News from "./pages/News";
import Insights from "./pages/Insights";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index"; // Ensure this is correct and exists

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* Comment out Toaster and Sonner if needed */}
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/mapinfo" element={<MapInfo />} />
          <Route path="/carbon-calculator" element={<CarbonCalculator />} />
          <Route path="/analysis" element={<Prediction />} />
          <Route path="/predicted-sites" element={<PredictedSites />} />
          <Route path="/news" element={<News />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
