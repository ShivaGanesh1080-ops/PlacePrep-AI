"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Brain,
  ClipboardCheck,
  MessageSquare,
  FileText,
  User,
  Settings,
  GraduationCap,
  LogOut,
  ChevronRight,
  Bot,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  Building2,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Prep AI", href: "/copilot", icon: Bot },
  { label: "Career AI", href: "/career", icon: Brain },
  { label: "Aptitude Tests", href: "/tests", icon: ClipboardCheck },
  { label: "Mock Interview", href: "/interview", icon: MessageSquare },
  { label: "Resume Intelligence", href: "/resume", icon: FileText },
  { label: "Campus Drives", href: "/companies", icon: Building2 },
  { label: "My Profile", href: "/profile", icon: User },
  { label: "Admin Panel", href: "/admin", icon: Settings, adminOnly: true },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  // Sidebar expanded (true = full width w-64, false = Antigravity slim activity rail w-[68px])
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const userRole = (session?.user as { role?: string } | undefined)?.role;

  const filteredNavItems = navItems.filter(
    (item) => !item.adminOnly || userRole === "ADMIN"
  );

  function isActive(href: string): boolean {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Drawer Backdrop */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}

      {/* Antigravity-Style Collapsible Sidebar (Desktop: Expanded w-64 vs Slim Activity Rail w-[68px]) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200/90 flex flex-col transition-all duration-300 ease-in-out shadow-xs ${
          // Desktop sizing:
          sidebarOpen ? "lg:w-64" : "lg:w-[68px]"
        } ${
          // Mobile drawer sizing:
          mobileDrawerOpen
            ? "translate-x-0 w-64"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-15 border-b border-slate-100 flex items-center justify-between px-3.5">
          {/* Logo & Brand Name */}
          <Link
            href="/dashboard"
            className={`flex items-center gap-2.5 overflow-hidden transition-all ${
              !sidebarOpen ? "lg:justify-center lg:w-full" : ""
            }`}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-xl flex items-center justify-center shadow-xs shrink-0">
              <GraduationCap className="w-4.5 h-4.5 text-white" />
            </div>

            {/* Title visible only when expanded or on mobile drawer */}
            <span
              className={`text-base font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent tracking-tight whitespace-nowrap transition-opacity duration-200 ${
                !sidebarOpen ? "lg:hidden" : "block"
              }`}
            >
              PlacePrep AI
            </span>
          </Link>

          {/* Desktop Toggle Button (Only 1 clean toggle button inside the sidebar!) */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer shrink-0 ${
              !sidebarOpen ? "hidden" : "flex"
            }`}
            title="Collapse sidebar to activity rail"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileDrawerOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Close menu"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* When collapsed on desktop: Dedicated expand button at top of slim rail */}
        {!sidebarOpen && (
          <div className="hidden lg:flex justify-center py-2.5 border-b border-slate-100">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
              title="Expand sidebar"
            >
              <PanelLeftOpen className="w-4.5 h-4.5" />
            </button>
          </div>
        )}

        {/* Navigation Items (Antigravity Activity Rail style) */}
        <nav className="flex-1 px-2.5 py-3 space-y-1 overflow-y-auto overflow-x-hidden">
          {filteredNavItems.map((item) => {
            const active = isActive(item.href);
            return (
              <div key={item.href} className="relative group">
                <Link
                  href={item.href}
                  onClick={() => setMobileDrawerOpen(false)}
                  className={`flex items-center rounded-xl text-xs font-semibold transition-all duration-200 ${
                    sidebarOpen
                      ? "px-3 py-2.5 gap-3"
                      : "lg:justify-center lg:px-0 lg:py-2.5 px-3 py-2.5 gap-3"
                  } ${
                    active
                      ? "bg-indigo-50 text-indigo-700 font-bold border border-indigo-100 shadow-xs"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
                  }`}
                >
                  {/* Left Active Glow Pill on Slim Rail */}
                  {!sidebarOpen && active && (
                    <span className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-600 rounded-r-full" />
                  )}

                  <item.icon
                    className={`w-4.5 h-4.5 shrink-0 transition-transform group-hover:scale-105 ${
                      active
                        ? "text-indigo-600"
                        : "text-slate-400 group-hover:text-slate-700"
                    }`}
                  />

                  {/* Label (hidden in slim mode on desktop) */}
                  <span
                    className={`flex-1 truncate transition-opacity duration-200 ${
                      !sidebarOpen ? "lg:hidden" : "block"
                    }`}
                  >
                    {item.label}
                  </span>

                  {sidebarOpen && active && (
                    <ChevronRight className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  )}
                </Link>

                {/* Sleek Floating Tooltip (Visible ONLY on desktop in slim mode) */}
                {!sidebarOpen && (
                  <div className="hidden lg:group-hover:flex items-center absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 pointer-events-none animate-in fade-in slide-in-from-left-2 duration-150">
                    <div className="px-2.5 py-1 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-xl whitespace-nowrap flex items-center gap-1.5 border border-slate-800">
                      <span>{item.label}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="p-3 border-t border-slate-100 bg-white">
          {sidebarOpen ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs">
                  {session?.user?.name
                    ? session.user.name.charAt(0).toUpperCase()
                    : "S"}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {session?.user?.name || "Student"}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {session?.user?.email || ""}
                  </p>
                </div>
              </div>

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="hidden lg:flex flex-col items-center gap-2 relative group">
              <div
                className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold shadow-xs cursor-pointer"
                title={session?.user?.name || "User"}
              >
                {session?.user?.name
                  ? session.user.name.charAt(0).toUpperCase()
                  : "S"}
              </div>

              {/* Tooltip on slim mode */}
              <div className="hidden lg:group-hover:flex items-center absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 pointer-events-none animate-in fade-in duration-150">
                <div className="px-2.5 py-1 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-xl whitespace-nowrap border border-slate-800">
                  {session?.user?.name || "Student"}
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          sidebarOpen ? "lg:pl-64" : "lg:pl-[68px]"
        }`}
      >
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs h-15 flex items-center justify-between px-4 sm:px-6">
          {/* Left: Mobile Drawer Trigger + Greeting */}
          <div className="flex items-center gap-3">
            {/* Mobile-only menu toggle (Hidden on desktop!) */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              title="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <p className="text-xs font-medium text-slate-500">
              Welcome back,{" "}
              <span className="font-semibold text-slate-900">
                {session?.user?.name || "Student"}
              </span>
            </p>
          </div>

          {/* Right: Quick Profile Badge & Logout */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                {session?.user?.name
                  ? session.user.name.charAt(0).toUpperCase()
                  : "S"}
              </div>
              <span className="text-xs font-semibold text-slate-800 hidden sm:block">
                {session?.user?.name || "Student"}
              </span>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-6 overflow-x-hidden min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
