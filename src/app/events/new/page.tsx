"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import EventForm from "@/components/EventForm";

export default function NewEventPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (
      status === "authenticated" &&
      session?.user?.role !== "TEACHER" &&
      session?.user?.role !== "ADMIN"
    ) {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  if (status === "loading") return null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create New Event</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Fill in the details for the assessment event.
        </p>
      </div>
      <EventForm userRole={session?.user?.role ?? "TEACHER"} />
    </div>
  );
}
