import { Button } from "@/components/ui/button"

interface ProfileActionsProps {
  isEditing: boolean
  setIsEditing: (v: boolean) => void
  form: any
  onSubmit: (data: any) => Promise<void>
  onSignOut: () => void
  originalProfile?: any
}

export default function ProfileActions({
  isEditing,
  setIsEditing,
  form,
  onSubmit,
  onSignOut,
  originalProfile,
}: ProfileActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
      {isEditing ? (
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              // Reset to the original profile values
              form.reset(originalProfile)
              setIsEditing(false)
            }}
            className="min-w-[160px] h-12 border-2 border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-all duration-200 font-semibold"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel
          </Button>

          <Button
            type="submit"
            className="min-w-[160px] h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 font-semibold"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Save Changes
          </Button>
        </>
      ) : (
        <>
          <Button
            type="button"
            onClick={() => setIsEditing(true)}
            className="min-w-[160px] h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 font-semibold"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Profile
          </Button>

          <Button
            type="button"
            onClick={onSignOut}
            className="min-w-[160px] h-12 bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 font-semibold"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </Button>
        </>
      )}
    </div>
  )
}
