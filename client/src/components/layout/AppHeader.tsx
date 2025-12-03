import { useState } from 'react';
import { Activity, User, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DesktopNav, MobileNav } from './Navigation';

interface AppHeaderProps {
  user?: {
    name: string;
    email: string;
    photoURL?: string;
  };
  onProfileClick: () => void;
  onSignOut: () => void;
}

export default function AppHeader({ user, onProfileClick, onSignOut }: AppHeaderProps) {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo / Branding */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold">HyperDiaSense</h1>
            </div>

            {/* Desktop Navigation */}
            <DesktopNav />

            {/* Theme Toggle & User */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-white hover:bg-white/20"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full p-0 hover:ring-2 hover:ring-white/50 transition"
                    >
                      <Avatar className="h-10 w-10 border-2 border-white/30">
                        <AvatarImage src={user.photoURL} alt={user.name} />
                        <AvatarFallback className="bg-gray-500 text-white">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    className="w-60 rounded-xl bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-700 p-2"
                    align="end"
                    forceMount
                  >
                    <DropdownMenuLabel className="px-3 py-2 font-normal">
                      <div className="flex flex-col space-y-0.5">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator className="my-1" />

                    <DropdownMenuItem
                      onClick={onProfileClick}
                      className="px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 text-sm"
                    >
                      <User className="h-4 w-4" /> Profile
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={onSignOut}
                      className="px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 text-sm"
                    >
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </>
  );
}
