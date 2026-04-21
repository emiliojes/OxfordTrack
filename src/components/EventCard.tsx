"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, BookOpen, ExternalLink, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

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

interface EventCardProps {
  event: Event;
  role?: string;
  onDelete?: (id: string) => void;
  onTogglePublish?: (id: string, published: boolean) => void;
}

const MIDDLE_GRADES = [6, 7, 8];

const TYPE_CONFIG: Record<string, { label: string; bar: string; badge: string }> = {
  SUMMATIVE:    { label: "Summative",   bar: "bg-red-500",    badge: "bg-red-100 text-red-700 border-red-200" },
  PROJECT:      { label: "Project",     bar: "bg-purple-500", badge: "bg-purple-100 text-purple-700 border-purple-200" },
  QUIZ:         { label: "Quiz",        bar: "bg-yellow-400", badge: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  EXAM:         { label: "Exam",        bar: "bg-orange-500", badge: "bg-orange-100 text-orange-700 border-orange-200" },
  COORDINATION: { label: "Coordination",bar: "bg-green-500",  badge: "bg-green-100 text-green-700 border-green-200" },
  OTHER:        { label: "Other",       bar: "bg-gray-400",   badge: "bg-gray-100 text-gray-600 border-gray-200" },
};

function buildGoogleCalendarUrl(event: Event) {
  const [year, month, day] = event.date.split("-");
  const [hour, minute] = event.time.split(":");
  const start = `${year}${month}${day}T${hour}${minute}00`;
  const endHour = String(parseInt(hour) + 1).padStart(2, "0");
  const end = `${year}${month}${day}T${endHour}${minute}00`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${start}/${end}`,
    details: event.description ?? "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default function EventCard({ event, role, onDelete, onTogglePublish }: EventCardProps) {
  const [loading, setLoading] = useState(false);
  const isTeacher = role === "TEACHER" || role === "ADMIN";
  const typeConfig = TYPE_CONFIG[event.eventType] ?? TYPE_CONFIG.OTHER;

  const formattedDate = new Date(`${event.date}T${event.time}`).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });
  const formattedTime = new Date(`${event.date}T${event.time}`).toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit",
  });

  const handleTogglePublish = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !event.published }),
      });
      if (res.ok) onTogglePublish?.(event.id, !event.published);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this event?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${event.id}`, { method: "DELETE" });
      if (res.ok) onDelete?.(event.id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow overflow-hidden bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
      {/* Color bar by event type */}
      <div className={`h-1.5 w-full ${typeConfig.bar}`} />

      <CardContent className="pt-4 pb-4 space-y-3">
        {/* Type + Grade/Section + Draft badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${typeConfig.badge}`}>
            {typeConfig.label}
          </span>
          {event.eventType === "COORDINATION" ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border bg-green-50 text-green-700 border-green-200">
              🌐 Global
            </span>
          ) : (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${
              MIDDLE_GRADES.includes(event.grade)
                ? "bg-teal-50 text-teal-700 border-teal-200"
                : "bg-indigo-50 text-indigo-700 border-indigo-200"
            }`}>
              {MIDDLE_GRADES.includes(event.grade) ? "MS" : "HS"} · Grade {event.grade}
            </span>
          )}
          {isTeacher && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ml-auto ${
              event.published
                ? "bg-green-100 text-green-700 border-green-200"
                : "bg-amber-100 text-amber-700 border-amber-200"
            }`}>
              {event.published ? "Published" : "Draft"}
            </span>
          )}
        </div>

        {/* Title */}
        <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-snug">{event.title}</p>

        {/* Meta */}
        <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
            <span>{formattedDate}</span>
            <Clock className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 shrink-0 ml-2" />
            <span>{formattedTime}</span>
          </div>
          {event.teacher && (
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <span>{event.teacher.name ?? event.teacher.email}</span>
            </div>
          )}
          {event.description && (
            <div className="flex items-start gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-gray-400 shrink-0 mt-0.5" />
              <span className="line-clamp-2">{event.description}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1 flex-wrap">
          <a
            href={buildGoogleCalendarUrl(event)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
          >
            <ExternalLink className="h-3 w-3" /> Add to Google Calendar
          </a>

          {isTeacher && (
            <div className="flex items-center gap-1.5 ml-auto">
              <Button variant="ghost" size="sm" onClick={handleTogglePublish}
                disabled={loading} className="text-xs h-7 px-2">
                {event.published
                  ? <><EyeOff className="h-3.5 w-3.5" /> Unpublish</>
                  : <><Eye className="h-3.5 w-3.5" /> Publish</>}
              </Button>
              <Link href={`/events/${event.id}/edit`}>
                <Button variant="outline" size="sm" className="h-7 px-2">
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </Link>
              <Button variant="destructive" size="sm" onClick={handleDelete}
                disabled={loading} className="h-7 px-2">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
