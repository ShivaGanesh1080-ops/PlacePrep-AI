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
  { label: "Career Pathways", href: "/career", icon: Brain },
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

  // Derive current page context name from pathname for quiet header
  const currentNav = filteredNavItems.find((item) => isActive(item.href));
  const pageTitle = currentNav?.label || "Workspace";

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Drawer Backdrop */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}

      {/* Antigravity-Style Collapsible Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200/80 flex flex-col transition-all duration-300 ease-in-out ${
          sidebarOpen ? "lg:w-64" : "lg:w-[68px]"
        } ${
          mobileDrawerOpen
            ? "translate-x-0 w-64 shadow-xl"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-14 border-b border-slate-100 flex items-center justify-between px-3.5">
          <Link
            href="/dashboard"
            className={`flex items-center gap-2.5 overflow-hidden transition-all ${
              !sidebarOpen ? "lg:justify-center lg:w-full" : ""
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>

            <div
              className={`flex items-baseline gap-1.5 transition-opacity duration-200 ${
                !sidebarOpen ? "lg:hidden" : "block"
              }`}
            >
              <span className="text-xs font-semibold tracking-tight text-slate-900">
                PlacePrep
              </span>
              <span className="text-[10px] font-mono font-medium text-slate-400">
                AI
              </span>
            </div>
          </Link>

          {/* Desktop Toggle Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0 ${
              !sidebarOpen ? "hidden" : "flex"
            }`}
            title="Collapse sidebar to activity rail"
          >
            <PanelLeftClose className="w-3.5 h-3.5" />
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
          <div className="hidden lg:flex justify-center py-2 border-b border-slate-100">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Expand sidebar"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {filteredNavItems.map((item) => {
            const active = isActive(item.href);
            return (
              <div key={item.href} className="relative group">
                <Link
                  href={item.href}
                  onClick={() => setMobileDrawerOpen(false)}
                  className={`flex items-center rounded-lg text-xs font-medium transition-colors ${
                    sidebarOpen
                      ? "px-2.5 py-2 gap-2.5"
                      : "lg:justify-center lg:px-0 lg:py-2 px-2.5 py-2 gap-2.5"
                  } ${
                    active
                      ? "bg-slate-100 text-slate-900 font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {/* Left Active Glow Pill on Slim Rail */}
                  {!sidebarOpen && active && (
                    <span className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-indigo-600 rounded-r-full" />
                  )}

                  <item.icon
                    className={`w-4 h-4 shrink-0 ${
                      active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
                    }`}
                  />

                  {/* Label */}
                  <span
                    className={`flex-1 truncate transition-opacity duration-200 ${
                      !sidebarOpen ? "lg:hidden" : "block"
                    }`}
                  >
                    {item.label}
                  </span>

                  {sidebarOpen && active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                  )}
                </Link>

                {/* Sleek Floating Tooltip */}
                {!sidebarOpen && (
                  <div className="hidden lg:group-hover:flex items-center absolute left-full top-1/2 -translate-y-1/2 ml-2.5 z-50 pointer-events-none animate-in fade-in duration-100">
                    <div className="px-2 py-1 bg-slate-900 text-white text-[11px] font-medium rounded-md shadow-lg whitespace-nowrap border border-slate-800">
                      {item.label}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="p-2.5 border-t border-slate-100 bg-white">
          {sidebarOpen ? (
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-white text-[11px] font-semibold shrink-0">
                  {session?.user?.name
                    ? session.user.name.charAt(0).toUpperCase()
                    : "S"}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-900 truncate">
                    {session?.user?.name || "Student"}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {session?.user?.email || ""}
                  </p>
                </div>
              </div>

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="hidden lg:flex flex-col items-center py-1 relative group">
              <div
                className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-white text-[11px] font-semibold cursor-pointer"
                title={session?.user?.name || "User"}
              >
                {session?.user?.name
                  ? session.user.name.charAt(0).toUpperCase()
                  : "S"}
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
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200/80 h-14 flex items-center justify-between px-4 sm:px-6">
          {/* Left: Context Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden p-1.5 -ml-1 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              title="Open menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400">Workspace</span>
              <span className="text-slate-300">/</span>
              <span className="font-medium text-slate-900">{pageTitle}</span>
            </div>
          </div>

          {/* Right: User Badge */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="font-medium hidden sm:inline">
                {session?.user?.name || "Student"}
              </span>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-20 lg:pb-8 overflow-x-hidden min-w-0">
          {children}
        </main>

        {/* Mobile Bottom Navigation Bar (Phone-Optimized, 0 friction) */}
        <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 lg:hidden px-2 py-1.5 flex items-center justify-around shadow-lg">
          {[
            { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
            { label: "Prep AI", href: "/copilot", icon: Bot },
            { label: "Tests", href: "/tests", icon: ClipboardCheck },
            { label: "Resume", href: "/resume", icon: FileText },
            { label: "Interview", href: "/interview", icon: MessageSquare },
          ].map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-medium transition-colors ${
                  active
                    ? "text-indigo-600 font-bold bg-indigo-50/70"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <item.icon className={`w-4 h-4 mb-0.5 ${active ? "text-indigo-600" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
