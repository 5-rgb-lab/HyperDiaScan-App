import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Loader2, User, Heart, UserPlus, Info } from 'lucide-react';
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
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');

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
      biologicalSex: 'Other',
      heightCm: 170,
      weightKg: 70,
      primaryCondition: 'diabetes',
    },
  });

  const onSignIn = async (data: SignInData) => {
    setIsLoading(true);
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
    }
  };

  const onSignUp = async (data: SignUpData) => {
    setIsLoading(true);
    try {
      // Build flat profileData to match createUserProfile expectations
      const profileData = {
        primaryCondition: data.primaryCondition,
        age: data.age,
        heightCm: data.heightCm,
        weightKg: data.weightKg,
        gender: data.biologicalSex,
      } as const;

      await signUp(data.email, data.password, data.name, profileData as any);

      toast({
        title: 'Account created!',
        description: 'Welcome to HyperDiaScan! Complete your profile next.',
      });

      // You can later add a redirect here, e.g. navigate("/profile-setup")
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast({
        variant: 'destructive',
        title: 'Sign up failed',
        description: error?.message || 'Please check your info and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl shadow-lg">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              HyperDiaScan
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
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Sign In
                  </Button>
                </form>
              </Form>
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
                                <SelectItem value="both">Both</SelectItem>
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
