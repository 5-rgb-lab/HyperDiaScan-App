import { useState } from 'react';
import CameraScanner from '@/components/CameraScanner';
import NutritionForm from '@/components/NutritionForm';
import HealthAssessment from '@/components/HealthAssessment';
import { NutritionData, AnalyzeFoodRequest, HealthPrediction } from '@shared/schema';
import { analyzeFood } from '@/lib/healthApi';
import { saveScanRecord } from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';

export default function Scanner() {
  const { user } = useAuth();
  const [scannedData, setScannedData] = useState<NutritionData | null>(null);
  const [healthResult, setHealthResult] = useState<HealthPrediction | null>(null);
  const [currentCondition, setCurrentCondition] = useState<'diabetes' | 'hypertension'>('diabetes');

  const handleScanComplete = (data: NutritionData) => {
    console.log('Scan completed:', data);
    setScannedData(data);
    setHealthResult(null); // Reset previous results
  };

  const handleAnalyze = async (data: AnalyzeFoodRequest) => {
    console.log('Analyzing data:', data);
    setCurrentCondition(data.condition);
    
    try {
      const result = await analyzeFood(data);
      console.log('Analysis completed successfully:', result);
      setHealthResult(result);
      
      // TODO: Temporarily disable Firebase saving to test Flask API connection
      console.log('Analysis result ready for display:', result);
      
      // Save to Firestore if user is authenticated (disabled for API testing)
      // if (user) {
      //   try {
      //     await saveScanRecord(user.uid, {
      //       userId: user.uid,
      //       nutritionData: {
      //         calories: data.calories,
      //         carbohydrates: data.carbohydrates,
      //         protein: data.protein,
      //         fat: data.fat,
      //         sodium: data.sodium,
      //         fiber: data.fiber,
      //       },
      //       condition: data.condition,
      //       prediction: result,
      //     });
      //     console.log('Scan record saved successfully to Firebase');
      //   } catch (saveError) {
      //     console.error('Error saving scan record:', saveError);
      //   }
      // }
    } catch (error) {
      console.error('Error analyzing food:', error);
    }
  };

  const handleSaveToHistory = async () => {
    if (!user || !scannedData || !healthResult) return;
    
    try {
      await saveScanRecord(user.uid, {
        userId: user.uid,
        nutritionData: scannedData,
        condition: currentCondition,
        prediction: healthResult,
      });
      console.log('Scan saved to history');
    } catch (error) {
      console.error('Error saving to history:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold" data-testid="text-scanner-title">
          Nutrition Label Scanner
        </h1>
        <p className="text-muted-foreground">
          Upload a photo of your food's nutrition label for instant health analysis
        </p>
      </div>

      {!scannedData && (
        <CameraScanner onScanComplete={handleScanComplete} />
      )}

      {scannedData && !healthResult && (
        <NutritionForm
          initialData={scannedData}
          onAnalyze={handleAnalyze}
        />
      )}

      {healthResult && scannedData && (
        <div className="space-y-6">
          <HealthAssessment
            prediction={healthResult.prediction}
            confidence={healthResult.confidence}
            reasoning={healthResult.reasoning}
            condition={currentCondition}
            nutritionData={scannedData}
          />
          
          <div className="flex gap-4">
            <button
              onClick={() => {
                setScannedData(null);
                setHealthResult(null);
              }}
              className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              data-testid="button-scan-another"
            >
              Scan Another Item
            </button>
            <button
              onClick={handleSaveToHistory}
              className="flex-1 py-2 px-4 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
              data-testid="button-save-to-history"
            >
              Save to History
            </button>
          </div>
        </div>
      )}
    </div>
  );
}