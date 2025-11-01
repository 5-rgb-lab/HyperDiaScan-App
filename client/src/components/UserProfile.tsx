import { useState } from 'react';
import { updateUserProfile } from '@/lib/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  User, Settings, LogOut, Shield, Calculator, 
  HeartPulse, Activity, Gauge, Baby, 
  Cookie, Pill, Target, UserCircle,
  AlertCircle, Apple, Brain
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";

import { 
  type UserProfile as UserProfileType,
  userProfileSchema
} from '@shared/schema';

type ProfileFormData = z.infer<typeof userProfileSchema>;

interface UserProfileProps {
  user?: {
    id: string;
    name: string;
    email: string;
    photoURL?: string;
    profile?: UserProfileType | null;
  };
  onSaveProfile: (data: ProfileFormData) => void;
  onSignOut: () => void;
}

export default function UserProfile({ user, onSaveProfile, onSignOut }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      name: user?.profile?.name || user?.name || '',
      email: user?.profile?.email || user?.email || '',
      age: user?.profile?.age || 18,
      primaryCondition: user?.profile?.primaryCondition || 'diabetes',
      primaryMedical: user?.profile?.primaryMedical || {
        diabetesType: 'None',
        hypertensionType: 'None',
      },
      diabetesStatus: user?.profile?.diabetesStatus || {
        latestHbA1c: 0,
        hypoglycemiaFrequency: 'Rare',
      },
      hypertensionStatus: user?.profile?.hypertensionStatus || {
        currentBP: { systolic: 120, diastolic: 80 },
        useOfDiuretic: false,
      },
      treatmentManagement: user?.profile?.treatmentManagement || {
        diabetesManagement: {
          insulinUse: false,
          oralMedications: [],
        },
        hypertensionManagement: {
          antihypertensiveMeds: [],
        },
      },
      nutrientTargets: user?.profile?.nutrientTargets || {
        dailyCalorieTarget: 2000,
        dailyCarbLimit: 200,
        dailySodiumLimit: 2300,
        dailySatFatLimit: 20,
        fastingGlucoseTarget: '80-100',
        postMealGlucoseTarget: '100-140',
      },
      demographics: user?.profile?.demographics || {
        biologicalSex: 'Other',
        heightCm: 170,
        weightKg: 70,
        activityLevel: 'Sedentary',
      },
      healthBackground: user?.profile?.healthBackground || {
        otherHealthConditions: [],
        foodAllergies: [],
      },
    }
  });

  const onSubmit = async (data: ProfileFormData) => {
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
                      <div className="md:col-span-2">
                      <Accordion type="single" collapsible className="w-full">
                        {/* Primary Medical */}
                        <AccordionItem value="primary-medical">
                          <AccordionTrigger className="text-left">
                            <div className="flex items-center gap-2">
                              <HeartPulse className="h-4 w-4 text-primary" />
                              <span>Primary Medical Conditions</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="p-4 space-y-2">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="text-sm font-medium mb-1">Diabetes Type</h4>
                                  <p className="text-sm">{user.profile?.primaryMedical.diabetesType}</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium mb-1">Hypertension Type</h4>
                                  <p className="text-sm">{user.profile?.primaryMedical.hypertensionType}</p>
                                </div>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        {/* Demographics */}
                        <AccordionItem value="demographics">
                          <AccordionTrigger className="text-left">
                            <div className="flex items-center gap-2">
                              <UserCircle className="h-4 w-4 text-primary" />
                              <span>Demographics & Measurements</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="p-4 space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="text-sm font-medium mb-1">Biological Sex</h4>
                                  <p className="text-sm">{user.profile?.demographics.biologicalSex}</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium mb-1">Activity Level</h4>
                                  <p className="text-sm">{user.profile?.demographics.activityLevel}</p>
                                </div>
                              </div>

                              {/* BMI Calculator */}
                              <Card className="bg-gradient-to-r from-blue-50 to-teal-50 border-blue-200">
                                <CardContent className="p-4">
                                  <div className="flex items-center gap-3">
                                    <Calculator className="w-6 h-6 text-blue-600" />
                                    <div>
                                      <h4 className="font-semibold text-blue-900">BMI Calculator</h4>
                                      <div className="mt-2 space-y-1">
                                        <p className="text-sm text-blue-800">
                                          Height: {user.profile?.demographics.heightCm} cm | Weight: {user.profile?.demographics.weightKg} kg
                                        </p>
                                        <div className="flex items-center gap-2">
                                          <span className="text-lg font-bold text-blue-900">
                                            BMI: {calculateBMI(user.profile?.demographics.weightKg || 0, user.profile?.demographics.heightCm || 0)}
                                          </span>
                                          <span className={`text-sm font-medium ${getBMICategory(parseFloat(calculateBMI(user.profile?.demographics.weightKg || 0, user.profile?.demographics.heightCm || 0))).color}`}>
                                            ({getBMICategory(parseFloat(calculateBMI(user.profile?.demographics.weightKg || 0, user.profile?.demographics.heightCm || 0))).category})
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        {/* Treatment Management */}
                        <AccordionItem value="treatment">
                          <AccordionTrigger className="text-left">
                            <div className="flex items-center gap-2">
                              <Pill className="h-4 w-4 text-primary" />
                              <span>Treatment & Medications</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="p-4 space-y-4">
                              {/* Diabetes Management */}
                              <div>
                                <h4 className="text-sm font-medium mb-2">Diabetes Management</h4>
                                <div className="space-y-2">
                                  <p className="text-sm">
                                    Insulin: {user.profile?.treatmentManagement.diabetesManagement.insulinUse ? 'Yes' : 'No'}
                                  </p>
                                  <p className="text-sm">
                                    Medications: {user.profile?.treatmentManagement.diabetesManagement.oralMedications.join(', ') || 'None'}
                                  </p>
                                </div>
                              </div>

                              {/* Hypertension Management */}
                              <div>
                                <h4 className="text-sm font-medium mb-2">Hypertension Management</h4>
                                <p className="text-sm">
                                  Medications: {user.profile?.treatmentManagement.hypertensionManagement.antihypertensiveMeds.join(', ') || 'None'}
                                </p>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        {/* Health Background */}
                        <AccordionItem value="background">
                          <AccordionTrigger className="text-left">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-primary" />
                              <span>Health Background</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="p-4 space-y-4">
                              <div>
                                <h4 className="text-sm font-medium mb-2">Other Health Conditions</h4>
                                <p className="text-sm">
                                  {user.profile?.healthBackground.otherHealthConditions.length 
                                    ? user.profile.healthBackground.otherHealthConditions.join(', ')
                                    : 'None reported'}
                                </p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium mb-2">Food Allergies</h4>
                                <p className="text-sm">
                                  {user.profile?.healthBackground.foodAllergies.length 
                                    ? user.profile.healthBackground.foodAllergies.join(', ')
                                    : 'None reported'}
                                </p>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        {/* Nutrient Targets */}
                        <AccordionItem value="targets">
                          <AccordionTrigger className="text-left">
                            <div className="flex items-center gap-2">
                              <Target className="h-4 w-4 text-primary" />
                              <span>Nutrient & Health Targets</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="p-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="text-sm font-medium mb-1">Daily Calories</h4>
                                  <p className="text-sm">{user.profile?.nutrientTargets.dailyCalorieTarget} kcal</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium mb-1">Carb Limit</h4>
                                  <p className="text-sm">{user.profile?.nutrientTargets.dailyCarbLimit}g</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium mb-1">Sodium Limit</h4>
                                  <p className="text-sm">{user.profile?.nutrientTargets.dailySodiumLimit}mg</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium mb-1">Saturated Fat Limit</h4>
                                  <p className="text-sm">{user.profile?.nutrientTargets.dailySatFatLimit}g</p>
                                </div>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Accordion type="single" collapsible defaultValue="basic" className="w-full">
                  {/* Basic Information */}
                  <AccordionItem value="basic">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Basic Information</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
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
                                <Input {...field} type="email" />
                              </FormControl>
                              <FormMessage />
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
                                  type="number"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
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
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="diabetes">Diabetes</SelectItem>
                                  <SelectItem value="hypertension">Hypertension</SelectItem>
                                  <SelectItem value="both">Both</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Demographics */}
                  <AccordionItem value="demographics">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <UserCircle className="h-4 w-4" />
                        <span>Demographics & Measurements</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="demographics.biologicalSex"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Biological Sex</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Male">Male</SelectItem>
                                  <SelectItem value="Female">Female</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="demographics.heightCm"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Height (cm)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="demographics.weightKg"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Weight (kg)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="demographics.activityLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Activity Level</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Sedentary">Sedentary</SelectItem>
                                  <SelectItem value="Lightly Active">Lightly Active</SelectItem>
                                  <SelectItem value="Moderate">Moderate</SelectItem>
                                  <SelectItem value="Very Active">Very Active</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Medical Conditions */}
                  <AccordionItem value="medical">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <HeartPulse className="h-4 w-4" />
                        <span>Medical Conditions</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="p-4 grid grid-cols-1 gap-4">
                        <FormField
                          control={form.control}
                          name="primaryMedical.diabetesType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Diabetes Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="None">None</SelectItem>
                                  <SelectItem value="Type 1">Type 1</SelectItem>
                                  <SelectItem value="Type 2">Type 2</SelectItem>
                                  <SelectItem value="Gestational">Gestational</SelectItem>
                                  <SelectItem value="Pre-diabetes">Pre-diabetes</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="primaryMedical.hypertensionType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Hypertension Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="None">None</SelectItem>
                                  <SelectItem value="Primary">Primary</SelectItem>
                                  <SelectItem value="Secondary">Secondary</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="diabetesStatus.latestHbA1c"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Latest HbA1c</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.1"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="hypertensionStatus.currentBP.systolic"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Systolic BP</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="hypertensionStatus.currentBP.diastolic"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Diastolic BP</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Treatment */}
                  <AccordionItem value="treatment">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <Pill className="h-4 w-4" />
                        <span>Treatment & Medications</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="p-4 space-y-6">
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium">Diabetes Management</h4>
                          <FormField
                            control={form.control}
                            name="treatmentManagement.diabetesManagement.insulinUse"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between">
                                <FormLabel>Insulin Use</FormLabel>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <h4 className="text-sm font-medium">Hypertension Management</h4>
                          <FormField
                            control={form.control}
                            name="treatmentManagement.hypertensionManagement.medicationTiming"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Medication Timing</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Morning">Morning</SelectItem>
                                    <SelectItem value="Evening">Evening</SelectItem>
                                    <SelectItem value="Both">Both</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Nutrient Targets */}
                  <AccordionItem value="targets">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        <span>Daily Targets</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="nutrientTargets.dailyCalorieTarget"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Daily Calorie Target</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="nutrientTargets.dailyCarbLimit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Daily Carb Limit (g)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="nutrientTargets.dailySodiumLimit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Daily Sodium Limit (mg)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="nutrientTargets.dailySatFatLimit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Daily Saturated Fat Limit (g)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

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