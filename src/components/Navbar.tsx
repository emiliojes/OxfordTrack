"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { CalendarDays, LogOut, User, LayoutGrid, CalendarRange, Megaphone } from "lucide-react";
import Image from "next/image";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-blue-600 text-lg">
            <CalendarDays className="h-6 w-6" />
            <span>OxfordTrack</span>
          </Link>

          {session?.user && (
            <div className="hidden sm:flex items-center gap-1 ml-4">
              <Link href="/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                <LayoutGrid className="h-4 w-4" />
                Dashboard
              </Link>
              <Link href="/calendar"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                <CalendarDays className="h-4 w-4" />
                Month
              </Link>
              <Link href="/calendar/week"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                <CalendarRange className="h-4 w-4" />
                Week
              </Link>
              <Link href="/announcements"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                <Megaphone className="h-4 w-4" />
                Notices
              </Link>
            </div>
          )}

          <div className="flex items-center gap-4 ml-auto">
            {session?.user ? (
              <>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name ?? "User"}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                  )}
                  <div className="hidden sm:block">
                    <p className="font-medium text-gray-900">{session.user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">
                      {session.user.role?.toLowerCase()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-gray-600"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign out</span>
                </Button>
              </>
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
