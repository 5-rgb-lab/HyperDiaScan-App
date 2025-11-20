import React, { useState, useEffect, useRef } from 'react';
import { NutritionForm, ScannerInstructions, ScannerLoadingCard } from '@/components/scanner';
import ProTipCard from '@/components/scanner/ProTipCard';
import { HealthAssessment, HealthAssessmentImage } from '@/components/health';
import { NutritionData, AnalyzeFoodRequest, HealthPrediction } from '@shared/schema';
import { createScanAuditLog } from '@/admin/lib/auditLog';
import { analyzeFood, generatePersonalizedDailyTips } from '@/lib/analyzeFood';
import { saveScanRecord, updateUserHealthTips } from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { userProfileSchema } from '@shared/schema';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PenLine } from 'lucide-react';
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
  const [isImageMode, setIsImageMode] = useState(false);
  const [sourceImageFile, setSourceImageFile] = useState<File | null>(null);
  const [sourceImageUrl, setSourceImageUrl] = useState<string | null>(null);
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
    setIsImageMode(true)
    try {
      // store file and preview URL for later save/display
      setSourceImageFile(file)
      try {
        const url = URL.createObjectURL(file)
        setSourceImageUrl(url)
      } catch (e) {
        setSourceImageUrl(null)
      }
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
      setLoading(false);
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
      setLoading(false);
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
      await saveScanRecord(user.uid, scanRecord, sourceImageFile ?? undefined);

      // Firestore save succeeded; clear local preview and file from memory
      try { if (sourceImageUrl) URL.revokeObjectURL(sourceImageUrl) } catch (e) {}
      setSourceImageFile(null)
      setSourceImageUrl(null)

      // Create audit log for successful scan analysis and save
      await createScanAuditLog(
        user.uid,
        'scan.saved',
        `Food scan saved: ${currentFoodName || "Unnamed Food"} (${healthResult.prediction})${isImageMode ? ' [Image OCR]' : ''}`,
        'success',
        {
          foodName: currentFoodName || "Unnamed Food",
          prediction: healthResult.prediction,
          condition: currentCondition,
          hasHealthTips: healthResult.healthTip?.length > 0,
          source: isImageMode ? 'image' : 'manual'
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
        description: `Scan ${isImageMode ? '(from image)' : '(manual entry)'} and health tips saved successfully.`,
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
          error: error instanceof Error ? error.message : 'Unknown error',
          source: isImageMode ? 'image' : 'manual'
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

      <ProTipCard />

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
              <Card className="w-full border-0 shadow-xl bg-white dark:bg-gray-800">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent mb-2">
                      Choose Analysis Method
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Scan a nutrition label or enter values manually
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Take Photo / Upload Image */}
                    <button
                      onClick={openFilePicker}
                      className="group relative overflow-hidden p-6 rounded-2xl border-2 border-transparent hover:border-blue-400 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] bg-gradient-to-br from-blue-50 via-purple-50 to-teal-50 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-teal-950/30"
                    >
                      <div className="flex flex-col items-center gap-4 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-teal-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent mb-1">
                            {isMobile ? 'Take Photo' : 'Upload Image'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            AI-powered OCR analysis
                          </p>
                        </div>
                      </div>
                    </button>

                    {/* Manual Entry */}
                    <button
                      onClick={handleStartEmpty}
                      className="group relative overflow-hidden p-6 rounded-2xl border-2 border-transparent hover:border-purple-400 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] bg-gradient-to-br from-purple-50 via-teal-50 to-blue-50 dark:from-purple-950/30 dark:via-teal-950/30 dark:to-blue-950/30"
                    >
                      <div className="flex flex-col items-center gap-4 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 via-teal-600 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <PenLine className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 via-teal-600 to-blue-600 bg-clip-text text-transparent mb-1">
                            Manual Entry
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Enter nutrition values
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                </CardContent>
              </Card>
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
                {isImageMode ? (
                  <HealthAssessmentImage
                    prediction={healthResult.prediction === 'Safe' ? 'safe' : 'risky'}
                    reasoning={healthResult.reasoning}
                    condition={currentCondition}
                    nutritionData={scannedData}
                    sourceImage={sourceImageUrl || currentFoodName}
                  />
                ) : (
                  <HealthAssessment
                    prediction={healthResult.prediction === 'Safe' ? 'safe' : 'risky'}
                    reasoning={healthResult.reasoning}
                    condition={currentCondition}
                    nutritionData={scannedData}
                  />
                )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                onClick={() => {
                  setScannedData(null)
                  setHealthResult(null)
                  setCurrentFoodName("")
                  setIsImageMode(false)
                }}
                className="h-12 bg-gradient-to-r from-purple-600 via-teal-600 to-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 font-semibold"
                data-testid="button-scan-another"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Scan Another Item
              </Button>
              <Button
                onClick={handleSaveToHistory}
                className="h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                data-testid="button-save-to-history"
                disabled={saving}
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-white" />
                    Saving...
                  </span>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Save to History
                  </>
                )}
              </Button>
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