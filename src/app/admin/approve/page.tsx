"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Users, ArrowLeft, CheckCircle, XCircle, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface PendingUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  status: string;
  createdAt: string;
}

const ROLES = ["TEACHER", "COORDINATOR", "ADMIN"];

export default function ApproveUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [roleMap, setRoleMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated" && session?.user?.role !== "ADMIN") { router.push("/dashboard"); return; }
    if (status === "authenticated") {
      fetch("/api/users/approve")
        .then((r) => r.json())
        .then((data) => {
          setUsers(data);
          const map: Record<string, string> = {};
          data.forEach((u: PendingUser) => { map[u.id] = "TEACHER"; });
          setRoleMap(map);
        })
        .finally(() => setLoading(false));
    }
  }, [status, session, router]);

  const approve = async (userId: string) => {
    setUpdating(userId);
    const res = await fetch("/api/users/approve", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, status: "ACTIVE", role: roleMap[userId] ?? "TEACHER" }),
    });
    if (res.ok) setUsers((prev) => prev.filter((u) => u.id !== userId));
    setUpdating(null);
  };

  const reject = async (userId: string) => {
    setUpdating(userId);
    const res = await fetch("/api/users/approve", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, status: "BLOCKED" }),
    });
    if (res.ok) setUsers((prev) => prev.filter((u) => u.id !== userId));
    setUpdating(null);
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="h-6 w-6 text-orange-500" />
            Pending Approvals
          </h1>
          <p className="text-gray-500 text-sm mt-1">Approve or reject users waiting for access.</p>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-3" />
          <p className="font-semibold text-gray-700">No pending approvals</p>
          <p className="text-sm text-gray-400 mt-1">All users have been reviewed.</p>
          <Link href="/admin/users" className="text-sm text-blue-600 hover:underline mt-4 inline-block">
            Manage all users →
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm divide-y divide-gray-100">
          {users.map((user) => (
            <div key={user.id} className="flex items-center gap-4 px-6 py-4 flex-wrap">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {user.image ? (
                  <Image src={user.image} alt={user.name ?? ""} width={40} height={40} className="rounded-full shrink-0" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                    <span className="text-orange-600 font-semibold text-sm">
                      {(user.name ?? user.email ?? "?")[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{user.name ?? "—"}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Requested {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={roleMap[user.id] ?? "TEACHER"}
                  onChange={(e) => setRoleMap((prev) => ({ ...prev, [user.id]: e.target.value }))}
                  disabled={updating === user.id}
                  className="text-sm rounded-lg border border-gray-300 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>

                <Button
                  size="sm"
                  onClick={() => approve(user.id)}
                  disabled={updating === user.id}
                  className="bg-green-600 hover:bg-green-700 text-white gap-1"
                >
                  {updating === user.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                  Approve
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => reject(user.id)}
                  disabled={updating === user.id}
                  className="text-red-600 border-red-300 hover:bg-red-50 gap-1"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
