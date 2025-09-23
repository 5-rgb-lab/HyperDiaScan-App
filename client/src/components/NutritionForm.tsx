import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

import { analyzeFoodSchema, AnalyzeFoodRequest } from '@shared/schema';

interface NutritionFormProps {
  initialData?: Partial<AnalyzeFoodRequest>;
  onAnalyze: (data: AnalyzeFoodRequest) => void;
}

export default function NutritionForm({ initialData, onAnalyze }: NutritionFormProps) {
  const form = useForm<AnalyzeFoodRequest>({
    resolver: zodResolver(analyzeFoodSchema),
    defaultValues: {
      calories: 0,
      carbohydrates: 0,
      protein: 0,
      fat: 0,
      sodium: 0,
      fiber: 0,
      condition: 'diabetes',
      ...initialData
    }
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

  const onSubmit = (data: AnalyzeFoodRequest) => {
    console.log('Analyzing nutrition data:', data);
    onAnalyze(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Review & Edit Nutrition Facts</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="calories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calories</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        data-testid="input-calories"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="carbohydrates"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Carbohydrates (g)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        data-testid="input-carbohydrates"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="protein"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Protein (g)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        data-testid="input-protein"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Fat (g)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        data-testid="input-fat"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sodium"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sodium (mg)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        data-testid="input-sodium"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fiber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dietary Fiber (g)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        data-testid="input-fiber"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <FormField
              control={form.control}
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Health Condition</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-condition">
                        <SelectValue placeholder="Select your condition" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="diabetes">Diabetes</SelectItem>
                      <SelectItem value="hypertension">Hypertension</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" data-testid="button-analyze">
              Analyze Food Safety
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}