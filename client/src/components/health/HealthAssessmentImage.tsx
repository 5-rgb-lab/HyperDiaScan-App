import { AlertTriangle, CheckCircle, XCircle, Info, Camera } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { NutritionData } from '@shared/schema';

interface HealthAssessmentImageProps {
  prediction: 'safe' | 'risky';
  condition: 'diabetes' | 'hypertension';
  reasoning: string;
  nutritionData: NutritionData;
  sourceImage?: string;
}

export default function HealthAssessmentImage({
  prediction,
  condition,
  reasoning,
  nutritionData,
  sourceImage,
}: HealthAssessmentImageProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getNutrient = (...keys: Array<keyof typeof nutritionData | string>) => {
    for (const k of keys) {
      const val = (nutritionData as any)[k];
      if (val === undefined || val === null) continue;
      const num = Number(val);
      if (!Number.isNaN(num)) return num;
    }
    return 0;
  };

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
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg" data-testid="text-assessment-result">
                  {getStatusText()}
                </CardTitle>
                <div title="Analyzed from image">
                  <Camera className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                For {condition === 'diabetes' ? 'Diabetes' : 'Hypertension'} Management (OCR Analysis)
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
        {sourceImage && (
          <div className="space-y-2">
            {/* If sourceImage looks like a URL or data/blob URL, show an image preview */}
            {typeof sourceImage === 'string' && (sourceImage.startsWith('http') || sourceImage.startsWith('data:') || sourceImage.startsWith('blob:')) ? (
              <div className="w-full flex justify-center">
                <img
                  src={sourceImage}
                  alt="Uploaded food"
                  className="w-full max-h-72 object-contain rounded-md border"
                  onClick={() => window.open(sourceImage, '_blank')}
                />
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">Source:</span> {sourceImage}
              </div>
            )}
          </div>
        )}

        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between"
              data-testid="button-toggle-reasoning"
            >
              View Analysis & Nutrition Facts
              <Info className="w-4 h-4" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <div className="p-4 bg-muted/50 rounded-lg space-y-4">
              <div>
                <h4 className="font-medium mb-2">Medical Reasoning:</h4>
                <div className="text-sm whitespace-pre-wrap" data-testid="text-medical-reasoning">
                  {reasoning || 'No detailed reasoning available.'}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Extracted Nutrition Facts:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {allNutrients.map((nutrient) => (
                    <div key={nutrient.key}>
                      <span className="font-medium">{nutrient.label}:</span>{' '}
                      {typeof nutrient.value === 'string' ? nutrient.value : nutrient.value}
                      {nutrient.unit && <span className="text-xs text-muted-foreground ml-1">{nutrient.unit}</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
