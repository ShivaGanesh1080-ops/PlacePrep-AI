"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { GraduationCap, LogOut, ChevronDown, LayoutDashboard } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xs border-b border-slate-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15">
          {/* Flat, confident logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0">
              <GraduationCap className="w-4.5 h-4.5" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-semibold tracking-tight text-slate-900">
                PlacePrep
              </span>
              <span className="text-[11px] font-mono font-medium text-slate-400">
                AI
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600">
            <a href="#features" className="hover:text-slate-900 transition-colors">
              Platform
            </a>
            <a href="#modules" className="hover:text-slate-900 transition-colors">
              Curriculum
            </a>
            <a href="#architecture" className="hover:text-slate-900 transition-colors">
              Architecture
            </a>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {status === "loading" && (
              <div className="w-7 h-7 rounded-full bg-slate-100 animate-pulse" />
            )}

            {status === "unauthenticated" && (
              <>
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs"
                >
                  Get started
                </Link>
              </>
            )}

            {status === "authenticated" && session?.user && (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70 rounded-lg transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-slate-500" />
                  <span>Workspace</span>
                </Link>

                {/* User dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer text-xs font-medium text-slate-700"
                  >
                    <div className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center text-[11px] font-semibold">
                      {session.user.name
                        ? session.user.name.charAt(0).toUpperCase()
                        : "U"}
                    </div>
                    <span className="hidden sm:inline max-w-[120px] truncate">
                      {session.user.name || "Student"}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 text-xs animate-in fade-in z-50">
                      <div className="px-3 py-2 border-b border-slate-100">
                        <p className="font-semibold text-slate-900 truncate">
                          {session.user.name}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {session.user.email}
                        </p>
                      </div>
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-red-600 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
