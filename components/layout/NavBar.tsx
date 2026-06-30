"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/authSlice";
import { selectCartCount } from "@/store/cartSlice";

export function NavBar() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const cartCount = useAppSelector(selectCartCount);
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (p: string) =>
    pathname === p
      ? "text-[color:var(--teal)] font-semibold"
      : "text-[color:var(--text-muted)] hover:text-[color:var(--teal)]";

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/doctors", label: "Find Doctors" },
    { href: "/pharmacy", label: "Pharmacy", badge: "cart" as const },
    { href: "/ambulances", label: "Ambulance" },
    { href: "/doctor-home-service", label: "Home Doctor" },
    { href: "/my-appointments", label: "My Corner" },
  ];

  const authLinks = [
    ...(user?.role === "doctor"
      ? [{ href: "/doctor-dashboard", label: "Dashboard" }]
      : []),
    ...(user?.role === "admin"
      ? [{ href: "/admin", label: "Admin" }]
      : []),
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-[color:var(--border)] bg-white/95 backdrop-blur-sm shadow-[0_2px_12px_rgba(15,110,86,0.07)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="font-serif text-xl sm:text-2xl font-black text-[color:var(--teal)]"
          >
            Find<span className="text-[color:var(--teal-light)]">My</span>Doctor
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3 py-2 text-sm rounded-lg transition-colors ${isActive(link.href)}`}
              >
                {link.label}
                {"badge" in link && link.badge === "cart" && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Link>
            ))}
            {authLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${isActive(link.href)}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <>
                <span className="max-w-[140px] truncate text-xs text-[color:var(--text-muted)]">
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="rounded-full border border-[color:var(--teal)] px-4 py-2 text-xs font-semibold text-[color:var(--teal)] hover:bg-[color:var(--teal-pale)]"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-full bg-[color:var(--teal)] px-5 py-2 text-xs font-semibold text-white hover:bg-[color:var(--teal-light)]"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-[color:var(--text-muted)] hover:bg-[color:var(--teal-pale)]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[color:var(--border)] bg-white">
          <div className="px-4 py-3 space-y-1">
            {[...navLinks, ...authLinks].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm ${isActive(link.href)}`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-[color:var(--border)]">
              {user ? (
                <div className="space-y-2">
                  <p className="px-3 text-xs text-[color:var(--text-muted)] truncate">
                    {user.email}
                  </p>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full rounded-lg border border-[color:var(--teal)] px-4 py-2.5 text-sm font-semibold text-[color:var(--teal)] hover:bg-[color:var(--teal-pale)]"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full rounded-lg bg-[color:var(--teal)] px-4 py-2.5 text-sm font-semibold text-white text-center hover:bg-[color:var(--teal-light)]"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
