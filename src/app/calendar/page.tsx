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

const TYPE_CONFIG: Record<string, { label: string; dot: string; badge: string; bar: string }> = {
  SUMMATIVE:    { label: "Summative",   dot: "bg-red-500",    badge: "bg-red-100 text-red-700 border-red-200",         bar: "border-l-red-500" },
  PROJECT:      { label: "Project",     dot: "bg-purple-500", badge: "bg-purple-100 text-purple-700 border-purple-200", bar: "border-l-purple-500" },
  QUIZ:         { label: "Quiz",        dot: "bg-yellow-400", badge: "bg-yellow-100 text-yellow-700 border-yellow-200", bar: "border-l-yellow-400" },
  CHECKPOINT:   { label: "Checkpoint",  dot: "bg-blue-500",   badge: "bg-blue-100 text-blue-700 border-blue-200",       bar: "border-l-blue-500" },
  EXAM:         { label: "Exam",        dot: "bg-orange-500", badge: "bg-orange-100 text-orange-700 border-orange-200", bar: "border-l-orange-500" },
  COORDINATION: { label: "Coordination",dot: "bg-green-500",  badge: "bg-green-100 text-green-700 border-green-200",    bar: "border-l-green-500" },
  OTHER:        { label: "Other",       dot: "bg-gray-400",   badge: "bg-gray-100 text-gray-600 border-gray-200",       bar: "border-l-gray-400" },
};

const MIDDLE_GRADES = [6, 7, 8];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function CalendarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

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
      const res = await fetch("/api/events");
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

  // Filter events
  const filtered = events.filter((e) => {
    if (filterLevel === "middle" && !MIDDLE_GRADES.includes(e.grade)) return false;
    if (filterLevel === "high" && MIDDLE_GRADES.includes(e.grade)) return false;
    if (filterGrade !== "" && e.grade !== filterGrade) return false;
    if (filterType && e.eventType !== filterType) return false;
    return true;
  });

  // Group events by date string (YYYY-MM-DD)
  const eventsByDate: Record<string, Event[]> = {};
  for (const e of filtered) {
    if (!eventsByDate[e.date]) eventsByDate[e.date] = [];
    eventsByDate[e.date].push(e);
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
    setSelectedDay(null);
  };

  const formatDateKey = (day: number) =>
    `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const selectedDateKey = selectedDay ? formatDateKey(selectedDay) : null;
  const selectedEvents = selectedDateKey ? (eventsByDate[selectedDateKey] ?? []) : [];

  const isToday = (day: number) =>
    day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-500 text-sm mt-1">Monthly view of all assessment events</p>
        </div>
        {isTeacher && (
          <Link href="/events/new">
            <Button><Plus className="h-4 w-4" />New Event</Button>
          </Link>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: calendar + filters */}
        <div className="flex-1 min-w-0">
          {/* Filters */}
          <div className="bg-white border border-gray-200 rounded-xl p-3 mb-4 flex flex-wrap items-center gap-2">
            {/* Level pills */}
            {([["", "All"], ["middle", "MS"], ["high", "HS"]] as const).map(([val, label]) => (
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

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-lg border border-gray-300 px-2 py-1 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              {Object.entries(TYPE_CONFIG).map(([val, cfg]) => (
                <option key={val} value={val}>{cfg.label}</option>
              ))}
            </select>

            {(filterLevel || filterGrade !== "" || filterType) && (
              <button
                onClick={() => { setFilterLevel(""); setFilterGrade(""); setFilterType(""); }}
                className="text-xs text-gray-400 hover:text-gray-600 ml-1"
              >
                Clear
              </button>
            )}

            <span className="ml-auto text-xs text-gray-400">{filtered.length} events</span>
          </div>

          {/* Month navigator */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <h2 className="font-semibold text-gray-900 text-lg">
                {MONTHS[viewMonth]} {viewYear}
              </h2>
              <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-gray-100">
              {DAYS.map(d => (
                <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7">
              {/* Empty cells before first day */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="border-t border-gray-50 min-h-[72px] bg-gray-50/40" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateKey = formatDateKey(day);
                const dayEvents = eventsByDate[dateKey] ?? [];
                const isSelected = selectedDay === day;
                const isTodayCell = isToday(day);

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDay(isSelected ? null : day)}
                    className={`border-t border-gray-100 min-h-[72px] p-1.5 cursor-pointer transition-colors ${
                      isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1 ${
                      isTodayCell
                        ? "bg-blue-600 text-white"
                        : isSelected
                        ? "text-blue-600"
                        : "text-gray-700"
                    }`}>
                      {day}
                    </div>

                    {/* Event dots / labels */}
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 3).map((ev) => {
                        const cfg = TYPE_CONFIG[ev.eventType] ?? TYPE_CONFIG.OTHER;
                        return (
                          <div
                            key={ev.id}
                            className={`text-[10px] leading-tight px-1 py-0.5 rounded truncate font-medium border-l-2 ${cfg.bar} ${cfg.badge}`}
                            title={ev.title}
                          >
                            {ev.title}
                          </div>
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <div className="text-[10px] text-gray-400 pl-1">+{dayEvents.length - 3} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-3 px-1">
            {Object.entries(TYPE_CONFIG).map(([, cfg]) => (
              <div key={cfg.label} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                <span className="text-xs text-gray-500">{cfg.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: selected day detail */}
        <div className="lg:w-80 shrink-0">
          {selectedDay ? (
            <div className="bg-white border border-gray-200 rounded-xl p-5 sticky top-6">
              <h3 className="font-semibold text-gray-900 mb-1">
                {MONTHS[viewMonth]} {selectedDay}, {viewYear}
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                {selectedEvents.length === 0
                  ? "No events this day"
                  : `${selectedEvents.length} event${selectedEvents.length !== 1 ? "s" : ""}`}
              </p>

              {selectedEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-300">
                  <span className="text-4xl">📭</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedEvents.map((ev) => {
                    const cfg = TYPE_CONFIG[ev.eventType] ?? TYPE_CONFIG.OTHER;
                    const isMiddle = MIDDLE_GRADES.includes(ev.grade);
                    const time = new Date(`${ev.date}T${ev.time}`).toLocaleTimeString("en-US", {
                      hour: "2-digit", minute: "2-digit",
                    });
                    return (
                      <div key={ev.id} className={`rounded-lg border-l-4 ${cfg.bar} bg-gray-50 border border-gray-100 p-3`}>
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${cfg.badge}`}>
                            {cfg.label}
                          </span>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${
                            isMiddle
                              ? "bg-teal-50 text-teal-700 border-teal-200"
                              : "bg-indigo-50 text-indigo-700 border-indigo-200"
                          }`}>
                            {isMiddle ? "MS" : "HS"} · Grade {ev.grade}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 leading-snug">{ev.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{time} · {ev.subject}</p>
                        {ev.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{ev.description}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-5 text-center text-gray-400 sticky top-6">
              <p className="text-sm">Click a day to see its events</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
