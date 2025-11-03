import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { userProfileSchema, UserProfile as UserProfileType } from "@shared/schema"
import { getUserProfile } from "@/lib/auth"
import { Form } from "@/components/ui/form"
import BasicInfoSection from "./BasicInfoSection"
import DemographicsSection from "./DemographicSection"
import MedicalSection from "./MedicalSection"
import BMISection from "./BMISection"
import ProfileActions from "./ProfileActions"
import { User, MapPin, HeartPulse, Activity } from "lucide-react"
import TreatmentSection from "./TreatmentSection"
import { Pill } from "lucide-react"


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

  const form = useForm<UserProfileType>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: user.profile || {},
  })

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user.id) return
      const profileData = await getUserProfile(user.id)
      if (profileData) form.reset(profileData)
      setLoading(false)
    }
    fetchProfile()
  }, [user.id, form])

  const onSubmit = async (data: UserProfileType) => {
    try {
      await onSaveProfile(data as UserProfileType)
      setIsEditing(false)
    } catch (error) {
      console.error("Error saving profile:", error)
      alert("Failed to save profile. Please try again.")
    }
  }

  if (loading) return <p className="text-center text-muted-foreground">Loading profile...</p>

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Accordion type="multiple" defaultValue={["basic"]}>
          
          {/* Basic Info */}
          <AccordionItem value="basic">
            <AccordionTrigger>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm">
                <User className="w-5 h-5" />
              </div>
              <span className="font-semibold">Basic Information</span>
            </AccordionTrigger>
            <AccordionContent>
              <BasicInfoSection form={form} isEditing={isEditing} />
            </AccordionContent>
          </AccordionItem>

          {/* Demographics */}
          <AccordionItem value="demographics">
            <AccordionTrigger>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-lime-500 text-white shadow-sm">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="font-semibold">Demographics</span>
            </AccordionTrigger>
            <AccordionContent>
              <DemographicsSection form={form} isEditing={isEditing} />
            </AccordionContent>
          </AccordionItem>

          {/* Medical Info */}
          <AccordionItem value="medical">
            <AccordionTrigger>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm">
                <HeartPulse className="w-5 h-5" />
              </div>
              <span className="font-semibold">Medical Information</span>
            </AccordionTrigger>
            <AccordionContent>
              <MedicalSection form={form} isEditing={isEditing} />
            </AccordionContent>
          </AccordionItem>

          {/* Treatment & Medications */}
          <AccordionItem value="treatment">
            <AccordionTrigger>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm">
                <Pill className="w-5 h-5" />
              </div>
              <span className="font-semibold">Treatment & Medications</span>
            </AccordionTrigger>
            <AccordionContent>
              <TreatmentSection form={form} isEditing={isEditing} />
            </AccordionContent>
          </AccordionItem>

          {/* BMI */}
          <AccordionItem value="bmi">
            <AccordionTrigger>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-sm">
                <Activity className="w-5 h-5" />
              </div>
              <span className="font-semibold">Body Mass Index</span>
            </AccordionTrigger>
            <AccordionContent>
              <BMISection form={form} />
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
