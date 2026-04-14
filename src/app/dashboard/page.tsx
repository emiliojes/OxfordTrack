"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import EventCard from "@/components/EventCard";
import { Plus, CalendarDays, Loader2, Filter, X } from "lucide-react";

export interface Event {
  id: string;
  title: string;
  subject: string;
  grade: number;
  section: string;
  eventType: string;
  date: string;
  time: string;
  description?: string | null;
  published: boolean;
  createdBy: string;
  teacher?: { name: string | null; email: string | null };
}

const MIDDLE_GRADES = [6, 7, 8];
const HIGH_GRADES = [9, 10, 11, 12];
const EVENT_TYPES = ["SUMMATIVE", "PROJECT", "QUIZ", "CHECKPOINT", "EXAM", "COORDINATION", "OTHER"];
const TYPE_LABELS: Record<string, string> = {
  SUMMATIVE: "Summative", PROJECT: "Project", QUIZ: "Quiz",
  CHECKPOINT: "Checkpoint", EXAM: "Exam", COORDINATION: "Coordination", OTHER: "Other",
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState<"" | "middle" | "high">("");
  const [filterGrade, setFilterGrade] = useState<number | "">("");
  const [filterType, setFilterType] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated") fetchEvents();
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const role = session?.user?.role ?? "";
      const qs = ["ADMIN", "COORDINATOR"].includes(role) ? "?all=true" : "";
      const res = await fetch(`/api/events${qs}`);
      if (res.ok) setEvents(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => setEvents((prev) => prev.filter((e) => e.id !== id));
  const handleTogglePublish = (id: string, published: boolean) =>
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, published } : e)));

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const role = session?.user?.role;
  const isTeacher = role === "TEACHER" || role === "COORDINATOR" || role === "ADMIN";

  // Coordination events are always global — only filter by type, never by level/grade
  const coordUpcoming = events.filter((e) =>
    e.eventType === "COORDINATION" &&
    new Date(`${e.date}T${e.time}`) >= new Date() &&
    (filterType === "" || filterType === "COORDINATION")
  );

  const filtered = events.filter((e) => {
    if (e.eventType === "COORDINATION") return false; // shown separately
    if (filterLevel === "middle" && !MIDDLE_GRADES.includes(e.grade)) return false;
    if (filterLevel === "high" && !HIGH_GRADES.includes(e.grade)) return false;
    if (filterGrade !== "" && e.grade !== filterGrade) return false;
    if (filterType && e.eventType !== filterType) return false;
    return true;
  });

  const hasFilters = filterLevel !== "" || filterGrade !== "" || filterType !== "";
  const upcoming = filtered.filter((e) => new Date(`${e.date}T${e.time}`) >= new Date());
  const past = filtered.filter((e) => new Date(`${e.date}T${e.time}`) < new Date());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isTeacher ? "My Events" : "Upcoming Assessments"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isTeacher
              ? "Manage and publish assessment events by grade and section"
              : "Published assessments across all grades and sections"}
          </p>
        </div>
        {isTeacher && (
          <Link href="/events/new">
            <Button><Plus className="h-4 w-4" />New Event</Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 space-y-3">
        {/* School level quick-filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider w-16 shrink-0">Level</span>
          <div className="flex gap-2">
            {([["", "All"], ["middle", "Middle School"], ["high", "High School"]] as const).map(([val, label]) => (
              <button
                key={val}
                onClick={() => { setFilterLevel(val); setFilterGrade(""); }}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                  filterLevel === val
                    ? val === "middle"
                      ? "bg-teal-100 text-teal-700 border-teal-300"
                      : val === "high"
                      ? "bg-indigo-100 text-indigo-700 border-indigo-300"
                      : "bg-gray-800 text-white border-gray-800"
                    : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Grade / Type dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider w-16 shrink-0">
            <Filter className="h-3.5 w-3.5" /> Filter
          </span>

          <select
            value={filterGrade}
            onChange={(e) => { setFilterGrade(e.target.value === "" ? "" : Number(e.target.value)); }}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Grades</option>
            <optgroup label="Middle School">
              {MIDDLE_GRADES.map((g) => <option key={g} value={g}>Grade {g}</option>)}
            </optgroup>
            <optgroup label="High School">
              {HIGH_GRADES.map((g) => <option key={g} value={g}>Grade {g}</option>)}
            </optgroup>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            {EVENT_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
          </select>

          {hasFilters && (
            <button
              onClick={() => { setFilterLevel(""); setFilterGrade(""); setFilterType(""); }}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
            >
              <X className="h-3.5 w-3.5" /> Clear
            </button>
          )}

          <span className="ml-auto text-sm text-gray-400">
            {filtered.length} event{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Coordination events — pinned global section */}
      {coordUpcoming.length > 0 && filterType !== "" && filterType !== "COORDINATION" ? null : coordUpcoming.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            🌐 Coordination / School-wide — {coordUpcoming.length}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {coordUpcoming.map((event) => (
              <EventCard key={event.id} event={event} role={role}
                onDelete={async (id) => { await fetch(`/api/events/${id}`, { method: "DELETE" }); fetchEvents(); }}
                onTogglePublish={async (id, pub) => { await fetch(`/api/events/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ published: !pub }) }); fetchEvents(); }}
              />
            ))}
          </div>
        </section>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : filtered.length === 0 && coordUpcoming.length === 0 ? (
        <div className="text-center py-20">
          <CalendarDays className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {events.length === 0 ? "No events yet" : "No events match your filters"}
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            {events.length === 0
              ? isTeacher
                ? "Create your first assessment event to get started."
                : "No assessments have been published yet."
              : "Try adjusting the grade, section, or type filters."}
          </p>
          {isTeacher && events.length === 0 && (
            <Link href="/events/new">
              <Button><Plus className="h-4 w-4" />Create Event</Button>
            </Link>
          )}
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-8">
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Upcoming — {upcoming.length}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcoming.map((event) => (
                  <EventCard key={event.id} event={event} role={role}
                    onDelete={handleDelete} onTogglePublish={handleTogglePublish} />
                ))}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Past — {past.length}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
                {past.map((event) => (
                  <EventCard key={event.id} event={event} role={role}
                    onDelete={handleDelete} onTogglePublish={handleTogglePublish} />
                ))}
              </div>
            </section>
          )}
        </div>
      ) : null}

      {isTeacher && (
        <div className="mt-8 pt-6 border-t border-gray-200 flex gap-4">
          <Link href="/admin/users">
            <Button variant="outline" size="sm">Manage User Roles</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
