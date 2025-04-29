import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login-page";
import OrdersPage from "@/pages/orders-page";
import MapPage from "@/pages/map-page";
import PaymentPage from "@/pages/payment-page";
import ProfilePage from "@/pages/profile-page";
import BottomNavigation from "@/components/bottom-navigation";
import { useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <ProtectedRoute path="/" component={OrdersPage} />
      <ProtectedRoute path="/orders" component={OrdersPage} />
      <ProtectedRoute path="/map/:orderId" component={MapPage} />
      <ProtectedRoute path="/payment/:orderId" component={PaymentPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { user } = useAuth();

  return (
    <div className="app-container mx-auto max-w-md bg-[#F3F4F6] min-h-screen relative">
      <TooltipProvider>
        <Toaster />
        <Router />
        {user && <BottomNavigation />}
      </TooltipProvider>
    </div>
  );
}

export default App;
