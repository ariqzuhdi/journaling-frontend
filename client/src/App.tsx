import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Forgot from "@/pages/forgot";
import Entries from "@/pages/entries";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";
import ProtectedRoute from "@/components/protected-route";
import EmailVerificationHandler from './pages/verify';
import AccountSettings from "@/pages/settings";
import UnderMaintenance from "./pages/maintenance";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/forgot" component={UnderMaintenance} />
      <Route path="/verify" component={EmailVerificationHandler} />
      <Route
        path="/entries"
        component={() => (
          <ProtectedRoute>
            <Entries />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/settings"
        component={() => (
          <ProtectedRoute>
            {/* <AccountSettings /> */}
            {/* <UnderMaintenance/> */}
            <Settings />
          </ProtectedRoute>
        )}
      />
      <Route component={NotFound} />
    </Switch>
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
