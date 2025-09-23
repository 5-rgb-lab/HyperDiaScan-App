import ScanHistory from '../ScanHistory';

export default function ScanHistoryExample() {
  //todo: remove mock functionality
  const mockRecords = [
    {
      id: '1',
      date: new Date().toISOString(),
      condition: 'diabetes' as const,
      prediction: 'safe' as const,
      confidence: 92,
      foodName: 'Greek Yogurt',
      nutritionData: { calories: 120, carbs: 15, sodium: 65 }
    },
    {
      id: '2',
      date: new Date(Date.now() - 86400000).toISOString(),
      condition: 'hypertension' as const,
      prediction: 'risky' as const,
      confidence: 85,
      foodName: 'Frozen Pizza',
      nutritionData: { calories: 380, carbs: 45, sodium: 920 }
    },
    {
      id: '3',
      date: new Date(Date.now() - 172800000).toISOString(),
      condition: 'diabetes' as const,
      prediction: 'moderate' as const,
      confidence: 74,
      foodName: 'Granola Bar',
      nutritionData: { calories: 180, carbs: 28, sodium: 150 }
    }
  ];

  const handleViewDetails = (record: any) => {
    console.log('View details for:', record);
  };

  const handleDeleteRecord = (id: string) => {
    console.log('Delete record:', id);
  };

  return (
    <ScanHistory 
      records={mockRecords} 
      onViewDetails={handleViewDetails}
      onDeleteRecord={handleDeleteRecord}
    />
  );
}