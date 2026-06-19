import Sidebar from "./Sidebar";

interface DashboardShellProps {
  children: React.ReactNode;
  role: "admin" | "user";
  name: string;
  email: string;
  title: string;
  subtitle?: string;
}

export default function DashboardShell({
  children,
  role,
  name,
  email,
  title,
  subtitle,
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-surface-50">
      <Sidebar role={role} name={name} email={email} />
      <div className="lg:pl-60">
        <main className="min-h-screen">
          <div className="px-6 py-8 max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-surface-900">{title}</h1>
              {subtitle && (
                <p className="text-sm text-surface-500 mt-1">{subtitle}</p>
              )}
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
