"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CalendarDays, LogOut, User, LayoutGrid, CalendarRange, Megaphone, Moon, Sun, ChevronDown, Settings, ShieldCheck, Table2 } from "lucide-react";
import Image from "next/image";
import { useTheme } from "@/components/ThemeProvider";

export default function Navbar() {
  const { data: session } = useSession();
  const { theme, toggle } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navLink = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white transition-colors";

  return (
    <nav className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-blue-600 text-lg shrink-0">
            <CalendarDays className="h-6 w-6" />
            <span>OxfordTrack</span>
          </Link>

          {session?.user && (
            <div className="hidden sm:flex items-center gap-1 ml-4">
              <Link href="/dashboard" className={navLink}><LayoutGrid className="h-4 w-4" />Dashboard</Link>
              <Link href="/calendar" className={navLink}><CalendarDays className="h-4 w-4" />Month</Link>
              <Link href="/calendar/week" className={navLink}><CalendarRange className="h-4 w-4" />Week</Link>
              <Link href="/calendar/matrix" className={navLink}><Table2 className="h-4 w-4" />Matrix</Link>
              <Link href="/announcements" className={navLink}><Megaphone className="h-4 w-4" />Notices</Link>
            </div>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {/* Dark mode toggle */}
            <button
              onClick={toggle}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {session?.user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  {session.user.image ? (
                    <Image src={session.user.image} alt={session.user.name ?? "User"} width={32} height={32} className="rounded-full" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-300 font-semibold text-sm">
                        {(session.user.name ?? session.user.email ?? "?")[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-tight">{session.user.name ?? session.user.email}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{session.user.role?.toLowerCase()}</p>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400 hidden sm:block" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-1 w-52 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-700">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{session.user.name ?? "—"}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{session.user.email}</p>
                    </div>
                    <Link href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                      <User className="h-4 w-4" />My Profile
                    </Link>
                    {session.user.role === "ADMIN" && (
                      <Link href="/admin/users"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                        <Settings className="h-4 w-4" />Manage Roles
                      </Link>
                    )}
                    {(session.user.role === "ADMIN" || session.user.role === "COORDINATOR") && (
                      <Link href="/admin/approve"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-slate-700 transition-colors">
                        <ShieldCheck className="h-4 w-4" />Pending Approvals
                      </Link>
                    )}
                    <div className="border-t border-gray-100 dark:border-slate-700 mt-1 pt-1">
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-slate-700 transition-colors w-full text-left"
                      >
                        <LogOut className="h-4 w-4" />Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login">
                <Button size="sm">Sign in</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
