import { z } from "zod";

// ----------------------------------------------------
// 🧾 Base Schemas
// ----------------------------------------------------
export const nutritionDataSchema = z.object({
  calories: z.number().min(0).max(5000),
  carbohydrates: z.number().min(0).max(500),
  protein: z.number().min(0).max(200),
  fat: z.number().min(0).max(200),
  sodium: z.number().min(0).max(10000),
  fiber: z.number().min(0).max(100),
  sugar: z.number().min(0).max(500),
});

export const healthConditionSchema = z.enum(["diabetes", "hypertension", "both"]);

export const healthPredictionSchema = z.object({
  prediction: z.enum(["Safe", "Risky"]),
  reasoning: z.string(),
});

// ----------------------------------------------------
// 👤 Category Schemas (Exported Individually)
// ----------------------------------------------------

// 1️⃣ Primary Medical Conditions
export const primaryMedicalSchema = z.object({
  diabetesType: z.enum(["Type 1", "Type 2", "Gestational", "Pre-diabetes", "None"]),
  hypertensionType: z.enum(["Primary", "Secondary", "None"]),
  yearOfDiagnosis: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  complications: z
    .array(z.enum(["Neuropathy", "Retinopathy", "Nephropathy", "None"]))
    .optional(),
});

// 2️⃣ Diabetes-Specific Status
export const diabetesStatusSchema = z.object({
  latestHbA1c: z.number().min(0).max(20),
  dateOfLastHbA1cTest: z.string().datetime().optional(),
  hypoglycemiaFrequency: z.enum(["Rare", "Occasional", "Frequent"]),
  glucoseMonitoringMethod: z.enum(["Fingerstick", "Continuous", "None"]).optional(),
  avgFastingGlucose: z.number().min(0).max(1000).optional(),
  avgPostMealGlucose: z.number().min(0).max(1000).optional(),
});

// 3️⃣ Hypertension-Specific Status
export const hypertensionStatusSchema = z.object({
  currentBP: z.object({
    systolic: z.number().min(50).max(300),
    diastolic: z.number().min(30).max(200),
  }),
  avgWeeklyBP: z
    .object({
      systolic: z.number().min(50).max(300),
      diastolic: z.number().min(30).max(200),
    })
    .optional(),
  useOfDiuretic: z.boolean(),
  saltSensitivity: z.enum(["Yes", "No", "Unknown"]).optional(),
});

// 4️⃣ Treatment & Medication Management
export const treatmentManagementSchema = z.object({
  diabetesManagement: z.object({
    insulinUse: z.boolean(),
    insulinType: z.enum(["Short-acting", "Long-acting", "Both"]).optional(),
    insulinTiming: z.string().optional(),
    oralMedications: z.array(z.string()),
    dietExerciseManagement: z.boolean().optional(),
  }),
  hypertensionManagement: z.object({
    antihypertensiveMeds: z.array(z.string()),
    medicationTiming: z.enum(["Morning", "Evening", "Both"]).optional(),
    supplementsUsed: z.string().optional(),
  }),
});

// 5️⃣ Personalized Nutrient & Physiological Targets
export const nutrientTargetsSchema = z.object({
  dailyCalorieTarget: z.number().min(100).max(10000),
  dailyCarbLimit: z.number().min(0).max(1000),
  dailySodiumLimit: z.number().min(0).max(10000),
  dailySatFatLimit: z.number().min(0).max(500),
  fastingGlucoseTarget: z.string(),
  postMealGlucoseTarget: z.string(),
  dailyFiberGoal: z.number().optional(),
  dailyPotassiumTarget: z.number().optional(),
  cholesterolTargets: z
    .object({
      LDL: z.number().optional(),
      HDL: z.number().optional(),
    })
    .optional(),
});

// 6️⃣ Demographics & Physiology
export const demographicsSchema = z.object({
  biologicalSex: z.enum(["Male", "Female", "Other"]),
  heightCm: z.number().min(50).max(250),
  weightKg: z.number().min(20).max(300),
  activityLevel: z.enum(["Sedentary", "Lightly Active", "Moderate", "Very Active"]),
  bodyFatPercent: z.number().min(0).max(100).optional(),
  weightGoal: z.enum(["Maintain", "Lose", "Gain"]).optional(),
});

// 7️⃣ Comorbidities, Allergies & Dietary Patterns
export const healthBackgroundSchema = z.object({
  otherHealthConditions: z.array(z.string()),
  foodAllergies: z.array(z.string()),
  allergySeverity: z.enum(["Mild", "Moderate", "Severe"]).optional(),
  dietaryPattern: z
    .enum(["Omnivore", "Vegetarian", "Vegan", "Pescatarian", "Low-FODMAP"])
    .optional(),
});

// ----------------------------------------------------
// 🧩 Combined User Profile Schema (for full form or Firestore document)
// ----------------------------------------------------
export const userProfileSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().min(18).max(120).optional(),
  primaryCondition: healthConditionSchema,
  primaryMedical: primaryMedicalSchema,
  diabetesStatus: diabetesStatusSchema,
  hypertensionStatus: hypertensionStatusSchema,
  treatmentManagement: treatmentManagementSchema,
  nutrientTargets: nutrientTargetsSchema,
  demographics: demographicsSchema,
  healthBackground: healthBackgroundSchema,
});

// ----------------------------------------------------
// 🔍 Scan Record Schema
// ----------------------------------------------------
export const scanRecordSchema = z.object({
  id: z.string(),
  userId: z.string(),
  timestamp: z.string().datetime(),
  foodName: z.string().optional(),
  nutritionData: nutritionDataSchema,
  condition: healthConditionSchema,
  prediction: healthPredictionSchema,
});

// ----------------------------------------------------
// 🔐 Firebase User Schema
// ----------------------------------------------------
export const firebaseUserSchema = z.object({
  uid: z.string(),
  email: z.string().email().nullable(),
  displayName: z.string().nullable(),
  emailVerified: z.boolean(),
});

// ----------------------------------------------------
// 🧠 Type Exports
// ----------------------------------------------------
export type NutritionData = z.infer<typeof nutritionDataSchema>;
export type HealthCondition = z.infer<typeof healthConditionSchema>;
export type HealthPrediction = z.infer<typeof healthPredictionSchema>;

export type PrimaryMedical = z.infer<typeof primaryMedicalSchema>;
export type DiabetesStatus = z.infer<typeof diabetesStatusSchema>;
export type HypertensionStatus = z.infer<typeof hypertensionStatusSchema>;
export type TreatmentManagement = z.infer<typeof treatmentManagementSchema>;
export type NutrientTargets = z.infer<typeof nutrientTargetsSchema>;
export type Demographics = z.infer<typeof demographicsSchema>;
export type HealthBackground = z.infer<typeof healthBackgroundSchema>;

export type UserProfile = z.infer<typeof userProfileSchema>;
export type ScanRecord = z.infer<typeof scanRecordSchema>;
export type FirebaseUser = z.infer<typeof firebaseUserSchema>;

// ----------------------------------------------------
// 🧾 Insert Schemas (for forms or writes)
// ----------------------------------------------------
export const insertUserProfileSchema = userProfileSchema.omit({});
export const insertScanRecordSchema = scanRecordSchema.omit({ id: true, timestamp: true });

export const analyzeFoodSchema = nutritionDataSchema.extend({
  condition: healthConditionSchema,
  foodName: z.string().optional(),
});

export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type InsertScanRecord = z.infer<typeof insertScanRecordSchema>;
export type AnalyzeFoodRequest = z.infer<typeof analyzeFoodSchema>;
