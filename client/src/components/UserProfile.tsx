import { useState } from 'react';
import { updateUserProfile } from '@/lib/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Settings, LogOut, Shield, Calculator } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  age: z.number().min(18).max(120),
  primaryCondition: z.enum(['diabetes', 'hypertension']),
  emergencyContact: z.string().optional(),
  height: z.number().min(100).max(250).optional(),
  weight: z.number().min(30).max(300).optional()
});

type ProfileData = z.infer<typeof profileSchema>;

interface UserProfileProps {
  user?: {
    id: string;
    name: string;
    email: string;
    photoURL?: string;
    profile?: {
      name: string;
      email: string;
      age?: number; 
      primaryCondition: "diabetes" | "hypertension"; 
      emergencyContact?: string;
      height?: number;
      weight?: number;
    } | null; 
  };
  onSaveProfile: (data: ProfileData) => void;
  onSignOut: () => void;
}

export default function UserProfile({ user, onSaveProfile, onSignOut }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      age: user?.profile?.age || 30,
      primaryCondition: (user?.profile?.primaryCondition === 'diabetes' || user?.profile?.primaryCondition === 'hypertension')
        ? user.profile.primaryCondition
        : 'diabetes',
      emergencyContact: user?.profile?.emergencyContact || '',
      height: user?.profile?.height || undefined,
      weight: user?.profile?.weight || undefined
    }
  });

  const onSubmit = async (data: ProfileData) => {
    console.log('Saving profile:', data);
    if (user?.id) {
      try {
        await updateUserProfile(user.id, data);
      } catch (error) {
        console.error('Error saving to Firestore:', error);
      }
    }
    onSaveProfile(data);
    setIsEditing(false);
  };

  const getConditionBadge = (condition: string) => {
    const colors = {
      diabetes: 'bg-blue-100 text-blue-800',
      hypertension: 'bg-red-100 text-red-800'
    };
    return colors[condition as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getConditionText = (condition: string) => {
    switch (condition) {
      case 'diabetes': return 'Diabetes';
      case 'hypertension': return 'Hypertension';
      default: return condition;
    }
  };

  const calculateBMI = (weight: number, height: number) => {
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-600' };
    if (bmi < 25) return { category: 'Normal weight', color: 'text-green-600' };
    if (bmi < 30) return { category: 'Overweight', color: 'text-yellow-600' };
    return { category: 'Obese', color: 'text-red-600' };
  };

  if (!user) {
    return (
      <Card className="text-center p-8">
        <CardContent>
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Please sign in to view your profile</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
            {!isEditing && (
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(true)}
                data-testid="button-edit-profile"
              >
                <Settings className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!isEditing ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={user.photoURL} alt={user.name} />
                  <AvatarFallback>
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold" data-testid="text-user-name">
                    {user.name}
                  </h3>
                  <p className="text-muted-foreground" data-testid="text-user-email">
                    {user.email}
                  </p>
                </div>
              </div>

              {user.profile && (
                <>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Age</label>
                      <p className="text-sm" data-testid="text-user-age">
                        {user.profile.age} years old
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Primary Condition</label>
                      <div className="mt-1">
                        <Badge className={getConditionBadge(user.profile.primaryCondition)}>
                          {getConditionText(user.profile.primaryCondition)}
                        </Badge>
                      </div>
                    </div>
                    {user.profile.emergencyContact && (
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-muted-foreground">Emergency Contact</label>
                        <p className="text-sm" data-testid="text-emergency-contact">
                          {user.profile.emergencyContact}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* BMI Calculator Display */}
                  {user.profile.height && user.profile.weight && (
                    <>
                      <Separator />
                      <Card className="bg-gradient-to-r from-blue-50 to-teal-50 border-blue-200">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Calculator className="w-6 h-6 text-blue-600" />
                            <div>
                              <h4 className="font-semibold text-blue-900">BMI Calculator</h4>
                              <div className="mt-2 space-y-1">
                                <p className="text-sm text-blue-800">
                                  Height: {user.profile.height} cm | Weight: {user.profile.weight} kg
                                </p>
                                <div className="flex items-center gap-2">
                                  <span className="text-lg font-bold text-blue-900">
                                    BMI: {calculateBMI(user.profile.weight, user.profile.height)}
                                  </span>
                                  <span className={`text-sm font-medium ${getBMICategory(parseFloat(calculateBMI(user.profile.weight, user.profile.height))).color}`}>
                                    ({getBMICategory(parseFloat(calculateBMI(user.profile.weight, user.profile.height))).category})
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </>
              )}
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-profile-name" />
                        </FormControl>
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
                          <Input {...field} type="email" data-testid="input-profile-email" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            data-testid="input-profile-age"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="primaryCondition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Condition</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-primary-condition">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="diabetes">Diabetes</SelectItem>
                            <SelectItem value="hypertension">Hypertension</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height (cm)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="175"
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            data-testid="input-height"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (kg)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="70"
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            data-testid="input-weight"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emergencyContact"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Emergency Contact (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Phone number or email"
                            data-testid="input-emergency-contact"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" data-testid="button-save-profile">
                    Save Changes
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                    data-testid="button-cancel-edit"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Account Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            variant="destructive" 
            onClick={onSignOut}
            data-testid="button-sign-out"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}