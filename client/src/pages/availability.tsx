import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useUser } from "@/context/user-context";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import DaySchedule from "@/components/availability/day-schedule";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";

// Day names for mapping
const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" }
];

const BUFFER_OPTIONS = [
  { value: 0, label: "No buffer" },
  { value: 5, label: "5 minutes" },
  { value: 10, label: "10 minutes" },
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" }
];

const MIN_NOTICE_OPTIONS = [
  { value: 0, label: "No minimum" },
  { value: 60, label: "1 hour" },
  { value: 240, label: "4 hours" },
  { value: 1440, label: "24 hours" },
  { value: 2880, label: "48 hours" }
];

const MAX_ADVANCE_OPTIONS = [
  { value: 7, label: "1 week" },
  { value: 14, label: "2 weeks" },
  { value: 30, label: "30 days" },
  { value: 60, label: "60 days" },
  { value: 90, label: "90 days" }
];

export default function Availability() {
  const { user } = useUser();
  const { toast } = useToast();
  
  const [availabilityData, setAvailabilityData] = useState<any[]>([]);
  const [settings, setSettings] = useState({
    bufferBefore: 10,
    bufferAfter: 10,
    minNotice: 240,
    maxAdvance: 30
  });

  // Fetch availabilities
  const { data: availabilities, isLoading: availabilitiesLoading } = useQuery({
    queryKey: ['/api/users/1/availabilities'],
    enabled: !!user
  });

  // Fetch settings
  const { data: settingsData, isLoading: settingsLoading } = useQuery({
    queryKey: ['/api/users/1/settings'],
    enabled: !!user
  });

  // Update availability mutation
  const updateAvailabilityMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("PUT", `/api/availabilities/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/1/availabilities'] });
      toast({
        title: "Availability updated",
        description: "Your availability settings have been saved."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update availability settings.",
        variant: "destructive"
      });
    }
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("PUT", `/api/users/1/settings`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/1/settings'] });
      toast({
        title: "Settings updated",
        description: "Your buffer and booking window settings have been saved."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings.",
        variant: "destructive"
      });
    }
  });

  // Update availabilityData when availabilities are loaded
  useEffect(() => {
    if (availabilities) {
      setAvailabilityData(availabilities);
    }
  }, [availabilities]);

  // Update settings when settingsData is loaded
  useEffect(() => {
    if (settingsData) {
      setSettings(settingsData);
    }
  }, [settingsData]);

  // Update availability handler
  const handleUpdateAvailability = (id: number, updates: any) => {
    updateAvailabilityMutation.mutate({ id, ...updates });
  };

  // Save settings handler
  const handleSaveSettings = () => {
    updateSettingsMutation.mutate(settings);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Availability Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Configure when you're available for bookings.</p>
      </div>

      {/* Working Hours Section */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Working Hours</h3>
          <p className="mt-1 text-sm text-gray-500">Set your regular availability for each day of the week.</p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          {availabilitiesLoading ? (
            <div className="space-y-6">
              {[0, 1, 2, 3, 4, 5, 6].map(day => (
                <div key={day} className="flex items-center justify-between">
                  <Skeleton className="h-8 w-1/5" />
                  <Skeleton className="h-8 w-2/5" />
                  <Skeleton className="h-8 w-1/5" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {DAYS_OF_WEEK.map(day => {
                const dayAvailability = availabilityData.find(a => a.dayOfWeek === day.value);
                
                return (
                  <DaySchedule
                    key={day.value}
                    day={day}
                    availability={dayAvailability}
                    onUpdate={handleUpdateAvailability}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Buffer Times Section */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Buffer Times</h3>
          <p className="mt-1 text-sm text-gray-500">Set buffer time before and after appointments.</p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          {settingsLoading ? (
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="before-buffer">Time before appointments</Label>
                <Select
                  value={settings.bufferBefore.toString()}
                  onValueChange={(value) => setSettings({...settings, bufferBefore: parseInt(value)})}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select buffer time" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUFFER_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="after-buffer">Time after appointments</Label>
                <Select
                  value={settings.bufferAfter.toString()}
                  onValueChange={(value) => setSettings({...settings, bufferAfter: parseInt(value)})}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select buffer time" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUFFER_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Booking Window Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Booking Window</h3>
          <p className="mt-1 text-sm text-gray-500">Set how far in advance clients can book.</p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          {settingsLoading ? (
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="min-notice">Minimum notice</Label>
                <Select
                  value={settings.minNotice.toString()}
                  onValueChange={(value) => setSettings({...settings, minNotice: parseInt(value)})}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select minimum notice" />
                  </SelectTrigger>
                  <SelectContent>
                    {MIN_NOTICE_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="max-advance">Maximum advance</Label>
                <Select
                  value={settings.maxAdvance.toString()}
                  onValueChange={(value) => setSettings({...settings, maxAdvance: parseInt(value)})}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select maximum advance" />
                  </SelectTrigger>
                  <SelectContent>
                    {MAX_ADVANCE_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <Button 
          onClick={handleSaveSettings}
          disabled={updateSettingsMutation.isPending}
        >
          {updateSettingsMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </main>
  );
}
