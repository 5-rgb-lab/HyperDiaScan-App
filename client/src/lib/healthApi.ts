import { AnalyzeFoodRequest, HealthPrediction } from '@shared/schema';

const FLASK_API_URL = "http://localhost:3000";


export const analyzeFood = async (data: AnalyzeFoodRequest): Promise<HealthPrediction> => {
  // If no Flask API URL is configured, use fallback analysis directly
  if (!FLASK_API_URL) {
    console.log('No Flask API configured, using fallback analysis');
    return fallbackAnalysis(data);
  }

  console.log(`Attempting to connect to Flask API at: ${FLASK_API_URL.replace(/\/+$/, '')}/predict`);
  console.log('Sending data:', data);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 50000); // Increased to 10 second timeout

    const response = await fetch(`${FLASK_API_URL.replace(/\/+$/, '')}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      signal: controller.signal,
      body: JSON.stringify({
        Calories: data.calories,
        Carbohydrates: data.carbohydrates,
        Protein: data.protein,
        Fat: data.fat,
        "Sodium Content": data.sodium,
        "Fiber Content": data.fiber,
        disease: data.condition,
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // Handle the new API format: {disease, prediction, confidence, risky, reasoning}
    console.log('API Response:', result);
    
    // Map the prediction based on the risky flag and prediction value
    let mappedPrediction: 'safe' | 'moderate' | 'risky';
    if (result.risky === 'Yes' || result.prediction === 1) {
      mappedPrediction = 'risky';
    } else if (result.prediction === '0' || result.risky === 'No') {
      mappedPrediction = 'safe';
    }else{
      mappedPrediction = 'moderate';
    }
    
    // Ensure confidence is in percentage format (0-100)
    const confidence = result.confidence > 1 
      ? Math.round(result.confidence) 
      : Math.round(result.confidence * 100);
    
    return {
      prediction: mappedPrediction,
      confidence: confidence,
      reasoning: result.reasoning || `Analysis for ${result.disease || 'condition'}: ${result.prediction || 'No detailed reasoning available.'}`,
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('Flask API request timed out, using fallback analysis');
    } else {
      console.log('Flask API unavailable, using fallback analysis');
    }
    
    // Fallback to local analysis if Flask API is unavailable
    return fallbackAnalysis(data);
  }
};

// Fallback analysis when Flask API is not available
const fallbackAnalysis = (data: AnalyzeFoodRequest): HealthPrediction => {
  const { condition, sodium, carbohydrates: carbs, calories } = data;
  
  if (condition === 'hypertension') {
    if (sodium > 600) {
      return {
        prediction: 'risky',
        confidence: 85,
        reasoning: `High sodium content (${sodium}mg) significantly exceeds recommended limits for hypertension management. This could lead to increased blood pressure and cardiovascular strain. Consider alternatives with less than 300mg sodium per serving.`
      };
    } else if (sodium > 300) {
      return {
        prediction: 'moderate',
        confidence: 72,
        reasoning: `Moderate sodium content (${sodium}mg) requires portion control for hypertension management. While not immediately dangerous, regular consumption should be limited to maintain healthy blood pressure levels.`
      };
    }
    return {
      prediction: 'safe',
      confidence: 92,
      reasoning: `Low sodium content (${sodium}mg) makes this food suitable for hypertension management. The nutritional profile supports healthy blood pressure maintenance when part of a balanced diet.`
    };
  } else {
    // Diabetes analysis
    if (carbs > 45 || calories > 400) {
      return {
        prediction: 'risky',
        confidence: 88,
        reasoning: `High carbohydrate content (${carbs}g) and calories (${calories}) may cause significant blood sugar spikes. This food could disrupt glucose control and require careful portion management or insulin adjustment.`
      };
    } else if (carbs > 25) {
      return {
        prediction: 'moderate',
        confidence: 76,
        reasoning: `Moderate carbohydrate content (${carbs}g) requires monitoring for diabetes management. Consider pairing with protein or fiber-rich foods to help stabilize blood sugar response.`
      };
    }
    return {
      prediction: 'safe',
      confidence: 94,
      reasoning: `Low to moderate carbohydrate content (${carbs}g) and reasonable caloric density make this food suitable for diabetes management. The nutritional profile supports stable blood glucose levels.`
    };
  }
};