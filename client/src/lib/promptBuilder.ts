import { AnalyzeFoodRequest, UserProfile } from '@shared/schema'

export function buildPrompt(nutrition: AnalyzeFoodRequest, user: UserProfile): string {
  const heightM = user.demographics.heightCm / 100;
  const bmi = user.demographics.weightKg / (heightM * heightM);

  const diabetesInfo =
    user.primaryCondition === "diabetes" || user.primaryCondition === "both"
      ? `BS: ${user.diabetesStatus?.bloodSugar ?? "unknown"} mg/dL`
      : "";

  const bpInfo =
    user.primaryCondition === "hypertension" || user.primaryCondition === "both"
      ? `BP: ${
          user.hypertensionStatus?.bloodPressure?.systolic ?? "unknown"
        }/${user.hypertensionStatus?.bloodPressure?.diastolic ?? "unknown"}`
      : "";

  return `
      You are a nutrition analysis model. Follow ALL RULES below strictly.

      ==========================
      📌 **RULE-BASED ANALYSIS**
      ==========================

      1️⃣ **Safety Evaluation ("Safe | "Risky)**  
      Determine safety based ONLY on RENI% values using these rules:  
      - Limit nutrients: **Total Fat, Saturated Fat, Sodium, Total Sugars**  
      - High: >= 20% RENI  
      - Moderate (Good Source): 10–19% RENI  
      - Low: <= 5% RENI  
      Safety logic:  
      - If ANY limit nutrient >=20% RENI → "Potentially unsafe"  
      - If TWO OR MORE limit nutrients >=20% RENI → "Unsafe for regular consumption"  
      - If ALL limit nutrients <20% RENI → "Generally safe"

      2️⃣ **User Health Impact**  
      After the safety sentence, explain how this food affects the user's:  
      - Primary condition (diabetes / hypertension / both)  
      - Blood sugar (BS) if applicable  
      - Blood pressure (BP) if applicable  
      - BMI status  
      - Other conditions: kidney disease (KD), heart disease (HD)

      3️⃣ **Nutrient Interpretation (RENI%)**  
      List nutrients and classify as: Low (≤5%), Moderate (10–19%), High (≥20%).  
      Highlight beneficial nutrients: Iron, Calcium, Vitamin D, Fiber, Potassium.  
      Goal nutrients should ideally total 100% RENI daily.

      4️⃣ **Recommendation**  
      Provide a short, tailored recommendation for this specific user.

      ==========================
      📌 **USER PROFILE**
      ==========================
      Name: ${user.name}  
      Age: ${user.demographics.age}  
      BMI: ${bmi.toFixed(1)}  
      Conditions: ${user.primaryCondition}${user.otherConditions.kidneyDisease ? ", KD" : ""}${user.otherConditions.heartDisease ? ", HD" : ""}

      ${diabetesInfo ? `Diabetes: ${diabetesInfo}` : ""}
      ${bpInfo ? `Hypertension: ${bpInfo}` : ""}

      ==========================
      📌 **FOOD DATA (RENI-BASED)**
      ==========================
      Food: ${nutrition.foodName || "Unnamed"}  
      Calories: ${nutrition.calories}  
      Carbs: ${nutrition.carbohydrates}
      Protein: ${nutrition.protein}
      Fat: ${nutrition.fat}
      Sodium: ${nutrition.sodium}
      Sugars: ${nutrition.totalSugars ?? "?"}
      Fiber: ${nutrition.fiber}

      ==========================
      📌 **OUTPUT FORMAT**
      ==========================
      Return your answer using EXACTLY this JSON shape:

      {
        "prediction": "Safe" | "Risky",
        "reasoning": "First sentence: clearly state whether the food is Safe or Risky based strictly on RENI% rule-based thresholds. Second sentence: explain in detail why this is the case and how this food may affect the user's health conditions, BMI, and any relevant profile information. Third sentence: provide a short, personalized recommendation for the user."
      }

      ONLY output the JSON. 
      Return ONLY JSON with 2 keys: "prediction" and "reasoning".
      Do NOT add anything else outside the JSON.
      `;
  }



export function buildTipsPrompt(userProfile?: UserProfile, todaysScans: any[] = [], counts: { safe: number; risky: number } = { safe: 0, risky: 0 }): string {
  const userDemographics = userProfile?.demographics
  const bmiString = userDemographics
    ? userDemographics.weightKg && userDemographics.heightCm
      ? (userDemographics.weightKg / ((userDemographics.heightCm / 100) ** 2)).toFixed(1)
      : 'unknown'
    : 'unknown'

  return `Generate 5 short actionable health tips.

USER: ${userProfile?.name ?? 'unknown'}, ${userDemographics?.age ?? 'unknown'}yo, BMI ${bmiString}, ${userProfile?.primaryCondition ?? 'unknown'}
TODAY: ${counts.safe} safe, ${counts.risky} risky scans (${todaysScans.length} total)

Tips must address ${userProfile?.primaryCondition ?? 'their health'} and today's eating patterns. JSON: [{"content":"tip 1"}, {"content":"tip 2"}, {"content":"tip 3"}, {"content":"tip 4"}, {"content":"tip 5"}]`
}

export function buildImagePrompt(user: UserProfile, fileName?: string): string {
  return `Extract nutrition facts from the image as JSON. <image>`;
}



