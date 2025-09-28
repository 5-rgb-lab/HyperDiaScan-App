import Chatbot from '@/components/Chatbot';

export default function Chat() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold" data-testid="text-chat-title">
          Health Assistant
        </h1>
        <p className="text-muted-foreground">
          Ask questions about nutrition, diabetes management, and blood pressure control
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <Chatbot />
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-muted/50 rounded-lg p-6 space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
            What I can help with:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium">🍎 Nutrition Questions</h4>
              <ul className="text-muted-foreground space-y-1 text-xs">
                <li>• Understanding nutrition labels</li>
                <li>• Carbohydrate counting</li>
                <li>• Healthy food substitutions</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">🩺 Health Management</h4>
              <ul className="text-muted-foreground space-y-1 text-xs">
                <li>• Diabetes meal planning</li>
                <li>• Blood pressure control tips</li>
                <li>• General wellness advice</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-2 border-t border-muted-foreground/20">
            <p className="text-xs text-muted-foreground">
              <strong>Important:</strong> This assistant provides general information only. 
              Always consult your healthcare provider for personalized medical advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}