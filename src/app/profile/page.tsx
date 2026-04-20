"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, User, ArrowLeft, KeyRound, CheckCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  COORDINATOR: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  TEACHER: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
};

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [nameError, setNameError] = useState("");
  const [pwError, setPwError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (session?.user?.name) setName(session.user.name);
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setNameError(""); setNameSuccess(false);
    const res = await fetch("/api/users/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setNameError(data.error ?? "Failed to save"); return; }
    setNameSuccess(true);
    await update({ name: data.name });
    setTimeout(() => setNameSuccess(false), 3000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setPwError("Passwords do not match"); return; }
    setSavingPw(true); setPwError(""); setPwSuccess(false);
    const res = await fetch("/api/users/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    setSavingPw(false);
    if (!res.ok) { setPwError(data.error ?? "Failed to update password"); return; }
    setPwSuccess(true);
    setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    setTimeout(() => setPwSuccess(false), 3000);
  };

  const user = session?.user;
  const role = user?.role ?? "";

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Profile</h1>
      </div>

      {/* Profile card */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 mb-6 flex items-center gap-5">
        {user?.image ? (
          <Image src={user.image} alt={user.name ?? ""} width={64} height={64} className="rounded-full shrink-0" />
        ) : (
          <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0">
            <User className="h-7 w-7 text-blue-600 dark:text-blue-300" />
          </div>
        )}
        <div>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{user?.name ?? "—"}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
          <span className={`mt-1.5 inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full ${ROLE_COLORS[role] ?? "bg-gray-100 text-gray-600"}`}>
            {role}
          </span>
        </div>
      </div>

      {/* Edit name */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 mb-6">
        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">Display Name</h2>
        <form onSubmit={handleSaveName} className="flex gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            className="flex-1 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button type="submit" size="sm" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </Button>
        </form>
        {nameError && <p className="text-sm text-red-600 mt-2">{nameError}</p>}
        {nameSuccess && <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1 mt-2"><CheckCircle className="h-4 w-4" />Name updated!</p>}
      </div>

      {/* Change password — only for credential users */}
      {!user?.image && (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6">
          <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <KeyRound className="h-4 w-4" />Change Password
          </h2>
          <form onSubmit={handleChangePassword} className="space-y-3">
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
              required
              className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password (min. 6 characters)"
              required
              minLength={6}
              className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button type="submit" size="sm" disabled={savingPw}>
              {savingPw ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Password"}
            </Button>
          </form>
          {pwError && <p className="text-sm text-red-600 mt-2">{pwError}</p>}
          {pwSuccess && <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1 mt-2"><CheckCircle className="h-4 w-4" />Password updated!</p>}
        </div>
      )}
    </div>
  );
}
