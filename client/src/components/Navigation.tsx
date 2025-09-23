import { Camera, History, User, Home } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/scanner', icon: Camera, label: 'Scanner' },
  { href: '/history', icon: History, label: 'History' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export default function Navigation() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur border-t md:relative md:border-t-0 md:bg-transparent md:backdrop-blur-none">
      <div className="container mx-auto px-4">
        <div className="flex justify-center md:justify-center gap-2 py-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className={cn(
                    'flex flex-col gap-1 h-auto py-2 px-3 md:flex-row md:h-9 md:px-3',
                    isActive && 'text-primary-foreground bg-primary hover:bg-primary/90'
                  )}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  <Icon className="w-5 h-5 md:w-4 md:h-4" />
                  <span className="text-xs md:text-sm">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}