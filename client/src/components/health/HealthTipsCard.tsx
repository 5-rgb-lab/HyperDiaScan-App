import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function HealthTipsCard({ tips }: { tips: Array<{ icon: any; color: string; title: string; content: string }>; }) {
  const [currentTip, setCurrentTip] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => setCurrentTip((p) => (tips.length > 0 ? (p + 1) % tips.length : 0)), 5000);
    return () => clearInterval(interval);
  }, [tips.length]);

  if (!tips || tips.length === 0) return null;

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-800 dark:to-blue-950/50 border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${tips[currentTip].color} shadow-lg flex-shrink-0`}>
            {React.createElement(tips[currentTip].icon, { className: 'w-6 h-6 text-white' })}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-2">{tips[currentTip].title}</h3>
            <p className="text-muted-foreground leading-relaxed">{tips[currentTip].content}</p>
          </div>
        </div>

        {tips.length > 1 && (
          <div className="flex justify-center mt-4 gap-2">
            {tips.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentTip ? 'bg-blue-500 w-6' : 'bg-gray-300'}`}
                onClick={() => setCurrentTip(index)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
