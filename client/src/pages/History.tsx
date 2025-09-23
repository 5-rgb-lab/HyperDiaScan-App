import { useState, useEffect } from 'react';
import ScanHistory from '@/components/ScanHistory';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToUserScanHistory, deleteScanRecord } from '@/lib/firestore';

interface ScanRecord {
  id: string;
  date: string;
  condition: 'diabetes' | 'hypertension';
  prediction: 'safe' | 'moderate' | 'risky';
  confidence: number;
  foodName?: string;
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

  useEffect(() => {
    if (!user) {
      setRecords([]);
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToUserScanHistory(user.uid, (newRecords) => {
      setRecords(newRecords);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const handleViewDetails = (record: ScanRecord) => {
    console.log('Viewing details for record:', record);
    // In real app, this would navigate to a detailed view or open a modal
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
  );
}