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
  Bot,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  Building2,
  Sparkles,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "Core Preparation",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Prep AI Copilot", href: "/copilot", icon: Bot },
      { label: "Aptitude Tests", href: "/tests", icon: ClipboardCheck },
      { label: "Mock Interview", href: "/interview", icon: MessageSquare },
    ],
  },
  {
    title: "Career & Tools",
    items: [
      { label: "Career Pathways", href: "/career", icon: Brain },
      { label: "Resume Intelligence", href: "/resume", icon: FileText },
      { label: "Campus Drives", href: "/companies", icon: Building2 },
      { label: "My Profile", href: "/profile", icon: User },
      { label: "Admin Panel", href: "/admin", icon: Settings, adminOnly: true },
    ],
  },
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

  function isActive(href: string): boolean {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  }

  // Derive current page context name from pathname for header breadcrumb
  const allNavItems = navSections.flatMap((s) => s.items);
  const currentNav = allNavItems.find((item) => isActive(item.href));
  const pageTitle = currentNav?.label || "Workspace";

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#382418] flex">
      {/* Mobile Drawer Backdrop */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#382418]/30 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}

      {/* Editorial Collapsible Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-[#FFFFFF] border-r border-[#382418]/10 flex flex-col transition-all duration-300 ease-in-out ${
          sidebarOpen ? "lg:w-64" : "lg:w-[68px]"
        } ${
          mobileDrawerOpen
            ? "translate-x-0 w-64 shadow-xl"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-14 border-b border-[#382418]/8 flex items-center justify-between px-3.5 bg-[#FFFFFF]">
          <Link
            href="/dashboard"
            className={`flex items-center gap-2.5 overflow-hidden transition-all ${
              !sidebarOpen ? "lg:justify-center lg:w-full" : ""
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-[#382418] flex items-center justify-center text-[#F2E8DA] shrink-0 shadow-2xs">
              <GraduationCap className="w-4 h-4" />
            </div>

            <div
              className={`flex items-center gap-1.5 transition-opacity duration-200 ${
                !sidebarOpen ? "lg:hidden" : "block"
              }`}
            >
              <span className="text-sm font-bold tracking-tight text-[#382418]">
                PlacePrep
              </span>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[#8EC5FF]/25 text-[#1E3A5F]">
                AI
              </span>
            </div>
          </Link>

          {/* Desktop Toggle Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`hidden lg:flex p-1.5 rounded-lg text-[#7A6658] hover:text-[#382418] hover:bg-[#F2E8DA] transition-colors cursor-pointer shrink-0 ${
              !sidebarOpen ? "hidden" : "flex"
            }`}
            title="Collapse sidebar"
          >
            <PanelLeftClose className="w-3.5 h-3.5" />
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileDrawerOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-[#7A6658] hover:text-[#382418] hover:bg-[#F2E8DA] transition-colors"
            title="Close menu"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* When collapsed on desktop: Dedicated expand button at top of slim rail */}
        {!sidebarOpen && (
          <div className="hidden lg:flex justify-center py-2 border-b border-[#382418]/8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg text-[#7A6658] hover:text-[#382418] hover:bg-[#F2E8DA] transition-colors cursor-pointer"
              title="Expand sidebar"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Grouped Navigation Items */}
        <nav className="flex-1 px-2.5 py-3 space-y-4 overflow-y-auto overflow-x-hidden">
          {navSections.map((section, idx) => {
            const visibleItems = section.items.filter(
              (item) => !item.adminOnly || userRole === "ADMIN"
            );
            if (visibleItems.length === 0) return null;

            return (
              <div key={idx} className="space-y-1">
                {/* Section Title (only when expanded) */}
                {sidebarOpen && (
                  <p className="px-2.5 text-[10px] font-semibold uppercase tracking-wider text-[#7A6658]/80 select-none">
                    {section.title}
                  </p>
                )}

                {visibleItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <div key={item.href} className="relative group">
                      <Link
                        href={item.href}
                        onClick={() => setMobileDrawerOpen(false)}
                        className={`flex items-center rounded-lg text-xs font-medium transition-all ${
                          sidebarOpen
                            ? "px-2.5 py-2 gap-2.5"
                            : "lg:justify-center lg:px-0 lg:py-2 px-2.5 py-2 gap-2.5"
                        } ${
                          active
                            ? "bg-[#F2E8DA] text-[#382418] font-semibold shadow-2xs"
                            : "text-[#5A4537] hover:bg-[#F2E8DA]/60 hover:text-[#382418]"
                        }`}
                      >
                        {/* Left Active Glow Pill on Slim Rail */}
                        {!sidebarOpen && active && (
                          <span className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#8EC5FF] rounded-r-full shadow-xs" />
                        )}

                        <item.icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            active
                              ? "text-[#382418]"
                              : "text-[#7A6658] group-hover:text-[#382418]"
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
                          <span className="w-1.5 h-1.5 rounded-full bg-[#8EC5FF] shrink-0" />
                        )}
                      </Link>

                      {/* Tooltip for Collapsed State */}
                      {!sidebarOpen && (
                        <div className="hidden lg:group-hover:flex items-center absolute left-full top-1/2 -translate-y-1/2 ml-2.5 z-50 pointer-events-none animate-in fade-in duration-100">
                          <div className="px-2.5 py-1 bg-[#382418] text-[#F2E8DA] text-[11px] font-medium rounded-md shadow-md whitespace-nowrap border border-[#382418]/20">
                            {item.label}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* User Profile Single Source of Truth Dock */}
        <div className="p-2.5 border-t border-[#382418]/8 bg-[#FFFFFF]">
          {sidebarOpen ? (
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-[#382418] flex items-center justify-center text-[#F2E8DA] text-[11px] font-semibold shrink-0 shadow-2xs">
                  {session?.user?.name
                    ? session.user.name.charAt(0).toUpperCase()
                    : "S"}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#382418] truncate">
                    {session?.user?.name || "Student"}
                  </p>
                  <p className="text-[10px] text-[#7A6658] truncate">
                    {session?.user?.email || ""}
                  </p>
                </div>
              </div>

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="p-1 rounded-md text-[#7A6658] hover:text-[#382418] hover:bg-[#F2E8DA] transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="hidden lg:flex flex-col items-center py-1 relative group">
              <div
                className="w-7 h-7 rounded-lg bg-[#382418] flex items-center justify-center text-[#F2E8DA] text-[11px] font-semibold cursor-pointer shadow-2xs"
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
        {/* Top Header Bar (No duplicate user badge, clean editorial context) */}
        <header className="sticky top-0 z-30 bg-[#FFFFFF]/95 backdrop-blur-xs border-b border-[#382418]/8 h-14 flex items-center justify-between px-4 sm:px-6">
          {/* Left: Context Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden p-1.5 -ml-1 rounded-lg text-[#382418] hover:bg-[#F2E8DA] transition-colors"
              title="Open menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[#7A6658]">Workspace</span>
              <span className="text-[#C4B5A5]">/</span>
              <span className="font-semibold text-[#382418]">{pageTitle}</span>
            </div>
          </div>

          {/* Right: Clean Placement Cycle Status Chip */}
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#382418]/10 bg-[#F2E8DA]/50 text-xs text-[#382418]">
              <span className="w-2 h-2 rounded-full bg-[#8EC5FF] animate-pulse" />
              <span className="font-medium text-[11px] hidden sm:inline">
                SDE-1 Track 2026
              </span>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="lg:hidden p-1.5 rounded-lg text-[#7A6658] hover:text-[#382418] hover:bg-[#F2E8DA] transition-colors cursor-pointer"
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

        {/* Mobile Bottom Navigation Bar (Phone-Optimized, Warm Palette) */}
        <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-t border-[#382418]/10 lg:hidden px-2 py-1.5 flex items-center justify-around shadow-lg">
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
                    ? "text-[#382418] font-bold bg-[#F2E8DA]"
                    : "text-[#7A6658] hover:text-[#382418]"
                }`}
              >
                <item.icon
                  className={`w-4 h-4 mb-0.5 ${
                    active ? "text-[#382418]" : "text-[#7A6658]"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
