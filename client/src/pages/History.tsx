import { useState, useEffect } from 'react';
import ScanHistory from '@/components/ScanHistory';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToUserScanHistory, deleteScanRecord } from '@/lib/firestore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

// Updated ScanRecord type
interface ScanRecord {
  id: string;
  date: string; // human-readable (Asia/Manila)
  condition: 'diabetes' | 'hypertension';
  prediction: 'safe' | 'risky';
  reasoning?: string;
  foodName?: string;
  nutritionData: Record<string, number>; // dynamic nutrients
}

export default function History() {
  const { user } = useAuth();
  const [records, setRecords] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<ScanRecord | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const formatTimestamp = (ts: any) => {
    if (!ts) return 'Unknown date';
    let dateObj: Date | null = null;

    if (ts?.toDate && typeof ts.toDate === 'function') dateObj = ts.toDate();
    else if (typeof ts === 'object' && typeof ts.seconds === 'number')
      dateObj = new Date(ts.seconds * 1000);
    else if (typeof ts === 'string') {
      const parsed = new Date(ts);
      dateObj = isNaN(parsed.getTime()) ? null : parsed;
    } else if (ts instanceof Date) dateObj = ts;
    else if (typeof ts === 'number') dateObj = ts > 1e12 ? new Date(ts) : new Date(ts * 1000);

    if (!dateObj || isNaN(dateObj.getTime())) return 'Invalid date';

    return dateObj.toLocaleString('en-PH', {
      timeZone: 'Asia/Manila',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const toNumber = (v: any) => {
    if (v === undefined || v === null) return 0;
    const n = Number(v);
    return isNaN(n) ? 0 : n;
  };

  useEffect(() => {
    if (!user) {
      setRecords([]);
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToUserScanHistory(user.uid, (rawRecords: any[] | null) => {
      try {
        if (!rawRecords || rawRecords.length === 0) {
          setRecords([]);
          setLoading(false);
          return;
        }

        const mapped: ScanRecord[] = rawRecords.map((r: any) => {
          const id = r.id ?? r.docId ?? r._id ?? '';
          const rawTimestamp = r.timestamp ?? r.createdAt ?? r.date ?? r.time ?? null;

          const nutritionRaw = r.nutritionData ?? r.nutrition ?? r.nutrition_info ?? {};
          const nutritionData: Record<string, number> = {};
          for (const [key, value] of Object.entries(nutritionRaw)) {
            const n = toNumber(value);
            if (n !== 0) nutritionData[key] = n;
          }

          const condition = (r.condition ?? r.disease ?? 'diabetes') as 'diabetes' | 'hypertension';

          const rawPrediction =
            typeof r.prediction === 'object' && r.prediction !== null
              ? r.prediction
              : { prediction: r.prediction ?? 'safe' };

          let prediction: ScanRecord['prediction'] = 'safe';
          const predStr = String(rawPrediction.prediction ?? 'safe').toLowerCase();
          if (predStr === 'risky') prediction = 'risky';

          const reasoning = String(rawPrediction.reasoning ?? r.reasoning ?? '').trim();
          const foodName = r.foodName ?? r.name ?? r.label ?? undefined;
          const date = formatTimestamp(rawTimestamp ?? r.createdAt ?? r.timestamp ?? new Date());

          return {
            id,
            date,
            condition,
            prediction,
            foodName,
            reasoning,
            nutritionData,
          };
        });

        setRecords(mapped);
      } catch (err) {
        console.error('Error mapping scan history records:', err);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [user]);

  const handleViewDetails = (record: ScanRecord) => {
    setSelectedRecord(record);
    setIsDialogOpen(true);
  };

  const handleDeleteRecord = async (id: string) => {
    try {
      await deleteScanRecord(id);
      console.log('Record deleted:', id);
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };

  return (
    <>
      {/* Dialog for details */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setSelectedRecord(null);
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
              {/* Top info: Condition & Prediction */}
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

                {/* Nutrition Summary */}
                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-xl space-y-2">
                  <p className="font-semibold text-blue-700 dark:text-blue-300 text-center text-sm uppercase tracking-wide">
                    Nutrition Facts
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.entries(selectedRecord.nutritionData).map(([key, value]) => (
                      <div
                        key={key}
                        className="bg-white dark:bg-gray-800 p-2 rounded-md shadow-sm text-center"
                      >
                        <p className="text-xs uppercase text-gray-500 dark:text-gray-400 tracking-wide">{key}</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reasoning */}
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

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-3">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
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

      {/* Page content */}
      <div className="space-y-6">
        <div className="text-center space-y-2 p-6 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-lg border">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Scan History
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Review your past food scans and health assessments
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Loading your scan history...
          </div>
        ) : (
          <ScanHistory
            records={records}
            onViewDetails={handleViewDetails}
            onDeleteRecord={handleDeleteRecord}
          />
        )}
      </div>
    </>
  );
}
