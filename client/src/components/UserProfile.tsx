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
import BMISection from "./BMISection"
import ProfileActions from "./ProfileActions"
import { User, MapPin, HeartPulse, Activity, Pill } from "lucide-react"
import TreatmentSection from "./TreatmentSection"

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
      await onSaveProfile(data)
      setIsEditing(false)
    } catch (error) {
      console.error("Error saving profile:", error)
      alert("Failed to save profile. Please try again.")
    }
  }

  if (loading) return <p className="text-center text-muted-foreground">Loading profile...</p>

  // Card classes for content (matches Home.tsx)
  const cardClass =
    "p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border-0"

  // Trigger gradient wrapper (for icon)
  const triggerWrapper = (from: string, to: string) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-br ${from} ${to} text-white shadow-lg`

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Accordion type="multiple" defaultValue={["basic"]} className="space-y-4">
          {/* Basic Info */}
          <AccordionItem value="basic">
            <AccordionTrigger className="flex items-center gap-3">
              <div className={triggerWrapper("from-blue-500", "to-cyan-500 dark:from-blue-700 dark:to-cyan-700")}>
                <User className="w-5 h-5" />
              </div>
              <span className="font-semibold text-foreground">Basic Information</span>
            </AccordionTrigger>
            <AccordionContent className={cardClass}>
              <BasicInfoSection form={form} isEditing={isEditing} />
            </AccordionContent>
          </AccordionItem>

          {/* Demographics */}
          <AccordionItem value="demographics">
            <AccordionTrigger className="flex items-center gap-3">
              <div className={triggerWrapper("from-emerald-500", "to-lime-500 dark:from-emerald-700 dark:to-lime-700")}>
                <MapPin className="w-5 h-5" />
              </div>
              <span className="font-semibold text-foreground">Demographics</span>
            </AccordionTrigger>
            <AccordionContent className={cardClass}>
              <DemographicsSection form={form} isEditing={isEditing} />
            </AccordionContent>
          </AccordionItem>

          {/* Medical Info */}
          <AccordionItem value="medical">
            <AccordionTrigger className="flex items-center gap-3">
              <div className={triggerWrapper("from-rose-500", "to-pink-500 dark:from-rose-700 dark:to-pink-700")}>
                <HeartPulse className="w-5 h-5" />
              </div>
              <span className="font-semibold text-foreground">Medical Information</span>
            </AccordionTrigger>
            <AccordionContent className={cardClass}>
              <MedicalSection form={form} isEditing={isEditing} />
            </AccordionContent>
          </AccordionItem>

          {/* Treatment & Medications */}
          <AccordionItem value="treatment">
            <AccordionTrigger className="flex items-center gap-3">
              <div className={triggerWrapper("from-amber-500", "to-orange-500 dark:from-amber-700 dark:to-orange-700")}>
                <Pill className="w-5 h-5" />
              </div>
              <span className="font-semibold text-foreground">Treatment & Medications</span>
            </AccordionTrigger>
            <AccordionContent className={cardClass}>
              <TreatmentSection form={form} isEditing={isEditing} />
            </AccordionContent>
          </AccordionItem>

          {/* BMI */}
          <AccordionItem value="bmi">
            <AccordionTrigger className="flex items-center gap-3">
              <div className={triggerWrapper("from-purple-500", "to-indigo-500 dark:from-purple-700 dark:to-indigo-700")}>
                <Activity className="w-5 h-5" />
              </div>
              <span className="font-semibold text-foreground">Body Mass Index</span>
            </AccordionTrigger>
            <AccordionContent className={cardClass}>
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
