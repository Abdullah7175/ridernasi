import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginCredentials } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

export default function LoginPage() {
  const { loginMutation, user } = useAuth();
  const [, navigate] = useLocation();
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/orders');
    }
  }, [user, navigate]);

  const form = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  async function onSubmit(data: LoginCredentials) {
    loginMutation.mutate(data, {
      onSuccess: () => {
        navigate('/orders');
      }
    });
  }

  return (
    <div className="page-container flex flex-col items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-md shadow-md">
        <CardContent className="p-6">
          <div className="text-center mb-8">
            <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 9v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9"/>
                <path d="M9 22V12h6v10M2 10.6L12 2l10 8.6"/>
              </svg>
            </div>
            <h1 className="mt-4 text-2xl font-bold text-[#1F2937]">Nasi Cleaning</h1>
            <p className="text-[#4B5563]">Delivery Rider Portal</p>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-[#4B5563]">Rider ID</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your Rider ID" 
                        className="p-3 border border-[#9CA3AF] rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-[#4B5563]">Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Enter your password" 
                        className="p-3 border border-[#9CA3AF] rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full py-3 bg-[#22C55E] hover:bg-[#15803D] transition duration-300 text-white font-semibold rounded-lg shadow-md focus:outline-none"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Sign In
                </Button>
              </div>
              
              <div className="text-center mt-4">
                <p className="text-sm text-[#4B5563]">
                  Forgot password? Contact your vendor admin.
                </p>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
