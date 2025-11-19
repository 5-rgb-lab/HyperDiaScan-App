import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import { userProfileSchema, UserProfile as UserProfileType } from "@shared/schema"
import { getUserProfile } from "@/lib/auth"
import { Form } from "@/components/ui/form"
import BasicInfoSection from "./BasicInfoSection"
import DemographicsSection from "./DemographicSection"
import MedicalSection from "./MedicalSection"
import ProfileActions from "./ProfileActions"
import { User, MapPin, HeartPulse } from "lucide-react"

interface UserProfileProps {
  user: {
    id: string
    name: string
    email: string
    photoURL?: string
    profile?: UserProfileType | null
  }
  onSaveProfile: (data: UserProfileType) => void
  onSignOut: () => void
}

export default function UserProfile({ user, onSaveProfile, onSignOut }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)

  // Provide a complete default profile shape so form fields are always controlled.
  const emptyProfile: UserProfileType = {
    name: user.profile?.name || '',
    email: user.profile?.email || user.email || '',
    primaryCondition: (user.profile?.primaryCondition as any) || 'diabetes',
    otherConditions: user.profile?.otherConditions || { kidneyDisease: false, heartDisease: false },
    diabetesStatus: user.profile?.diabetesStatus || { bloodSugar: 0 },
    hypertensionStatus: user.profile?.hypertensionStatus || { bloodPressure: { systolic: 120, diastolic: 80 } },
    treatmentManagement: user.profile?.treatmentManagement || {
      diabetesMedication: { medications: [] },
      hypertensionMedication: { medications: [] },
    },
    demographics: user.profile?.demographics || {
      biologicalSex: 'Male',
      age: 18,
      heightCm: 170,
      weightKg: 70,
      activityLevel: 'Sedentary',
    },
  }

  const form = useForm<UserProfileType>({
    resolver: zodResolver(userProfileSchema),
    // Always initialize with the full emptyProfile so all inputs are controlled
    defaultValues: emptyProfile,
  })

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user.id) return
      const profileData = await getUserProfile(user.id)
      // Merge fetched profile with emptyProfile to ensure all nested keys exist
      if (profileData) {
        const merged = {
          ...emptyProfile,
          ...profileData,
          demographics: { ...emptyProfile.demographics, ...(profileData.demographics || {}) },
          otherConditions: { ...emptyProfile.otherConditions, ...(profileData.otherConditions || {}) },
          diabetesStatus: { ...emptyProfile.diabetesStatus, ...(profileData.diabetesStatus || {}) },
          hypertensionStatus: { ...emptyProfile.hypertensionStatus, ...(profileData.hypertensionStatus || {}) },
          treatmentManagement: {
            diabetesMedication: { ...emptyProfile.treatmentManagement.diabetesMedication, ...(profileData.treatmentManagement?.diabetesMedication || {}) },
            hypertensionMedication: { ...emptyProfile.treatmentManagement.hypertensionMedication, ...(profileData.treatmentManagement?.hypertensionMedication || {}) },
          },
        } as UserProfileType

        form.reset(merged)
      } else {
        form.reset(emptyProfile)
      }
      setLoading(false)
    }
    fetchProfile()
  }, [user.id, form])

  const onSubmit = async (data: UserProfileType) => {
    try {
      await onSaveProfile(data)
      setIsEditing(false)
    } catch (error) {
      console.error("Error saving profile:", error)
      alert("Failed to save profile. Please try again.")
    }
  }

  if (loading) return <p className="text-center text-muted-foreground">Loading profile...</p>

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Accordion type="multiple" defaultValue={["basic"]} className="space-y-4 ">
          {/* Basic Info */}
          <AccordionItem value="basic" className="border-0 bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gradient-to-r hover:from-blue-50 hover:via-purple-50 hover:to-teal-50 dark:hover:from-blue-950/30 dark:hover:via-purple-950/30 dark:hover:to-teal-950/30 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-teal-600 shadow-lg">
                  <User className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">Basic Information</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 pt-2">
              <BasicInfoSection form={form} isEditing={isEditing} />
            </AccordionContent>
          </AccordionItem>

          {/* Demographics */}
          <AccordionItem value="demographics" className="border-0 bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gradient-to-r hover:from-purple-50 hover:via-teal-50 hover:to-blue-50 dark:hover:from-purple-950/30 dark:hover:via-teal-950/30 dark:hover:to-blue-950/30 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-600 via-teal-600 to-blue-600 shadow-lg">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg bg-gradient-to-r from-purple-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">Demographics</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 pt-2">
              <DemographicsSection form={form} isEditing={isEditing} />
            </AccordionContent>
          </AccordionItem>

          {/* Medical Info */}
          <AccordionItem value="medical" className="border-0 bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gradient-to-r hover:from-teal-50 hover:via-blue-50 hover:to-purple-50 dark:hover:from-teal-950/30 dark:hover:via-blue-950/30 dark:hover:to-purple-950/30 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-teal-600 via-blue-600 to-purple-600 shadow-lg">
                  <HeartPulse className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg bg-gradient-to-r from-teal-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">Medical Information</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 pt-2">
              <MedicalSection form={form} isEditing={isEditing} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <ProfileActions
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          form={form}
          onSubmit={onSubmit}
          onSignOut={onSignOut}
          originalProfile={user.profile}
        />
      </form>
    </Form>
  )
}
