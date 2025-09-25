import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY2 });

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function chatWithHealthAssistant(messages: ChatMessage[]): Promise<string> {
  try {
    const systemMessage: ChatMessage = {
      role: 'system',
      content: `You are a helpful health assistant for a nutrition tracking app called HyperDiaScan. 
      The app helps users with diabetes and hypertension make informed food choices through nutrition label analysis.
      
      Your role:
      - Provide helpful, accurate information about nutrition, diabetes, and hypertension management
      - Answer questions about food choices, blood sugar management, and blood pressure control
      - Offer general health guidance and tips
      - Be supportive and encouraging
      - Always remind users to consult healthcare professionals for medical advice
      
      Keep responses:
      - Clear and concise (2-3 paragraphs maximum)
      - Evidence-based and factual
      - Encouraging and supportive
      - Always include a disclaimer about consulting healthcare providers
      
      Topics you can help with:
      - Nutrition facts interpretation
      - Diabetes-friendly food choices
      - Blood pressure management through diet
      - General health and wellness tips
      - Understanding carbohydrates, sodium, and other nutrients
      - Meal planning suggestions`
    };

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [systemMessage, ...messages],
      max_completion_tokens: 500, // Keep responses concise
    });

    return response.choices[0].message.content || "I apologize, but I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to get response from health assistant. Please try again.');
  }
}