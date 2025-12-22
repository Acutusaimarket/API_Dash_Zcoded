import * as React from "react";
import { cn } from "@/lib/utils";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

function Sidebar({ className, children, ...props }: SidebarProps) {
  return (
    <div
      className={cn(
        "flex h-full w-64 flex-col bg-background",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function SidebarHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex h-16 items-center px-6", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function SidebarContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex-1 overflow-y-auto px-3 py-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function SidebarFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("px-3 py-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}

interface SidebarItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  children: React.ReactNode;
}

function SidebarItem({ className, active, children, ...props }: SidebarItemProps) {
  return (
    <button
      className={cn(
        "flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
        "hover:bg-muted hover:text-foreground",
        active && "bg-muted text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

interface SidebarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  label?: string;
}

function SidebarGroup({ className, children, label, ...props }: SidebarGroupProps) {
  return (
    <div className={cn("space-y-1", className)} {...props}>
      {label && (
        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </div>
      )}
      {children}
    </div>
  );
}

interface SidebarSubItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  children: React.ReactNode;
}

function SidebarSubItem({ className, active, children, ...props }: SidebarSubItemProps) {
  return (
    <button
      className={cn(
        "flex w-full items-center rounded-md px-6 py-2 text-sm transition-colors",
        "hover:bg-muted hover:text-foreground",
        active && "bg-muted text-foreground font-medium",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarItem,
  SidebarGroup,
  SidebarSubItem,
};

