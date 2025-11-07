import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Pill, HeartPulse } from "lucide-react";

export default function TreatmentSection({
  form,
  isEditing,
}: {
  form: any;
  isEditing: boolean;
}) {
  const condition = form.watch("primaryCondition");
  const insulinUse = form.watch("treatmentManagement.diabetesManagement.insulinUse");

  return (
    <div className="p-4 grid grid-cols-1 gap-4">
      {/* Diabetes Management */}
      {(condition === "diabetes" || condition === "both") && (
        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 mb-3">
            <Pill className="w-4 h-4 text-pink-500" />
            <h3 className="text-sm font-semibold text-foreground">
              Diabetes Management
            </h3>
          </div>

          {/* Insulin Use */}
          <FormField
            control={form.control}
            name="treatmentManagement.diabetesManagement.insulinUse"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between">
                <FormLabel>Insulin Use</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={!isEditing}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Insulin Type */}
          {insulinUse && (
            <FormField
              control={form.control}
              name="treatmentManagement.diabetesManagement.insulinType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Insulin Type</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={!isEditing}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Short-acting">Short-acting</SelectItem>
                        <SelectItem value="Long-acting">Long-acting</SelectItem>
                        <SelectItem value="Both">Both</SelectItem>
                        <SelectItem value="Premixed">Premixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Insulin Timing */}
          {insulinUse && (
            <FormField
              control={form.control}
              name="treatmentManagement.diabetesManagement.insulinTiming"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Insulin Timing</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={!isEditing}
                    >
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
                        <SelectItem value="As prescribed">As prescribed</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      )}

      {/* Hypertension Management */}
      {(condition === "hypertension" || condition === "both") && (
        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 mb-3">
            <HeartPulse className="w-4 h-4 text-orange-500" />
            <h3 className="text-sm font-semibold text-foreground">
              Hypertension Management
            </h3>
          </div>

          <FormField
            control={form.control}
            name="treatmentManagement.hypertensionManagement.antihypertensiveMeds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Antihypertensive Medications (comma separated)
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g., Losartan, Amlodipine"
                    disabled={!isEditing}
                    onChange={(e) =>
                      field.onChange(e.target.value.split(",").map((v: string) => v.trim()))
                    }
                    value={
                      Array.isArray(field.value)
                        ? field.value.join(", ")
                        : field.value || ""
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="treatmentManagement.hypertensionManagement.medicationTiming"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Medication Timing</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!isEditing}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Morning">Morning</SelectItem>
                      <SelectItem value="Evening">Evening</SelectItem>
                      <SelectItem value="Both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
}
