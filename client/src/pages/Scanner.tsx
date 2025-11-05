import { useState, useEffect } from 'react';
import CameraScanner from '@/components/CameraScanner';
import NutritionForm from '@/components/NutritionForm';
import HealthAssessment from '@/components/HealthAssessment';
import { NutritionData, AnalyzeFoodRequest, HealthPrediction } from '@shared/schema';
import { analyzeFood } from '@/lib/analyzeFood';
import { saveScanRecord, updateUserHealthTips } from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { userProfileSchema } from '@shared/schema';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastViewport,
  ToastProvider,
} from "@/components/ui/toast"

export default function Scanner() {
  const { user, userProfile } = useAuth();
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

  const [showProfileModal, setShowProfileModal] = useState(false);

  const isProfileComplete = (profile: any) => {
    if (!profile) return false;
    try {
      userProfileSchema.parse(profile);
      return true;
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    if (user && !isProfileComplete(userProfile)) {
      setShowProfileModal(true);
    }
  }, [user, userProfile]);

  const handleCompleteProfile = () => {
    setShowProfileModal(false);
    // navigate to profile page for completion
    window.location.href = '/profile';
  };


  const handleScanComplete = (data: NutritionData) => {
    console.log('Scan completed:', data);
    setScannedData(data);
    setHealthResult(null); // Reset previous results
  };

  const handleAnalyze = async (data: AnalyzeFoodRequest) => {
    if (!userProfile || !user) {
      console.warn("No user profile found:", { user: !!user, profile: !!userProfile });
      setShowProfileModal(true);
      return;
    }

    // Verify the profile is complete before proceeding
    if (!isProfileComplete(userProfile)) {
      console.warn("Incomplete user profile detected");
      setShowProfileModal(true);
      setToastInfo({
        title: "❌ Incomplete Profile",
        description: "Please complete your health profile first.",
        variant: "destructive"
      });
      setOpen(true);
      return;
    }

    console.log('🍎 Starting Analysis:');
    console.log('Food Data:', data);
    
    setCurrentCondition(data.condition === 'both' ? 'diabetes' : data.condition);
    setCurrentFoodName(data.foodName || '');
    setLoading(true);

    try {
      // Send the raw profile without modifying the condition
      const result = await analyzeFood(data, userProfile);
      console.log('Analysis Result:', result);
      setHealthResult(result);
      
      // Show success toast with meaningful health insight
      const severity = result.prediction === "Safe" ? "default" : "destructive";
      const message = result.prediction === "Safe" 
        ? "This food appears safe for your condition." 
        : "This food may need caution with your condition.";
      
      setToastInfo({
        title: `${result.prediction === "Safe" ? "✅" : "⚠️"} Analysis Complete`,
        description: message,
        variant: severity
      });
      setOpen(true);
    } catch (error) {
      console.error('Error analyzing food:', error);
      setToastInfo({
        title: "❌ Analysis Failed",
        description: "Could not analyze food. Please try again.",
        variant: "destructive"
      });
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToHistory = async () => {
    if (!user || !scannedData || !healthResult) return;
    
    try {
      // Save scan record without health tips
      const scanRecord = {
        userId: user.uid,
        foodName: currentFoodName || "Unnamed Food", 
        nutritionData: scannedData,
        condition: currentCondition,
        prediction: {
          ...healthResult,

        },
      };
      await saveScanRecord(user.uid, scanRecord);

      // Update user's health tips if available
      if (healthResult.healthTip?.length > 0) {
        await updateUserHealthTips(user.uid, healthResult.healthTip);
      }

      setToastInfo({
        title: "✅ Saved!",
        description: "Scan and health tips saved successfully.",
        variant: "default",
      });
      setOpen(true);
      console.log('Scan and tips saved');
    } catch (error) {
      setToastInfo({
        title: "❌ Error",
        description: "Could not save scan. Please try again.",
        variant: "destructive",
      });
      setOpen(true);
      console.error('Error saving scan and tips:', error);
    }
  };

  return (
    <ToastProvider swipeDirection="right">
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Your Profile</DialogTitle>
            <DialogDescription>
              To provide accurate, personalized health insights, please complete your profile now.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              We'll use this information to customize recommendations and calculate accurate targets.
            </p>
            <Button className="w-full" onClick={handleCompleteProfile}>
              Complete Profile Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <div className="space-y-6">

      <div className="text-center space-y-2 p-6 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-lg border">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent" data-testid="text-profile-title">
          Food Analysis
        </h1>
        <p className="text-muted-foreground">
          Track your health journey with smart food analysis
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
                <p className="text-sm text-muted-foreground">Checking against your health profile...</p>
              </div>
            ) : (
              <NutritionForm 
                initialData={scannedData} 
                userCondition={userProfile?.primaryCondition || 'diabetes'}
                onAnalyze={handleAnalyze} 
              />
            )}
          </>
        )}

        {healthResult && scannedData && (
          <div className="space-y-6">
                {/**
                 * healthResult currently follows the shared schema: { prediction: 'Safe'|'Risky', reasoning }
                 * HealthAssessment expects prediction: 'safe'|'moderate'|'risky' and a numeric confidence.
                 * Map the values conservatively so the UI renders without type errors.
                 */}
                <HealthAssessment
                  prediction={healthResult.prediction === 'Safe' ? 'safe' : 'risky'}
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