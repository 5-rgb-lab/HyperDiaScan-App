import React from 'react';
import { ScanHistory } from '@/components/health';

interface ScanRecord {
  id: string;
  date: string;
  condition: 'diabetes' | 'hypertension';
  prediction: 'safe' | 'risky';
  reasoning?: string;
  foodName?: string;
  nutritionData: Record<string, number>;
  imageUrl?: string;
}

interface UserHistoryTabProps {
  records: ScanRecord[];
  loading: boolean;
  onViewDetails: (record: ScanRecord) => void;
  onDeleteRecord: (id: string) => void;
}

export default function UserHistoryTab({ 
  records, 
  loading, 
  onViewDetails, 
  onDeleteRecord 
}: UserHistoryTabProps) {
  if (loading) {
    return (
      <div className="text-center py-12 sm:py-16 text-gray-500 dark:text-gray-400">
        Loading your scan history...
      </div>
    );
  }

  return (
    <ScanHistory
      records={records}
      onViewDetails={onViewDetails}
      onDeleteRecord={onDeleteRecord}
    />
  );
}