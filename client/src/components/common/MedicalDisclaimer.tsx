import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export default function MedicalDisclaimer() {
  return (
    <Card className="bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-red-950/30 border-2 border-amber-300 dark:border-amber-700 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-500 rounded-xl shadow-lg flex-shrink-0">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-2">⚠️ Important Medical Disclaimer</h2>
            <div className="space-y-2 text-amber-800 dark:text-amber-200">
              <p className="leading-relaxed"><strong>This application is a health assistance tool only and should not replace professional medical advice.</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Do not rely entirely on the analysis results provided by this system</li>
                <li>Always consult with your doctor or healthcare provider before making dietary decisions</li>
                <li>This tool is designed to support, not substitute, your healthcare professional's guidance</li>
                <li>Individual health needs vary - seek personalized medical advice for your specific condition</li>
              </ul>
              <p className="text-sm font-semibold mt-3">If you have any concerns about your health or diet, please contact your healthcare provider immediately.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
