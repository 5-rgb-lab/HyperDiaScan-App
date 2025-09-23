import HealthAssessment from '../HealthAssessment';

export default function HealthAssessmentExample() {
  //todo: remove mock functionality
  const mockAssessment = {
    prediction: 'moderate' as const,
    confidence: 78,
    reasoning: 'This food item contains moderate levels of sodium (480mg) which may impact blood pressure management. The carbohydrate content (30g) is within acceptable range for diabetes management when consumed as part of a balanced meal. Consider limiting portion size and pairing with high-fiber foods.',
    condition: 'hypertension' as const,
    nutritionData: {
      calories: 250,
      carbohydrates: 30,
      protein: 8,
      fat: 12,
      sodium: 480,
      fiber: 3
    }
  };

  return <HealthAssessment {...mockAssessment} />;
}