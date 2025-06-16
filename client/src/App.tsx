
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PollProvider, usePoll } from "./context/PollContext";
import Header from "./components/Header";
import Home from "./pages/Home";
import TeacherDashboard from "./components/TeacherDashboard";
import StudentInterface from "./components/StudentInterface";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <PollProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen">
            <Header />
            <Routes>
              <Route path="/" element={<AppContent />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </PollProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

const AppContent = () => {
  const { currentUser } = usePoll();

  // Show appropriate interface based on user role
  if (!currentUser) {
    return <Home />;
  }

  if (currentUser.role === 'teacher') {
    return <TeacherDashboard />;
  }

  if (currentUser.role === 'student') {
    return <StudentInterface />;
  }

  return <Home />;
};

export default App;
