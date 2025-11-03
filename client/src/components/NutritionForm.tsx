import { useEffect } from "react";
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
import { Apple, Flame } from "lucide-react";

interface NutritionFormProps {
  initialData?: Partial<AnalyzeFoodRequest>;
  onAnalyze: (data: AnalyzeFoodRequest) => void;
}

export default function NutritionForm({
  initialData,
  onAnalyze,
}: NutritionFormProps) {
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
      sugar: 0,
      ...initialData,
    },
  });

  useEffect(() => {
    if (initialData) {
      Object.entries(initialData).forEach(([key, value]) => {
        if (value !== undefined) {
          form.setValue(key as keyof AnalyzeFoodRequest, value);
        }
      });
    }
  }, [initialData, form]);

  const onSubmit = async (data: AnalyzeFoodRequest) => {
    console.log("Submitting nutrition data:", data);

    try {
      if (!onAnalyze) throw new Error("onAnalyze function not provided!");
      await onAnalyze(data);
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
    <Card className="border border-border shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Apple className="w-5 h-5 text-blue-500" />
          <CardTitle className="text-lg text-foreground">
            Review & Edit Nutrition Facts
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        {/* ✅ Use FormProvider so FormField has access to useFormContext */}
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Product Name Field */}
            <FormField
              control={form.control}
              name="foodName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Apple className="w-4 h-4 text-blue-500" />
                    Product Name
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Greek Yogurt" />
                  </FormControl>
                </FormItem>
              )}
            />

            <Separator />

            {/* Nutrition Fields */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Flame className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-medium text-foreground">
                  Nutrition Information
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "calories", label: "Calories" },
                  { name: "carbohydrates", label: "Carbohydrates (g)" },
                  { name: "protein", label: "Protein (g)" },
                  { name: "fat", label: "Total Fat (g)" },
                  { name: "sodium", label: "Sodium (mg)" },
                  { name: "fiber", label: "Dietary Fiber (g)" },
                  { name: "sugar", label: "Sugar (g)" },
                ].map((fieldData) => (
                  <FormField
                    key={fieldData.name}
                    control={form.control}
                    name={fieldData.name as keyof AnalyzeFoodRequest}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{fieldData.label}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              Analyze Food Safety
            </Button>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
