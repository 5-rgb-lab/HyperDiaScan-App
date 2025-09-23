import NutritionForm from '../NutritionForm';

export default function NutritionFormExample() {
  //todo: remove mock functionality
  const mockData = {
    calories: 250,
    carbs: 30,
    protein: 8,
    fat: 12,
    sodium: 480,
    fiber: 3
  };

  const handleAnalyze = (data: any) => {
    console.log('Analysis requested:', data);
  };

  return <NutritionForm initialData={mockData} onAnalyze={handleAnalyze} />;
}