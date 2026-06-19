"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Hash, CheckCircle, TrendingUp, ArrowRight, Link2 } from "lucide-react";
import type { UserStats, LinkSubmission } from "@/types";

export default function DashboardClient() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentLinks, setRecentLinks] = useState<LinkSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/links")
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setStats(d.stats);
          setRecentLinks(d.links.slice(0, 5));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const progressPct = stats
    ? Math.min(100, (stats.totalSubmitted / stats.submissionLimit) * 100)
    : 0;

  const progressColor =
    progressPct >= 90 ? "bg-red-500" :
    progressPct >= 70 ? "bg-amber-500" :
    "bg-brand-500";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<Hash className="w-5 h-5 text-brand-600" />}
          label="Submission Limit"
          value={stats?.submissionLimit ?? 0}
          bg="bg-brand-50"
        />
        <StatCard
          icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
          label="Total Submitted"
          value={stats?.totalSubmitted ?? 0}
          bg="bg-emerald-50"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-violet-600" />}
          label="Remaining"
          value={stats?.remaining ?? 0}
          bg="bg-violet-50"
        />
      </div>

      {/* Progress */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-surface-800">Submission Progress</h2>
          <span className="text-sm font-mono text-surface-500">
            {stats?.totalSubmitted} / {stats?.submissionLimit}
          </span>
        </div>
        <div className="h-2.5 bg-surface-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-surface-400">{progressPct.toFixed(0)}% used</span>
          {progressPct >= 100 ? (
            <span className="text-xs font-medium text-red-600">Limit reached</span>
          ) : progressPct >= 90 ? (
            <span className="text-xs font-medium text-amber-600">Almost full</span>
          ) : (
            <span className="text-xs text-surface-400">{stats?.remaining} left</span>
          )}
        </div>
      </div>

      {/* CTA + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Submit CTA */}
        <div className="card p-6 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center mb-4">
              <Link2 className="w-5 h-5 text-brand-600" />
            </div>
            <h3 className="font-semibold text-surface-900 mb-1">Submit a New Link</h3>
            <p className="text-sm text-surface-500 mb-5">
              {stats?.remaining === 0
                ? "You've reached your submission limit. Contact admin to increase it."
                : `You have ${stats?.remaining} submission${stats?.remaining === 1 ? "" : "s"} remaining.`}
            </p>
          </div>
          <Link
            href="/user/submit"
            className={stats?.remaining === 0
              ? "btn-secondary pointer-events-none opacity-50 w-fit"
              : "btn-primary w-fit"
            }
          >
            Submit Link <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Recent submissions */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-surface-900">Recent Submissions</h3>
            <Link href="/user/history" className="text-xs text-brand-600 hover:text-brand-700 font-medium">
              View all
            </Link>
          </div>
          {recentLinks.length === 0 ? (
            <div className="text-center py-6 text-surface-400">
              <Link2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No submissions yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentLinks.map(link => (
                <div key={link.submissionId} className="flex items-center gap-2 p-2 hover:bg-surface-50 rounded-lg">
                  <div className="w-6 h-6 bg-brand-100 rounded flex items-center justify-center flex-shrink-0">
                    <Link2 className="w-3 h-3 text-brand-600" />
                  </div>
                  <a
                    href={link.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-surface-600 hover:text-brand-600 truncate font-mono flex-1"
                  >
                    {link.link}
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, bg }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  bg: string;
}) {
  return (
    <div className="card p-5">
      <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-surface-900 font-mono">{value}</p>
      <p className="text-sm text-surface-500 mt-0.5">{label}</p>
    </div>
  );
}
