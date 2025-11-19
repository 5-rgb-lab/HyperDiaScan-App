import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Loader2, User, Heart, UserPlus, Info, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signUpSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    age: z.number().min(10).max(120),
    biologicalSex: z.enum(['Male', 'Female', 'Other']),
    heightCm: z.number().min(50).max(250),
    weightKg: z.number().min(20).max(300),
    primaryCondition: z.enum(['diabetes', 'hypertension', 'both']),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignInData = z.infer<typeof signInSchema>;
type SignUpData = z.infer<typeof signUpSchema>;

export default function AuthForm() {
  const { signIn, signUp, resetPassword } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('');

  const signInForm = useForm<SignInData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const signUpForm = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      age: 18,
      biologicalSex: 'Male',
      heightCm: 170,
      weightKg: 70,
      primaryCondition: 'diabetes',
    },
  });

  const onSignIn = async (data: SignInData) => {
    setIsLoading(true);
    setLoadingMessage('Signing you in...');
    try {
      await signIn(data.email, data.password);
      toast({ title: 'Welcome back!', description: 'Signed in successfully.' });
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Sign in failed',
        description: error?.message || 'Invalid credentials.',
      });
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const onSignUp = async (data: SignUpData) => {
    setIsLoading(true);
    setLoadingMessage('Creating your account...');
    try {
      // Build profileData to match createUserProfile expectations
      const profileData = {
        primaryCondition: data.primaryCondition,
        demographics: {
          age: data.age,
          biologicalSex: data.biologicalSex,
          heightCm: data.heightCm,
          weightKg: data.weightKg,
          activityLevel: 'Sedentary' as const // default value
        }
      };

      await signUp(data.email, data.password, data.name, profileData);

      // Show success state instead of immediately switching tabs
      setRegistrationSuccess(true);
      setRegisteredEmail(data.email);
      
      toast({
        title: 'Account created successfully!',
        description: 'Please sign in with your credentials.',
      });

      // Reset the sign-up form
      signUpForm.reset();

    } catch (error: any) {
      console.error('Sign up error:', error);
      toast({
        variant: 'destructive',
        title: 'Sign up failed',
        description: error?.message || 'Please check your info and try again.',
      });
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleSwitchToSignIn = () => {
    setRegistrationSuccess(false);
    setActiveTab('signin');
    if (registeredEmail) {
      signInForm.setValue('email', registeredEmail);
    }
  };

  // If registration was successful, show a success message
  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl shadow-lg">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Registration Complete!
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="space-y-2">
              <p className="text-muted-foreground">
                Your account has been created successfully.
              </p>
              <p className="text-sm text-muted-foreground">
                Please sign in to continue to your dashboard.
              </p>
            </div>
            <Button 
              onClick={handleSwitchToSignIn} 
              className="w-full"
            >
              Sign In Now
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 relative">
      {isLoading && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-6">
          <div className="relative w-32 h-32">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-900"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>
            <div
              className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-500 animate-spin"
              style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
            ></div>
            <div
              className="absolute inset-4 rounded-full border-4 border-transparent border-t-teal-500 animate-spin"
              style={{ animationDuration: '1s' }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="w-16 h-16 heartbeat"
                viewBox="0 0 512 512"
                fill="url(#grad1)"
              >
                <defs>
                  <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4ef2c3"/>
                    <stop offset="100%" stopColor="#3aa9ff"/>
                  </linearGradient>
                </defs>
                <path d="M496 232h-73.4l-40.9-102.4c-4.8-12.1-16.5-19.6-29.4-19.6s-24.5 7.6-29.3 19.6l-71.5 179.2-45.8-91.7c-5.3-10.5-15.9-17.1-27.7-17.1-11.8 0-22.4 6.6-27.7 17.2l-37.7 75.1H16c-8.8 0-16 7.2-16 16s7.2 16 16 16h117.6c12 0 22.8-6.9 28-17.8l23.8-47.4 46 92c5.2 10.3 15.5 16.9 27.1 17.1h.6c11.4 0 21.8-6.7 26.9-17.4l70.9-177.2 27.4 68.6c4.8 12.1 16.5 19.6 29.4 19.6H496c8.8 0 16-7.2 16-16s-7.2-16-16-16z"/>
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            {loadingMessage || 'Loading...'}
          </h3>
          <p className="text-sm text-gray-700">Please wait a moment</p>
        </div>
      )}
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl shadow-lg">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              HyperDiaSense
            </CardTitle>
          </div>
          <p className="text-muted-foreground">Sign in or create an account</p>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {/* --- Sign In --- */}
            <TabsContent value="signin">
              <Form {...signInForm}>
                <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-4">
                  <FormField control={signInForm.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} type="email" /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormField control={signInForm.control} name="password" render={({ field }) => (
                    <FormItem><FormLabel>Password</FormLabel><FormControl><Input {...field} type="password" /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      className="px-0 font-normal text-xs text-muted-foreground hover:text-primary"
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                    >
                      Forgot password?
                    </Button>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Sign In
                  </Button>
                </form>
              </Form>

              <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Reset Password</DialogTitle>
                    <DialogDescription>
                      Enter your email address and we'll send you a link to reset your password.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="reset-email" className="text-right">
                        Email
                      </Label>
                      <Input
                        id="reset-email"
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setShowForgotPassword(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={async () => {
                        try {
                          setIsLoading(true);
                          await resetPassword(resetEmail);
                          toast({
                            title: "Reset link sent",
                            description: "Check your email for password reset instructions.",
                          });
                          setShowForgotPassword(false);
                          setResetEmail('');
                        } catch (error: any) {
                          toast({
                            variant: "destructive",
                            title: "Error",
                            description: error?.message || "Failed to send reset link. Please try again.",
                          });
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      disabled={!resetEmail || isLoading}
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Send Reset Link
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* --- Sign Up --- */}
            <TabsContent value="signup">
              <Form {...signUpForm}>
                <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-4">
                  {/* Basic Info */}
                  <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-lg shadow-sm border">
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" />
                      Basic Information
                    </h4>
                    <p className="text-xs text-muted-foreground mb-3">Used to personalize your experience. We'll keep this private.</p>
                    <div className="grid grid-cols-1 gap-3">
                      <FormField control={signUpForm.control} name="name" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl><Input {...field} placeholder="Enter your full name" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={signUpForm.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl><Input {...field} type="email" placeholder="Enter your email" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <div className="grid grid-cols-2 gap-3">
                        <FormField control={signUpForm.control} name="password" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl><Input {...field} type="password" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <FormField control={signUpForm.control} name="confirmPassword" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl><Input {...field} type="password" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Demographics */}
                  <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-lg shadow-sm border">
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Info className="w-4 h-4 text-primary" />
                      Demographics
                    </h4>
                    <p className="text-xs text-muted-foreground mb-3">This helps calculate targets and provide tailored guidance.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <FormField
                        control={signUpForm.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Age</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField control={signUpForm.control} name="biologicalSex" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Biological Sex</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select sex" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </FormItem>
                      )} />

                      <FormField
                        control={signUpForm.control}
                        name="heightCm"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Height (cm)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={signUpForm.control}
                        name="weightKg"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weight (kg)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Medical Info */}
                  <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-lg shadow-sm border">
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-primary" />
                      Medical Information
                    </h4>
                    <p className="text-xs text-muted-foreground mb-3">Tell us about any conditions so recommendations match your needs.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <FormField control={signUpForm.control} name="primaryCondition" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Condition</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select condition" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="diabetes">Diabetes</SelectItem>
                                <SelectItem value="hypertension">Hypertension</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </FormItem>
                      )} />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Sign Up
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}