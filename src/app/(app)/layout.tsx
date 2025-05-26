"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  BookOpenText,
  Layers3,
  Puzzle,
  Settings,
  LogOut,
  Wind,
  ChevronDown,
  Bell,
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { useUser } from '@/context/UserContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { lessonTopics, lessons } from '@/lib/data';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/lessons', label: 'Lessons', icon: BookOpenText, subItemsPrefix: '/lessons/' },
  { href: '/flashcards', label: 'Flashcards', icon: Layers3, subItemsPrefix: '/flashcards/' },
  { href: '/quizzes', label: 'Quizzes', icon: Puzzle, subItemsPrefix: '/quizzes/' },
];

const AppSidebar = () => {
  const pathname = usePathname();
  const { level, userName } = useUser();
  const { open } = useSidebar();

  const topicSubNavItems = lessonTopics.map(topic => ({
    href: `/lessons/${topic.toLowerCase().replace(/\s+/g, '-')}`,
    label: topic,
  }));

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="flex items-center justify-between p-2">
        <Link href="/dashboard" className="flex items-center gap-2 hover:no-underline">
          <Wind className="h-7 w-7 text-primary" />
          {open && <span className="text-xl font-semibold text-primary">French Breeze</span>}
        </Link>
        <SidebarTrigger className="md:hidden" />
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href || (item.subItemsPrefix && pathname.startsWith(item.subItemsPrefix))}
                tooltip={open ? undefined : item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
              {item.label === "Lessons" && (pathname.startsWith("/lessons") || pathname === "/lessons") && open && (
                <SidebarMenuSub>
                  {topicSubNavItems.map(subItem => (
                     <SidebarMenuSubItem key={subItem.href}>
                        <SidebarMenuSubButton asChild isActive={pathname === subItem.href}>
                           <Link href={subItem.href}>{subItem.label}</Link>
                        </SidebarMenuSubButton>
                     </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/settings'} tooltip={open ? undefined : "Settings"}>
              <Link href="/settings">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { level, setLevel, userName, setUserName } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!level || !userName) {
      router.push('/'); // Redirect to onboarding if level or name is not set
    }
  }, [level, userName, router]);

  const handleLogout = () => {
    setLevel(null);
    setUserName(null);
    localStorage.removeItem("frenchBreezeLevel");
    localStorage.removeItem("frenchBreezeUserName");
    localStorage.removeItem("frenchBreezeProgress");
    localStorage.removeItem("frenchBreezeStreak");
    localStorage.removeItem("frenchBreezeLastVisit");
    router.push('/');
  };
  
  if (!level || !userName) {
     // Still loading or redirecting, show minimal UI or loader
    return (
        <div className="flex min-h-screen items-center justify-center">
            <Wind className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }


  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-2">
             <SidebarTrigger className="hidden md:flex" />
             {/* Placeholder for breadcrumbs or page title */}
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </Button>
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://placehold.co/40x40.png?text=${userName?.charAt(0).toUpperCase()}`} alt={userName || "User"} data-ai-hint="profile avatar" />
                    <AvatarFallback>{userName?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline">{userName}</span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
