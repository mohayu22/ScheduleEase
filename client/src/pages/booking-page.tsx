import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useUser } from "@/context/user-context";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import ServiceOption from "@/components/booking/service-option";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Copy, ExternalLink } from "lucide-react";
import { insertServiceSchema } from "@shared/schema";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const serviceFormSchema = insertServiceSchema.omit({ userId: true }).extend({
  price: z.string().optional(),
  duration: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Duration must be a number",
  }),
});

type ServiceFormValues = z.infer<typeof serviceFormSchema>;

export default function BookingPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("services");

  // Setup form
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: "",
      description: "",
      duration: "60",
      price: ""
    },
  });

  // Fetch services
  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ['/api/users/1/services'],
    enabled: !!user
  });

  // Create service mutation
  const createServiceMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/services", {
        ...data,
        userId: 1,
        price: data.price ? parseInt(data.price) * 100 : null, // Convert to cents
        duration: parseInt(data.duration)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/1/services'] });
      toast({
        title: "Service created",
        description: "Your new service has been added to your booking page."
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create service.",
        variant: "destructive"
      });
    }
  });

  // Delete service mutation
  const deleteServiceMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/services/${id}`, null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/1/services'] });
      toast({
        title: "Service deleted",
        description: "The service has been removed from your booking page."
      });
    }
  });

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

  const handleDeleteService = (id: number) => {
    if (confirm("Are you sure you want to delete this service?")) {
      deleteServiceMutation.mutate(id);
    }
  };

  const onSubmit = (data: ServiceFormValues) => {
    createServiceMutation.mutate(data);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Booking Page</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your booking page and services.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Tabs defaultValue="services" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="questions">Additional Questions</TabsTrigger>
            </TabsList>

            <TabsContent value="services">
              <Card>
                <CardHeader>
                  <CardTitle>Manage Services</CardTitle>
                  <CardDescription>
                    Create and edit the services you offer for booking.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Current Services List */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Your Services</h3>
                    
                    {servicesLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="border rounded-lg p-4">
                            <Skeleton className="h-5 w-1/3 mb-2" />
                            <Skeleton className="h-4 w-2/3 mb-1" />
                            <div className="flex justify-between mt-3">
                              <Skeleton className="h-4 w-20" />
                              <Skeleton className="h-8 w-16" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : services?.length > 0 ? (
                      <div className="space-y-4">
                        {services.map(service => (
                          <ServiceOption 
                            key={service.id}
                            service={service}
                            onDelete={() => handleDeleteService(service.id)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 border rounded-lg border-dashed">
                        <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">No services created yet.</p>
                        <p className="text-gray-500 text-sm">Add your first service below.</p>
                      </div>
                    )}
                  </div>

                  {/* Add New Service Form */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Service</h3>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Service Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Career Coaching Session" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Describe your service..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="duration"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Duration (minutes)</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="60" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Price (USD, optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. 120" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="pt-2">
                          <Button 
                            type="submit" 
                            disabled={createServiceMutation.isPending}
                          >
                            {createServiceMutation.isPending ? "Creating..." : "Add Service"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance Settings</CardTitle>
                  <CardDescription>
                    Customize how your booking page looks to clients.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="page-title">Page Title</Label>
                      <Input id="page-title" defaultValue={`Book with ${user?.name || 'Me'}`} className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="page-description">Page Description</Label>
                      <Textarea 
                        id="page-description" 
                        defaultValue="Select a service and a time slot that works for you."
                        className="mt-1" 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <Label htmlFor="show-prices" className="mb-1">Show Prices</Label>
                        <span className="text-gray-500 text-sm">Display service prices on your booking page</span>
                      </div>
                      <Switch id="show-prices" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <Label htmlFor="show-duration" className="mb-1">Show Duration</Label>
                        <span className="text-gray-500 text-sm">Display service duration on your booking page</span>
                      </div>
                      <Switch id="show-duration" defaultChecked />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-end">
                  <Button>Save Changes</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="questions">
              <Card>
                <CardHeader>
                  <CardTitle>Additional Questions</CardTitle>
                  <CardDescription>
                    Customize the questions asked when someone books an appointment.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <Label htmlFor="require-phone" className="mb-1">Require Phone Number</Label>
                        <span className="text-gray-500 text-sm">Ask clients for their phone number</span>
                      </div>
                      <Switch id="require-phone" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <Label htmlFor="require-notes" className="mb-1">Allow Notes</Label>
                        <span className="text-gray-500 text-sm">Let clients add notes with their booking</span>
                      </div>
                      <Switch id="require-notes" defaultChecked />
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-md font-medium text-gray-900 mb-4">Custom Questions</h4>
                      <div className="text-center py-8 border rounded-lg border-dashed">
                        <p className="text-gray-500">No custom questions added yet.</p>
                        <Button variant="outline" className="mt-2">Add Custom Question</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-end">
                  <Button>Save Changes</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Booking Link</CardTitle>
              <CardDescription>
                Share this link with your clients so they can book appointments with you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-3 rounded-md flex items-center justify-between">
                <code className="text-sm text-gray-800 truncate">
                  {user ? `${window.location.origin}/book/${user.username}` : 'Loading...'}
                </code>
                <Button variant="ghost" size="sm" onClick={handleCopyBookingLink}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="mt-4">
                <Button variant="outline" className="w-full" onClick={handleCopyBookingLink}>
                  <Copy className="h-4 w-4 mr-2" /> Copy Link
                </Button>
              </div>
              
              <div className="mt-2">
                <Button variant="outline" className="w-full" asChild>
                  <a href={user ? `/book/${user.username}` : '#'} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" /> Preview Page
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Create different services for different types of meetings</li>
                <li>• Set buffer times between appointments in Availability settings</li>
                <li>• Keep service names short and descriptive</li>
                <li>• Include pricing information if applicable</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
