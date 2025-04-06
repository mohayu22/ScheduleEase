import { format, parseISO, isValid } from "date-fns";

// Get today's date in YYYY-MM-DD format
export const getTodayDateString = (): string => {
  return format(new Date(), "yyyy-MM-dd");
};

// Format date for display
export const formatDateDisplay = (dateString: string): string => {
  if (!dateString) return "";
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return dateString;
    
    return format(date, "MMMM d, yyyy");
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};

// Format time in 12-hour format
export const formatTime12Hour = (timeString: string): string => {
  if (!timeString) return "";
  
  try {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    
    return `${displayHour}:${minutes} ${ampm}`;
  } catch (error) {
    console.error("Error formatting time:", error);
    return timeString;
  }
};

// Format time range
export const formatTimeRange = (startTime: string, endTime: string): string => {
  return `${formatTime12Hour(startTime)} - ${formatTime12Hour(endTime)}`;
};

// Get day of week (0-6) for a date
export const getDayOfWeek = (date: Date): number => {
  return date.getDay();
};

// Get day name from day number
export const getDayName = (day: number): string => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[day];
};

// Get short day name from day number
export const getShortDayName = (day: number): string => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[day];
};

// Calculate end time based on start time and duration (in minutes)
export const calculateEndTime = (startTime: string, durationMinutes: number): string => {
  const [hours, minutes] = startTime.split(":").map(Number);
  
  let totalMinutes = hours * 60 + minutes + durationMinutes;
  const newHours = Math.floor(totalMinutes / 60);
  const newMinutes = totalMinutes % 60;
  
  return `${String(newHours).padStart(2, "0")}:${String(newMinutes).padStart(2, "0")}`;
};
