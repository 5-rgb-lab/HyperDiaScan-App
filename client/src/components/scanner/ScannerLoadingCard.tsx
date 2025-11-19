
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
                <svg
                    className="w-10 h-10 heartbeat"
                    viewBox="0 0 512 512"
                    fill="url(#grad1)"
                  >
                    <defs>
                      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#4ef2c3"/>
                        <stop offset="100%" stop-color="#3aa9ff"/>
                      </linearGradient>
                    </defs>
                    <path d="M496 232h-73.4l-40.9-102.4c-4.8-12.1-16.5-19.6-29.4-19.6s-24.5 7.6-29.3 19.6l-71.5 179.2-45.8-91.7c-5.3-10.5-15.9-17.1-27.7-17.1-11.8 0-22.4 6.6-27.7 17.2l-37.7 75.1H16c-8.8 0-16 7.2-16 16s7.2 16 16 16h117.6c12 0 22.8-6.9 28-17.8l23.8-47.4 46 92c5.2 10.3 15.5 16.9 27.1 17.1h.6c11.4 0 21.8-6.7 26.9-17.4l70.9-177.2 27.4 68.6c4.8 12.1 16.5 19.6 29.4 19.6H496c8.8 0 16-7.2 16-16s-7.2-16-16-16z"/>
                  </svg>
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
