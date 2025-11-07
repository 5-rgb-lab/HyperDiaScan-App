import { UseFormReturn } from "react-hook-form"
import { UserProfile } from "@shared/schema"
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Leaf } from "lucide-react" // ✅ green icon

interface DailyIntakeSectionProps {
  form: UseFormReturn<UserProfile>
  isEditing: boolean
}

export default function DailyIntakeSection({ form, isEditing }: DailyIntakeSectionProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Daily Calorie Target */}
        <FormField
          control={form.control}
          name="nutrientTargets.dailyCalorieTarget"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1">
                <Leaf className="w-4 h-4 text-green-600" />
                Daily Calorie Target (kcal)
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  disabled={!isEditing}
                  placeholder="2000"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Daily Carb Limit */}
        <FormField
          control={form.control}
          name="nutrientTargets.dailyCarbLimit"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1">
                <Leaf className="w-4 h-4 text-green-600" />
                Daily Carbohydrate Limit (g)
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  disabled={!isEditing}
                  placeholder="200"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Daily Sodium Limit */}
        <FormField
          control={form.control}
          name="nutrientTargets.dailySodiumLimit"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1">
                <Leaf className="w-4 h-4 text-green-600" />
                Daily Sodium Limit (mg)
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  disabled={!isEditing}
                  placeholder="2300"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Daily Saturated Fat Limit */}
        <FormField
          control={form.control}
          name="nutrientTargets.dailySatFatLimit"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1">
                <Leaf className="w-4 h-4 text-green-600" />
                Daily Saturated Fat Limit (g)
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  disabled={!isEditing}
                  placeholder="20"
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
  )
}
