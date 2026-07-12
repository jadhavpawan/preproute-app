"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Eye, Trash2, Search } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import { StatusBadge } from "@/components/StatusBadge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { testsApi, getApiErrorMessage } from "@/lib/api";
import { toast } from "@/components/ui/Toast";
import type { Test } from "@/lib/types";

function DashboardContent() {
  const router = useRouter();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadTests();
  }, []);

  async function loadTests() {
    setLoading(true);
    try {
      const data = await testsApi.getAll();
      setTests(data);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Couldn't load tests"));
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this test? This can't be undone.")) return;
    setDeletingId(id);
    try {
      await testsApi.remove(id);
      setTests((prev) => prev.filter((t) => t.id !== id));
      toast.success("Test deleted");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Couldn't delete test"));
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = useMemo(() => {
    return tests.filter((t) => {
      const matchesSearch =
        search.trim() === "" ||
        t.name?.toLowerCase().includes(search.toLowerCase()) ||
        (t.subjectName ?? t.subject)?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "draft" && t.status !== "live") ||
        (statusFilter === "live" && t.status === "live");
      return matchesSearch && matchesStatus;
    });
  }, [tests, search, statusFilter]);

  return (
    <div className="flex min-h-screen bg-white">
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-xl p-xl">
        <div className="flex items-center justify-between">
          <h1 className="text-section-title text-text-secondary">Your tests</h1>
          <Button onClick={() => router.push("/tests/new")}>
            <Plus className="h-4 w-4" />
            Create New Test
          </Button>
        </div>

        <div className="flex gap-lg">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
            <Input
              placeholder="Search by test name or subject…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-[180px]"
          >
            <option value="all">All statuses</option>
            <option value="draft">Draft</option>
            <option value="live">Live</option>
          </Select>
        </div>

        {loading ? (
          <p className="py-2xl text-center text-small-body text-text-tertiary">
            Loading tests…
          </p>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded border border-border-light py-2xl">
            <p className="text-small-body text-text-secondary">No tests found</p>
            <p className="text-caption text-text-tertiary">
              {tests.length === 0
                ? "Create your first test to get started."
                : "Try adjusting your search or filter."}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded border border-border-light">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-light bg-surface-gray">
                  <th className="px-base10 py-3 text-small-label text-text-secondary">Name</th>
                  <th className="px-base10 py-3 text-small-label text-text-secondary">Subject</th>
                  <th className="px-base10 py-3 text-small-label text-text-secondary">Status</th>
                  <th className="px-base10 py-3 text-small-label text-text-secondary">Created</th>
                  <th className="px-base10 py-3 text-small-label text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} className="border-b border-border-light last:border-b-0">
                    <td className="px-base10 py-3 text-small-body text-text-secondary">
                      {t.name}
                    </td>
                    <td className="px-base10 py-3 text-small-body text-text-secondary">
                      {t.subjectName ?? t.subject}
                    </td>
                    <td className="px-base10 py-3">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-base10 py-3 text-small-body text-text-secondary">
                      {t.created_at ? new Date(t.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-base10 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          title="Edit"
                          onClick={() => router.push(`/tests/${t.id}`)}
                          className="text-icon-gray hover:text-brand-periwinkle"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          title="View"
                          onClick={() => router.push(`/tests/${t.id}/view`)}
                          className="text-icon-gray hover:text-brand-periwinkle"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          title="Delete"
                          disabled={deletingId === t.id}
                          onClick={() => handleDelete(t.id)}
                          className="text-icon-gray hover:text-danger disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  );
}
