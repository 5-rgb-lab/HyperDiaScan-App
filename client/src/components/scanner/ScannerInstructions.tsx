import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Apple } from 'lucide-react';

export default function ScannerInstructions() {
  return (
    <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 border-2 border-blue-300 dark:border-blue-700">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-blue-500 rounded-lg shadow-lg flex-shrink-0">
            <Apple className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 space-y-3">
            <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100">📋 How to Find Nutritional Information</h2>
            <div className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
              <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                <p className="font-semibold mb-2">🔍 Step 1: Locate the Nutrition Facts Label</p>
                <p>Look for the "Nutrition Facts" panel on the back or side of the product package. It's usually a black and white table.</p>
              </div>

              <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                <p className="font-semibold mb-2">📝 Step 2: Find Key Information</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Serving Size:</strong> Located at the top (e.g., "1 cup (240g)")</li>
                  <li><strong>Calories:</strong> Usually the first number after serving size</li>
                  <li><strong>Nutrients:</strong> Listed below calories (carbs, protein, fat, sodium, etc.)</li>
                </ul>
              </div>

              <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                <p className="font-semibold mb-2">✏️ Step 3: Input the Values</p>
                <p>Enter each nutrient value into the corresponding field below. <strong>If a nutrient is not listed on the label, simply enter 0.</strong></p>
              </div>

              <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-lg border border-amber-300 dark:border-amber-700">
                <p className="font-semibold text-amber-900 dark:text-amber-100">💡 Pro Tip:</p>
                <p className="text-amber-800 dark:text-amber-200">Pay attention to "per serving" vs "per container" values. Make sure you're entering the per serving amounts!</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
