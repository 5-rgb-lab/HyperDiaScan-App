import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

type ScanRecord = {
  id?: string;
  date?: string;
  condition?: string;
  prediction?: string;
  reasoning?: string;
  foodName?: string;
  nutritionData?: Record<string, number>;
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
  return (
    <Dialog
      open={open}
      onOpenChange={(openState) => {
        onOpenChange(openState);
      }}
    >
      <DialogContent className="max-w-xl rounded-3xl shadow-2xl p-6 bg-white dark:bg-gray-900">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-2xl font-bold text-blue-600 flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            {selectedRecord?.foodName ?? 'Scan Details'}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
            Detailed information about this scan result.
          </DialogDescription>
        </DialogHeader>

        {selectedRecord ? (
          <div className="mt-4 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-gray-700 dark:text-gray-200">Date:</span> {selectedRecord.date}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-gray-700 dark:text-gray-200">Condition:</span> <span className="capitalize">{selectedRecord.condition}</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-gray-700 dark:text-gray-200">Prediction:</span>{' '}
                  <span
                    className={`font-semibold px-2 py-1 rounded-lg text-sm ${
                      selectedRecord.prediction === 'risky'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    }`}
                  >
                    {selectedRecord.prediction === 'risky' ? 'Not Recommended' : 'Safe for Consumption'}
                  </span>
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-xl space-y-2">
                <p className="font-semibold text-blue-700 dark:text-blue-300 text-center text-sm uppercase tracking-wide">
                  Nutrition Facts
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {selectedRecord.nutritionData && Object.entries(selectedRecord.nutritionData).map(([key, value]) => (
                    <div key={key} className="bg-white dark:bg-gray-800 p-2 rounded-md shadow-sm text-center">
                      <p className="text-xs uppercase text-gray-500 dark:text-gray-400 tracking-wide">{key}</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t pt-3">
              <p className="font-semibold text-gray-700 dark:text-gray-200 mb-2 text-sm">Reasoning</p>
              {selectedRecord.reasoning ? (
                <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap max-h-48 overflow-auto p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                  {selectedRecord.reasoning}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No reasoning available.</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="text-blue-600 border-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700"
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-6">No record selected.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
