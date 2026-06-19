"use client";
import { useState, useEffect, useCallback } from "react";
import { Search, Trash2, ExternalLink, RefreshCw, Link2, Filter, X } from "lucide-react";
import toast from "react-hot-toast";
import type { LinkSubmission } from "@/types";

export default function LinksClient() {
  const [links, setLinks] = useState<LinkSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterUser, setFilterUser] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchLinks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/links");
      const data = await res.json();
      if (data.success) setLinks(data.links);
    } catch { toast.error("Failed to load links"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchLinks(); }, [fetchLinks]);

  const allEmails = Array.from(new Set(links.map(l => l.userEmail)));

  const filtered = links.filter(l => {
    const matchSearch =
      l.link.toLowerCase().includes(search.toLowerCase()) ||
      l.userEmail.toLowerCase().includes(search.toLowerCase());
    const matchUser = !filterUser || l.userEmail === filterUser;
    return matchSearch && matchUser;
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/links/${deleteId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success("Link deleted");
      setDeleteId(null);
      fetchLinks();
    } catch { toast.error("Failed to delete link"); }
    finally { setDeleting(false); }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  const truncateUrl = (url: string, max = 60) =>
    url.length > max ? url.slice(0, max) + "..." : url;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search by URL or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-9 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <select
              value={filterUser}
              onChange={e => setFilterUser(e.target.value)}
              className="input-field pl-9 pr-8 text-sm appearance-none min-w-[180px]"
            >
              <option value="">All Users</option>
              {allEmails.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          {filterUser && (
            <button onClick={() => setFilterUser("")} className="btn-secondary text-sm px-3 py-2">
              <X className="w-4 h-4" />
            </button>
          )}
          <button onClick={fetchLinks} className="btn-secondary text-sm px-3 py-2">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Count */}
      <p className="text-sm text-surface-500">
        Showing <span className="font-semibold text-surface-700">{filtered.length}</span> of{" "}
        <span className="font-semibold text-surface-700">{links.length}</span> links
      </p>

      {/* Links Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-surface-400">
            <Link2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No links found</p>
            <p className="text-sm mt-1">Links submitted by users will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-50 border-b border-surface-200">
                <tr>
                  <th className="text-left px-5 py-3.5 font-semibold text-surface-600">Link</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-surface-600">Submitted By</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-surface-600">Date</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-surface-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filtered.map(link => (
                  <tr key={link.submissionId} className="hover:bg-surface-50/50">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-brand-100 flex items-center justify-center flex-shrink-0">
                          <Link2 className="w-3 h-3 text-brand-600" />
                        </div>
                        <span className="text-surface-700 font-mono text-xs truncate max-w-xs">
                          {truncateUrl(link.link)}
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
                    <td className="px-5 py-3.5 text-surface-500">{link.userEmail}</td>
                    <td className="px-5 py-3.5 text-surface-500 whitespace-nowrap">
                      {formatDate(link.timestamp)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setDeleteId(link.submissionId)}
                        className="p-1.5 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete link"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-elevated w-full max-w-sm p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <p className="font-medium text-surface-900 mb-1">Delete this link?</p>
              <p className="text-sm text-surface-500 mb-6">This action cannot be undone.</p>
              <div className="flex gap-2">
                <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleDelete} disabled={deleting} className="btn-danger flex-1">
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
