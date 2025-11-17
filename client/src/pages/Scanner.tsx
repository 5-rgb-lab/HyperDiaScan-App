import React, { useState, useEffect, useRef } from 'react';
import NutritionForm from '@/components/NutritionForm';
import HealthAssessment from '@/components/HealthAssessment';
import { NutritionData, AnalyzeFoodRequest, HealthPrediction } from '@shared/schema';
import { createScanAuditLog } from '@/admin/lib/auditLog';
import { analyzeFood, generatePersonalizedDailyTips } from '@/lib/analyzeFood';
import { saveScanRecord, updateUserHealthTips } from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { userProfileSchema } from '@shared/schema';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PenLine } from 'lucide-react';
import ScannerInstructions from '@/components/ScannerInstructions';
import ScannerLoadingCard from '@/components/ScannerLoadingCard';
import { useIsMobile } from '@/hooks/use-mobile'
import { analyzeImageFile } from '@/lib/analyzeImage'
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
  const [scannedData, setScannedData] = useState(null as (NutritionData | null));
  const [healthResult, setHealthResult] = useState(null as (HealthPrediction | null));
  const [currentCondition, setCurrentCondition] = useState('diabetes' as ('diabetes' | 'hypertension'));
  const [currentFoodName, setCurrentFoodName] = useState('' as string);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false)
  const [toastInfo, setToastInfo] = useState({ title: "", description: "", variant: "default" } as {
    title: string;
    description: string;
    variant?: "default" | "destructive";
  })

  const [showProfileModal, setShowProfileModal] = useState(false as boolean);

  const isProfileComplete = (profile: any) => {
    if (!profile) {
      console.warn("❌ Profile is null or undefined");
      return false;
    }
    try {
      userProfileSchema.parse(profile);
      
      return true;
    } catch (error) {
      console.warn("❌ Profile validation failed:", error);
      return false;
    }
  };

  useEffect(() => {
    if (user && userProfile && !isProfileComplete(userProfile)) {
      setShowProfileModal(true);
    }
  }, [user, userProfile]);

  const handleCompleteProfile = () => {
    setShowProfileModal(false);
    // navigate to profile page for completion
    window.location.href = '/profile';
  };


  const handleScanComplete = (data: NutritionData) => {
    setScannedData(data);
    setHealthResult(null); // Reset previous results
    setLoading(false); // Ensure loading is false when new scan is complete
  };

  // File input ref for upload / camera capture
  const fileInputRef = useRef(null as (HTMLInputElement | null))
  const isMobile = useIsMobile()

  const handleFileSelected = async (file?: File | null) => {
    if (!file) return
    setLoading(true)
    try {
      const parsed = await analyzeImageFile(file, userProfile ?? undefined)
      setHealthResult(parsed)
      // If LLM returned nutritionData attach it to scannedData
      if ((parsed as any).nutritionData) {
        setScannedData((parsed as any).nutritionData)
      }
    } catch (err) {
      console.error('Error processing image:', err)
    } finally {
      setLoading(false)
    }
  }

  const openFilePicker = () => {
    if (!fileInputRef.current) return
    fileInputRef.current.value = ''
    fileInputRef.current.click()
  }

  const handleStartEmpty = () => {
    setScannedData({
      calories: 0,
      carbohydrates: 0,
      protein: 0,
      fat: 0,
      sodium: 0,
      fiber: 0,
      totalSugars: 0,
      addedSugars: 0,
      saturatedFat: 0,
      transFat: 0,
      potassium: 0,
      cholesterol: 0,
      servingSize: '',
      servingsPerContainer: 1,
    })
    setHealthResult(null)
  }

  const handleAnalyze = async (data: AnalyzeFoodRequest) => {
    // Use a ref to track if we've already started analyzing
    const analysisStarted = loading;
    
    if (analysisStarted) {
      return;
    }

    // Set loading immediately to prevent double submission
    setLoading(true);



    if (!userProfile || !user) {
      console.warn("⚠️ No user profile found:", { user: !!user, profile: !!userProfile });
      setShowProfileModal(true);
      return;
    }

    // Verify the profile is complete before proceeding
    const profileValidation = isProfileComplete(userProfile);


    if (!profileValidation) {
      console.warn("⚠️ Incomplete user profile detected");
      setShowProfileModal(true);
      setToastInfo({
        title: "❌ Incomplete Profile",
        description: "Please complete your health profile first.",
        variant: "destructive"
      });
      setOpen(true);
      return;
    }

    // Set all states at once to prevent race conditions
    setLoading(true);
    setCurrentCondition(data.condition === 'both' ? 'diabetes' : data.condition);
    setCurrentFoodName(data.foodName || '');

    try {
      // Send the raw profile without modifying the condition
      const result = await analyzeFood(data, userProfile);
      setHealthResult(result);
      
      // Update scannedData with the user-edited nutrition values so HealthAssessment displays them
      setScannedData({
        calories: data.calories || 0,
        carbohydrates: data.carbohydrates || 0,
        protein: data.protein || 0,
        fat: data.fat || 0,
        sodium: data.sodium || 0,
        fiber: data.fiber || 0,
        totalSugars: (data as any).totalSugars || 0,
        addedSugars: (data as any).addedSugars || 0,
        saturatedFat: (data as any).saturatedFat || 0,
        transFat: (data as any).transFat || 0,
        potassium: (data as any).potassium || 0,
        cholesterol: (data as any).cholesterol || 0,
        servingSize: (data as any).servingSize || '',
        servingsPerContainer: (data as any).servingsPerContainer || 0,
      });
      
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
    setSaving(true);
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

      // Create audit log for successful scan analysis and save
      await createScanAuditLog(
        user.uid,
        'scan.saved',
        `Food scan saved: ${currentFoodName || "Unnamed Food"} (${healthResult.prediction})`,
        'success',
        {
          foodName: currentFoodName || "Unnamed Food",
          prediction: healthResult.prediction,
          condition: currentCondition,
          hasHealthTips: healthResult.healthTip?.length > 0
        }
      );

      // Update user's health tips if available
      if (healthResult.healthTip?.length > 0) {
        await updateUserHealthTips(user.uid, healthResult.healthTip);
      }

      // Regenerate personalized daily tips using LLM based on today's scans
      try {
        await generatePersonalizedDailyTips(user.uid, userProfile || undefined);
      } catch (err) {
        console.error('Error generating personalized daily tips after save:', err);
      }

      setToastInfo({
        title: "✅ Saved!",
        description: "Scan and health tips saved successfully.",
        variant: "default",
      });
      setOpen(true);
    } catch (error) {
      // Create audit log for failed scan save
      await createScanAuditLog(
        user.uid,
        'scan.saved',
        `Failed to save food scan: ${currentFoodName || "Unnamed Food"}`,
        'error',
        {
          foodName: currentFoodName || "Unnamed Food",
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      );

      setToastInfo({
        title: "❌ Error",
        description: "Could not save scan. Please try again.",
        variant: "destructive",
      });
      setOpen(true);
      console.error('Error saving scan and tips:', error);
    } finally {
      setSaving(false);
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

      <ScannerInstructions />

        {/* Hidden file input used for both camera capture on mobile and file picker on desktop */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture={isMobile ? 'environment' : undefined}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null
            handleFileSelected(f)
          }}
        />

        {!healthResult && (
          <>
            {loading ? (
              <ScannerLoadingCard />
            ) : scannedData ? (
              <NutritionForm 
                initialData={scannedData} 
                userCondition={userProfile?.primaryCondition || 'diabetes'}
                onAnalyze={handleAnalyze} 
              />
            ) : (
              <div className="grid gap-4">
                <div className="flex gap-2">
                  

                  <Card className="p-6 space-y-4 flex-1">
                    <div className="flex items-center gap-2">
                      <PenLine className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold">Manual Nutrition Input</h3>
                    </div>
                    <p className="text-muted-foreground text-sm">Enter nutritional values manually to analyze your food item.</p>
                    <Button onClick={handleStartEmpty} className="w-full">Start Manual Entry</Button>
                    <Button className="w-full" onClick={openFilePicker}>
                    {isMobile ? 'Take Photo' : 'Upload Image'}
                  </Button>
                  </Card>
                </div>
              </div>
            )}
          </>
        )}

        {healthResult && !scannedData && (
          <div className="space-y-6">
            <Card className="p-6 border-destructive bg-destructive/5">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-destructive">Analysis Error</h3>
                <p className="text-sm text-muted-foreground">{healthResult.reasoning}</p>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" onClick={() => {
                  setHealthResult(null)
                  setScannedData(null)
                }}>
                  Back to Options
                </Button>
                <Button onClick={handleStartEmpty}>
                  Try Manual Entry
                </Button>
              </div>
            </Card>
          </div>
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
                className="flex-1 py-2 px-4 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 disabled:opacity-60 disabled:cursor-not-allowed"
                data-testid="button-save-to-history"
                disabled={saving}
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-secondary-foreground" />
                    Saving...
                  </span>
                ) : (
                  'Save to History'
                )}
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