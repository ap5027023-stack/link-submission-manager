"use client";
import { useState, useEffect } from "react";
import { Search, Link2, ExternalLink, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import type { LinkSubmission } from "@/types";

export default function HistoryClient() {
  const [links, setLinks] = useState<LinkSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/links");
      const data = await res.json();
      if (data.success) setLinks(data.links);
    } catch { toast.error("Failed to load history"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLinks(); }, []);

  const filtered = links.filter(l =>
    l.link.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (d: string) =>
    new Date(d).toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search your links..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-9 text-sm"
          />
        </div>
        <button onClick={fetchLinks} className="btn-secondary text-sm px-3 py-2">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <p className="text-sm text-surface-500">
        <span className="font-semibold text-surface-700">{filtered.length}</span> of{" "}
        <span className="font-semibold text-surface-700">{links.length}</span> submissions
      </p>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-surface-400">
            <Link2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">
              {search ? "No links match your search" : "No submissions yet"}
            </p>
            <p className="text-sm mt-1">
              {!search && "Submit your first link to see it here"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-50 border-b border-surface-200">
                <tr>
                  <th className="text-left px-5 py-3.5 font-semibold text-surface-600">#</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-surface-600">Link</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-surface-600">Submitted At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filtered.map((link, i) => (
                  <tr key={link.submissionId} className="hover:bg-surface-50/50">
                    <td className="px-5 py-3.5 text-surface-400 font-mono text-xs">
                      {links.length - i}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-brand-100 rounded flex items-center justify-center flex-shrink-0">
                          <Link2 className="w-3 h-3 text-brand-600" />
                        </div>
                        <span className="text-surface-700 font-mono text-xs truncate max-w-xs">
                          {link.link}
                        </span>
                        <a
                          href={link.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-surface-400 hover:text-brand-600 flex-shrink-0"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-surface-500 whitespace-nowrap">
                      {formatDate(link.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
