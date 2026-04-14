"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Event {
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
}

const TYPE_CONFIG: Record<string, { label: string; color: string; text: string; border: string }> = {
  SUMMATIVE:    { label: "Summative",   color: "bg-red-50",     text: "text-red-800",    border: "border-red-300" },
  PROJECT:      { label: "Project",     color: "bg-purple-50",  text: "text-purple-800", border: "border-purple-300" },
  QUIZ:         { label: "Quiz",        color: "bg-yellow-50",  text: "text-yellow-800", border: "border-yellow-300" },
  CHECKPOINT:   { label: "Checkpoint",  color: "bg-blue-50",    text: "text-blue-800",   border: "border-blue-300" },
  EXAM:         { label: "Exam",        color: "bg-orange-50",  text: "text-orange-800", border: "border-orange-300" },
  COORDINATION: { label: "Coordination",color: "bg-green-50",   text: "text-green-800",  border: "border-green-300" },
  OTHER:        { label: "Other",       color: "bg-gray-50",    text: "text-gray-700",   border: "border-gray-300" },
};

const MIDDLE_GRADES = [6, 7, 8];
const ALL_GRADES = [6, 7, 8, 9, 10, 11, 12];
const WEEKDAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

/** Returns the Monday of the ISO week containing `date` */
function getMondayOf(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}


