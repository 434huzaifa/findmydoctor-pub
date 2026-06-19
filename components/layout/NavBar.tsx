
"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/authSlice";

export function NavBar() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (p: string) => pathname === p ? "text-[color:var(--teal)]" : "text-[color:var(--text-muted)] hover:text-[color:var(--teal)]";
  const handleLogout = () => { dispatch(logout()); router.push("/"); };
  return (
    <nav className="sticky top-0 z-50 flex h-[68px] items-center justify-between border-b border-[color:var(--border)] bg-white px-[5%] shadow-[0_2px_12px_rgba(15,110,86,0.07)]">
      <Link href="/" className="font-serif text-2xl font-black text-[color:var(--teal)]">
        Find<span className="text-[color:var(--teal-light)]">My</span>Doctor
      </Link>
      <div className="flex items-center gap-6 text-sm">
        <Link href="/" className={isActive("/")}>Home</Link>
        <Link href="/doctors" className={isActive("/doctors")}>Find Doctors</Link>
        <Link href="/medicine" className={isActive("/medicine")}>Medicine</Link>
        <Link href="/about" className={isActive("/about")}>About</Link>
        <Link href="/my-appointments" className={isActive("/my-appointments")}>See My Appointment</Link>
        {(user?.role === "doctor" || user?.role === "admin") && (
          <Link href="/doctor-dashboard" className={isActive("/doctor-dashboard")}>Dashboard</Link>
        )}
        {user?.role === "admin" && (
          <Link href="/admin" className={isActive("/admin")}>Admin</Link>
        )}
        {user ? (
          <div className="flex items-center gap-3">
            <span className="max-w-[140px] truncate text-xs text-[color:var(--text-muted)]">{user.email}</span>
            <button onClick={handleLogout} className="rounded-full border border-[color:var(--teal)] px-4 py-2 text-xs font-semibold text-[color:var(--teal)] hover:bg-[color:var(--teal-pale)]">
              Sign Out
            </button>
          </div>
        ) : (
          <Link href="/login" className="rounded-full bg-[color:var(--teal)] px-5 py-2 text-xs font-semibold text-white hover:bg-[color:var(--teal-light)]">
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
