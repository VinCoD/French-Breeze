
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
import { lessonTopics } from '@/lib/data';
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from '@/hooks/use-mobile';
import { BottomNavigation } from '@/components/bottom-navigation';
import { cn } from '@/lib/utils';


const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/lessons', label: 'Lessons', icon: BookOpenText, subItemsPrefix: '/lessons/' },
  { href: '/flashcards', label: 'Flashcards', icon: Layers3, subItemsPrefix: '/flashcards/' },
  { href: '/quizzes', label: 'Quizzes', icon: Puzzle, subItemsPrefix: '/quizzes/' },
];

const AppSidebar = () => {
  const pathname = usePathname();
  const { open } = useSidebar(); // from SidebarProvider context
  const isMobile = useIsMobile();

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
        {!isMobile && <SidebarTrigger className="md:hidden" />}
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
  const { firebaseUser, loadingAuth, loadingUserData, userName, level, signOut: contextSignOut } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Wait for both auth and user data to finish loading before making decisions
    if (!loadingAuth && !loadingUserData) {
      if (!firebaseUser) {
        router.push('/'); 
      } else if (!userName || !level) {
        // If profile details (name/level from Firestore) are missing, 
        // but user is authenticated, redirect to settings or onboarding page.
        // For now, let's assume if they reach here without name/level, settings is appropriate.
        // The main page '/' should handle redirecting to 'details' step if name/level missing right after login.
        if (router.pathname !== '/settings' && router.pathname !== '/') { // Avoid loop if already on settings or root
          // router.push('/settings'); // Or could be '/' which then directs to details
        }
      }
    }
  }, [firebaseUser, loadingAuth, loadingUserData, userName, level, router]);

  const handleLogout = async () => {
    try {
      await contextSignOut();
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      // router.push('/') is handled by the useEffect above once firebaseUser becomes null
    } catch (error) {
        toast({ variant: "destructive", title: "Logout Error", description: "Failed to log out." });
    }
  };
  
  if (loadingAuth || loadingUserData || !firebaseUser) { // Added loadingUserData check
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-accent/30">
            <Wind className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      {!isMobile && <AppSidebar />}
      
      <SidebarInset className={cn(isMobile ? "ml-0 !p-0" : "")}> 
        <header className={cn(
          "sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md sm:px-6",
          isMobile && "fixed w-full" 
        )}>
          <div className="flex items-center gap-2">
             {!isMobile && <SidebarTrigger className="hidden md:flex" />}
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
                    <AvatarImage 
                      src={firebaseUser.photoURL || `https://placehold.co/40x40.png?text=${userName?.charAt(0).toUpperCase() || 'U'}`} 
                      alt={userName || firebaseUser.email || "User"} 
                      data-ai-hint="profile avatar" />
                    <AvatarFallback>{userName?.charAt(0).toUpperCase() || firebaseUser.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline">{userName || firebaseUser.email}</span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account ({level || 'N/A'})</DropdownMenuLabel>
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
        <main className={cn(
          "flex-1 p-4 sm:p-6",
          isMobile ? "pt-16 pb-20" : "" 
        )}>
          {children}
        </main>
      </SidebarInset>
      {isMobile && <BottomNavigation navItems={navItems} />}
    </SidebarProvider>
  );
}
