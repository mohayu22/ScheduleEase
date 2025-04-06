import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, addDays, isBefore, isAfter, parseISO, startOfDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Form schema
const bookingFormSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().optional(),
  notes: z.string().optional(),
  serviceId: z.string({ required_error: "Please select a service" }),
  date: z.date({ required_error: "Please select a date" }),
  time: z.string({ required_error: "Please select a time" })
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

// Time slots (would normally be generated based on availability)
const generateTimeSlots = (start: string, end: string, interval: number = 60) => {
  const timeSlots: string[] = [];
  const [startHour, startMinute] = start.split(':').map(Number);
  const [endHour, endMinute] = end.split(':').map(Number);
  
  let currentHour = startHour;
  let currentMinute = startMinute;
  
  while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
    const formattedHour = currentHour.toString().padStart(2, '0');
    const formattedMinute = currentMinute.toString().padStart(2, '0');
    timeSlots.push(`${formattedHour}:${formattedMinute}`);
    
    currentMinute += interval;
    if (currentMinute >= 60) {
      currentHour += Math.floor(currentMinute / 60);
      currentMinute %= 60;
    }
  }
  
  return timeSlots;
};

export default function PublicBooking() {
  const { username } = useParams();
  const [, navigate] = useLocation();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isBookingComplete, setIsBookingComplete] = useState(false);
  
  // Get user
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/users', username],
    queryFn: async () => {
      const res = await fetch(`/api/users/1`); // In a real app, we'd use username
      if (!res.ok) throw new Error('User not found');
      return res.json();
    }
  });

  // Get services
  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ['/api/users/1/services'],
    enabled: !!user
  });

  // Get user settings
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['/api/users/1/settings'],
    enabled: !!user
  });

  // Get availabilities
  const { data: availabilities, isLoading: availabilitiesLoading } = useQuery({
    queryKey: ['/api/users/1/availabilities'],
    enabled: !!user
  });

  // Initialize form
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      notes: "",
      serviceId: "",
      date: undefined,
      time: ""
    }
  });

  // Handle date selection
  useEffect(() => {
    if (selectedDate && availabilities) {
      // Get day of week (0-6, where 0 is Sunday)
      const dayOfWeek = selectedDate.getDay();
      
      // Find availability for this day
      const dayAvailability = availabilities.find(a => a.dayOfWeek === dayOfWeek && a.isActive);
      
      if (dayAvailability) {
        const slots = generateTimeSlots(dayAvailability.startTime, dayAvailability.endTime, 60);
        setTimeSlots(slots);
      } else {
        setTimeSlots([]);
      }
      
      // Clear time selection if date changes
      form.setValue('time', '');
    }
  }, [selectedDate, availabilities, form]);

  // Submit booking
  const onSubmit = async (data: BookingFormValues) => {
    try {
      const serviceId = parseInt(data.serviceId);
      const service = services.find(s => s.id === serviceId);
      
      if (!service) {
        toast({
          title: "Error",
          description: "Service not found",
          variant: "destructive"
        });
        return;
      }
      
      // Calculate end time (add service duration to start time)
      const [hours, minutes] = data.time.split(':').map(Number);
      const startDate = new Date(data.date);
      startDate.setHours(hours, minutes, 0, 0);
      
      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + service.duration);
      
      const formattedDate = format(data.date, 'yyyy-MM-dd');
      const startTime = data.time;
      const endTime = format(endDate, 'HH:mm');
      
      // Prepare appointment data
      const appointmentData = {
        userId: user.id,
        serviceId,
        clientName: `${data.firstName} ${data.lastName}`,
        clientEmail: data.email,
        clientPhone: data.phone || null,
        notes: data.notes || null,
        date: formattedDate,
        startTime,
        endTime,
        status: 'confirmed'
      };
      
      // Create appointment
      await apiRequest("POST", "/api/appointments", appointmentData);
      
      // Show success and reset
      setIsBookingComplete(true);
      form.reset();
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/users/1/appointments'] });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to book appointment. Please try again.",
        variant: "destructive"
      });
      console.error("Booking error:", error);
    }
  };

  // Date constraints
  const today = new Date();
  const minDate = startOfDay(today);
  
  let maxDate = addDays(today, 30); // Default to 30 days
  if (settings?.maxAdvance) {
    maxDate = addDays(today, settings.maxAdvance);
  }

  // Determine if a date is bookable
  const isDateDisabled = (date: Date) => {
    // Check if date is before min date or after max date
    if (isBefore(date, minDate) || isAfter(date, maxDate)) {
      return true;
    }
    
    // Check if the day of week is available
    if (availabilities) {
      const dayOfWeek = date.getDay();
      const dayAvailability = availabilities.find(a => a.dayOfWeek === dayOfWeek);
      
      // If no availability found or if it's not active, disable the date
      if (!dayAvailability || !dayAvailability.isActive) {
        return true;
      }
    }
    
    return false;
  };

  // Format price as currency
  const formatPrice = (price: number | null | undefined) => {
    if (price == null) return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price / 100);
  };

  // Format time for display
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Navigate through steps
  const goToNextStep = () => {
    // Validate current step
    if (currentStep === 1) {
      const serviceId = form.getValues('serviceId');
      if (!serviceId) {
        form.setError('serviceId', { 
          type: 'manual', 
          message: 'Please select a service to continue' 
        });
        return;
      }
    } else if (currentStep === 2) {
      const date = form.getValues('date');
      const time = form.getValues('time');
      if (!date) {
        form.setError('date', { 
          type: 'manual', 
          message: 'Please select a date to continue' 
        });
        return;
      }
      if (!time) {
        form.setError('time', { 
          type: 'manual', 
          message: 'Please select a time to continue' 
        });
        return;
      }
    }
    
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const goToPrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // If booking complete, show confirmation
  if (isBookingComplete) {
    return (
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="shadow-lg border-green-100">
          <CardHeader className="bg-green-50 text-green-700">
            <CardTitle className="text-center">Appointment Confirmed!</CardTitle>
            <CardDescription className="text-center text-green-600">
              Your appointment has been scheduled successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 text-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-16 w-16 text-green-500 mx-auto mb-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
            <p className="text-gray-700">
              We've sent a confirmation email with all the details.
            </p>
            <p className="text-gray-500 mt-2">
              Add this appointment to your calendar to make sure you don't miss it!
            </p>
            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
              <Button variant="outline">Add to Google Calendar</Button>
              <Button variant="outline">Add to Apple Calendar</Button>
            </div>
          </CardContent>
          <CardFooter className="justify-center">
            <Button 
              variant="default" 
              onClick={() => {
                setIsBookingComplete(false);
                navigate(`/book/${username}`);
              }}
            >
              Book Another Appointment
            </Button>
          </CardFooter>
        </Card>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="shadow-md overflow-hidden">
        <CardHeader className="bg-primary text-white text-center">
          {userLoading ? (
            <>
              <Skeleton className="h-6 w-1/2 mx-auto bg-primary-foreground/20" />
              <Skeleton className="h-8 w-3/4 mx-auto mt-2 bg-primary-foreground/20" />
              <Skeleton className="h-4 w-1/3 mx-auto mt-1 bg-primary-foreground/20" />
            </>
          ) : (
            <>
              <CardTitle className="text-2xl">Book an Appointment with</CardTitle>
              <h1 className="text-2xl font-bold">{user?.name}</h1>
              <CardDescription className="text-primary-foreground/80">
                Select a service and time that works for you
              </CardDescription>
            </>
          )}
        </CardHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs value={`step-${currentStep}`} className="w-full">
              {/* Step 1: Service Selection */}
              <TabsContent value="step-1" className="m-0">
                <CardContent className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Select Service</h3>
                  
                  {servicesLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="border rounded-lg p-4">
                          <Skeleton className="h-5 w-1/3 mb-2" />
                          <Skeleton className="h-4 w-2/3 mb-1" />
                          <Skeleton className="h-4 w-1/4 mt-2" />
                        </div>
                      ))}
                    </div>
                  ) : services?.length > 0 ? (
                    <FormField
                      control={form.control}
                      name="serviceId"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <RadioGroup 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            {services.map(service => (
                              <div key={service.id} className="relative border rounded-lg p-4 flex hover:border-primary cursor-pointer">
                                <RadioGroupItem 
                                  value={service.id.toString()} 
                                  id={`service-${service.id}`} 
                                  className="mt-1"
                                />
                                <div className="ml-3 flex justify-between w-full">
                                  <Label 
                                    htmlFor={`service-${service.id}`} 
                                    className="text-sm font-medium text-gray-700 cursor-pointer"
                                  >
                                    <div>{service.name}</div>
                                    <p className="text-gray-500 text-sm">{service.duration} minutes - {service.description}</p>
                                  </Label>
                                  {service.price && (
                                    <span className="text-gray-900 font-medium">
                                      {formatPrice(service.price)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </RadioGroup>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500">No services available</p>
                    </div>
                  )}
                </CardContent>
              </TabsContent>

              {/* Step 2: Date & Time Selection */}
              <TabsContent value="step-2" className="m-0">
                <CardContent className="p-6 border-b border-gray-200">
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Select Date</h3>
                    
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <div className="rounded-md border shadow-sm">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                field.onChange(date);
                                setSelectedDate(date);
                              }}
                              disabled={isDateDisabled}
                              className="w-full"
                            />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Select Time {selectedDate && `- ${format(selectedDate, 'MMMM d, yyyy')}`}
                    </h3>
                    
                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {timeSlots.length > 0 ? (
                              timeSlots.map(time => (
                                <Button
                                  key={time}
                                  type="button"
                                  variant={field.value === time ? "default" : "outline"}
                                  className="text-sm"
                                  onClick={() => field.onChange(time)}
                                >
                                  {formatTime(time)}
                                </Button>
                              ))
                            ) : selectedDate ? (
                              <div className="col-span-full text-center py-4">
                                <p className="text-gray-500">No available times on this date</p>
                              </div>
                            ) : (
                              <div className="col-span-full text-center py-4">
                                <p className="text-gray-500">Select a date to see available times</p>
                              </div>
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </TabsContent>

              {/* Step 3: Contact Information */}
              <TabsContent value="step-3" className="m-0">
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Your Information</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First name</FormLabel>
                            <FormControl>
                              <Input placeholder="John" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last name</FormLabel>
                            <FormControl>
                              <Input placeholder="Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="john.doe@example.com" type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone number (optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="(555) 123-4567" type="tel" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional notes (optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any additional information you'd like to share before the appointment"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </TabsContent>
            </Tabs>

            {/* Navigation Buttons */}
            <CardFooter className={cn(
              "justify-between bg-gray-50 border-t border-gray-200 p-4",
              currentStep === 1 && "justify-end"
            )}>
              {currentStep > 1 && (
                <Button type="button" variant="outline" onClick={goToPrevStep}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}
              
              {currentStep < 3 ? (
                <Button type="button" onClick={goToNextStep}>
                  Next Step
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit">Book Appointment</Button>
              )}
            </CardFooter>
          </form>
        </Form>
      </Card>
      
      {/* Step Indicator */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-900">Progress</span>
          <span className="text-sm text-gray-500">Step {currentStep} of 3</span>
        </div>
        <div className="overflow-hidden rounded-full bg-gray-200">
          <div 
            className="h-2 rounded-full bg-primary transition-all" 
            style={{ width: `${(currentStep / 3) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span className={currentStep >= 1 ? "text-primary font-medium" : ""}>Service</span>
          <span className={currentStep >= 2 ? "text-primary font-medium" : ""}>Date & Time</span>
          <span className={currentStep >= 3 ? "text-primary font-medium" : ""}>Your Details</span>
        </div>
      </div>
    </main>
  );
}
