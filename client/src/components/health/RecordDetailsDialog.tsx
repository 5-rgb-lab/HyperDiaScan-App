
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, X, CheckCircle2, AlertTriangle, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

type ScanRecord = {
  id?: string;
  date?: string;
  condition?: string;
  prediction?: string;
  reasoning?: string;
  foodName?: string;
  nutritionData?: Record<string, number>;
  imageUrl?: string;
};

export default function RecordDetailsDialog({
  open,
  onOpenChange,
  selectedRecord,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRecord: ScanRecord | null;
}) {
  const isSafe = selectedRecord?.prediction === 'safe';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-2xl p-0 bg-white dark:bg-gray-900 max-h-[90vh] flex flex-col mx-2 sm:mx-0 overflow-hidden border-0 shadow-2xl">
        {/* Modern Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 dark:from-blue-700 dark:via-purple-700 dark:to-teal-700 px-6 py-8 sm:px-8 sm:py-10">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-2xl sm:text-3xl font-bold text-white pr-8">
              {selectedRecord?.foodName ?? 'Scan Details'}
            </DialogTitle>
            <DialogDescription className="text-white/80 text-sm sm:text-base">
              Detailed nutrition analysis and health assessment
            </DialogDescription>
          </DialogHeader>
        </div>

        {selectedRecord ? (
          <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 sm:py-8 space-y-6">
            {/* Image Preview */}
            {selectedRecord.imageUrl && (
              <div className="relative rounded-xl overflow-hidden shadow-md">
                <img 
                  src={selectedRecord.imageUrl} 
                  alt={selectedRecord.foodName || 'scan image'} 
                  className="w-full h-48 sm:h-64 object-cover" 
                />
              </div>
            )}

            {/* Status Badge */}
            <div className="flex justify-center">
              <Badge 
                className={`px-5 py-2.5 text-base font-medium rounded-full flex items-center gap-2 ${
                  isSafe
                    ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white'
                    : 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                }`}
              >
                {isSafe ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Safe for Consumption
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5" />
                    Not Recommended
                  </>
                )}
              </Badge>
            </div>

            <Separator className="my-4" />

            {/* Quick Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-1.5">
                  <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase">Date Scanned</span>
                </div>
                <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{selectedRecord.date}</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-1.5">
                  <Activity className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase">Condition</span>
                </div>
                <p className="text-base font-semibold text-gray-900 dark:text-gray-100 capitalize">{selectedRecord.condition}</p>
              </div>
            </div>

            {/* Nutrition Facts */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Nutrition Facts
              </h3>
              {selectedRecord.nutritionData && Object.keys(selectedRecord.nutritionData).length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(selectedRecord.nutritionData).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                      <p className="text-xs uppercase text-gray-500 dark:text-gray-400 font-medium mb-1">{key}</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-6 text-sm">No nutrition data available</p>
              )}
            </div>

            {/* Reasoning Section */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Health Assessment
              </h3>
              {selectedRecord.reasoning ? (
                <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-xl text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap max-h-48 overflow-auto">
                  {selectedRecord.reasoning}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic p-5 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  No detailed reasoning available for this scan.
                </p>
              )}
            </div>

            {/* Action Button */}
            <div className="flex justify-center pt-2">
              <Button
                onClick={() => onOpenChange(false)}
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 hover:from-blue-700 hover:via-purple-700 hover:to-teal-700 text-white font-semibold px-8 py-3 rounded-full shadow-md hover:shadow-lg transition-all"
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <p className="text-center text-gray-500 dark:text-gray-400">No record selected.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
