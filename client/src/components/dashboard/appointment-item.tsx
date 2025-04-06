import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Clock } from "lucide-react";
import type { Appointment, Service } from "@shared/schema";

interface AppointmentItemProps {
  appointment: Appointment;
}

export default function AppointmentItem({ appointment }: AppointmentItemProps) {
  const { toast } = useToast();
  const [isRescheduling, setIsRescheduling] = useState(false);

  // Fetch service details
  const { data: service } = useMutation({
    mutationFn: async (): Promise<Service> => {
      const res = await fetch(`/api/services/${appointment.serviceId}`);
      if (!res.ok) throw new Error("Failed to fetch service");
      return res.json();
    },
  });

  // Update appointment status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      return apiRequest("PUT", `/api/appointments/${appointment.id}`, {
        status
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/1/appointments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/1/appointments/date', appointment.date] });

      toast({
        title: "Appointment updated",
        description: "The appointment status has been updated."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update appointment status.",
        variant: "destructive"
      });
    }
  });

  const handleReschedule = () => {
    setIsRescheduling(true);
    // In a real app, this would open a reschedule dialog
    toast({
      title: "Reschedule",
      description: "Reschedule functionality would open a dialog to select a new time."
    });
    setIsRescheduling(false);
  };

  const handleJoin = () => {
    toast({
      title: "Join Meeting",
      description: "In a real app, this would open your meeting room or video call."
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-md border-l-4 border-primary">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-900">{appointment.clientName}</p>
          <p className="text-sm text-gray-500">{service?.name || appointment.serviceId}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center text-sm text-gray-700">
            <Clock className="h-4 w-4 mr-1" />
            <span>{appointment.startTime} - {appointment.endTime}</span>
          </div>
          <div className="mt-1">
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(appointment.status)}`}>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-3 flex justify-end space-x-3">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleReschedule}
          disabled={isRescheduling || appointment.status === "cancelled" || appointment.status === "completed"}
        >
          Reschedule
        </Button>
        {appointment.status === "confirmed" && (
          <Button 
            size="sm"
            onClick={handleJoin}
          >
            Join
          </Button>
        )}
      </div>
    </div>
  );
}
