import { useState } from "react";
import { useUser } from "@/context/user-context";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Settings() {
  const { user, updateUser } = useUser();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    timezone: "America/New_York",
    emailNotifications: {
      newBooking: true,
      reminder: true,
      cancellation: true,
      reschedule: true
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNotificationChange = (key: string) => {
    setFormData({
      ...formData,
      emailNotifications: {
        ...formData.emailNotifications,
        [key]: !formData.emailNotifications[key as keyof typeof formData.emailNotifications]
      }
    });
  };

  const handleSaveProfile = () => {
    // In a real app, this would call API to update user profile
    updateUser({ name: formData.name, email: formData.email });
    
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved."
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Notification settings updated",
      description: "Your notification preferences have been saved."
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase();
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your account and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={user?.profileImage} alt={user?.name} />
                  <AvatarFallback>{user?.name ? getInitials(user.name) : "User"}</AvatarFallback>
                </Avatar>
                <h3 className="text-lg font-medium text-gray-900">{user?.name}</h3>
                <p className="text-gray-500">{user?.email}</p>
              </div>
              
              <Separator className="my-4" />
              
              <nav className="flex flex-col space-y-1">
                <Button 
                  variant={activeTab === "profile" ? "default" : "ghost"} 
                  className="justify-start" 
                  onClick={() => setActiveTab("profile")}
                >
                  Profile
                </Button>
                <Button 
                  variant={activeTab === "notifications" ? "default" : "ghost"} 
                  className="justify-start" 
                  onClick={() => setActiveTab("notifications")}
                >
                  Notifications
                </Button>
                <Button 
                  variant={activeTab === "integrations" ? "default" : "ghost"} 
                  className="justify-start" 
                  onClick={() => setActiveTab("integrations")}
                >
                  Integrations
                </Button>
                <Button 
                  variant={activeTab === "plans" ? "default" : "ghost"} 
                  className="justify-start" 
                  onClick={() => setActiveTab("plans")}
                >
                  Plans & Billing
                </Button>
                <Button 
                  variant={activeTab === "security" ? "default" : "ghost"} 
                  className="justify-start" 
                  onClick={() => setActiveTab("security")}
                >
                  Security
                </Button>
              </nav>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>
                    Update your personal information and public profile.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <Label htmlFor="name">Name</Label>
                      <Input 
                        id="name" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleInputChange} 
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        value={formData.email} 
                        onChange={handleInputChange} 
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="timezone">Timezone</Label>
                      <select 
                        id="timezone" 
                        name="timezone" 
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                        value={formData.timezone}
                        onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                      >
                        <option value="America/New_York">Eastern Time (US & Canada)</option>
                        <option value="America/Chicago">Central Time (US & Canada)</option>
                        <option value="America/Denver">Mountain Time (US & Canada)</option>
                        <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                        <option value="Europe/London">London</option>
                        <option value="Europe/Paris">Paris</option>
                        <option value="Asia/Tokyo">Tokyo</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="avatar">Profile Picture</Label>
                      <div className="mt-1 flex items-center">
                        <Avatar className="h-12 w-12 mr-4">
                          <AvatarImage src={user?.profileImage} alt={user?.name} />
                          <AvatarFallback>{user?.name ? getInitials(user.name) : "User"}</AvatarFallback>
                        </Avatar>
                        <Button variant="outline">Change</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-end">
                  <Button onClick={handleSaveProfile}>Save Changes</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>
                    Configure how and when you receive notifications.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <Label className="mb-1">New Booking Notification</Label>
                        <span className="text-gray-500 text-sm">Receive an email when someone books an appointment</span>
                      </div>
                      <Switch 
                        checked={formData.emailNotifications.newBooking} 
                        onCheckedChange={() => handleNotificationChange('newBooking')} 
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <Label className="mb-1">Appointment Reminders</Label>
                        <span className="text-gray-500 text-sm">Get reminded about upcoming appointments</span>
                      </div>
                      <Switch 
                        checked={formData.emailNotifications.reminder} 
                        onCheckedChange={() => handleNotificationChange('reminder')} 
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <Label className="mb-1">Cancellation Notification</Label>
                        <span className="text-gray-500 text-sm">Get notified when an appointment is cancelled</span>
                      </div>
                      <Switch 
                        checked={formData.emailNotifications.cancellation} 
                        onCheckedChange={() => handleNotificationChange('cancellation')} 
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <Label className="mb-1">Reschedule Notification</Label>
                        <span className="text-gray-500 text-sm">Get notified when an appointment is rescheduled</span>
                      </div>
                      <Switch 
                        checked={formData.emailNotifications.reschedule} 
                        onCheckedChange={() => handleNotificationChange('reschedule')} 
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-end">
                  <Button onClick={handleSaveNotifications}>Save Preferences</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="integrations">
              <Card>
                <CardHeader>
                  <CardTitle>Calendar Integrations</CardTitle>
                  <CardDescription>
                    Connect your calendar services to sync appointments.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-md font-medium">Google Calendar</h3>
                        <p className="text-gray-500 text-sm">Sync your Google Calendar</p>
                      </div>
                      <Button variant="outline">Connect</Button>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-md font-medium">Microsoft Outlook</h3>
                        <p className="text-gray-500 text-sm">Sync your Outlook Calendar</p>
                      </div>
                      <Button variant="outline">Connect</Button>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-md font-medium">Apple Calendar</h3>
                        <p className="text-gray-500 text-sm">Sync your Apple Calendar</p>
                      </div>
                      <Button variant="outline">Connect</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="plans">
              <Card>
                <CardHeader>
                  <CardTitle>Plans & Billing</CardTitle>
                  <CardDescription>
                    Manage your subscription and billing details.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-6">
                    <h3 className="text-md font-medium text-primary mb-1">Free Plan</h3>
                    <p className="text-gray-600 text-sm mb-4">You're currently on the free plan with basic features.</p>
                    <Button>Upgrade to Pro</Button>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-md font-medium">Pro Plan Features</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Unlimited appointments</li>
                      <li>• Custom branding</li>
                      <li>• Email reminders</li>
                      <li>• Calendar integrations</li>
                      <li>• Advanced analytics</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your password and account security.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-end">
                  <Button>Update Password</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
