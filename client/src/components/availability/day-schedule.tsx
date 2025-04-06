import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Availability } from "@shared/schema";

interface DayProps {
  value: number;
  label: string;
}

interface DayScheduleProps {
  day: DayProps;
  availability?: Availability;
  onUpdate: (id: number, updates: any) => void;
}

// Generate time options in 30-minute increments
const generateTimeOptions = () => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const formattedHour = hour.toString().padStart(2, '0');
      const formattedMinute = minute.toString().padStart(2, '0');
      const time = `${formattedHour}:${formattedMinute}`;
      
      // Format for display (12-hour)
      const displayHour = hour % 12 || 12;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayTime = `${displayHour}:${formattedMinute} ${ampm}`;
      
      options.push({ value: time, label: displayTime });
    }
  }
  return options;
};

const timeOptions = generateTimeOptions();

export default function DaySchedule({ day, availability, onUpdate }: DayScheduleProps) {
  const [timeRanges, setTimeRanges] = useState<{ start: string; end: string }[]>(
    availability ? [{ start: availability.startTime, end: availability.endTime }] : []
  );
  
  const [isActive, setIsActive] = useState(availability?.isActive ?? false);

  // Handle checkbox change
  const handleActiveChange = (checked: boolean) => {
    setIsActive(checked);
    
    if (availability) {
      onUpdate(availability.id, { isActive: checked });
    } else {
      // Create new availability if it doesn't exist
      onUpdate(0, { 
        userId: 1, 
        dayOfWeek: day.value, 
        isActive: checked,
        startTime: "09:00",
        endTime: "17:00"
      });
    }
  };

  // Handle time change
  const handleTimeChange = (field: 'start' | 'end', value: string, index: number = 0) => {
    const newRanges = [...timeRanges];
    newRanges[index] = { ...newRanges[index], [field]: value };
    setTimeRanges(newRanges);
    
    if (availability) {
      onUpdate(availability.id, { 
        [field === 'start' ? 'startTime' : 'endTime']: value 
      });
    }
  };

  // Add another time range (not implemented in the backend yet)
  const handleAddHours = () => {
    setTimeRanges([...timeRanges, { start: "09:00", end: "17:00" }]);
  };

  return (
    <div className="flex items-center justify-between">
      <div className="w-1/5">
        <div className="flex items-center">
          <Checkbox 
            id={`day-${day.value}`} 
            checked={isActive}
            onCheckedChange={handleActiveChange}
          />
          <Label htmlFor={`day-${day.value}`} className="ml-2 text-sm text-gray-900">
            {day.label}
          </Label>
        </div>
      </div>
      
      {timeRanges.length > 0 ? (
        <div className="w-2/5 flex items-center space-x-2">
          <Select
            value={timeRanges[0].start}
            onValueChange={(value) => handleTimeChange('start', value)}
            disabled={!isActive}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Start time" />
            </SelectTrigger>
            <SelectContent>
              {timeOptions.map(option => (
                <SelectItem key={`start-${option.value}`} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <span className="text-gray-500">to</span>
          
          <Select
            value={timeRanges[0].end}
            onValueChange={(value) => handleTimeChange('end', value)}
            disabled={!isActive}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="End time" />
            </SelectTrigger>
            <SelectContent>
              {timeOptions.map(option => (
                <SelectItem key={`end-${option.value}`} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="w-2/5 text-gray-400 text-sm">
          Not available
        </div>
      )}
      
      <div className="w-1/5">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleAddHours}
          disabled={!isActive || timeRanges.length >= 1}
        >
          <Plus className="h-4 w-4 mr-1" /> Add Hours
        </Button>
      </div>
    </div>
  );
}
