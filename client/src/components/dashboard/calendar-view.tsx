import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import type { Appointment } from "@shared/schema";

interface CalendarViewProps {
  currentDate: Date;
  appointments: Appointment[];
  isLoading: boolean;
}

export default function CalendarView({ currentDate, appointments, isLoading }: CalendarViewProps) {
  const [calendar, setCalendar] = useState<Date[][]>([]);

  // Generate calendar dates
  useEffect(() => {
    const generateCalendar = () => {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(monthStart);
      const startDate = startOfWeek(monthStart);
      const endDate = endOfWeek(monthEnd);

      const rows: Date[][] = [];
      let days: Date[] = [];
      let day = startDate;

      while (day <= endDate) {
        for (let i = 0; i < 7; i++) {
          days.push(day);
          day = addDays(day, 1);
        }
        rows.push(days);
        days = [];
      }

      setCalendar(rows);
    };

    generateCalendar();
  }, [currentDate]);

  // Get appointments for a specific day
  const getDayAppointments = (day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    return appointments.filter(app => app.date === dayStr);
  };

  // Format appointment time for display
  const formatAppointmentTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-7 gap-px bg-gray-200 text-center text-xs font-semibold text-gray-700">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
            <div key={index} className="bg-white py-2">{day}</div>
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="calendar-container">
      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 text-center text-xs font-semibold text-gray-700">
        <div className="bg-white py-2">Sun</div>
        <div className="bg-white py-2">Mon</div>
        <div className="bg-white py-2">Tue</div>
        <div className="bg-white py-2">Wed</div>
        <div className="bg-white py-2">Thu</div>
        <div className="bg-white py-2">Fri</div>
        <div className="bg-white py-2">Sat</div>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {calendar.map((week, rowIndex) => (
          week.map((day, colIndex) => {
            const dayAppointments = getDayAppointments(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());
            
            // Determine cell background
            let cellClass = "bg-white";
            if (!isCurrentMonth) cellClass = "bg-gray-50";
            
            // Determine date text style
            let dateClass = "text-gray-700";
            if (!isCurrentMonth) dateClass = "text-gray-400";
            
            return (
              <div 
                key={`${rowIndex}-${colIndex}`} 
                className={`${cellClass} h-24 sm:h-32 p-2 relative`}
              >
                {isToday ? (
                  <div className="text-white text-sm rounded-full bg-primary h-6 w-6 flex items-center justify-center absolute top-2 left-2">
                    {format(day, 'd')}
                  </div>
                ) : (
                  <div className={`${dateClass} text-sm`}>
                    {format(day, 'd')}
                  </div>
                )}
                
                {isToday && <div className="mt-7"></div>}
                
                <div className={`${isToday ? 'mt-0' : 'mt-1'} overflow-y-auto max-h-[80%]`}>
                  {dayAppointments.slice(0, 3).map((appointment, index) => (
                    <div 
                      key={appointment.id} 
                      className="text-xs p-1 rounded bg-primary text-white truncate mt-1"
                      title={`${appointment.clientName} - ${appointment.serviceId}`}
                    >
                      {formatAppointmentTime(appointment.startTime)} - {appointment.clientName.split(' ')[0]}
                    </div>
                  ))}
                  {dayAppointments.length > 3 && (
                    <div className="text-xs text-gray-500 mt-1 text-center">
                      +{dayAppointments.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ))}
      </div>
    </div>
  );
}
