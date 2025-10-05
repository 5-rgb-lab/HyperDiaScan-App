import { useState } from 'react';
import CameraScanner from '@/components/CameraScanner';
import NutritionForm from '@/components/NutritionForm';
import HealthAssessment from '@/components/HealthAssessment';
import { NutritionData, AnalyzeFoodRequest, HealthPrediction } from '@shared/schema';
import { analyzeFood } from '@/lib/healthApi';
import { saveScanRecord } from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';
import {
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastViewport,
  ToastProvider,
} from "@/components/ui/toast"

export default function Scanner() {
  const { user } = useAuth();
  const [scannedData, setScannedData] = useState<NutritionData | null>(null);
  const [healthResult, setHealthResult] = useState<HealthPrediction | null>(null);
  const [currentCondition, setCurrentCondition] = useState<'diabetes' | 'hypertension'>('diabetes');
  const [currentFoodName, setCurrentFoodName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false)
  const [toastInfo, setToastInfo] = useState<{
    title: string
    description: string
    variant?: "default" | "destructive"
  }>({ title: "", description: "", variant: "default" })


  const handleScanComplete = (data: NutritionData) => {
    console.log('Scan completed:', data);
    setScannedData(data);
    setHealthResult(null); // Reset previous results
  };

  const handleAnalyze = async (data: AnalyzeFoodRequest) => {
    console.log('Analyzing data:', data);
    setCurrentCondition(data.condition);
    setCurrentFoodName(data.foodName || '');
    setLoading(true); // show loader

    try {
      const result = await analyzeFood(data);
      console.log('Analysis completed successfully:', result);
      setHealthResult(result);
      
      console.log('Analysis result ready for display:', result);
      
      
    } catch (error) {
      console.error('Error analyzing food:', error);
    } finally {
      setLoading(false); // hide loader
    }
  };

  const handleSaveToHistory = async () => {
    if (!user || !scannedData || !healthResult) return;
    
    try {
      await saveScanRecord(user.uid, {
        userId: user.uid,
        foodName: currentFoodName || "Unnamed Food", 
        nutritionData: scannedData,
        condition: currentCondition,
        prediction: healthResult,
      });
      setToastInfo({
        title: "✅ Saved!",
        description: "Scan successfully saved to history.",
        variant: "default",
      })
      setOpen(true)
      console.log('Scan saved to history');
    } catch (error) {
      setToastInfo({
        title: "❌ Error",
        description: "Could not save scan. Please try again.",
        variant: "destructive",
      })
      setOpen(true)
      console.error('Error saving to history:', error);
    }
  };

  return (
    <ToastProvider swipeDirection="right">
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
          <>
            {loading ? (
              <div className="p-6 rounded-lg shadow-md bg-muted text-center space-y-3">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary mx-auto"></div>
                <p className="font-medium text-primary">Analyzing your nutrition label...</p>
                <p className="text-sm text-muted-foreground">This may take a few seconds</p>
              </div>
            ) : (
              <NutritionForm initialData={scannedData} onAnalyze={handleAnalyze} />
            )}
          </>
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
                  setScannedData(null)
                  setHealthResult(null)
                  setCurrentFoodName("")
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

      {/* ✅ Toast lives here, OUTSIDE your scanner UI */}
      <Toast open={open} onOpenChange={setOpen} variant={toastInfo.variant}>
        <div className="grid gap-1">
          <ToastTitle>{toastInfo.title}</ToastTitle>
          <ToastDescription>{toastInfo.description}</ToastDescription>
        </div>
        <ToastClose />
      </Toast>
      <ToastViewport />
    </ToastProvider>
  )
}