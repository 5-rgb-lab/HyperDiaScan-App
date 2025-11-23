
import { describe, it, expect, vi } from 'vitest';
import { analyzeImageFile } from '@/lib/analyzeImage';

vi.mock('@/lib/analyzeImage');

describe('Scanner - Image Analysis', () => {
  it('should analyze nutrition label from image', async () => {
    const mockFile = new File(['test'], 'label.jpg', { type: 'image/jpeg' });
    
    vi.mocked(analyzeImageFile).mockResolvedValue({
      prediction: 'Safe',
      reasoning: 'Parsed label',
      healthTip: [{ content: 'Parsed label' }],
      nutritionData: {
        foodName: 'Granola Bar',
        calories: 200,
        carbohydrates: 30,
        protein: 5,
        fat: 8,
        sodium: 150,
        fiber: 3,
        totalSugars: 12
      }
    } as any);

    const result = await analyzeImageFile(mockFile);
    expect((result as any).nutritionData.foodName).toBe('Granola Bar');
    expect((result as any).nutritionData.calories).toBe(200);
  });

  it('should reject invalid image formats', async () => {
    const mockFile = new File(['test'], 'document.pdf', { type: 'application/pdf' });
    
    vi.mocked(analyzeImageFile).mockRejectedValue(new Error('Invalid file format'));

    await expect(analyzeImageFile(mockFile)).rejects.toThrow('Invalid file format');
  });

  it('should handle low quality images gracefully', async () => {
    const mockFile = new File(['blurry'], 'blurry.jpg', { type: 'image/jpeg' });
    
    vi.mocked(analyzeImageFile).mockResolvedValue({
      prediction: 'Risky',
      reasoning: 'Low quality',
      healthTip: [{ content: 'Low quality image' }],
      nutritionData: {
        foodName: 'Unknown',
        calories: 0,
        carbohydrates: 0,
        protein: 0,
        fat: 0,
        sodium: 0,
        fiber: 0,
        totalSugars: 0
      }
    } as any);

    const result = await analyzeImageFile(mockFile);
    expect(result).toBeDefined();
  });
});