function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const DAY_ABBR = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function WeekCalendarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterGrade, setFilterGrade] = useState<number | "">("");
  const [filterLevel, setFilterLevel] = useState<"" | "middle" | "high">("");

  const today = new Date();
  const [weekStart, setWeekStart] = useState<Date>(() => getMondayOf(today));
  const [schoolWeek, setSchoolWeek] = useState<number>(7);
  const [editingWeek, setEditingWeek] = useState(false);
  const [weekInput, setWeekInput] = useState("7");

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

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const role = session?.user?.role;
  const isTeacher = role === "TEACHER" || role === "ADMIN";

  const prevWeek = () => { setWeekStart(d => addDays(d, -7)); setSchoolWeek(w => Math.max(1, w - 1)); };
  const nextWeek = () => { setWeekStart(d => addDays(d, 7));  setSchoolWeek(w => w + 1); };
  const goToday  = () => setWeekStart(getMondayOf(today));

  const confirmWeekEdit = () => {
    const n = parseInt(weekInput);
    if (!isNaN(n) && n > 0) setSchoolWeek(n);
    else setWeekInput(String(schoolWeek));
    setEditingWeek(false);
  };

  // Mon–Fri date objects
  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i));

  // Month range label e.g. "Apr 14 – 18, 2026"
  const friday = weekDays[4];
  const monthLabel =
    weekStart.getMonth() === friday.getMonth()
      ? `${MONTHS_SHORT[weekStart.getMonth()]} ${weekStart.getDate()} – ${friday.getDate()}, ${weekStart.getFullYear()}`
      : `${MONTHS_SHORT[weekStart.getMonth()]} ${weekStart.getDate()} – ${MONTHS_SHORT[friday.getMonth()]} ${friday.getDate()}, ${weekStart.getFullYear()}`;

  // Filter events — COORDINATION events are always shown regardless of grade/level filter
  const filtered = events.filter((e) => {
    if (e.eventType === "COORDINATION") return true;
    if (filterLevel === "middle" && !MIDDLE_GRADES.includes(e.grade)) return false;
    if (filterLevel === "high"   &&  MIDDLE_GRADES.includes(e.grade)) return false;
    if (filterGrade !== "" && e.grade !== filterGrade) return false;
    return true;
  });

  // Group by date key
  const byDate: Record<string, Event[]> = {};
  for (const e of filtered) {
    if (!byDate[e.date]) byDate[e.date] = [];
    byDate[e.date].push(e);
  }

  const isThisWeek = toDateKey(weekStart) === toDateKey(getMondayOf(today));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Weekly View</h1>
          <p className="text-gray-500 text-sm mt-1">{monthLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/calendar">
            <Button variant="outline" size="sm">Month View</Button>
          </Link>
          {isTeacher && (
            <Link href="/events/new">
              <Button size="sm"><Plus className="h-4 w-4 mr-1" />New Event</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 mb-5 flex flex-wrap items-center gap-2">
        {([["", "All Levels"], ["middle", "Middle School"], ["high", "High School"]] as const).map(([val, label]) => (
          <button
            key={val}
            onClick={() => { setFilterLevel(val); setFilterGrade(""); }}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
              filterLevel === val
                ? val === "middle" ? "bg-teal-100 text-teal-700 border-teal-300"
                : val === "high"   ? "bg-indigo-100 text-indigo-700 border-indigo-300"
                :                    "bg-gray-800 text-white border-gray-800"
                : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
            }`}
          >
            {label}
          </button>
        ))}

        <div className="w-px h-4 bg-gray-200" />

        <select
          value={filterGrade}
          onChange={(e) => setFilterGrade(e.target.value === "" ? "" : Number(e.target.value))}
          className="rounded-lg border border-gray-300 px-2 py-1 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Grades</option>
          <optgroup label="Middle School">
            {[6,7,8].map(g => <option key={g} value={g}>Grade {g}</option>)}
          </optgroup>
          <optgroup label="High School">
            {[9,10,11,12].map(g => <option key={g} value={g}>Grade {g}</option>)}
          </optgroup>
        </select>

        {(filterLevel || filterGrade !== "") && (
          <button
            onClick={() => { setFilterLevel(""); setFilterGrade(""); }}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            Clear
          </button>
        )}
      </div>

      {/* Week table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {/* Week header banner */}
        <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
          <button onClick={prevWeek} className="p-1.5 rounded-lg hover:bg-blue-500 transition-colors text-white">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="text-center">
            <h2 className="text-white font-black text-2xl tracking-wide flex items-center gap-2 justify-center">
            WEEK #
            {editingWeek ? (
              <input
                autoFocus
                type="number"
                min={1}
                value={weekInput}
                onChange={(e) => setWeekInput(e.target.value)}
                onBlur={confirmWeekEdit}
                onKeyDown={(e) => { if (e.key === "Enter") confirmWeekEdit(); if (e.key === "Escape") { setEditingWeek(false); setWeekInput(String(schoolWeek)); } }}
                className="w-16 text-center bg-blue-700 border border-blue-300 rounded text-white font-black text-2xl focus:outline-none"
              />
            ) : (
              <button
                onClick={() => { setWeekInput(String(schoolWeek)); setEditingWeek(true); }}
                title="Click to edit school week number"
                className="underline decoration-dotted hover:text-blue-200 transition-colors"
              >
                {schoolWeek}
              </button>
            )}
            {" "}EVENTS
          </h2>
            <p className="text-blue-200 text-sm mt-0.5">{monthLabel}</p>
          </div>
          <button onClick={nextWeek} className="p-1.5 rounded-lg hover:bg-blue-500 transition-colors text-white">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Today button */}
        {!isThisWeek && (
          <div className="flex justify-center py-2 bg-blue-50 border-b border-blue-100">
            <button onClick={goToday} className="text-xs text-blue-600 hover:underline font-medium">
              ← Back to current week
            </button>
          </div>
        )}

        {/* Day columns header */}
        <div className="grid grid-cols-5 border-b border-gray-200">
          {weekDays.map((d, i) => {
            const isToday = toDateKey(d) === toDateKey(today);
            return (
              <div
                key={i}
                className={`px-3 py-3 text-center border-r last:border-r-0 border-gray-200 ${
                  isToday ? "bg-blue-50" : "bg-gray-50"
                }`}
              >
                <p className={`text-xs font-black tracking-widest uppercase ${isToday ? "text-blue-700" : "text-gray-600"}`}>
                  {WEEKDAYS[i]}
                </p>
                <p className={`text-lg font-bold mt-0.5 ${isToday ? "text-blue-700" : "text-gray-800"}`}>
                  {d.getDate()}
                </p>
              </div>
            );
          })}
        </div>

        {/* Events grid */}
        <div className="grid grid-cols-5 min-h-[320px]">
          {weekDays.map((d, i) => {
            const key = toDateKey(d);
            const dayEvents = byDate[key] ?? [];
            const isToday = key === toDateKey(today);

            return (
              <div
                key={i}
                className={`border-r last:border-r-0 border-gray-100 p-2 space-y-1.5 ${
                  isToday ? "bg-blue-50/40" : ""
                }`}
              >
                {dayEvents.length === 0 ? (
                  <p className="text-xs text-gray-300 text-center pt-4">—</p>
                ) : (
                  dayEvents.map((ev) => {
                    const cfg = TYPE_CONFIG[ev.eventType] ?? TYPE_CONFIG.OTHER;
                    const isMiddle = MIDDLE_GRADES.includes(ev.grade);
                    const time = new Date(`${ev.date}T${ev.time}`).toLocaleTimeString("en-US", {
                      hour: "numeric", minute: "2-digit",
                    });
                    const isCoord = ev.eventType === "COORDINATION";
                    return (
                      <div
                        key={ev.id}
                        className={`rounded-lg border p-2 text-xs ${cfg.color} ${cfg.border}`}
                      >
                        <div className="flex items-center gap-1 mb-1 flex-wrap">
                          <span className={`font-bold text-[10px] uppercase tracking-wide ${cfg.text}`}>
                            {cfg.label}
                          </span>
                          {isCoord ? (
                            <span className="text-[10px] font-semibold px-1 rounded-full bg-green-100 text-green-700">
                              GLOBAL
                            </span>
                          ) : (
                            <span className={`text-[10px] font-semibold px-1 rounded-full ${
                              isMiddle ? "bg-teal-100 text-teal-700" : "bg-indigo-100 text-indigo-700"
                            }`}>
                              Gr.{ev.grade}
                            </span>
                          )}
                        </div>
                        <p className={`font-semibold leading-snug ${cfg.text}`}>{ev.title}</p>
                        <p className="text-gray-400 mt-0.5">{time}</p>
                        {ev.description && (
                          <p className="text-gray-500 mt-0.5 line-clamp-2">{ev.description}</p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            );
          })}
        </div>

        {/* Per-grade breakdown (collapsible rows) */}
        {filterGrade === "" && (
          <div className="border-t border-gray-200">
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">By Grade</p>
            </div>

            {/* Coordination row */}
            {weekDays.some(d => (byDate[toDateKey(d)] ?? []).some(e => e.eventType === "COORDINATION")) && (
              <div className="grid grid-cols-5 border-b border-gray-100">
                {weekDays.map((d, i) => {
                  const key = toDateKey(d);
                  const coordEvents = (byDate[key] ?? []).filter(e => e.eventType === "COORDINATION");
                  return (
                    <div key={i} className="border-r last:border-r-0 border-gray-100 p-2">
                      {i === 0 && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold mb-1 bg-green-100 text-green-700">
                          GLOBAL
                        </span>
                      )}
                      <div className="space-y-1">
                        {coordEvents.map((ev) => (
                          <div key={ev.id} className="text-[10px] font-medium px-1.5 py-1 rounded border-l-2 bg-green-50 text-green-800 border-l-green-400">
                            {ev.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {ALL_GRADES.map((grade) => {
              const hasThisWeek = weekDays.some(d => (byDate[toDateKey(d)] ?? []).some(e => e.grade === grade && e.eventType !== "COORDINATION"));
              if (!hasThisWeek) return null;
              const isMiddle = MIDDLE_GRADES.includes(grade);
              return (
                <div key={grade} className="grid grid-cols-5 border-b border-gray-100 last:border-b-0">
                  {/* Grade label spans as side context — shown in first cell spanning logic via absolute */}
                  {weekDays.map((d, i) => {
                    const key = toDateKey(d);
                    const dayGradeEvents = (byDate[key] ?? []).filter(e => e.grade === grade);
                    return (
                      <div key={i} className={`border-r last:border-r-0 border-gray-100 p-2 ${i === 0 ? "relative" : ""}`}>
                        {i === 0 && (
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold mb-1 ${
                            isMiddle ? "bg-teal-100 text-teal-700" : "bg-indigo-100 text-indigo-700"
                          }`}>
                            {isMiddle ? "MS" : "HS"} · Gr.{grade}
                          </span>
                        )}
                        <div className="space-y-1">
                          {dayGradeEvents.map((ev) => {
                            const cfg = TYPE_CONFIG[ev.eventType] ?? TYPE_CONFIG.OTHER;
                            return (
                              <div key={ev.id} className={`text-[10px] font-medium px-1.5 py-1 rounded border-l-2 ${cfg.color} ${cfg.text} ${
                                ev.eventType === "SUMMATIVE" ? "border-l-red-400"
                                : ev.eventType === "PROJECT" ? "border-l-purple-400"
                                : ev.eventType === "QUIZ" ? "border-l-yellow-400"
                                : ev.eventType === "CHECKPOINT" ? "border-l-blue-400"
                                : ev.eventType === "EXAM" ? "border-l-orange-400"
                                : "border-l-gray-400"
                              }`}>
                                {ev.subject} – {TYPE_CONFIG[ev.eventType]?.label ?? ev.eventType}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 px-1">
        {Object.entries(TYPE_CONFIG).map(([, cfg]) => (
          <div key={cfg.label} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-sm border ${cfg.color} ${cfg.border}`} />
            <span className="text-xs text-gray-500">{cfg.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
