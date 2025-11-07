import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { UserCircle, Ruler, Scale, Activity } from "lucide-react"

export default function DemographicSection({ form, isEditing }: { form: any; isEditing: boolean }) {
  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">

      {/* Biological Sex */}
      <FormField
        control={form.control}
        name="demographics.biologicalSex"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2 text-sm font-medium">
              <UserCircle className="w-4 h-4 text-green-500" />
              Biological Sex
            </FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isEditing}>
              <FormControl>
                <SelectTrigger><SelectValue /></SelectTrigger>
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

      {/* Height */}
      <FormField
        control={form.control}
        name="demographics.heightCm"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2 text-sm font-medium">
              <Ruler className="w-4 h-4 text-green-500" />
              Height (cm)
            </FormLabel>
            <FormControl>
              <Input
                type="number"
                {...field}
                disabled={!isEditing}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Weight */}
      <FormField
        control={form.control}
        name="demographics.weightKg"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2 text-sm font-medium">
              <Scale className="w-4 h-4 text-green-500" />
              Weight (kg)
            </FormLabel>
            <FormControl>
              <Input
                type="number"
                {...field}
                disabled={!isEditing}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Activity Level */}
      <FormField
        control={form.control}
        name="demographics.activityLevel"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2 text-sm font-medium">
              <Activity className="w-4 h-4 text-green-500" />
              Activity Level
            </FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isEditing}>
              <FormControl>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
  )
}
