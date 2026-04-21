"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Loader2, Plus, LayoutGrid } from "lucide-react";
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
  teacher?: { name: string | null; email: string | null };
}

const TYPE_CONFIG: Record<string, { label: string; bg: string; text: string; dark: string }> = {
  SUMMATIVE:    { label: "Summative",    bg: "bg-red-100",    text: "text-red-800",    dark: "dark:bg-red-900/50 dark:text-red-200" },
  PROJECT:      { label: "Project",      bg: "bg-purple-100", text: "text-purple-800", dark: "dark:bg-purple-900/50 dark:text-purple-200" },
  QUIZ:         { label: "Quiz",         bg: "bg-yellow-100", text: "text-yellow-800", dark: "dark:bg-yellow-900/50 dark:text-yellow-200" },
  EXAM:         { label: "Exam",         bg: "bg-orange-100", text: "text-orange-800", dark: "dark:bg-orange-900/50 dark:text-orange-200" },
  COORDINATION: { label: "Coordination", bg: "bg-green-100",  text: "text-green-800",  dark: "dark:bg-green-900/50 dark:text-green-200" },
  OTHER:        { label: "Other",        bg: "bg-gray-100",   text: "text-gray-700",   dark: "dark:bg-gray-700 dark:text-gray-200" },
};

const ALL_GRADES = [6, 7, 8, 9, 10, 11, 12];
const MIDDLE_GRADES = [6, 7, 8];
const DAYS = [
  { key: 0, label: "Monday" },
  { key: 1, label: "Tuesday" },
  { key: 2, label: "Wednesday" },
  { key: 3, label: "Thursday" },
  { key: 4, label: "Friday" },
];

