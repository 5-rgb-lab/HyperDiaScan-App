import { PenLine, History, User, Home } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/scanner', icon: PenLine, label: 'Analyze' },
  { href: '/history', icon: History, label: 'History' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export function DesktopNav() {
  const [location] = useLocation();

  return (
    <nav className="hidden lg:flex lg:gap-6 lg:ml-auto lg:mr-4">
      {navItems.map((item) => {
        const isActive =
          location === item.href || (item.href !== '/' && location.startsWith(item.href));
        const Icon = item.icon;

        return (
          <Link key={item.href} href={item.href}>
            <button
              className={cn(
                'flex items-center gap-1 px-2 py-1 text-white transition-all duration-200',
                'hover:text-gray-200',
                isActive ? 'border-b-2 border-white font-semibold' : ''
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </button>
          </Link>
        );
      })}
    </nav>
  );
}


export function MobileNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 text-white backdrop-blur-lg border-t border-transparent shadow-lg lg:hidden">
      <div className="container mx-auto px-4">
        <div className="flex justify-around gap-2 py-3">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    'flex flex-col gap-1 h-auto py-2 px-4 rounded-2xl transition-all duration-300 text-white',
                    'hover:text-gray-200 hover:scale-105',
                    isActive
                      ? 'border-b-2 border-white font-semibold'
                      : ''
                  )}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  <Icon className={cn('w-5 h-5 transition-all duration-300')} />
                  <span className={cn('text-xs font-medium transition-all duration-300')}>
                    {item.label}
                  </span>
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}


export default MobileNav;