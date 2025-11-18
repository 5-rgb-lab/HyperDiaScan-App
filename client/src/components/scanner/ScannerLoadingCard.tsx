import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export default function ScannerLoadingCard() {
  return (
    <div className="space-y-4">
      <div className="p-6 rounded-lg shadow-md bg-muted text-center space-y-3">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary mx-auto"></div>
        <p className="font-medium text-primary">Analyzing your nutrition label...</p>
        <p className="text-sm text-muted-foreground">Checking against your health profile...</p>
      </div>
      <Card className="bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-red-950/30 border-2 border-amber-300 dark:border-amber-700">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-500 rounded-lg shadow-lg flex-shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-100 mb-1 flex items-center gap-1"><span>⚠️</span> Medical Disclaimer</h3>
              <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">This analysis is for informational purposes only and should not replace professional medical advice. Always consult with your healthcare provider before making dietary decisions.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
