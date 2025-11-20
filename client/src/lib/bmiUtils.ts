export type BMIStandard = 'WHO' | 'Asian';

export interface BMIResult {
  bmi: number;
  category: string;
  categoryColor: string;
  standard: BMIStandard;
}

export function calculateBMI(heightCm: number, weightKg: number): number {
  if (heightCm <= 0 || weightKg <= 0) return 0;
  return weightKg / ((heightCm / 100) ** 2);
}

export function getBMICategory(bmi: number, standard: BMIStandard = 'WHO'): string {
  if (standard === 'Asian') {
    if (bmi < 17.5) return 'Underweight';
    if (bmi < 23) return 'Normal weight';
    if (bmi < 28) return 'Overweight';
    return 'Obese';
  } else {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal weight';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  }
}

export function getBMICategoryColor(category: string): string {
  switch (category) {
    case 'Underweight':
      return 'text-blue-500';
    case 'Normal weight':
      return 'text-green-500';
    case 'Overweight':
      return 'text-orange-500';
    case 'Obese':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
}

export function analyzeBMI(
  heightCm: number,
  weightKg: number,
  standard: BMIStandard = 'WHO'
): BMIResult {
  const bmi = calculateBMI(heightCm, weightKg);
  const category = getBMICategory(bmi, standard);
  const categoryColor = getBMICategoryColor(category);
  
  return {
    bmi,
    category,
    categoryColor,
    standard,
  };
}

export function getBMIRanges(standard: BMIStandard = 'WHO'): Array<{range: string; category: string}> {
  if (standard === 'Asian') {
    return [
      { range: '< 17.50', category: 'Underweight' },
      { range: '17.50 - 22.99', category: 'Normal weight' },
      { range: '23.00 - 27.99', category: 'Overweight' },
      { range: '≥ 28.00', category: 'Obese' },
    ];
  } else {
    return [
      { range: '< 18.50', category: 'Underweight' },
      { range: '18.50 - 24.99', category: 'Normal weight' },
      { range: '25.00 - 29.99', category: 'Overweight' },
      { range: '≥ 30.00', category: 'Obese' },
    ];
  }
}
