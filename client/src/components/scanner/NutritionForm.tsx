import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { analyzeFoodSchema, AnalyzeFoodRequest } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Apple, Flame, Sparkles } from "lucide-react";
import { UserProfile } from "@shared/schema";

interface NutritionFormProps {
  initialData?: Partial<AnalyzeFoodRequest>;
  userCondition?: "diabetes" | "hypertension" | "both";
  onAnalyze: (data: AnalyzeFoodRequest, options?: { unit?: 'reni' | 'grams' }) => void;
}

export default function NutritionForm({
  initialData,
  userCondition = "diabetes",
  onAnalyze,
}: NutritionFormProps) {
  const [units, setUnits] = useState<Record<string, string>>({});
  const form = useForm<AnalyzeFoodRequest>({
    resolver: zodResolver(analyzeFoodSchema),
    defaultValues: {
      foodName: "",
      calories: 0,
      carbohydrates: 0,
      protein: 0,
      fat: 0,
      sodium: 0,
      fiber: 0,
      totalSugars: 0,
      addedSugars: 0,
      saturatedFat: 0,
      transFat: 0,
      potassium: 0,
      cholesterol: 0,
      servingSize: "",
      servingsPerContainer: 0,
      condition: userCondition,
    },
  });

  useEffect(() => {
    if (initialData) {
      const formData = {
        foodName: initialData.foodName || "",
        calories: Number(initialData.calories) || 0,
        carbohydrates: Number(initialData.carbohydrates) || 0,
        protein: Number(initialData.protein) || 0,
        fat: Number(initialData.fat) || 0,
        sodium: Number(initialData.sodium) || 0,
        fiber: Number(initialData.fiber) || 0,
        totalSugars: Number((initialData as any).totalSugars) || 0,
        addedSugars: Number((initialData as any).addedSugars) || 0,
        saturatedFat: Number((initialData as any).saturatedFat) || 0,
        transFat: Number((initialData as any).transFat) || 0,
        potassium: Number((initialData as any).potassium) || 0,
        cholesterol: Number((initialData as any).cholesterol) || 0,
        servingSize: (initialData as any).servingSize || "",
        servingsPerContainer: Number((initialData as any).servingsPerContainer) || 0,
        condition: userCondition,
      };
      // initialize units state from any incoming data (backwards compatible)
      const initialUnits: Record<string, string> = (initialData as any)?.units || {};
      setUnits(initialUnits);
      form.reset(formData);
    }
  }, [initialData, form, userCondition]);

  const onSubmit = async (data: AnalyzeFoodRequest) => {
    try {
      const formattedData: AnalyzeFoodRequest = {
        ...data,
        calories: Number(data.calories),
        carbohydrates: Number(data.carbohydrates),
        protein: Number(data.protein),
        fat: Number(data.fat),
        sodium: Number(data.sodium),
        fiber: Number(data.fiber),
        totalSugars: Number((data as any).totalSugars),
        addedSugars: Number((data as any).addedSugars || 0),
        saturatedFat: Number((data as any).saturatedFat || 0),
        transFat: Number((data as any).transFat || 0),
        potassium: Number((data as any).potassium || 0),
        cholesterol: Number((data as any).cholesterol || 0),
        servingSize: (data as any).servingSize || "",
        servingsPerContainer: Number((data as any).servingsPerContainer || 0),
        condition: data.condition || userCondition,
      };

      // attach units map (per-nutrient) to payload for richer prompts
      // keep backwards compatibility: if no units were selected, default mapping will be handled by promptBuilder
      const payloadWithUnits = {
        ...formattedData,
        units: units,
      } as any;
      if (!onAnalyze) throw new Error("onAnalyze function not provided!");
      await onAnalyze(payloadWithUnits, { unit: 'grams' });
    } catch (error) {
      console.error("Error analyzing food:", error);
      alert(
        `Failed to analyze food: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-emerald-50/30 to-green-50/30 dark:from-gray-800 dark:via-emerald-950/20 dark:to-green-950/20">
      <CardHeader className="space-y-1 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg">
            <Apple className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Review & Edit Nutrition Facts
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Verify extracted values and make any corrections
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="foodName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Apple className="w-4 h-4 text-primary" />
                    Product Name
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="e.g., Greek Yogurt"
                      className="h-12 border-2 focus:border-primary transition-colors"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Separator className="my-4 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-gradient-to-r from-primary to-secondary">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow">
                  <Flame className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-base font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Nutrition Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: "calories", label: "Calories", unit: "kcal", icon: "" },
                  { name: "carbohydrates", label: "Carbohydrates", unit: "g", icon: "" },
                  { name: "totalSugars", label: "Total Sugars", unit: "g", icon: "" },
                  { name: "addedSugars", label: "Added Sugars", unit: "g", icon: "" },
                  { name: "protein", label: "Protein", unit: "g", icon: "" },
                  { name: "fat", label: "Total Fat", unit: "g", icon: "" },
                  { name: "saturatedFat", label: "Saturated Fat", unit: "g", icon: "" },
                  { name: "transFat", label: "Trans Fat", unit: "g", icon: "" },
                  { name: "sodium", label: "Sodium", unit: "mg", icon: "" },
                  { name: "potassium", label: "Potassium", unit: "mg", icon: "" },
                  { name: "cholesterol", label: "Cholesterol", unit: "mg", icon: "" },
                  { name: "fiber", label: "Dietary Fiber", unit: "g", icon: "" },
                  { name: "servingSize", label: "Serving Size", unit: "text", icon: "" },
                  { name: "servingsPerContainer", label: "Servings / Container", unit: "count", icon: "" },
                ].map((fieldData) => (
                  <FormField
                    key={fieldData.name}
                    control={form.control}
                    name={fieldData.name as any}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <span className="text-base">{fieldData.icon}</span>
                          <span>{fieldData.label}</span>
                          {fieldData.unit !== "text" && fieldData.unit !== "count" && (
                            <span className="text-xs text-muted-foreground">({fieldData.unit})</span>
                          )}
                        </FormLabel>
                        <FormControl>
                          {fieldData.unit === 'text' ? (
                            <Input 
                              {...(field as any)} 
                              placeholder="e.g., 1 cup (240g)"
                              className="h-11 border-2 focus:border-primary transition-colors"
                            />
                          ) : (
                            <div className="relative">
                              <Input
                                type="number"
                                step="any"
                                min="0"
                                {...(field as any)}
                                value={typeof field.value === 'number' ? (field.value === 0 ? "" : field.value) : ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  const numValue = value === "" ? 0 : parseFloat(value) || 0;
                                  field.onChange(Math.max(0, numValue));
                                }}
                                className="h-11 border-2 focus:border-primary transition-colors pr-16"
                                placeholder="0"
                              />
                              {fieldData.unit !== "count" && fieldData.unit !== "kcal" && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                  <div className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                                    {/** display selected unit or default */}
                                    {units[fieldData.name] || fieldData.unit}
                                  </div>
                                  <select
                                    aria-label={`${fieldData.name}-unit`}
                                    value={units[fieldData.name] || fieldData.unit}
                                    onChange={(e) => setUnits((prev) => ({ ...prev, [fieldData.name]: e.target.value }))}
                                    className="rounded px-2 py-1 text-xs border"
                                  >
                                    <option value="g">g</option>
                                    <option value="mg">mg</option>
                                    {/* <option value="ml">ml</option> */}
                                  </select>
                                </div>
                              )}
                            </div>
                          )}
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>

            <Separator className="my-4 bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />

            <Button
              type="submit"
              className="w-full h-14 text-base font-bold bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-600 hover:via-green-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Analyze Food Safety
            </Button>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}