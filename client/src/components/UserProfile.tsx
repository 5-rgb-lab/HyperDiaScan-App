import { useState, useEffect } from 'react';
import { updateUserProfile, getUserProfile } from '@/lib/auth';
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
import { Switch } from '@/components/ui/switch';

import { 
  type UserProfile,
  userProfileSchema
} from '@shared/schema';

type ProfileFormData = z.infer<typeof userProfileSchema>;

interface UserProfileProps {
  user?: {
    id: string;
    name: string;
    email: string;
    photoURL?: string;
    profile?: UserProfile | null;
  };
  onSaveProfile: (data: ProfileFormData) => void;
  onSignOut: () => void;
}

export default function UserProfile({ user, onSaveProfile, onSignOut }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [profileLoaded, setProfileLoaded] = useState<UserProfile | null>(null);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      // Basic Info
      name: user?.profile?.name || user?.name || '',
      email: user?.profile?.email || user?.email || '',
      age: user?.profile?.age || 18,
      primaryCondition: user?.profile?.primaryCondition || 'diabetes',
      
      // Primary Medical
      primaryMedical: user?.profile?.primaryMedical || {
        diabetesType: 'None',
        hypertensionType: 'None',
      },
      
      // Diabetes Status
      diabetesStatus: user?.profile?.diabetesStatus || {
        latestHbA1c: 0,
        hypoglycemiaFrequency: 'Rare',
      },
      
      // Hypertension Status
      hypertensionStatus: user?.profile?.hypertensionStatus || {
        currentBP: { 
          systolic: 120, 
          diastolic: 80 
        },
      },
      
      // Treatment Management
      treatmentManagement: user?.profile?.treatmentManagement || {
        diabetesManagement: {
          insulinUse: false,
          insulinType: "Short-acting", // Required by schema
          insulinTiming: "Before Meals",  // Required by schema
        },
        hypertensionManagement: {
          antihypertensiveMeds: [],
          medicationTiming: "Morning", // Required by schema
        },
      },
      
      // Nutrient Targets
      nutrientTargets: user?.profile?.nutrientTargets || {
        dailyCalorieTarget: 2000,
        dailyCarbLimit: 200,
        dailySodiumLimit: 2300,
        dailySatFatLimit: 20,
      },
      
      // Demographics
      demographics: user?.profile?.demographics || {
        biologicalSex: 'Male',
        heightCm: 170,
        weightKg: 70,
        activityLevel: 'Sedentary',
      },
    }
  });

  // Fetch profile from Firestore when user.id becomes available
  useEffect(() => {
    let mounted = true;
    async function loadProfile() {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await getUserProfile(user.id);
        if (mounted && data) {
          // merge data with defaults to avoid missing fields
          form.reset({
            // Basic Info
            name: data.name ?? user.name ?? '',
            email: data.email ?? user.email ?? '',
            age: data.age ?? 18,
            primaryCondition: data.primaryCondition ?? 'diabetes',
            
            // Primary Medical
            primaryMedical: data.primaryMedical ?? { 
              diabetesType: 'None', 
              hypertensionType: 'None' 
            },
            
            // Diabetes Status
            diabetesStatus: data.diabetesStatus ?? { 
              latestHbA1c: 0, 
            },
            
            // Hypertension Status
            hypertensionStatus: data.hypertensionStatus ?? { 
              currentBP: { 
                systolic: 120, 
                diastolic: 80 
              }
            },
            
            // Treatment Management
            treatmentManagement: data.treatmentManagement ?? {
              diabetesManagement: {
                insulinUse: false,
                insulinType: 'Short-acting',
                insulinTiming: 'Before Meals',
              },
              hypertensionManagement: {
                antihypertensiveMeds: [],
                medicationTiming: 'Morning'
              }
            },
            
            // Nutrient Targets
            nutrientTargets: data.nutrientTargets ?? {
              dailyCalorieTarget: 2000,
              dailyCarbLimit: 200,
              dailySodiumLimit: 2300,
              dailySatFatLimit: 20
            },
            
            // Demographics
            demographics: data.demographics ?? {
              biologicalSex: 'Male',
              heightCm: 170,
              weightKg: 70,
              activityLevel: 'Sedentary'
            },
          });
          setProfileLoaded(data);
        }
      } catch (err) {
        console.error('Error fetching profile from Firestore:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadProfile();
    return () => { mounted = false; };
  }, [user?.id]);

  const onSubmit = async (data: ProfileFormData) => {
    console.log('Saving profile:', data);
    if (!user?.id) {
      console.error('No user ID available');
      return;
    }

    try {
      setLoading(true);
      
      // Ensure all required fields are present
      const profileData: UserProfile = {
        ...data,
        // Ensure these required fields are always present
        primaryMedical: {
          ...data.primaryMedical,
        },
        diabetesStatus: {
          ...data.diabetesStatus,
        },
        hypertensionStatus: {
          ...data.hypertensionStatus,
        },
        treatmentManagement: {
          ...data.treatmentManagement,
        },
        nutrientTargets: {
          ...data.nutrientTargets,
        },
        demographics: {
          ...data.demographics,
        },
      };

      // Update profile and get the updated data
      const updatedProfile = await updateUserProfile(user.id, profileData);
      
      if (updatedProfile) {
        // Update local state with the server response
        setProfileLoaded(updatedProfile);
        // Notify parent
        onSaveProfile(updatedProfile);
        setIsEditing(false);
        console.log('Profile saved successfully');
      } else {
        console.error('Failed to get updated profile');
      }
    } catch (error) {
      console.error('Error saving to Firestore:', error);
    } finally {
      setLoading(false);
    }
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
      case 'both': return 'Both';
      default: return condition;
    }
  };

  const calculateBMI = (weight: number, height: number) => {
    const heightInMeters = height / 100;
    if (!heightInMeters) return '0.0';
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

  if (loading) {
    return (
      <Card className="text-center p-8">
        <CardContent>
          <p className="text-muted-foreground">Loading profile...</p>
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
              {/* Basic Info */}
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={user.photoURL} alt={user.name} />
                  <AvatarFallback>
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{user.name}</h3>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
              </div>

              {profileLoaded && (
                <>
                  <Separator />
                  <Accordion type="multiple" className="w-full">
                    {/* BASIC INFO */}
                    <AccordionItem value="basic">
                      <AccordionTrigger>Basic Information</AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div><strong>Age:</strong> {profileLoaded.age} years</div>
                          <div>
                            <strong>Primary Condition:</strong>{" "}
                            <Badge className={getConditionBadge(profileLoaded.primaryCondition)}>
                              {getConditionText(profileLoaded.primaryCondition)}
                            </Badge>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* DEMOGRAPHICS */}
                    <AccordionItem value="demographics">
                      <AccordionTrigger>Demographics & Measurements</AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div><strong>Sex:</strong> {profileLoaded.demographics.biologicalSex}</div>
                          <div><strong>Activity Level:</strong> {profileLoaded.demographics.activityLevel}</div>
                          <div><strong>Height:</strong> {profileLoaded.demographics.heightCm} cm</div>
                          <div><strong>Weight:</strong> {profileLoaded.demographics.weightKg} kg</div>
                        </div>
                        <div className="mt-2">
                          <strong>BMI:</strong>{" "}
                          {calculateBMI(profileLoaded.demographics.weightKg, profileLoaded.demographics.heightCm)}{" "}
                          <span className={getBMICategory(parseFloat(calculateBMI(profileLoaded.demographics.weightKg, profileLoaded.demographics.heightCm))).color}>
                            ({getBMICategory(parseFloat(calculateBMI(profileLoaded.demographics.weightKg, profileLoaded.demographics.heightCm))).category})
                          </span>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* MEDICAL CONDITIONS */}
                    <AccordionItem value="medical">
                      <AccordionTrigger>Medical Conditions</AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-2 gap-4">
                          {(profileLoaded.primaryCondition === "diabetes" ||
                            profileLoaded.primaryCondition === "both") && (
                            <>
                              <div><strong>Diabetes Type:</strong> {profileLoaded.primaryMedical.diabetesType}</div>
                              <div><strong>Latest HbA1c:</strong> {profileLoaded.diabetesStatus.latestHbA1c || "N/A"}</div>
                            </>
                          )}

                          {(profileLoaded.primaryCondition === "hypertension" ||
                            profileLoaded.primaryCondition === "both") && (
                            <>
                              <div><strong>Hypertension Type:</strong> {profileLoaded.primaryMedical.hypertensionType}</div>
                              <div>
                                <strong>Blood Pressure:</strong>{" "}
                                {profileLoaded.hypertensionStatus.currentBP.systolic}/
                                {profileLoaded.hypertensionStatus.currentBP.diastolic} mmHg
                              </div>
                            </>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* TREATMENT */}
                    <AccordionItem value="treatment">
                      <AccordionTrigger>Treatment & Medications</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          {(profileLoaded.primaryCondition === "diabetes" ||
                            profileLoaded.primaryCondition === "both") && (
                            <div>
                              <h4 className="font-medium text-sm">Diabetes Management</h4>
                              <p>Insulin Use: {profileLoaded.treatmentManagement.diabetesManagement.insulinUse ? "Yes" : "No"}</p>
                              {profileLoaded.treatmentManagement.diabetesManagement.insulinUse && (
                                <>
                                  <p>Insulin Type: {profileLoaded.treatmentManagement.diabetesManagement.insulinType || "N/A"}</p>
                                  <p>Insulin Timing: {profileLoaded.treatmentManagement.diabetesManagement.insulinTiming || "N/A"}</p>
                                </>
                              )}
                            </div>
                          )}

                          {(profileLoaded.primaryCondition === "hypertension" ||
                            profileLoaded.primaryCondition === "both") && (
                            <div>
                              <h4 className="font-medium text-sm">Hypertension Management</h4>
                              <p>
                                Antihypertensive Meds:{" "}
                                {profileLoaded.treatmentManagement.hypertensionManagement.antihypertensiveMeds?.length
                                  ? profileLoaded.treatmentManagement.hypertensionManagement.antihypertensiveMeds.join(", ")
                                  : "None"}
                              </p>
                              <p>
                                Timing: {profileLoaded.treatmentManagement.hypertensionManagement.medicationTiming || "N/A"}
                              </p>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* TARGETS */}
                    <AccordionItem value="targets">
                      <AccordionTrigger>Nutrient & Health Targets</AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div><strong>Calories:</strong> {profileLoaded.nutrientTargets.dailyCalorieTarget} kcal</div>
                          <div><strong>Carbs Limit:</strong> {profileLoaded.nutrientTargets.dailyCarbLimit} g</div>
                          <div><strong>Sodium Limit:</strong> {profileLoaded.nutrientTargets.dailySodiumLimit} mg</div>
                          <div><strong>Sat. Fat Limit:</strong> {profileLoaded.nutrientTargets.dailySatFatLimit} g</div>

                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
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
                              <FormControl>
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
                              </FormControl>
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
                              <FormControl>
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
                              </FormControl>
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
                        {/* Diabetes section */}
                        {(form.watch('primaryCondition') === 'diabetes' || form.watch('primaryCondition') === 'both') && (
                          <>
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
                          </>
                        )}

                        {/* Hypertension section */}
                        {(form.watch('primaryCondition') === 'hypertension' || form.watch('primaryCondition') === 'both') && (
                          <>
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
                          </>
                        )}
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
                        {/* Diabetes Management */}
                        {(form.watch('primaryCondition') === 'diabetes' || form.watch('primaryCondition') === 'both') && (
                          <div className="space-y-4">
                            <h4 className="text-sm font-medium">Diabetes Management</h4>

                            <FormField
                              control={form.control}
                              name="treatmentManagement.diabetesManagement.insulinUse"
                              render={({ field }) => (
                                <FormItem className="flex items-center justify-between">
                                  <FormLabel>Insulin Use</FormLabel>
                                  <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            {form.watch("treatmentManagement.diabetesManagement.insulinUse") && (
                              <>
                                <FormField
                                  control={form.control}
                                  name="treatmentManagement.diabetesManagement.insulinType"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Insulin Type</FormLabel>
                                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                          <SelectTrigger><SelectValue /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="Short-acting">Short-acting</SelectItem>
                                          <SelectItem value="Long-acting">Long-acting</SelectItem>
                                          <SelectItem value="Both">Both</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </FormItem>
                                  )}
                                />
                                  <FormField
                                    control={form.control}
                                    name="treatmentManagement.diabetesManagement.insulinTiming"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Insulin Timing</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select timing" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            <SelectItem value="Before Meals">Before Meals</SelectItem>
                                            <SelectItem value="After Meals">After Meals</SelectItem>
                                            <SelectItem value="Morning">Morning</SelectItem>
                                            <SelectItem value="Evening">Evening</SelectItem>
                                            <SelectItem value="Both">As prescribed</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </FormItem>
                                    )}
                                  />

                              </>
                            )}
                          </div>
                        )}


                        {/* Hypertension Management */}
                        {(form.watch('primaryCondition') === 'hypertension' || form.watch('primaryCondition') === 'both') && (
                          <div className="space-y-4">
                            <h4 className="text-sm font-medium">Hypertension Management</h4>

                            <FormField
                              control={form.control}
                              name="treatmentManagement.hypertensionManagement.antihypertensiveMeds"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Antihypertensive Medications (comma separated)</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="e.g., Losartan, Amlodipine"
                                      onChange={(e) =>
                                        field.onChange(e.target.value.split(",").map(v => v.trim()))
                                      }
                                      value={field.value?.join(", ")}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="treatmentManagement.hypertensionManagement.medicationTiming"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Medication Timing</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger><SelectValue /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="Morning">Morning</SelectItem>
                                      <SelectItem value="Evening">Evening</SelectItem>
                                      <SelectItem value="Both">Both</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )}
                            />
                          </div>
                        )}

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
                  <Button type="submit" data-testid="button-save-profile" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => { setIsEditing(false); form.reset(profileLoaded ?? undefined); }}
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
