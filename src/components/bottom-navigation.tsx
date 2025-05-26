
"use client";

import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  subItemsPrefix?: string;
}

interface BottomNavigationProps {
  navItems: NavItem[];
}

export function BottomNavigation({ navItems }: BottomNavigationProps) {
  const pathname = usePathname();

  // Filter out any items that shouldn't be in the bottom nav, if necessary.
  // For now, using all main navItems.
  const bottomNavItems = navItems.filter(item => 
    ["/dashboard", "/lessons", "/flashcards", "/quizzes"].includes(item.href)
  );


  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 h-16 border-t bg-background/90 backdrop-blur-lg md:hidden">
      <div className="flex h-full items-center justify-around px-2">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href || (item.subItemsPrefix && pathname.startsWith(item.subItemsPrefix));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 rounded-md p-1 text-xs font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary hover:bg-accent/50",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon className={cn("h-5 w-5 sm:h-6 sm:w-6", isActive ? "text-primary" : "")} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
