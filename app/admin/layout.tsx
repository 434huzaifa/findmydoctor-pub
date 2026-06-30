"use client";

import { usePathname } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/authSlice";
import { Button } from "@/shared/components/ui/Button";
import Link from "next/link";

const MENU_ITEMS = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: "📊"
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: "📦"
  },
  {
    label: "Ambulances",
    href: "/admin/ambulances",
    icon: "🚑"
  },
  {
    label: "Doctors",
    href: "/admin/doctors",
    icon: "🩺"
  },
  {
    label: "Medicines",
    href: "/admin/medicines",
    icon: "💊"
  },
  {
    label: "Support",
    href: "/admin/messages",
    icon: "✉️"
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-blue-600 flex items-center gap-2">
            🛡️ Admin Panel
          </h2>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <Button
            variant="outline"
            className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => dispatch(logout())}
          >
            <span className="text-lg">🚪</span>
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
