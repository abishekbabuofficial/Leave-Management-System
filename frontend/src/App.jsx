import { Toaster as Sonner } from "./components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import Profile from "./pages/Profile";
import ApplyLeave from "./pages/ApplyLeave";
import MyRequests from "./pages/MyRequests";
import TeamMembers from "./pages/TeamMembers";
import PendingRequests from "./pages/PendingRequests";
import Approvals from "./pages/Approvals";
import NotFound from "./pages/NotFound";

// Components
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                {/* Common Routes */}
                <Route path="/" element={<Dashboard />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/profile" element={<Profile />} />
                
                {/* Employee Routes */}
                <Route path="/apply-leave" element={<ApplyLeave />} />
                <Route path="/my-requests" element={<MyRequests />} />
                
                {/* Admin Routes */}
                <Route element={<AdminRoute />}>
                  <Route path="/team" element={<TeamMembers />} />
                  <Route path="/pending-requests" element={<PendingRequests />} />
                  <Route path="/approvals" element={<Approvals />} />
                </Route>
              </Route>
            </Route>
            
            {/* Catch All */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
  </QueryClientProvider>
);

export default App;
