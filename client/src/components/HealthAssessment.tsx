import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface HealthAssessmentProps {
  prediction: 'safe' | 'risky';
  condition: 'diabetes' | 'hypertension';
  reasoning: string;
  nutritionData: {
    calories: number;
    carbohydrates: number;
    protein: number;
    fat: number;
    sodium: number;
    fiber: number;
    // support both legacy `sugar` and new `totalSugars`
    sugar?: number;
    totalSugars?: number;
  };
}

export default function HealthAssessment({ 
  prediction, 
  condition,
  reasoning,
  nutritionData 
}: HealthAssessmentProps) {
  const [isExpanded, setIsExpanded] = useState(false);


  const getNutrient = (...keys: Array<keyof typeof nutritionData | string>) => {
    for (const k of keys) {
      // @ts-ignore - index into dynamic keys
      const val = (nutritionData as any)[k];
      if (val === undefined || val === null) continue;
      const num = Number(val);
      if (!Number.isNaN(num)) return num;
    }
    return 0;
  };

  // Get all nutrients with proper fallbacks and display formatting
  const allNutrients = [
    { label: 'Calories', key: 'calories', unit: 'kcal', value: getNutrient('calories') },
    { label: 'Carbohydrates', key: 'carbohydrates', unit: 'g', value: getNutrient('carbohydrates') },
    { label: 'Protein', key: 'protein', unit: 'g', value: getNutrient('protein') },
    { label: 'Total Fat', key: 'fat', unit: 'g', value: getNutrient('fat', 'totalFat') },
    { label: 'Saturated Fat', key: 'saturatedFat', unit: 'g', value: getNutrient('saturatedFat') },
    { label: 'Trans Fat', key: 'transFat', unit: 'g', value: getNutrient('transFat') },
    { label: 'Sodium', key: 'sodium', unit: 'mg', value: getNutrient('sodium') },
    { label: 'Potassium', key: 'potassium', unit: 'mg', value: getNutrient('potassium') },
    { label: 'Cholesterol', key: 'cholesterol', unit: 'mg', value: getNutrient('cholesterol') },
    { label: 'Dietary Fiber', key: 'fiber', unit: 'g', value: getNutrient('fiber', 'dietaryFiber') },
    { label: 'Total Sugars', key: 'totalSugars', unit: 'g', value: getNutrient('totalSugars', 'sugar') },
    { label: 'Added Sugars', key: 'addedSugars', unit: 'g', value: getNutrient('addedSugars') },
    { label: 'Serving Size', key: 'servingSize', unit: '', value: (nutritionData as any).servingSize || '' },
    { label: 'Servings Per Container', key: 'servingsPerContainer', unit: '', value: getNutrient('servingsPerContainer') },
  ];

  const getStatusColor = () => {
    switch (prediction) {
      case 'safe': return 'text-green-600 border-green-200 bg-green-50';
      case 'risky': return 'text-red-600 border-red-200 bg-red-50';
      default: return 'text-gray-600 border-gray-200 bg-gray-50';
    }
  };

  const getStatusIcon = () => {
    switch (prediction) {
      case 'safe': return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'risky': return <XCircle className="w-6 h-6 text-red-600" />;
      default: return <Info className="w-6 h-6 text-gray-600" />;
    }
  };

  const getStatusText = () => {
    switch (prediction) {
      case 'safe': return 'Safe for Consumption';
      case 'risky': return 'Not Recommended';
      default: return 'Analysis Complete';
    }
  };

  return (
    <Card className={`border-2 ${getStatusColor()}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <CardTitle className="text-lg" data-testid="text-assessment-result">
                {getStatusText()}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                For {condition === 'diabetes' ? 'Diabetes' : 'Hypertension'} Management
              </p>
            </div>
          </div>
          <Badge 
            variant={prediction === 'safe' ? 'default' : 'destructive'}
            data-testid="badge-prediction"
          >
            {prediction.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Confidence Score</span>
          </div>
        </div>

        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-between"
              data-testid="button-toggle-reasoning"
            >
              View Medical Reasoning
              <Info className="w-4 h-4" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Analysis Details:</h4>
              {/* Medical reasoning from the model (preserve newlines) */}
              <div className="mb-4 text-sm whitespace-pre-wrap" data-testid="text-medical-reasoning">
                <span className="font-medium">Medical Reasoning:</span>
                <div className="mt-2">{reasoning || 'No detailed reasoning available.'}</div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                {allNutrients.map((nutrient) => (
                  <div key={nutrient.key}>
                    <span className="font-medium">{nutrient.label}:</span>{' '}
                    {typeof nutrient.value === 'string' ? nutrient.value : nutrient.value}
                    {nutrient.unit && <span className="text-xs text-muted-foreground ml-1">{nutrient.unit}</span>}
                  </div>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}