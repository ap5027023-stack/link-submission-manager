"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Plus, Search, Edit2, Trash2, UserCheck, UserX,
  X, Save, RefreshCw, Key, User, Mail, Hash
} from "lucide-react";
import toast from "react-hot-toast";
import clsx from "clsx";
import type { UserPublic } from "@/types";

const LIMIT_PRESETS = [50, 100, 200, 300, 500];

interface UserFormData {
  name: string;
  email: string;
  password: string;
  submissionLimit: number | string;
}

interface EditFormData {
  name: string;
  email: string;
  password: string;
  submissionLimit: number | string;
  status: "active" | "disabled";
}

export default function UsersClient() {
  const [users, setUsers] = useState<UserPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<UserPublic | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [createForm, setCreateForm] = useState<UserFormData>({
    name: "", email: "", password: "", submissionLimit: 50,
  });
  const [editForm, setEditForm] = useState<EditFormData>({
    name: "", email: "", password: "", submissionLimit: 50, status: "active",
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success) setUsers(data.users);
    } catch { toast.error("Failed to load users"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success("User created successfully");
      setShowCreate(false);
      setCreateForm({ name: "", email: "", password: "", submissionLimit: 50 });
      fetchUsers();
    } catch { toast.error("Failed to create user"); }
    finally { setSaving(false); }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: editForm.name,
        email: editForm.email,
        submissionLimit: editForm.submissionLimit,
        status: editForm.status,
      };
      if (editForm.password) payload.password = editForm.password;

      const res = await fetch(`/api/admin/users/${editUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success("User updated successfully");
      setEditUser(null);
      fetchUsers();
    } catch { toast.error("Failed to update user"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteUserId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${deleteUserId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success("User deleted");
      setDeleteUserId(null);
      fetchUsers();
    } catch { toast.error("Failed to delete user"); }
    finally { setSaving(false); }
  };

  const openEdit = (user: UserPublic) => {
    setEditUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      password: "",
      submissionLimit: user.submissionLimit,
      status: user.status,
    });
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-9 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchUsers} className="btn-secondary text-sm px-3 py-2">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => setShowCreate(true)} className="btn-primary text-sm">
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-surface-400">
            <User className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No users found</p>
            <p className="text-sm mt-1">Create your first user to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-50 border-b border-surface-200">
                <tr>
                  <th className="text-left px-5 py-3.5 font-semibold text-surface-600">User</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-surface-600">Limit</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-surface-600">Status</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-surface-600">Created</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-surface-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filtered.map(user => (
                  <tr key={user.id} className="hover:bg-surface-50/50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-brand-600">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-surface-900">{user.name}</p>
                          <p className="text-surface-400 text-xs">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-surface-700 bg-surface-100 px-2.5 py-1 rounded-full">
                        <Hash className="w-3 h-3" />{user.submissionLimit}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={user.status === "active" ? "badge-active" : "badge-disabled"}>
                        <span className={clsx("w-1.5 h-1.5 rounded-full", user.status === "active" ? "bg-emerald-500" : "bg-red-500")} />
                        {user.status === "active" ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-surface-500">{formatDate(user.createdDate)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEdit(user)}
                          className="p-1.5 text-surface-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg"
                          title="Edit user"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteUserId(user.id)}
                          className="p-1.5 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreate && (
        <Modal title="Create New User" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <FormField label="Full Name" icon={<User className="w-4 h-4" />}>
              <input type="text" value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                placeholder="John Doe" className="input-field pl-10" required />
            </FormField>
            <FormField label="Email" icon={<Mail className="w-4 h-4" />}>
              <input type="email" value={createForm.email} onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))}
                placeholder="john@example.com" className="input-field pl-10" required />
            </FormField>
            <FormField label="Password" icon={<Key className="w-4 h-4" />}>
              <input type="password" value={createForm.password} onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Min 8 characters" className="input-field pl-10" required minLength={8} />
            </FormField>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">Submission Limit</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {LIMIT_PRESETS.map(l => (
                  <button key={l} type="button"
                    onClick={() => setCreateForm(f => ({ ...f, submissionLimit: l }))}
                    className={clsx("px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors",
                      createForm.submissionLimit === l
                        ? "bg-brand-600 text-white border-brand-600"
                        : "bg-white text-surface-600 border-surface-200 hover:border-brand-300"
                    )}>
                    {l}
                  </button>
                ))}
              </div>
              <input type="number" value={createForm.submissionLimit}
                onChange={e => setCreateForm(f => ({ ...f, submissionLimit: e.target.value }))}
                placeholder="Custom limit" className="input-field text-sm" min={1} />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? <><Spinner /> Saving...</> : <><Save className="w-4 h-4" /> Create User</>}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <Modal title="Edit User" onClose={() => setEditUser(null)}>
          <form onSubmit={handleEdit} className="space-y-4">
            <FormField label="Full Name" icon={<User className="w-4 h-4" />}>
              <input type="text" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                className="input-field pl-10" required />
            </FormField>
            <FormField label="Email" icon={<Mail className="w-4 h-4" />}>
              <input type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                className="input-field pl-10" required />
            </FormField>
            <FormField label="New Password (leave blank to keep)" icon={<Key className="w-4 h-4" />}>
              <input type="password" value={editForm.password} onChange={e => setEditForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Leave blank to keep current" className="input-field pl-10" minLength={8} />
            </FormField>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">Submission Limit</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {LIMIT_PRESETS.map(l => (
                  <button key={l} type="button"
                    onClick={() => setEditForm(f => ({ ...f, submissionLimit: l }))}
                    className={clsx("px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors",
                      editForm.submissionLimit === l
                        ? "bg-brand-600 text-white border-brand-600"
                        : "bg-white text-surface-600 border-surface-200 hover:border-brand-300"
                    )}>
                    {l}
                  </button>
                ))}
              </div>
              <input type="number" value={editForm.submissionLimit}
                onChange={e => setEditForm(f => ({ ...f, submissionLimit: e.target.value }))}
                className="input-field text-sm" min={1} />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">Account Status</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setEditForm(f => ({ ...f, status: "active" }))}
                  className={clsx("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors flex-1 justify-center",
                    editForm.status === "active"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                      : "bg-white text-surface-500 border-surface-200 hover:border-emerald-200"
                  )}>
                  <UserCheck className="w-4 h-4" /> Active
                </button>
                <button type="button" onClick={() => setEditForm(f => ({ ...f, status: "disabled" }))}
                  className={clsx("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors flex-1 justify-center",
                    editForm.status === "disabled"
                      ? "bg-red-50 text-red-700 border-red-300"
                      : "bg-white text-surface-500 border-surface-200 hover:border-red-200"
                  )}>
                  <UserX className="w-4 h-4" /> Disabled
                </button>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setEditUser(null)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? <><Spinner /> Saving...</> : <><Save className="w-4 h-4" /> Save Changes</>}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirm Modal */}
      {deleteUserId && (
        <Modal title="Delete User" onClose={() => setDeleteUserId(null)}>
          <div className="text-center py-2">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-surface-700 mb-1 font-medium">Are you sure?</p>
            <p className="text-sm text-surface-500 mb-6">
              This will permanently delete the user and all their submitted links.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteUserId(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleDelete} disabled={saving} className="btn-danger flex-1">
                {saving ? <><Spinner /> Deleting...</> : "Delete User"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-elevated w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
          <h2 className="font-semibold text-surface-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-surface-100 rounded-lg text-surface-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function FormField({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-surface-700 mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">{icon}</span>
        {children}
      </div>
    </div>
  );
}

function Spinner() {
  return <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />;
}
