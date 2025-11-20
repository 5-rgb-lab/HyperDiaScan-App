import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { UserCircle, Ruler, Scale, Activity, Calendar, Globe2 } from "lucide-react"
import { analyzeBMI, type BMIStandard } from "@/lib/bmiUtils"

function BMIDisplay({ height, weight, standard }: { height: number; weight: number; standard: BMIStandard }) {
  const result = analyzeBMI(height, weight, standard);

  return (
    <div className="p-4 rounded-lg border border-border bg-card shadow-sm col-span-2">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-purple-500" />
          <h3 className="text-sm font-semibold text-foreground">
            Body Mass Index (BMI)
          </h3>
        </div>
        <span className="text-xs px-2 py-1 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium">
          {standard} Standard
        </span>
      </div>
      <div className="space-y-1 text-sm">
        <p>
          <strong className="text-foreground">BMI:</strong>{" "}
          <span className="font-medium text-purple-600">
            {result.bmi > 0 ? result.bmi.toFixed(1) : "0.0"}
          </span>
        </p>
        <p>
          <strong className="text-foreground">Category:</strong>{" "}
          <span className={`font-semibold ${result.categoryColor}`}>{result.category}</span>
        </p>
      </div>
    </div>
  );
}

export default function DemographicSection({ form, isEditing }: { form: any; isEditing: boolean }) {
  const height = Number(form.watch("demographics.heightCm"));
  const weight = Number(form.watch("demographics.weightKg"));
  const bmiStandard = form.watch("demographics.bmiStandard") || "WHO";

  return (
    <div className="p-4 space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">

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
            <Select defaultValue={field.value} onValueChange={field.onChange} disabled={!isEditing}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select sex" />
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

        {/* Age */}
        <FormField
          control={form.control}
          name="demographics.age"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="w-4 h-4 text-green-500" />
                Age
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
            <Select defaultValue={field.value} onValueChange={field.onChange} disabled={!isEditing}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select activity level" />
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

      {/* BMI Standard */}
      <FormField
        control={form.control}
        name="demographics.bmiStandard"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2 text-sm font-medium">
              <Globe2 className="w-4 h-4 text-green-500" />
              BMI Standard
            </FormLabel>
            <Select defaultValue={field.value || "WHO"} onValueChange={field.onChange} disabled={!isEditing}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select BMI standard" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="WHO">WHO (World Health Organization)</SelectItem>
                <SelectItem value="Asian">Asian (Modified for Asian populations)</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* BMI Display */}
      <BMIDisplay height={height} weight={weight} standard={bmiStandard as BMIStandard} />
    </div>
  )
}