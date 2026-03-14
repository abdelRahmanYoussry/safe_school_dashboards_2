import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

// Pages
import Dashboard from "./pages/Dashboard";
import Schools from "./pages/Schools";
import SchoolDetails from "./pages/SchoolDetails";
import Plans from "./pages/Plans";
import Analytics from "./pages/Analytics";
import SafetyReports from "./pages/SafetyReports";
import Tickets from "./pages/Tickets";
import AuditLogs from "./pages/AuditLogs";
import MapView from "./pages/Map";
import NotFound from "@/pages/not-found";
import LoginPage from "./pages/LoginPage";
import AdminLoginPage from "./admin/pages/AdminLoginPage";


import { AdminLayout } from "./admin/components/AdminLayout";
import AdminDashboard from "./admin/pages/AdminDashboard";
import StudentsPage from "./admin/pages/StudentsPage";
import StaffPage from "./admin/pages/StaffPage";
import PickupPage from "./admin/pages/PickupPage";
import TransportationPage from "./admin/pages/TransportationPage";
import InvitationsPage from "./admin/pages/InvitationsPage";
import SettingsPage from "./admin/pages/SettingsPage";

function ProtectedRoute({ component: Component, path }: { component: React.ComponentType, path: string }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  // If a school admin tries to access a super admin route, redirect to admin home
  const isSchoolAdmin = user?.role?.toLowerCase() === 'school_admin';

  if (isSchoolAdmin && !path.startsWith('/admin')) {
    return <Redirect to="/admin" />;
  }

  return (
    <Route path={path}>
      <AppLayout>
        <Component />
      </AppLayout>
    </Route>
  );
}

function AdminProtectedRoute({ component: Component, path }: { component: React.ComponentType, path: string }) {
    const { user, isLoading } = useAuth();
  
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
  
    const isSchoolAdmin = user?.role?.toLowerCase() === 'school_admin';
  
    if (!user || !isSchoolAdmin) {
      return <Redirect to="/admin/login" />;
    }
  
    return (
      <Route path={path}>
        <AdminLayout>
          <Component />
        </AdminLayout>
      </Route>
    );
  }

function Router() {
  const { user } = useAuth();

  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/admin/login" component={AdminLoginPage} />
      
      {/* Super Admin Routes */}
      <ProtectedRoute path="/" component={user?.role?.toLowerCase() === 'school_admin' ? AdminDashboard : Dashboard} />
      <ProtectedRoute path="/schools" component={Schools} />
      <ProtectedRoute path="/schools/:id" component={SchoolDetails} />
      <ProtectedRoute path="/plans" component={Plans} />
      <ProtectedRoute path="/analytics" component={Analytics} />
      <ProtectedRoute path="/safety-reports" component={SafetyReports} />
      <ProtectedRoute path="/tickets" component={Tickets} />
      <ProtectedRoute path="/audit-logs" component={AuditLogs} />
      <ProtectedRoute path="/map" component={MapView} />

      {/* School Admin Routes */}
      <AdminProtectedRoute path="/admin" component={AdminDashboard} />
      <AdminProtectedRoute path="/admin/students" component={StudentsPage} />
      <AdminProtectedRoute path="/admin/staff" component={StaffPage} />
      <AdminProtectedRoute path="/admin/pickup" component={PickupPage} />
      <AdminProtectedRoute path="/admin/transportation" component={TransportationPage} />
      <AdminProtectedRoute path="/admin/invitations" component={InvitationsPage} />
      <AdminProtectedRoute path="/admin/settings" component={SettingsPage} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
