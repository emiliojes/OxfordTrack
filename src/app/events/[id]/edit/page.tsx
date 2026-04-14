"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import EventForm from "@/components/EventForm";
import { Loader2 } from "lucide-react";

interface Event {
  id: string;
  title: string;
  subject: string;
  grade: number;
  eventType: string;
  date: string;
  time: string;
  description?: string | null;
  published: boolean;
  createdBy: string;
}

export default function EditEventPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      return;
    }
    if (status === "authenticated" && id) {
      fetch(`/api/events/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Not found");
          return res.json();
        })
        .then((data) => {
          if (
            data.createdBy !== session?.user?.id &&
            session?.user?.role !== "ADMIN"
          ) {
            router.push("/dashboard");
            return;
          }
          setEvent(data);
        })
        .catch(() => setError("Event not found or access denied."))
        .finally(() => setLoading(false));
    }
  }, [status, session, id, router]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3">
          {error}
        </div>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Event</h1>
        <p className="text-gray-500 text-sm mt-1">Update the details for this summative event.</p>
      </div>
      <EventForm initialData={event} />
    </div>
  );
}
