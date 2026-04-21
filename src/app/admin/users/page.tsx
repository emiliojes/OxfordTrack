"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, ArrowLeft, BookOpen, X, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const ALL_SUBJECTS = [
  "ICT", "Robotics", "Mathematics", "Science", "English", "History",
  "Geography", "Physics", "Chemistry", "Biology", "Literature",
  "Art", "Music", "Physical Education", "Computer Science", "Spanish",
  "French", "Social Studies", "Other",
];

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: "STUDENT" | "TEACHER" | "COORDINATOR" | "ADMIN";
  subjects: string[] | null;
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [editingSubjects, setEditingSubjects] = useState<string | null>(null);
  const [pendingSubjects, setPendingSubjects] = useState<string[]>([]);
  const [savingSubjects, setSavingSubjects] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated" && !["ADMIN", "COORDINATOR"].includes(session?.user?.role ?? "")) {
      router.push("/dashboard"); return;
    }
    if (status === "authenticated") {
      fetch("/api/users/role")
        .then((r) => r.json())
        .then((data) => setUsers(data.map((u: Omit<User, "subjects"> & { subjects?: string | null }) => ({
          ...u,
          subjects: u.subjects ? JSON.parse(u.subjects as unknown as string) : null,
        }))))
        .finally(() => setLoading(false));
    }
  }, [status, session, router]);

  const updateRole = async (userId: string, role: string) => {
    setUpdating(userId);
    try {
      const res = await fetch("/api/users/role", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });
      if (res.ok) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: role as User["role"] } : u)));
      }
    } finally {
      setUpdating(null);
    }
  };

  const startEditSubjects = (user: User) => {
    setEditingSubjects(user.id);
    setPendingSubjects(user.subjects ?? []);
  };

  const toggleSubject = (subject: string) => {
    setPendingSubjects(prev =>
      prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
    );
  };

  const saveSubjects = async (userId: string) => {
    setSavingSubjects(true);
    try {
      const res = await fetch("/api/users/subjects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, subjects: pendingSubjects }),
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, subjects: pendingSubjects.length > 0 ? pendingSubjects : null } : u));
        setEditingSubjects(null);
      }
    } finally {
      setSavingSubjects(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const roleVariant: Record<string, "default" | "success" | "warning"> = {
    STUDENT: "secondary" as "default",
    TEACHER: "default",
    COORDINATOR: "warning",
    ADMIN: "success",
  };

  const roleBadgeClass: Record<string, string> = {
    STUDENT: "bg-gray-100 text-gray-600",
    TEACHER: "bg-blue-100 text-blue-700",
    COORDINATOR: "bg-orange-100 text-orange-700",
    ADMIN: "bg-green-100 text-green-700",
  };

  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            Manage Users
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Assign roles and subjects to teachers.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {users.map((user) => (
              <div key={user.id} className="px-6 py-4 space-y-3">
                {/* Top row: avatar + name + role selector */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {user.image ? (
                      <Image src={user.image} alt={user.name ?? ""} width={36} height={36} className="rounded-full shrink-0" />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                        <span className="text-blue-600 dark:text-blue-300 font-medium text-sm">
                          {(user.name ?? user.email ?? "?")[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">{user.name ?? "—"}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${roleBadgeClass[user.role] ?? "bg-gray-100 text-gray-600"}`}>
                      {user.role}
                    </span>
                    {isAdmin && user.id !== session?.user?.id && (
                      <select
                        value={user.role}
                        onChange={(e) => updateRole(user.id, e.target.value)}
                        disabled={updating === user.id}
                        className="text-sm rounded-lg border border-gray-300 dark:border-slate-600 px-2 py-1.5 bg-white dark:bg-slate-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        <option value="STUDENT">Student</option>
                        <option value="TEACHER">Teacher</option>
                        <option value="COORDINATOR">Coordinator</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    )}
                    {updating === user.id && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
                  </div>
                </div>

                {/* Subjects row — only for TEACHER */}
                {user.role === "TEACHER" && (
                  <div className="pl-12">
                    {editingSubjects === user.id ? (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <BookOpen className="h-3.5 w-3.5" /> Select subjects for this teacher:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {ALL_SUBJECTS.map(s => (
                            <button
                              key={s}
                              onClick={() => toggleSubject(s)}
                              className={`px-2 py-1 rounded-full text-xs font-medium border transition-all ${
                                pendingSubjects.includes(s)
                                  ? "bg-blue-600 text-white border-blue-600"
                                  : "bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-600 hover:border-blue-400"
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2 pt-1">
                          <Button size="sm" className="h-7 gap-1" onClick={() => saveSubjects(user.id)} disabled={savingSubjects}>
                            {savingSubjects ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                            Save
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 gap-1" onClick={() => setEditingSubjects(null)}>
                            <X className="h-3 w-3" /> Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 flex-wrap">
                        <BookOpen className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        {user.subjects && user.subjects.length > 0 ? (
                          user.subjects.map(s => (
                            <span key={s} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full border border-blue-100 dark:border-blue-800">
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400 italic">No subjects assigned (can use all)</span>
                        )}
                        <button
                          onClick={() => startEditSubjects(user)}
                          className="text-xs text-blue-600 hover:underline ml-1"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-gray-400 mt-4">
        Teachers with no subjects assigned can select any subject.
      </p>
    </div>
  );
}
