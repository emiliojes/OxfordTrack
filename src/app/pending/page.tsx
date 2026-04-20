"use client";

import { useSession, signOut } from "next-auth/react";
import { Clock, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function PendingPage() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-sm p-10 w-full max-w-md text-center">
        <div className="flex justify-center mb-5">
          <div className="h-16 w-16 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Awaiting Approval
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
          Your account is pending review by an administrator.
          You will be able to access OxfordTrack once approved.
        </p>

        {user && (
          <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-700 rounded-xl px-4 py-3 mb-6 text-left">
            {user.image ? (
              <Image src={user.image} alt={user.name ?? ""} width={40} height={40} className="rounded-full shrink-0" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0">
                <span className="text-blue-600 dark:text-blue-300 font-semibold">
                  {(user.name ?? user.email ?? "?")[0].toUpperCase()}
                </span>
              </div>
            )}
            <div className="min-w-0">
              <p className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">{user.name ?? "—"}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">
          Contact your school administrator if you need immediate access.
        </p>

        <Button
          variant="outline"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
}
