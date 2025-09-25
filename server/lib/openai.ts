import { CohereClient } from "cohere-ai";

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function chatWithHealthAssistant(messages: ChatMessage[]): Promise<string> {
  try {
    const systemPrompt = `You are a helpful health assistant for a nutrition tracking app called HyperDiaScan. 
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
    - Meal planning suggestions`;

    // Convert messages to Cohere format, maintaining conversation history
    const chatHistory: Array<{role: 'USER' | 'CHATBOT', message: string}> = [];
    const userMessage = messages[messages.length - 1].content;
    
    // Build chat history from previous messages (excluding the current one)
    for (let i = 0; i < messages.length - 1; i++) {
      const msg = messages[i];
      if (msg.role === 'user') {
        chatHistory.push({ role: 'USER', message: msg.content });
      } else if (msg.role === 'assistant') {
        chatHistory.push({ role: 'CHATBOT', message: msg.content });
      }
    }
    
    const response = await cohere.chat({
      model: "command-r-08-2024",
      message: userMessage,
      preamble: systemPrompt,
      chatHistory: chatHistory,
      maxTokens: 500,
      temperature: 0.3, // Lower temperature for more consistent medical disclaimers
    });

    const responseText = response.text || "I apologize, but I couldn't generate a response. Please try again.";
    
    // Ensure medical disclaimer is present in health-related responses
    if (!responseText.toLowerCase().includes('consult') && !responseText.toLowerCase().includes('healthcare')) {
      return responseText + "\n\n**Important:** Please consult with your healthcare provider for personalized medical advice.";
    }
    
    return responseText;
  } catch (error) {
    console.error('Cohere API error:', error);
    throw new Error('Failed to get response from health assistant. Please try again.');
  }
}