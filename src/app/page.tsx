import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalendarDays, BookOpen, Users } from "lucide-react";

export default async function Home() {
  const session = await getSession();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-16">
      <div className="text-center max-w-2xl mx-auto">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 rounded-full p-4">
            <CalendarDays className="h-12 w-12 text-blue-600" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          OxfordTrack
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Oxford School's central hub for assessments, coordination events and weekly schedules.
          Teachers publish, coordinators announce, students stay informed.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 text-left">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 shadow-sm">
            <BookOpen className="h-6 w-6 text-blue-500 mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Create Events</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Teachers and coordinators create assessments, quizzes, projects and school-wide events.</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 shadow-sm">
            <Users className="h-6 w-6 text-green-500 mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Stay Updated</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Students see all published events in a clean, easy-to-read calendar view.</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 shadow-sm">
            <CalendarDays className="h-6 w-6 text-purple-500 mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Google Calendar</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Add any event to Google Calendar with one click — no extra setup needed.</p>
          </div>
        </div>

        <Link href="/login">
          <Button size="lg" className="px-10">
            Sign in with Google
          </Button>
        </Link>
      </div>
    </div>
  );
}
