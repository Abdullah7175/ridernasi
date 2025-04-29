import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateProfile } from "@shared/schema";
import { z } from "zod";
import { 
  LogOut, 
  Camera, 
  Lock, 
  Bell, 
  Globe, 
  ChevronRight, 
  HeadphonesIcon, 
  HelpCircle,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const updateProfileSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.password && !data.confirmPassword) return false;
  if (!data.password && data.confirmPassword) return false;
  if (data.password && data.confirmPassword && data.password !== data.confirmPassword) return false;
  return true;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type UpdateProfileForm = z.infer<typeof updateProfileSchema>;

export default function ProfilePage() {
  const { user, logoutMutation, updateProfileMutation } = useAuth();
  const { toast } = useToast();
  
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  const form = useForm<UpdateProfileForm>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: UpdateProfileForm) => {
    if (data.password) {
      updateProfileMutation.mutate({ password: data.password }, {
        onSuccess: () => {
          toast({
            title: "Password Updated",
            description: "Your password has been successfully updated.",
          });
          setIsPasswordDialogOpen(false);
          form.reset();
        },
      });
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleChangeProfilePhoto = () => {
    // In a real app, we would open a file picker here
    toast({
      title: "Feature Not Available",
      description: "This feature is not available in the demo version.",
    });
  };

  const handleChangePassword = () => {
    setIsPasswordDialogOpen(true);
  };

  const handleToggleNotifications = (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    // In a real app, we would send this preference to the server
    toast({
      title: `Notifications ${enabled ? 'Enabled' : 'Disabled'}`,
      description: `You will ${enabled ? 'now' : 'no longer'} receive notifications for new orders.`,
    });
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <header className="bg-white p-4 shadow-sm flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-lg font-semibold text-[#1F2937]">Profile</h1>
        <button 
          className="text-[#4B5563]" 
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          {logoutMutation.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <LogOut className="h-5 w-5" />
          )}
        </button>
      </header>

      <div className="p-4">
        {/* Profile Info */}
        <Card className="mb-6">
          <CardContent className="p-4 text-center">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border-4 border-white shadow mx-auto overflow-hidden">
                {user.profileImage ? (
                  <img 
                    src={user.profileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                )}
              </div>
              <button 
                className="absolute bottom-0 right-0 bg-[#22C55E] text-white rounded-full p-1.5 shadow-md"
                onClick={handleChangeProfilePhoto}
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <h2 className="text-xl font-semibold text-[#1F2937]">{user.name}</h2>
            <p className="text-[#4B5563]">Rider ID: {user.username}</p>
            <p className="text-[#4B5563]">Vendor: {user.vendorId ? `Vendor ${user.vendorId}` : 'Nasi Cleaning'}</p>
          </CardContent>
        </Card>
        
        {/* Account Settings */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <h3 className="font-medium text-[#1F2937] mb-4">Account Settings</h3>
            
            <div className="space-y-3">
              <button 
                className="flex justify-between items-center w-full py-3 px-1 border-b border-[#F3F4F6]"
                onClick={handleChangePassword}
              >
                <div className="flex items-center">
                  <Lock className="h-5 w-5 text-[#4B5563] mr-3" />
                  <span className="font-medium text-[#1F2937]">Change Password</span>
                </div>
                <ChevronRight className="h-5 w-5 text-[#4B5563]" />
              </button>
              
              <div className="flex justify-between items-center w-full py-3 px-1 border-b border-[#F3F4F6]">
                <div className="flex items-center">
                  <Bell className="h-5 w-5 text-[#4B5563] mr-3" />
                  <span className="font-medium text-[#1F2937]">Notifications</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-[#4B5563] text-sm">
                    {notificationsEnabled ? "On" : "Off"}
                  </span>
                  <Switch 
                    checked={notificationsEnabled} 
                    onCheckedChange={handleToggleNotifications} 
                  />
                </div>
              </div>
              
              <button className="flex justify-between items-center w-full py-3 px-1 border-b border-[#F3F4F6]">
                <div className="flex items-center">
                  <Globe className="h-5 w-5 text-[#4B5563] mr-3" />
                  <span className="font-medium text-[#1F2937]">Language</span>
                </div>
                <div className="flex items-center">
                  <span className="text-[#4B5563] mr-2">English</span>
                  <ChevronRight className="h-5 w-5 text-[#4B5563]" />
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
        
        {/* Support Section */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-[#1F2937] mb-4">Support</h3>
            
            <div className="space-y-3">
              <button className="flex justify-between items-center w-full py-3 px-1 border-b border-[#F3F4F6]">
                <div className="flex items-center">
                  <HeadphonesIcon className="h-5 w-5 text-[#4B5563] mr-3" />
                  <span className="font-medium text-[#1F2937]">Contact Support</span>
                </div>
                <ChevronRight className="h-5 w-5 text-[#4B5563]" />
              </button>
              
              <button className="flex justify-between items-center w-full py-3 px-1 border-b border-[#F3F4F6]">
                <div className="flex items-center">
                  <HelpCircle className="h-5 w-5 text-[#4B5563] mr-3" />
                  <span className="font-medium text-[#1F2937]">FAQ</span>
                </div>
                <ChevronRight className="h-5 w-5 text-[#4B5563]" />
              </button>
              
              <div className="pt-2 text-center text-sm text-[#4B5563]">
                <p>App Version 1.0.0</p>
                <p className="mt-1">© 2023 Nasi Cleaning</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Enter new password" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Confirm new password" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsPasswordDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
