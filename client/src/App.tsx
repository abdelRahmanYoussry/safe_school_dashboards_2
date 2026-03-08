import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/AppLayout";

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

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard}/>
        <Route path="/schools" component={Schools}/>
        <Route path="/schools/:id" component={SchoolDetails}/>
        <Route path="/plans" component={Plans}/>
        <Route path="/analytics" component={Analytics}/>
        <Route path="/safety-reports" component={SafetyReports}/>
        <Route path="/tickets" component={Tickets}/>
        <Route path="/audit-logs" component={AuditLogs}/>
        <Route path="/map" component={MapView}/>
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
