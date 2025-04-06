import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Availability from "@/pages/availability";
import BookingPage from "@/pages/booking-page";
import Settings from "@/pages/settings";
import PublicBooking from "@/pages/public-booking";
import { UserProvider } from "@/context/user-context";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/availability" component={Availability} />
      <Route path="/booking-page" component={BookingPage} />
      <Route path="/settings" component={Settings} />
      <Route path="/book/:username" component={PublicBooking} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex-grow">
            <Router />
          </div>
          <Footer />
        </div>
        <Toaster />
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
