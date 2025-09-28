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

interface ScanRecord {
  id: string;
  date: string; // human readable (Asia/Manila)
  condition: 'diabetes' | 'hypertension';
  prediction: 'safe' | 'moderate' | 'risky';
  confidence: number;
  foodName?: string;
  reasoning?: string; // <-- new
  nutritionData: {
    calories: number;
    carbs: number;
    sodium: number;
  };
}

export default function History() {
  const { user } = useAuth();
  const [records, setRecords] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<ScanRecord | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReasoningExpanded, setIsReasoningExpanded] = useState(false);

  // reset reasoning expansion whenever a different record is selected
  useEffect(() => {
    setIsReasoningExpanded(false);
  }, [selectedRecord]);

  // Helper: convert many possible timestamp shapes into a Date, then format.
  const formatTimestamp = (ts: any) => {
    if (!ts) return 'Unknown date';

    let dateObj: Date | null = null;

    // Firestore Timestamp
    if (ts?.toDate && typeof ts.toDate === 'function') {
      dateObj = ts.toDate();
    } else if (typeof ts === 'object' && typeof ts.seconds === 'number') {
      // maybe { seconds, nanoseconds }
      dateObj = new Date(ts.seconds * 1000);
    } else if (typeof ts === 'string') {
      // ISO string
      const parsed = new Date(ts);
      dateObj = isNaN(parsed.getTime()) ? null : parsed;
    } else if (ts instanceof Date) {
      dateObj = ts;
    } else if (typeof ts === 'number') {
      // epoch ms or seconds (guess)
      dateObj = ts > 1e12 ? new Date(ts) : new Date(ts * 1000);
    }

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

  // Normalizer for numeric fields (handles strings / numbers / undefined)
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
          // record id can come from different places depending on your lib/firestore shape
          const id = r.id ?? r.docId ?? r._id ?? '';

          // timestamp might be top-level or inside a createdAt field
          const rawTimestamp = r.timestamp ?? r.createdAt ?? r.date ?? r.time ?? null;

          // nutritionData might use different naming
          const nutritionRaw = r.nutritionData ?? r.nutrition ?? r.nutrition_info ?? {};
          const calories = toNumber(nutritionRaw.calories ?? nutritionRaw.cal ?? nutritionRaw.energy);
          const carbs = toNumber(nutritionRaw.carbs ?? nutritionRaw.carbohydrates ?? nutritionRaw.carbohydrate);
          const sodium = toNumber(nutritionRaw.sodium ?? nutritionRaw['Sodium Content'] ?? nutritionRaw.sodiumContent);

          // condition/prediction normalizing
          const condition = (r.condition ?? r.disease ?? 'diabetes') as 'diabetes' | 'hypertension';

          const rawPrediction =
            typeof r.prediction === 'object' && r.prediction !== null
              ? r.prediction
              : { prediction: r.prediction ?? 'safe', confidence: r.confidence ?? 0 };

          const predStr = String(rawPrediction.prediction ?? 'safe').toLowerCase();

          let prediction: ScanRecord['prediction'] = 'safe';
          if (predStr === 'risky') prediction = 'risky';
          else if (predStr === 'moderate') prediction = 'moderate';

          const confidence = toNumber(rawPrediction.confidence ?? r.confidence ?? 0);

          // <-- extract reasoning from the nested prediction object (or top-level fallback)
          const reasoning = String(rawPrediction.reasoning ?? r.reasoning ?? '').trim();

          const foodName = r.foodName ?? r.name ?? r.label ?? undefined;
          const date = formatTimestamp(rawTimestamp ?? r.createdAt ?? r.timestamp ?? new Date());

          return {
            id,
            date,
            condition,
            prediction,
            confidence,
            foodName,
            reasoning, // <-- included here
            nutritionData: { calories, carbs, sodium },
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

  // Render
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
        <DialogContent className="max-w-xl rounded-2xl shadow-lg p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {selectedRecord?.foodName ?? 'Scan Details'}
            </DialogTitle>
            <DialogDescription>Detailed information about this scan result.</DialogDescription>
          </DialogHeader>

          {selectedRecord ? (
            <div className="space-y-4 text-sm">
              <div className="flex gap-4 items-start">
                <div className="flex-1">
                  <p><span className="font-medium">Date:</span> {selectedRecord.date}</p>
                  <p><span className="font-medium">Condition:</span> {selectedRecord.condition}</p>
                  <p>
                    <span className="font-medium">Prediction:</span>{' '}
                    <span
                      className={
                        selectedRecord.prediction === 'risky'
                          ? 'text-red-600 font-semibold'
                          : selectedRecord.prediction === 'moderate'
                          ? 'text-yellow-600 font-semibold'
                          : 'text-green-600 font-semibold'
                      }
                    >
                      {selectedRecord.prediction}
                    </span>
                  </p>
                  <p><span className="font-medium">Confidence:</span> {selectedRecord.confidence}%</p>
                </div>

                <div className="w-36 text-right">
                  <p className="font-medium">Nutrition</p>
                  <p className="text-muted-foreground">{selectedRecord.nutritionData.calories} cal</p>
                  <p className="text-muted-foreground">{selectedRecord.nutritionData.carbs} g carbs</p>
                  <p className="text-muted-foreground">{selectedRecord.nutritionData.sodium} mg sodium</p>
                </div>
              </div>

              {/* Reasoning block */}
              <div className="pt-2 border-t">
                <p className="font-medium mb-2">Reasoning</p>

                {selectedRecord.reasoning ? (
                  <>
                    <div className="text-sm text-muted-foreground whitespace-pre-wrap max-h-44 overflow-auto">
                      {isReasoningExpanded
                        ? selectedRecord.reasoning
                        : selectedRecord.reasoning.length > 300
                        ? `${selectedRecord.reasoning.slice(0, 300)}...`
                        : selectedRecord.reasoning}
                    </div>

                    {selectedRecord.reasoning.length > 300 && (
                      <div className="flex justify-end mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsReasoningExpanded((s) => !s)}
                        >
                          {isReasoningExpanded ? 'Show less' : 'Show more'}
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No reasoning available.</p>
                )}
              </div>
            </div>
          ) : (
            <p>No record selected.</p>
          )}

          <div className="flex justify-end pt-4">
            <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Page content */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold" data-testid="text-history-title">
            Scan History
          </h1>
          <p className="text-muted-foreground">
            Review your past food scans and health assessments
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
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
