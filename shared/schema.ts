import { z } from "zod";

// Nutrition data schema
export const nutritionDataSchema = z.object({
  calories: z.number().min(0).max(5000),
  carbohydrates: z.number().min(0).max(500),
  protein: z.number().min(0).max(200),
  fat: z.number().min(0).max(200),
  sodium: z.number().min(0).max(10000),
  fiber: z.number().min(0).max(100),
});

// Health conditions enum
export const healthConditionSchema = z.enum(['diabetes', 'hypertension']);

// Health prediction schema
export const healthPredictionSchema = z.object({
  prediction: z.enum(['safe', 'moderate', 'risky']),
  confidence: z.number().min(0).max(100),
  reasoning: z.string(),
});

// User profile schema
export const userProfileSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().min(18).max(120).optional(),
  primaryCondition: healthConditionSchema,
  emergencyContact: z.string().optional(),
  photoURL: z.string().url().optional(),
});

// Scan record schema
export const scanRecordSchema = z.object({
  id: z.string(),
  userId: z.string(),
  timestamp: z.string().datetime(),
  foodName: z.string().optional(),
  nutritionData: nutritionDataSchema,
  condition: healthConditionSchema,
  prediction: healthPredictionSchema,
  imageUrl: z.string().url().optional(),
});

// Firebase user schema
export const firebaseUserSchema = z.object({
  uid: z.string(),
  email: z.string().email().nullable(),
  displayName: z.string().nullable(),
  photoURL: z.string().url().nullable(),
  emailVerified: z.boolean(),
});

// Type exports
export type NutritionData = z.infer<typeof nutritionDataSchema>;
export type HealthCondition = z.infer<typeof healthConditionSchema>;
export type HealthPrediction = z.infer<typeof healthPredictionSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
export type ScanRecord = z.infer<typeof scanRecordSchema>;
export type FirebaseUser = z.infer<typeof firebaseUserSchema>;

// Insert schemas for forms
export const insertUserProfileSchema = userProfileSchema.omit({});
export const insertScanRecordSchema = scanRecordSchema.omit({ id: true, timestamp: true });
export const analyzeFoodSchema = nutritionDataSchema.extend({
  condition: healthConditionSchema
});

export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type InsertScanRecord = z.infer<typeof insertScanRecordSchema>;
export type AnalyzeFoodRequest = z.infer<typeof analyzeFoodSchema>;
