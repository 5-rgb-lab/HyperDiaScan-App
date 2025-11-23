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
          {/* Cancel */}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset(originalProfile)
              setIsEditing(false)
            }}
            className="
              min-w-[160px] h-12 rounded-xl border 
              border-gray-300 dark:border-gray-700
              hover:bg-gray-100 dark:hover:bg-gray-800 
              transition-all font-medium
              flex items-center
            "
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel
          </Button>

          {/* Save */}
          <Button
            type="submit"
            className="
              min-w-[160px] h-12 rounded-xl 
              bg-blue-600 text-white 
              hover:bg-blue-700 
              shadow-sm hover:shadow-md 
              transition-all font-medium
              flex items-center
            "
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Save Changes
          </Button>
        </>
      ) : (
<>
  {/* Edit */}
  <Button
    type="button"
    onClick={() => setIsEditing(true)}
    variant="ghost"
    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 p-0"
  >
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
    Edit Profile
  </Button>

  {/* Sign Out */}
  <Button
    type="button"
    onClick={onSignOut}
    variant="ghost"
    className="flex items-center gap-2 text-red-600 hover:text-red-800 p-0"
  >
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    </svg>
    Sign Out
  </Button>
</>

      )}
    </div>
  )
}
