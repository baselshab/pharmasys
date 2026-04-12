import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DatabaseProvider } from "@/db/DatabaseProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import Index from "./pages/Index";
import POS from "./pages/POS";
import Products from "./pages/Products";
import Inventory from "./pages/Inventory";
import Purchases from "./pages/Purchases";
import Suppliers from "./pages/Suppliers";
import Customers from "./pages/Customers";
import Reports from "./pages/Reports";
import SettingsPage from "./pages/SettingsPage";
import Branches from "./pages/Branches";
import RolesPermissions from "./pages/RolesPermissions";
import AuditReports from "./pages/AuditReports";
import Attendance from "./pages/Attendance";
import AuditLogPage from "./pages/AuditLog";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import Employees from "./pages/Employees";
import Sales from "./pages/Sales";
import NotFound from "./pages/NotFound";
import Branches2 from "./pages/Branches2";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <LanguageProvider>
          <DatabaseProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/pos" element={<POS />} />
                <Route path="/products" element={<Products />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/purchases" element={<Purchases />} />
                <Route path="/suppliers" element={<Suppliers />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/branches" element={<Branches />} />
                <Route path="/branches2" element={<Branches2 />} />
                <Route path="/roles" element={<RolesPermissions />} />
                <Route path="/audit-reports" element={<AuditReports />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/audit-log" element={<AuditLogPage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/employees" element={<Employees />} />
                <Route path="/sales" element={<Sales />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </DatabaseProvider>
        </LanguageProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
