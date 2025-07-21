
'use client';

import React from 'react';
import Link from 'next/link';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  useSidebar 
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  FileText,
  History,
  Settings,
  LogOut,
  Bell,
  Beaker,
  ListChecks,
  LibraryBig,
  BarChartHorizontalBig,
  Share2,
  PackageSearch,
  ChevronsLeft, 
  ChevronsRight 
} from 'lucide-react';
import { Logo } from '@/components/layout/logo';
import { ModeToggle } from '@/components/layout/mode-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/claims', label: 'Claims Management', icon: FileText },
  { href: '/batches', label: 'Claim Batches', icon: PackageSearch },
  { href: '/audit', label: 'Audit Trail', icon: History },
  { href: '/criticality-assessment', label: 'Criticality Assessment', icon: Beaker },
  { href: '/critical-findings', label: 'Critical Findings', icon: ListChecks },
  { href: '/knowledge-base', label: 'Knowledge Base', icon: LibraryBig },
  { href: '/reports', label: 'Reports', icon: BarChartHorizontalBig },
  { href: '/integrations', label: 'Integrations', icon: Share2 },
  { href: '/admin', label: 'Administration', icon: Settings },
];

function AppShellContent({ children }: { children: React.ReactNode }) {
  const { open, toggleSidebar, isMobile, variant } = useSidebar();

  return (
    <>
      <Sidebar variant="sidebar" collapsible="icon" className="border-r">
        <SidebarRail />
        <SidebarHeader className="p-4">
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <Link href={item.href} passHref legacyBehavior>
                  <SidebarMenuButton asChild tooltip={item.label}>
                    <a>
                      <item.icon />
                      <span>{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-2 flex flex-col gap-2">
           {!isMobile && (
            <SidebarMenuButton
              onClick={toggleSidebar}
              className="w-full"
              tooltip={open ? "Collapse Sidebar" : "Expand Sidebar"}
              aria-label={open ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              {open ? <ChevronsLeft /> : <ChevronsRight />}
              <span className="group-data-[state=collapsed]:hidden">
                {open ? "Collapse" : "Expand"}
              </span>
            </SidebarMenuButton>
           )}
           <ModeToggle />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset variant={variant}>
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <div className="hidden md:block font-semibold text-lg">JALIN HEALTH PORTAL</div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="https://placehold.co/100x100.png" alt="User Avatar" data-ai-hint="man portrait"/>
                    <AvatarFallback>UN</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">User Name</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      user@example.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
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
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen>
      <AppShellContent>{children}</AppShellContent>
    </SidebarProvider>
  );
}
