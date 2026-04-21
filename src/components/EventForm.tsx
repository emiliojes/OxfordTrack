"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";

const SUBJECTS = [
  "ICT", "Robotics", "Mathematics", "Science", "English", "History",
  "Geography", "Physics", "Chemistry", "Biology", "Literature",
  "Art", "Music", "Physical Education", "Computer Science", "Spanish",
  "French", "Social Studies", "Other",
];

const ALL_EVENT_TYPES = [
  { value: "SUMMATIVE",    label: "Summative",    color: "bg-red-100 text-red-700 border-red-200",    roles: ["TEACHER","COORDINATOR","ADMIN"] },
  { value: "PROJECT",      label: "Project",      color: "bg-purple-100 text-purple-700 border-purple-200", roles: ["TEACHER","COORDINATOR","ADMIN"] },
  { value: "QUIZ",         label: "Quiz",         color: "bg-yellow-100 text-yellow-700 border-yellow-200", roles: ["TEACHER","COORDINATOR","ADMIN"] },
  { value: "EXAM",         label: "Exam",         color: "bg-orange-100 text-orange-700 border-orange-200", roles: ["TEACHER","COORDINATOR","ADMIN"] },
  { value: "COORDINATION", label: "Coordination", color: "bg-green-100 text-green-700 border-green-200",  roles: ["COORDINATOR","ADMIN"] },
  { value: "OTHER",        label: "Other",        color: "bg-gray-100 text-gray-700 border-gray-200",    roles: ["TEACHER","COORDINATOR","ADMIN"] },
];

const MIDDLE_GRADES = [6, 7, 8];
const HIGH_GRADES = [9, 10, 11, 12];

interface EventFormProps {
  initialData?: {
    id: string;
    title: string;
    subject: string;
    grade: number;
    eventType: string;
    date: string;
    time: string;
    description?: string | null;
    published: boolean;
  };
}

function getLevel(grade: number | string) {
  return Number(grade) <= 8 ? "Middle School" : "High School";
}

function buildTitle(grade: number | string, subject: string, eventType: string) {
  if (eventType === "COORDINATION") return "";
  if (!grade || !subject || !eventType) return "";
  const typeLabel = ALL_EVENT_TYPES.find((t) => t.value === eventType)?.label ?? eventType;
  return `Grade ${grade} ${subject} – ${typeLabel}`;
}

export default function EventForm({ initialData, userRole }: EventFormProps & { userRole?: string }) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [form, setForm] = useState({
    grade: initialData?.grade ?? 9,
    subject: initialData?.subject ?? "",
    eventType: initialData?.eventType ?? "SUMMATIVE",
    title: initialData?.title ?? "",
    date: initialData?.date ?? "",
    time: initialData?.time ?? "",
    description: initialData?.description ?? "",
    published: initialData?.published ?? false,
  });
  const [autoTitle, setAutoTitle] = useState(!isEditing);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (autoTitle) {
      const generated = buildTitle(form.grade, form.subject, form.eventType);
      if (generated) setForm((prev) => ({ ...prev, title: generated }));
    }
  }, [form.grade, form.subject, form.eventType, autoTitle]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : name === "grade" ? Number(value) : value,
    }));
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAutoTitle(false);
    setForm((prev) => ({ ...prev, title: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const url = isEditing ? `/api/events/${initialData.id}` : "/api/events";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Something went wrong");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const EVENT_TYPES = ALL_EVENT_TYPES.filter(t => t.roles.includes(userRole ?? "TEACHER"));
  const selectedType = EVENT_TYPES.find((t) => t.value === form.eventType);
  const isCoordination = form.eventType === "COORDINATION";

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6 space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Grade + school level — hidden for coordination events */}
      {!isCoordination && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="grade">
              Grade <span className="text-red-500">*</span>
            </label>
            <select
              id="grade"
              name="grade"
              required
              value={form.grade}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700"
            >
              <optgroup label="Middle School">
                {MIDDLE_GRADES.map((g) => (
                  <option key={g} value={g}>Grade {g}</option>
                ))}
              </optgroup>
              <optgroup label="High School">
                {HIGH_GRADES.map((g) => (
                  <option key={g} value={g}>Grade {g}</option>
                ))}
              </optgroup>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">School Level</label>
            <div className={`w-full rounded-lg border px-3 py-2 text-sm font-medium ${
              MIDDLE_GRADES.includes(Number(form.grade))
                ? "bg-teal-50 border-teal-200 text-teal-700"
                : "bg-indigo-50 border-indigo-200 text-indigo-700"
            }`}>
              {getLevel(form.grade)}
            </div>
          </div>
        </div>
      )}

      {/* Coordination global notice */}
      {isCoordination && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          🌐 <strong>Global event</strong> — visible to all grades and sections.
        </div>
      )}

      {/* Subject — hidden for coordination events */}
      {!isCoordination && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="subject">
            Subject <span className="text-red-500">*</span>
          </label>
          <select
            id="subject"
            name="subject"
            required
            value={form.subject}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700"
          >
            <option value="">Select a subject...</option>
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      )}

      {/* Event Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Event Type <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {EVENT_TYPES.map((t: typeof ALL_EVENT_TYPES[number]) => (
            <button
              key={t.value}
              type="button"
              onClick={() => { setForm((prev) => ({ ...prev, eventType: t.value })); }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                form.eventType === t.value
                  ? t.color + " ring-2 ring-offset-1 ring-current"
                  : "bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-gray-300 border-gray-200 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Auto-generated Title */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="title">
            Title <span className="text-red-500">*</span>
          </label>
          {!autoTitle && (
            <button
              type="button"
              onClick={() => setAutoTitle(true)}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              <Sparkles className="h-3 w-3" /> Auto-generate
            </button>
          )}
        </div>
        <input
          id="title"
          name="title"
          type="text"
          required
          value={form.title}
          onChange={handleTitleChange}
          placeholder="e.g. Grade 9A ICT – Summative"
          className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-700 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {autoTitle && form.title && (
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> Auto-generated from your selections
          </p>
        )}
        {/* Preview badge */}
        {form.title && selectedType && (
          <div className="mt-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${selectedType.color}`}>
              {form.title}
            </span>
          </div>
        )}
      </div>

      {/* Date + Time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="date">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            id="date"
            name="date"
            type="date"
            required
            value={form.date}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="time">
            Time <span className="text-red-500">*</span>
          </label>
          <input
            id="time"
            name="time"
            type="time"
            required
            value={form.time}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={form.description}
          onChange={handleChange}
          placeholder="Optional: topics covered, materials needed, format..."
          className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-700 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Publish */}
      <div className="flex items-center gap-3">
        <input
          id="published"
          name="published"
          type="checkbox"
          checked={form.published}
          onChange={handleChange}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="published" className="text-sm text-gray-700 dark:text-gray-300">
          Publish immediately
        </label>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={loading} className="flex-1 sm:flex-none">
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
          ) : isEditing ? (
            "Save Changes"
          ) : (
            "Create Event"
          )}
        </Button>
        <Link href="/dashboard">
          <Button variant="outline" type="button">
            <ArrowLeft className="h-4 w-4" />
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  );
}
