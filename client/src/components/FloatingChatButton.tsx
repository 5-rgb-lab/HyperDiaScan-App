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
          // Fixed positioning - always visible and floating
          "fixed bottom-20 right-4 z-50",
          // Professional circular design
          "w-16 h-16 rounded-full",
          // Health app gradient background
          "bg-gradient-to-br from-blue-500 to-green-500",
          "hover:from-blue-600 hover:to-green-600",
          "active:from-blue-700 active:to-green-700",
          // Professional shadows and effects
          "shadow-lg hover:shadow-xl",
          "ring-2 ring-white/20 hover:ring-white/30",
          // Text and border styling
          "text-white border-0",
          // Smooth professional animations
          "transition-all duration-300 ease-in-out",
          "hover:scale-105 hover:-translate-y-1",
          "active:scale-95 active:translate-y-0",
          // Responsive adjustments for smaller screens
          "sm:bottom-24 sm:right-6 sm:w-14 sm:h-14",
          // Accessibility and focus states
          "focus:ring-4 focus:ring-blue-500/50 focus:outline-none"
        )}
        data-testid="floating-chat-button"
      >
        <MessageCircle className="w-6 h-6 sm:w-5 sm:h-5" />
        <span className="sr-only">Open Health Assistant Chat</span>
      </Button>
    </Link>
  );
}