import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Droplet, HeartPulse, Activity } from "lucide-react"

export default function MedicalSection({ form, isEditing }: { form: any; isEditing: boolean }) {
  const condition = form.watch("primaryCondition")

  return (
    <div className="p-4 grid grid-cols-1 gap-4">

      {/* Diabetes Fields */}
      {(condition === "diabetes" || condition === "both") && (
        <>
          {/* Diabetes Type */}
          <FormField
            control={form.control}
            name="primaryMedical.diabetesType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Droplet className="w-4 h-4 text-pink-500" />
                  Diabetes Type
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isEditing}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
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

          {/* HbA1c */}
          <FormField
            control={form.control}
            name="diabetesStatus.latestHbA1c"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Activity className="w-4 h-4 text-pink-500" />
                  Latest HbA1c
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    {...field}
                    disabled={!isEditing}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}

      {/* Hypertension Fields */}
      {(condition === "hypertension" || condition === "both") && (
        <>
          {/* Hypertension Type */}
          <FormField
            control={form.control}
            name="primaryMedical.hypertensionType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <HeartPulse className="w-4 h-4 text-pink-500" />
                  Hypertension Type
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isEditing}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="None">None</SelectItem>
                    <SelectItem value="Primary">Primary</SelectItem>
                    <SelectItem value="Secondary">Secondary</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          {/* Systolic */}
          <FormField
            control={form.control}
            name="hypertensionStatus.currentBP.systolic"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <HeartPulse className="w-4 h-4 text-pink-500" />
                  Systolic BP
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

          {/* Diastolic */}
          <FormField
            control={form.control}
            name="hypertensionStatus.currentBP.diastolic"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <HeartPulse className="w-4 h-4 text-pink-500" />
                  Diastolic BP
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
        </>
      )}
    </div>
  )
}
