"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, Megaphone, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Announcement {
  id: string;
  title: string;
  body: string;
  weekNumber?: number | null;
  createdAt: string;
  author?: { name: string | null; email: string | null };
}

export default function AnnouncementsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", weekNumber: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated") fetchAnnouncements();
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/announcements");
      if (res.ok) setAnnouncements(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          body: form.body,
          weekNumber: form.weekNumber ? Number(form.weekNumber) : null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Something went wrong");
        return;
      }
      setForm({ title: "", body: "", weekNumber: "" });
      setShowForm(false);
      fetchAnnouncements();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/announcements/${id}`, { method: "DELETE" });
    fetchAnnouncements();
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const role = session?.user?.role ?? "";
  const canPost = ["COORDINATOR", "ADMIN"].includes(role);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-green-600" />
            Coordination Announcements
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Weekly messages from the coordination office
          </p>
        </div>
        {canPost && (
          <Button onClick={() => setShowForm((v) => !v)}>
            <Plus className="h-4 w-4" />
            {showForm ? "Cancel" : "New Announcement"}
          </Button>
        )}
      </div>

      {/* New announcement form */}
      {showForm && canPost && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-green-200 rounded-xl p-6 mb-6 space-y-4 shadow-sm"
        >
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Week #7 Coordination Message"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Week #
              </label>
              <input
                type="number"
                min={1}
                max={52}
                value={form.weekNumber}
                onChange={(e) => setForm((p) => ({ ...p, weekNumber: e.target.value }))}
                placeholder="7"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={8}
              value={form.body}
              onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
              placeholder="Paste the weekly coordination message here..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={saving} className="bg-green-600 hover:bg-green-700">
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Posting...</> : "Post Announcement"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Announcements list */}
      {announcements.length === 0 ? (
        <div className="text-center py-20">
          <Megaphone className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements yet</h3>
          <p className="text-gray-500 text-sm">
            {canPost
              ? "Post the first coordination message above."
              : "The coordination office hasn't posted anything yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => {
            const date = new Date(ann.createdAt).toLocaleDateString("en-US", {
              weekday: "long", year: "numeric", month: "long", day: "numeric",
            });
            return (
              <Card key={ann.id} className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {ann.weekNumber && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                            WEEK #{ann.weekNumber}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                          <CalendarDays className="h-3 w-3" /> {date}
                        </span>
                        {ann.author?.name && (
                          <span className="text-xs text-gray-400">· {ann.author.name}</span>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 text-base mb-2">{ann.title}</h3>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {ann.body}
                      </p>
                    </div>
                    {canPost && ann.author?.email === session?.user?.email || role === "ADMIN" ? (
                      <button
                        onClick={() => handleDelete(ann.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors shrink-0 mt-1"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
