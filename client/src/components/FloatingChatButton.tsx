import { MessageCircle } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function FloatingChatButton() {
  const [location] = useLocation();
  const isOnChatPage = location === '/chat';

  // Don't show the floating button if user is already on chat page
  if (isOnChatPage) {
    return null;
  }

  return (
    <Link href="/chat">
      <Button
        size="icon"
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg",
          "bg-gradient-to-br from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600",
          "text-white border-0 transition-all duration-300",
          "hover:scale-110 hover:shadow-xl",
          "focus:scale-105 active:scale-95"
        )}
        data-testid="floating-chat-button"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="sr-only">Open Health Assistant Chat</span>
      </Button>
    </Link>
  );
}