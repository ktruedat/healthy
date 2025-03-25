"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Home,
  Menu,
  TrendingUp,
  Dna,
  BarChartHorizontal,
  Brain,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/layout/theme-toggle";

interface NavItemsProps {
  isCollapsed: boolean;
  links: {
    title: string;
    label?: string;
    icon: React.ReactNode;
    variant: "default" | "ghost";
    href: string;
  }[];
}

export function SidebarNav() {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  // const pathname = usePathname();

  // Navigation items shared between mobile and desktop
  const navItems: {
    title: string;
    label?: string;
    icon: React.ReactNode;
    variant: "default" | "ghost";
    href: string;
  }[] = [
    {
      title: "Dashboard",
      label: "",
      icon: <Home className="h-4 w-4" />,
      variant: "default",
      href: "/dashboard",
    },
    {
      title: "Trends",
      label: "",
      icon: <TrendingUp className="h-4 w-4" />,
      variant: "ghost",
      href: "/dashboard/trends",
    },
    {
      title: "Diseases",
      label: "",
      icon: <Dna className="h-4 w-4" />,
      variant: "ghost",
      href: "/diseases",
    },
    {
      title: "Analytics",
      label: "",
      icon: <BarChart3 className="h-4 w-4" />,
      variant: "ghost",
      href: "/analytics",
    },
    {
      title: "Forecast",
      label: "",
      icon: <BarChartHorizontal className="h-4 w-4" />,
      variant: "ghost",
      href: "/analytics/forecast",
    },
    {
      title: "Correlation",
      label: "",
      icon: <Brain className="h-4 w-4" />,
      variant: "ghost",
      href: "/analytics/correlation",
    },
  ];

  return (
    <>
      {/* Mobile sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="md:hidden fixed top-4 left-4 z-40"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="pr-0 sm:max-w-xs">
          <MobileSidebar links={navItems} />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed hidden md:flex flex-col h-screen border-r bg-sidebar text-sidebar-foreground transition-all duration-300",
          isCollapsed ? "w-16" : "w-56",
        )}
      >
        <div className="flex h-16 items-center justify-between px-4">
          {!isCollapsed && (
            <div className="text-lg font-semibold text-sidebar-foreground">
              Health ISIS
            </div>
          )}

          <div className="flex items-center">
            <ThemeToggle />

            <Button
              variant="ghost"
              size="icon"
              className="ml-1 cursor-pointer"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
          </div>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          <NavItems isCollapsed={isCollapsed} links={navItems} />
        </nav>
      </aside>

      {/* Spacer for content (to push content away from the sidebar) */}
      <div className={cn("hidden md:block", isCollapsed ? "w-12" : "w-52")} />
    </>
  );
}

function MobileSidebar({
  links,
}: {
  links: {
    title: string;
    label?: string;
    icon: React.ReactNode;
    variant: "default" | "ghost";
    href: string;
  }[];
}) {
  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="px-4 flex items-center justify-between">
        <div className="text-lg font-semibold">Health ISIS</div>
        <ThemeToggle />
      </div>
      <nav className="mt-4 px-2 space-y-1">
        <NavItems isCollapsed={false} links={links} />
      </nav>
    </div>
  );
}

function NavItems({ links, isCollapsed }: NavItemsProps) {
  const pathname = usePathname();
  return (
    <div className="space-y-1">
      {links.map((link, index) => {
        const isActive = pathname === link.href;
        if (isCollapsed) {
          return (
            <Button
              key={index}
              asChild
              variant={isActive ? "default" : "ghost"}
              size="icon"
              className={cn(
                "w-full h-10",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 border-1 border-primary shadow-sm"
                  : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Link href={link.href}>
                {link.icon}
                <span className="sr-only">{link.title}</span>
              </Link>
            </Button>
          );
        }

        return (
          <Button
            key={index}
            asChild
            variant={isActive ? "default" : "ghost"}
            className={cn(
              "w-full justify-start",
              isActive
                ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 border-1 border-primary shadow-sm"
                : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <Link href={link.href}>
              {link.icon}
              <span>{link.title}</span>
              {link.label && (
                <span className="ml-auto bg-sidebar-accent text-sidebar-accent-foreground rounded px-2 py-0.5 text-xs">
                  {link.label}
                </span>
              )}
            </Link>
          </Button>
        );
      })}
    </div>
  );
}