function getMondayOf(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
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

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function MatrixCalendarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState<"all" | "middle" | "high">("all");

  const today = new Date();
  const [weekStart, setWeekStart] = useState<Date>(() => getMondayOf(today));
  const [schoolWeek, setSchoolWeek] = useState<number>(7);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated") {
      const role = session?.user?.role ?? "";
      if (!["TEACHER", "COORDINATOR", "ADMIN"].includes(role)) { router.push("/pending"); return; }
      fetchEvents(role);
    }
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchEvents = async (role?: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/events?all=true");
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

  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i));
  const weekEnd = weekDays[4];

  const visibleGrades = levelFilter === "middle"
    ? MIDDLE_GRADES
    : levelFilter === "high"
    ? ALL_GRADES.filter(g => !MIDDLE_GRADES.includes(g))
    : ALL_GRADES;

  // Build lookup: dateKey → grade → events[]
  const lookup: Record<string, Record<number, Event[]>> = {};
  weekDays.forEach(d => {
    const key = toDateKey(d);
    lookup[key] = {};
    visibleGrades.forEach(g => { lookup[key][g] = []; });
  });

  events.forEach(ev => {
    if (lookup[ev.date] && lookup[ev.date][ev.grade] !== undefined) {
      lookup[ev.date][ev.grade].push(ev);
    }
  });

  const headerRange = `${MONTHS[weekStart.getMonth()]} ${weekStart.getDate()} – ${MONTHS[weekEnd.getMonth()]} ${weekEnd.getDate()}, ${weekEnd.getFullYear()}`;
  const isToday = (d: Date) => toDateKey(d) === toDateKey(today);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Assessment Matrix</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Week {schoolWeek} · {headerRange}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Level filter */}
          <div className="flex rounded-lg border border-gray-200 dark:border-slate-600 overflow-hidden text-xs font-semibold">
            {(["all", "middle", "high"] as const).map(l => (
              <button
                key={l}
                onClick={() => setLevelFilter(l)}
                className={`px-3 py-1.5 transition-colors ${
                  levelFilter === l
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                }`}
              >
                {l === "all" ? "All" : l === "middle" ? "Middle" : "High"}
              </button>
            ))}
          </div>
          {/* Week nav */}
          <Button variant="outline" size="sm" onClick={() => setWeekStart(getMondayOf(today))}>Today</Button>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8"
              onClick={() => { setWeekStart(d => addDays(d, -7)); setSchoolWeek(w => Math.max(1, w - 1)); }}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8"
              onClick={() => { setWeekStart(d => addDays(d, 7)); setSchoolWeek(w => w + 1); }}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          {["COORDINATOR", "ADMIN"].includes(role ?? "") && (
            <Link href="/calendar/week">
              <Button variant="outline" size="sm" className="gap-1.5"><LayoutGrid className="h-3.5 w-3.5" />Monday Update</Button>
            </Link>
          )}
          {isTeacher && (
            <Link href="/events/new">
              <Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" />New Event</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Matrix table */}
      <div className="overflow-x-auto rounded-xl border border-gray-300 dark:border-slate-700 shadow-sm">
        <table className="w-full border-collapse min-w-[700px]">
          <thead>
            <tr>
              {/* Day column header */}
              <th className="w-28 bg-gray-100 dark:bg-slate-800 border-b-2 border-r border-gray-300 dark:border-slate-700 px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Day
              </th>
              {visibleGrades.map(grade => (
                <th key={grade}
                  className={`bg-gray-100 dark:bg-slate-800 border-b-2 border-r border-gray-300 dark:border-slate-700 px-3 py-3 text-center text-xs font-bold tracking-wide ${
                    MIDDLE_GRADES.includes(grade)
                      ? "text-teal-700 dark:text-teal-400"
                      : "text-indigo-700 dark:text-indigo-400"
                  }`}>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] ${
                    MIDDLE_GRADES.includes(grade)
                      ? "bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300"
                      : "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300"
                  }`}>
                    Grade {grade}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map(({ key, label }) => {
              const dayDate = weekDays[key];
              const dateKey = toDateKey(dayDate);
              const dayNum = dayDate.getDate();
              const todayRow = isToday(dayDate);

              return (
                <tr key={key} className={todayRow ? "bg-blue-50 dark:bg-blue-900/10" : "bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors"}>
                  {/* Day label cell */}
                  <td className={`border-b border-r border-gray-200 dark:border-slate-700 px-4 py-4 align-top w-28 bg-gray-50 dark:bg-slate-800/40 ${
                    todayRow ? "border-l-4 border-l-blue-500" : ""
                  }`}>
                    <p className={`text-sm font-bold ${todayRow ? "text-blue-600 dark:text-blue-400" : "text-gray-800 dark:text-gray-200"}`}>
                      {label}
                    </p>
                    <p className={`text-xs mt-0.5 ${todayRow ? "text-blue-400" : "text-gray-400 dark:text-gray-500"}`}>
                      {MONTHS[dayDate.getMonth()]} {dayNum}
                    </p>
                  </td>

                  {/* Grade cells */}
                  {visibleGrades.map(grade => {
                    const cellEvents = lookup[dateKey]?.[grade] ?? [];
                    return (
                      <td key={grade}
                        className="border-b border-r border-gray-200 dark:border-slate-800 px-2 py-2 align-top min-w-[120px]">
                        <div className="flex flex-col gap-1.5 min-h-[3rem]">
                          {cellEvents.map(ev => {
                            const cfg = TYPE_CONFIG[ev.eventType] ?? TYPE_CONFIG.OTHER;
                            const teacherName = ev.teacher?.name ?? ev.teacher?.email ?? null;
                            const firstName = teacherName?.split(" ")[0] ?? null;
                            const timeStr = ev.time ? ev.time.slice(0, 5) : null;
                            return (
                              <Link key={ev.id} href={isTeacher ? `/events/${ev.id}/edit` : "#"}
                                className={`block rounded-lg px-2 py-1.5 text-xs shadow-sm border border-black/5 hover:shadow-md transition-shadow ${cfg.bg} ${cfg.text} ${cfg.dark}`}>
                                <p className="font-bold leading-tight truncate">{ev.subject}</p>
                                <p className="leading-tight truncate opacity-80">{cfg.label}</p>
                                {timeStr && (
                                  <p className="leading-tight opacity-70 mt-0.5">🕐 {timeStr}</p>
                                )}
                                {firstName && <p className="leading-tight truncate opacity-60">Prof. {firstName}</p>}
                                {ev.description && (
                                  <p className="leading-tight opacity-55 mt-0.5 line-clamp-2 whitespace-normal">{ev.description}</p>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4">
        {Object.entries(TYPE_CONFIG).filter(([k]) => k !== "COORDINATION").map(([, cfg]) => (
          <span key={cfg.label} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
            {cfg.label}
          </span>
        ))}
      </div>
    </div>
  );
}
