"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Users,
  Link2,
  LayoutDashboard,
  History,
  PlusCircle,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Shield,
} from "lucide-react";
import toast from "react-hot-toast";
import clsx from "clsx";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const adminNav: NavItem[] = [
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Links", href: "/admin/links", icon: Link2 },
];

const userNav: NavItem[] = [
  { label: "Dashboard", href: "/user/dashboard", icon: LayoutDashboard },
  { label: "Submit Link", href: "/user/submit", icon: PlusCircle },
  { label: "History", href: "/user/history", icon: History },
];

interface SidebarProps {
  role: "admin" | "user";
  name: string;
  email: string;
}

export default function Sidebar({ role, name, email }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const navItems = role === "admin" ? adminNav : userNav;

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Logged out successfully");
    router.push(role === "admin" ? "/admin/login" : "/login");
    router.refresh();
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-surface-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <Link2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-700 text-surface-900 leading-tight" style={{ fontWeight: 700 }}>
              LinkManager
            </h1>
            <p className="text-xs text-surface-400">
              {role === "admin" ? "Admin Panel" : "User Panel"}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 pb-2 text-xs font-semibold text-surface-400 uppercase tracking-wider">
          Navigation
        </p>
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium group transition-all",
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-surface-600 hover:bg-surface-50 hover:text-surface-900"
              )}
            >
              <Icon
                className={clsx(
                  "w-4 h-4 flex-shrink-0",
                  active ? "text-brand-600" : "text-surface-400 group-hover:text-surface-600"
                )}
              />
              {label}
              {active && (
                <ChevronRight className="w-3.5 h-3.5 ml-auto text-brand-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div className="px-3 py-4 border-t border-surface-100">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface-50 mb-2">
          <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
            {role === "admin" ? (
              <Shield className="w-4 h-4 text-brand-600" />
            ) : (
              <span className="text-xs font-bold text-brand-600">
                {name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-surface-800 truncate">{name}</p>
            <p className="text-xs text-surface-400 truncate">{email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-surface-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-card border border-surface-200"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed top-0 left-0 h-full z-40 w-60 bg-white border-r border-surface-200 shadow-elevated transition-transform duration-200",
          "lg:translate-x-0 lg:shadow-none",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
