import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/user-context";
import StatsCard from "@/components/dashboard/stats-card";
import AppointmentItem from "@/components/dashboard/appointment-item";
import CalendarView from "@/components/dashboard/calendar-view";
import ActionCard from "@/components/dashboard/action-card";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarCheck, CheckCircle, Link2, LineChart } from "lucide-react";
import { getTodayDateString } from "@/lib/dates";

export default function Dashboard() {
  const { user } = useUser();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const todayStr = getTodayDateString();

  // Fetch appointments
  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['/api/users/1/appointments'],
    enabled: !!user
  });

  // Fetch today's appointments
  const { data: todayAppointments, isLoading: todayLoading } = useQuery({
    queryKey: ['/api/users/1/appointments/date', todayStr],
    queryFn: () => fetch(`/api/users/1/appointments/date/${todayStr}`).then(res => res.json()),
    enabled: !!user
  });

  // Calculate stats
  const stats = {
    upcoming: appointments?.filter(app => new Date(app.date) >= new Date()).length || 0,
    completed: appointments?.filter(app => app.status === 'completed').length || 0,
    views: 143 // Mock data for page views
  };

  // Generate current month string
  const currentMonth = format(currentDate, 'MMMM yyyy');

  // Handle navigation
  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const handleTodayClick = () => {
    setCurrentDate(new Date());
  };

  const handleCopyBookingLink = () => {
    if (user) {
      const url = `${window.location.origin}/book/${user.username}`;
      navigator.clipboard.writeText(url)
        .then(() => {
          toast({
            title: "Booking link copied!",
            description: "Share this link with your clients to allow them to book appointments with you."
          });
        })
        .catch(() => {
          toast({
            title: "Failed to copy link",
            description: "Please try again or copy manually.",
            variant: "destructive"
          });
        });
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your appointments and schedule.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        <StatsCard 
          title="Upcoming Appointments" 
          value={stats.upcoming.toString()} 
          icon={<CalendarCheck className="h-6 w-6 text-blue-500" />} 
          bgColor="bg-blue-100" 
          isLoading={appointmentsLoading} 
        />
        <StatsCard 
          title="Completed This Month" 
          value={stats.completed.toString()} 
          icon={<CheckCircle className="h-6 w-6 text-green-500" />} 
          bgColor="bg-green-100" 
          isLoading={appointmentsLoading} 
        />
        <StatsCard 
          title="Booking Page Views" 
          value={stats.views.toString()} 
          icon={<Link2 className="h-6 w-6 text-primary" />} 
          bgColor="bg-primary-100" 
          isLoading={false} 
        />
      </div>

      {/* Today's Appointments & Calendar View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Appointments */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Today's Appointments</h3>
              <p className="mt-1 text-sm text-gray-500">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
            </div>
            <div className="px-4 py-5 sm:p-6">
              {todayLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="p-4 rounded-md border-l-4 border-gray-300">
                      <Skeleton className="h-5 w-2/3 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-3" />
                      <div className="flex justify-end space-x-3">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-8 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : todayAppointments?.length > 0 ? (
                <div className="space-y-4">
                  {todayAppointments.map(appointment => (
                    <AppointmentItem key={appointment.id} appointment={appointment} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No appointments scheduled for today.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Calendar View */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Calendar</h3>
                <p className="mt-1 text-sm text-gray-500">{currentMonth}</p>
              </div>
              <div className="flex space-x-2">
                <button 
                  type="button" 
                  onClick={handlePrevMonth}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                <button 
                  type="button" 
                  onClick={handleTodayClick}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Today
                </button>
                <button 
                  type="button" 
                  onClick={handleNextMonth}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Next
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <CalendarView 
                currentDate={currentDate} 
                appointments={appointments || []} 
                isLoading={appointmentsLoading} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/booking-page">
            <ActionCard 
              title="Create New Appointment" 
              description="Schedule directly with a client" 
              icon={<CalendarCheck className="text-primary" />} 
              bgColor="bg-primary-100" 
            />
          </Link>
          <div onClick={handleCopyBookingLink}>
            <ActionCard 
              title="Copy Booking Link" 
              description="Share with your clients" 
              icon={<Link2 className="text-blue-500" />} 
              bgColor="bg-blue-100" 
            />
          </div>
          <Link href="/availability">
            <ActionCard 
              title="Update Availability" 
              description="Manage your schedule" 
              icon={<CalendarCheck className="text-purple-500" />} 
              bgColor="bg-purple-100" 
            />
          </Link>
          <ActionCard 
            title="View Analytics" 
            description="Check your booking stats" 
            icon={<LineChart className="text-green-600" />} 
            bgColor="bg-green-100" 
          />
        </div>
      </div>
    </main>
  );
}
