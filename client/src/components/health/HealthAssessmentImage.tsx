
import { AlertTriangle, CheckCircle, XCircle, Info, Camera, TrendingUp, AlertCircle, Image as ImageIcon } from 'lucide-react';
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
    { label: 'Calories', key: 'calories', unit: 'kcal', value: getNutrient('calories'), icon: '🔥' },
    { label: 'Carbohydrates', key: 'carbohydrates', unit: '%', value: getNutrient('carbohydrates'), icon: '🌾' },
    { label: 'Protein', key: 'protein', unit: '%', value: getNutrient('protein'), icon: '💪' },
    { label: 'Total Fat', key: 'fat', unit: '%', value: getNutrient('fat', 'totalFat'), icon: '🧈' },
    { label: 'Saturated Fat', key: 'saturatedFat', unit: '%', value: getNutrient('saturatedFat'), icon: '⚠️' },
    { label: 'Trans Fat', key: 'transFat', unit: '%', value: getNutrient('transFat'), icon: '🚫' },
    { label: 'Sodium', key: 'sodium', unit: '%', value: getNutrient('sodium'), icon: '🧂' },
    { label: 'Potassium', key: 'potassium', unit: '%', value: getNutrient('potassium'), icon: '🍌' },
    { label: 'Cholesterol', key: 'cholesterol', unit: '%', value: getNutrient('cholesterol'), icon: '❤️' },
    { label: 'Dietary Fiber', key: 'fiber', unit: '%', value: getNutrient('fiber', 'dietaryFiber'), icon: '🥬' },
    { label: 'Total Sugars', key: 'totalSugars', unit: '%', value: getNutrient('totalSugars', 'sugar'), icon: '🍬' },
    { label: 'Added Sugars', key: 'addedSugars', unit: '%', value: getNutrient('addedSugars'), icon: '🍭' },
  ];

  const isSafe = prediction === 'safe';
  const bgGradient = isSafe 
    ? 'from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-teal-950/20'
    : 'from-red-50 via-orange-50 to-amber-50 dark:from-red-950/20 dark:via-orange-950/20 dark:to-amber-950/20';
  
  const borderColor = isSafe ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800';
  const textColor = isSafe ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300';
  const iconBg = isSafe 
    ? 'bg-gradient-to-br from-green-500 to-teal-500' 
    : 'bg-gradient-to-br from-red-500 to-orange-500';

  return (
    <Card className={`border-2 ${borderColor} bg-gradient-to-br ${bgGradient} overflow-hidden`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className={`${iconBg} p-3 rounded-2xl shadow-lg flex-shrink-0`}>
              {isSafe ? (
                <CheckCircle className="w-8 h-8 text-white" />
              ) : (
                <XCircle className="w-8 h-8 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className={`text-2xl font-bold ${textColor}`} data-testid="text-assessment-result">
                  {isSafe ? 'Safe for Consumption' : 'Not Recommended'}
                </CardTitle>
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg" title="Analyzed from image">
                  <Camera className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                For {condition === 'diabetes' ? 'Diabetes' : 'Hypertension'} Management • AI-Powered OCR Analysis
              </p>
            </div>
          </div>
          <Badge 
            variant={isSafe ? 'default' : 'destructive'}
            className="text-sm px-4 py-1 shadow-md"
            data-testid="badge-prediction"
          >
            {prediction.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {sourceImage && (
          <div className="relative overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
            {typeof sourceImage === 'string' && (sourceImage.startsWith('http') || sourceImage.startsWith('data:') || sourceImage.startsWith('blob:')) ? (
              <div className="relative group">
                <img
                  src={sourceImage}
                  alt="Scanned nutrition label"
                  className="w-full max-h-80 object-contain cursor-pointer transition-transform group-hover:scale-105"
                  onClick={() => window.open(sourceImage, '_blank')}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Source:</span> {sourceImage}
                </p>
              </div>
            )}
          </div>
        )}

        <div className={`p-4 rounded-xl border-2 ${borderColor} bg-white/50 dark:bg-gray-900/50`}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className={`w-5 h-5 ${textColor}`} />
            <h4 className="font-semibold text-sm">Quick Summary</h4>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {isSafe 
              ? 'This food item appears suitable for your dietary needs. Continue monitoring your overall intake.'
              : 'This food item may not align with your health goals. Consider alternatives or consume in moderation.'}
          </p>
        </div>

        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all"
              data-testid="button-toggle-reasoning"
            >
              <span className="flex items-center gap-2">
                <Info className="w-4 h-4" />
                View Detailed Analysis & Nutrition Facts
              </span>
              <span className={`text-xs transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4 space-y-4">
            <div className="p-5 bg-white/80 dark:bg-gray-900/80 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold">Medical Reasoning</h4>
              </div>
              <div className="text-sm whitespace-pre-wrap leading-relaxed text-muted-foreground" data-testid="text-medical-reasoning">
                {reasoning || 'No detailed reasoning available.'}
              </div>
            </div>

            <div className="p-5 bg-white/80 dark:bg-gray-900/80 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-sm">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <span>📊</span>
                Extracted Nutrition Facts
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allNutrients.map((nutrient) => (
                  <div 
                    key={nutrient.key} 
                    className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600"
                  >
                    <span className="text-sm font-medium flex items-center gap-2">
                      <span className="text-base">{nutrient.icon}</span>
                      {nutrient.label}
                    </span>
                    <span className="text-sm font-bold">
                      {typeof nutrient.value === 'string' ? nutrient.value : nutrient.value}
                      {nutrient.unit && <span className="text-xs text-muted-foreground ml-1">{nutrient.unit}</span>}
                    </span>
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
