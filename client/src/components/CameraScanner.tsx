import { useState, useRef } from 'react';
import { Camera, Upload, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Tesseract from 'tesseract.js';

import { NutritionData } from '@shared/schema';

interface CameraScannerProps {
  onScanComplete: (data: NutritionData) => void;
}

export interface ServingInfo {
  size?: number;
  unit?: number;
}


export default function CameraScanner({ onScanComplete }: CameraScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractServingInfo = (text: string): ServingInfo => {
  const lines = text.toLowerCase().split('\n');
  const servingInfo: ServingInfo = {};

  lines.forEach(line => {
    if (line.includes('serving size')) {
      // Try to match a number followed by g or ml first
      let match = line.match(/([\d.]+)\s*(g|ml)/i);
      if (match) {
        servingInfo.size = parseFloat(match[1]);
        servingInfo.unit = match[2].toLowerCase() === 'ml' ? 1 : 0;
        return;
      }

      // Fallback: match first number and unit word
      match = line.match(/([\d.]+)\s*([a-zA-Z]+)/);
      if (match) {
        servingInfo.size = parseFloat(match[1]);
        const unitStr = match[2].toLowerCase();
        servingInfo.unit = unitStr === 'ml' ? 1 : 0;
      }
    }
  });

  if (servingInfo.size === undefined) servingInfo.size = 100;
  if (servingInfo.unit === undefined) servingInfo.unit = 0; 

  return servingInfo;
};


  const extractNutritionData = (text: string): NutritionData => {
    // Simple OCR text parsing for nutrition facts
    const lines = text.toLowerCase().split('\n');
    const data: NutritionData = {
      calories: 0,
      carbohydrates: 0,
      protein: 0,
      fat: 0,
      sodium: 0,
      fiber: 0
    };

    lines.forEach(line => {
      const numbers = line.match(/\d+/g);
      if (!numbers) return;
      
      if (line.includes('calories')) {
        data.calories = parseInt(numbers[0]) || 0;
      } else if (line.includes('carbohydrate') || line.includes('carbs')) {
        data.carbohydrates = parseInt(numbers[0]) || 0;
      } else if (line.includes('protein')) {
        data.protein = parseInt(numbers[0]) || 0;
      } else if (line.includes('fat') && !line.includes('saturated')) {
        data.fat = parseInt(numbers[0]) || 0;
      } else if (line.includes('sodium')) {
        data.sodium = parseInt(numbers[0]) || 0;
      } else if (line.includes('fiber')) {
        data.fiber = parseInt(numbers[0]) || 0;
      }
    });

    return data;
  };

  const handleImageUpload = async (file: File) => {
    setIsScanning(true);
    setScanComplete(false);

    try {
      const result = await Tesseract.recognize(file, 'eng', {
        logger: () => {} // Suppress logs
      });
      
      // Extract serving info 
      const servingInfo = extractServingInfo(result.data.text);
      console.log('Serving info:', servingInfo);

      const nutritionData = extractNutritionData(result.data.text);
      onScanComplete(nutritionData);
      
      setScanComplete(true);
      setTimeout(() => setScanComplete(false), 2000);
    } catch (error) {
      console.error('OCR Error:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  return (
    <Card className="p-6 text-center space-y-4">
      <div className="space-y-2">
        <Camera className="w-12 h-12 text-primary mx-auto" />
        <h3 className="text-lg font-semibold">Scan Nutrition Label</h3>
        <p className="text-muted-foreground">
          Upload or take a photo of the nutrition facts label
        </p>
      </div>

      <div className="space-y-3">
        <Button 
  onClick={() => fileInputRef.current?.click()}
  disabled={isScanning}
  className="w-full"
>
  {isScanning ? (
    <>
      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      Scanning...
    </>
  ) : scanComplete ? (
    <>
      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
      Scan Complete
    </>
  ) : (
    <>
      <Camera className="w-4 h-4 mr-2" />
      Take Photo
    </>
  )}
</Button>


        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
          data-testid="input-file-upload"
        />
      </div>
    </Card>
  );
}