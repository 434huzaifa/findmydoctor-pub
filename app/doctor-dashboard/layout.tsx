"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";

const DOCTOR_MENU = [
  { label: "Dashboard", href: "/doctor-dashboard", icon: "📊" },
  { label: "Availability", href: "/doctor-dashboard/availability", icon: "🕒" },
  { label: "My Profile", href: "/doctor-dashboard/profile", icon: "👤" },
];

export default function DoctorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <div className="min-h-screen bg-gray-50">
        {/* Doctor Navbar */}
        <nav className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="font-bold text-xl text-teal-700">Doctor Portal</div>
              <div className="flex gap-1">
                {DOCTOR_MENU.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition ${
                      pathname === item.href
                        ? "bg-teal-100 text-teal-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>

        {children}
      </div>
    </ProtectedRoute>
  );
}
