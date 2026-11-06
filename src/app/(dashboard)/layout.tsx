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
  Building2,
  User,
  Settings,
  GraduationCap,
  LogOut,
  ChevronRight,
  Bot,
  PanelLeft,
  PanelLeftClose,
  PanelLeftOpen,
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

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const SidebarContent = () => (
    <>
      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (typeof window !== "undefined" && window.innerWidth < 1024) {
                  setSidebarOpen(false);
                }
              }}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 shadow-sm border border-indigo-100"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <item.icon
                className={`w-5 h-5 flex-shrink-0 ${
                  active
                    ? "text-indigo-600"
                    : "text-slate-400 group-hover:text-slate-600"
                }`}
              />
              <span className="flex-1">{item.label}</span>
              {active && (
                <ChevronRight className="w-4 h-4 text-indigo-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section at bottom */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
            {session?.user?.name
              ? session.user.name.charAt(0).toUpperCase()
              : "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              {session?.user?.name || "User"}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {session?.user?.email || ""}
            </p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Backdrop overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Universal Responsive Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out shadow-lg lg:shadow-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo and Close Button */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-lg flex items-center justify-center shadow-sm">
              <GraduationCap className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-base font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent tracking-tight">
              PlacePrep AI
            </span>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Collapse sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        <SidebarContent />
      </aside>

      {/* Main content wrapper */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          sidebarOpen ? "lg:pl-64" : "pl-0"
        }`}
      >
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-15">
            {/* Left: Sleek ChatGPT-style PanelLeft icon toggle button */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSidebar}
                className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center justify-center cursor-pointer"
                title={sidebarOpen ? "Collapse sidebar" : "Open sidebar"}
              >
                {sidebarOpen ? (
                  <PanelLeftClose className="w-5 h-5 text-slate-600 hover:text-slate-900" />
                ) : (
                  <PanelLeftOpen className="w-5 h-5 text-slate-600 hover:text-slate-900" />
                )}
              </button>

              <div className="h-4 w-px bg-slate-200 hidden sm:block" />

              <p className="text-xs font-medium text-slate-500 hidden sm:block">
                Welcome back,{" "}
                <span className="font-semibold text-slate-800">
                  {session?.user?.name || "Student"}
                </span>
              </p>
            </div>

            {/* Right: User Profile & Quick Logout */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                  {session?.user?.name
                    ? session.user.name.charAt(0).toUpperCase()
                    : "S"}
                </div>
                <span className="text-xs font-bold text-slate-800 hidden sm:block">
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
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
