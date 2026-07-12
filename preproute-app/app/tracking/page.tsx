"use client";

import { RequireAuth } from "@/components/RequireAuth";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";

function TrackingContent() {
  return (
    <div className="flex min-h-screen bg-white">
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-small-body text-text-tertiary">
            Test Tracking isn't part of the documented API yet — coming soon.
          </p>
        </main>
      </div>
    </div>
  );
}

export default function TrackingPage() {
  return (
    <RequireAuth>
      <TrackingContent />
    </RequireAuth>
  );
}
