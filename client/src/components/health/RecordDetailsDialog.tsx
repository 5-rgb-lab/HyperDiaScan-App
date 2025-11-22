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

  const [showFullImage, setShowFullImage] = React.useState(false);

  return (
    <>
      {/* MAIN DIALOG */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-xl rounded-xl p-0 bg-white dark:bg-gray-900 max-h-[90vh] flex flex-col overflow-hidden border shadow-lg">

          {/* Header */}
          <div className="px-6 py-5 border-b relative bg-gray-50 dark:bg-gray-800">
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-4 right-4 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close"
            >
            </button>

            <DialogHeader className="space-y-1 flex flex-col items-center text-center">
              <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {selectedRecord?.foodName ?? 'Scan Details'}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
                Nutrition and condition overview
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Body */}
          {selectedRecord ? (
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

              {/* Image */}
              {selectedRecord.imageUrl && (
                <div
                  onClick={() => setShowFullImage(true)}
                  className="relative rounded-xl overflow-hidden border bg-gray-100 dark:bg-gray-800 cursor-pointer group"
                >
                  <img
                    src={selectedRecord.imageUrl}
                    alt={selectedRecord.foodName || 'scan image'}
                    className="w-full h-48 object-cover transition group-hover:opacity-90"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition"></div>
                </div>
              )}

              {/* Status */}
              <div className="flex justify-center">
                <Badge
                  className={`px-4 py-1.5 text-sm font-medium rounded-full flex items-center gap-2 border ${
                    isSafe
                      ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                      : 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                  }`}
                >
                  {isSafe ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Safe
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4" /> Not Recommended
                    </>
                  )}
                </Badge>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-semibold text-gray-500 uppercase">
                      Date
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {selectedRecord.date}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-semibold text-gray-500 uppercase">
                      Condition
                    </span>
                  </div>
                  <p className="text-sm font-medium capitalize text-gray-800 dark:text-gray-200">
                    {selectedRecord.condition}
                  </p>
                </div>
              </div>

              {/* Nutrition */}
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Nutrition Facts
                </h3>

                {selectedRecord.nutritionData && Object.keys(selectedRecord.nutritionData).length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Object.entries(selectedRecord.nutritionData).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border">
                        <p className="text-xs uppercase text-gray-500 mb-1">{key}</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{value}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-5 text-sm">
                    No nutrition data available
                  </p>
                )}
              </div>

              {/* Reasoning */}
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Health Assessment
                </h3>

                {selectedRecord.reasoning ? (
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border text-sm text-gray-700 dark:text-gray-300 leading-relaxed max-h-40 overflow-auto whitespace-pre-wrap">
                    {selectedRecord.reasoning}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                    No reasoning provided.
                  </p>
                )}
              </div>

              <div className="flex justify-center pt-2">
                <Button
                  onClick={() => onOpenChange(false)}
                  className="px-6 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-sm"
                >
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <p className="text-center text-gray-500 dark:text-gray-400">
                No record selected.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* FULL IMAGE VIEWER — FIXED ACCESSIBILITY */}
      <Dialog open={showFullImage} onOpenChange={setShowFullImage}>
        <DialogContent className="max-w-4xl bg-transparent border-none shadow-none p-0">

          {/* REQUIRED FOR RADIX (HIDDEN) */}
          <DialogHeader className="sr-only">
            <DialogTitle>Full Image</DialogTitle>
            <DialogDescription>Displays the scanned image in full size</DialogDescription>
          </DialogHeader>

          <div className="relative flex items-center justify-center">
            <img
              src={selectedRecord?.imageUrl}
              alt="Full"
              className="max-h-[90vh] w-auto rounded-xl shadow-xl"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
