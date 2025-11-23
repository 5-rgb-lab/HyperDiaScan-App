
import { describe, it, expect } from 'vitest';
import { 
  userProfileSchema, 
  analyzeFoodSchema, 
  scanRecordSchema 
} from '@shared/schema';

describe('Schema Validation', () => {
  it('should validate user profile schema', () => {
    const validProfile = {
      name: 'Test User',
      email: 'test@example.com',
      primaryCondition: 'diabetes',
      otherConditions: { kidneyDisease: false, heartDisease: false },
      diabetesStatus: { bloodSugar: 100 },
      hypertensionStatus: { bloodPressure: { systolic: 120, diastolic: 80 } },
      treatmentManagement: {
        diabetesMedication: { medications: [] },
        hypertensionMedication: { medications: [] }
      },
      demographics: {
        age: 30,
        biologicalSex: 'Male',
        heightCm: 175,
        weightKg: 70,
        activityLevel: 'Moderate'
      }
    };

    const result = userProfileSchema.safeParse(validProfile);
    expect(result.success).toBe(true);
  });

  it('should reject invalid profile data', () => {
    const invalidProfile = {
      name: 'T',
      email: 'invalid-email',
      primaryCondition: 'unknown'
    };

    const result = userProfileSchema.safeParse(invalidProfile);
    expect(result.success).toBe(false);
  });

  it('should validate analyze food schema', () => {
    const validData = {
      foodName: 'Apple',
      calories: 95,
      carbohydrates: 25,
      protein: 0.5,
      fat: 0.3,
      sodium: 2,
      fiber: 4,
      totalSugars: 19,
      condition: 'diabetes'
    };

    const result = analyzeFoodSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});
