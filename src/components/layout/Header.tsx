'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Bell, Settings, User, LogOut, Moon, Sun, ChevronDown, Laptop } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function Header() {
  const { user, signOut } = useAuth();
  const { setTheme, theme } = useTheme();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/signin');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6 shadow-sm dark:border-border relative z-20 transition-colors">
      <div className="flex items-center">
        <h2 className="text-lg font-semibold text-foreground">Dashboard</h2>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
        </Button>
        
        <div 
            className="relative min-w-[16rem]"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
        >
            <div className="flex items-center justify-end gap-3 border-l pl-4 border-border cursor-pointer py-2">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-foreground">
                    {user?.displayName || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
                <div className="absolute right-0 top-12 mt-1 w-60 rounded-xl border border-border bg-popover shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-3 border-b border-border sm:hidden">
                        <p className="text-sm font-medium text-foreground">
                        {user?.displayName || 'User'}
                        </p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>

                    <div className="px-2">
                        <Link href="/settings?tab=profile" className="flex items-center px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors">
                            <User className="mr-2 h-4 w-4" />
                            Profile
                        </Link>
                        
                        <Link href="/settings" className="flex items-center px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors">
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                        </Link>
                        
                        <button className="flex w-full items-center px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors">
                            <Bell className="mr-2 h-4 w-4" />
                            Notifications
                        </button>
                    </div>

                    <div className="border-t border-border my-2"></div>

                    <div className="px-2">
                        <button 
                            onClick={() => {
                                if (theme === 'light') setTheme('dark');
                                else if (theme === 'dark') setTheme('system');
                                else setTheme('light');
                            }}
                            className="flex w-full items-center px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors justify-between group"
                        >
                            <div className="flex items-center">
                                {theme === 'dark' ? (
                                    <Moon className="mr-2 h-4 w-4" />
                                ) : theme === 'system' ? (
                                    <Laptop className="mr-2 h-4 w-4" />
                                ) : (
                                    <Sun className="mr-2 h-4 w-4" />
                                )}
                                Theme
                            </div>
                            <span className="text-xs text-muted-foreground group-hover:text-accent-foreground capitalize">{theme === 'system' ? 'System' : theme}</span>
                        </button>
                    </div>

                    <div className="border-t border-border my-2"></div>

                    <div className="px-2">
                        <button 
                            onClick={handleLogout}
                            className="flex w-full items-center px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </header>
  );
}
