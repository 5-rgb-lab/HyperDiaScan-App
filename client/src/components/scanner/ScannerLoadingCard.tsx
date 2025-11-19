
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Sparkles } from 'lucide-react';

export default function ScannerLoadingCard() {
  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-blue-50 via-purple-50 to-teal-50 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-teal-950/30 overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-900"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              <div className="absolute inset-4 rounded-full border-4 border-transparent border-t-teal-500 animate-spin" style={{ animationDuration: '1s' }}></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-purple-600 animate-pulse" />
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
                Analyzing Nutrition
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Our AI is reviewing the nutrition data against your health profile...
              </p>
            </div>

            <div className="w-full max-w-xs">
              <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 rounded-full animate-pulse" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-red-950/30 border-2 border-amber-300 dark:border-amber-700 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-md flex-shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-100 mb-1 flex items-center gap-1">
                <span>⚠️</span> Medical Disclaimer
              </h3>
              <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                This analysis is for informational purposes only and should not replace professional medical advice. Always consult with your healthcare provider before making dietary decisions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
