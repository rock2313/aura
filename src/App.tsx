import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { KYC } from "@/pages/KYC";
import { Dashboard } from "@/pages/Dashboard";
import { Properties } from "@/pages/Properties";
import { Transactions } from "@/pages/Transactions";
import { AddProperty } from "@/pages/AddProperty";
import { AdminDashboard } from "@/pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState({
    userId: '',
    userName: '',
    userRole: '',
  });

  const handleKYCComplete = (userId: string, userName: string, userRole: string) => {
    setUserInfo({ userId, userName, userRole });
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserInfo({ userId: '', userName: '', userRole: '' });
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {isLoggedIn && (
            <Navbar
              isLoggedIn={isLoggedIn}
              userName={userInfo.userName}
              userId={userInfo.userId}
              userRole={userInfo.userRole}
              onLogout={handleLogout}
            />
          )}
          <Routes>
            <Route
              path="/"
              element={
                isLoggedIn ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <KYC onComplete={handleKYCComplete} />
                )
              }
            />
            <Route
              path="/dashboard"
              element={isLoggedIn ? <Dashboard /> : <Navigate to="/" replace />}
            />
            <Route
              path="/properties"
              element={isLoggedIn ? <Properties /> : <Navigate to="/" replace />}
            />
            <Route
              path="/transactions"
              element={isLoggedIn ? <Transactions /> : <Navigate to="/" replace />}
            />
            <Route
              path="/add-property"
              element={isLoggedIn ? <AddProperty /> : <Navigate to="/" replace />}
            />
            <Route
              path="/admin"
              element={isLoggedIn ? <AdminDashboard /> : <Navigate to="/" replace />}
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
