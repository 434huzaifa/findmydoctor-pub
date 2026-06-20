"use client";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[color:var(--border)] bg-white mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="font-serif text-xl font-black text-[color:var(--teal)]"
            >
              Find<span className="text-[color:var(--teal-light)]">My</span>
              Doctor
            </Link>
            <p className="mt-3 text-sm text-[color:var(--text-muted)] leading-relaxed">
              Your trusted healthcare platform in Bangladesh. Find doctors, book
              appointments, order medicines.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-[color:var(--text)] mb-3">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm text-[color:var(--text-muted)]">
              <li>
                <Link href="/doctors" className="hover:text-[color:var(--teal)]">
                  Find Doctors
                </Link>
              </li>
              <li>
                <Link href="/pharmacy" className="hover:text-[color:var(--teal)]">
                  Pharmacy
                </Link>
              </li>
              <li>
                <Link
                  href="/ambulances"
                  className="hover:text-[color:var(--teal)]"
                >
                  Ambulance Service
                </Link>
              </li>
              <li>
                <Link
                  href="/doctor-home-service"
                  className="hover:text-[color:var(--teal)]"
                >
                  Home Doctor
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-[color:var(--text)] mb-3">
              Services
            </h4>
            <ul className="space-y-2 text-sm text-[color:var(--text-muted)]">
              <li>
                <Link
                  href="/my-appointments"
                  className="hover:text-[color:var(--teal)]"
                >
                  My Corner
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[color:var(--teal)]">
                  About Us
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-[color:var(--teal)]">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[color:var(--teal)]">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-[color:var(--text)] mb-3">
              Contact
            </h4>
            <ul className="space-y-2 text-sm text-[color:var(--text-muted)]">
              <li className="flex items-center gap-2">
                <span>📧</span> support@findmydoctor.com.bd
              </li>
              <li className="flex items-center gap-2">
                <span>📞</span> +880 1XXX-XXXXXX
              </li>
              <li className="flex items-center gap-2">
                <span>📍</span> Dhaka, Bangladesh
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[color:var(--border)] text-center text-xs text-[color:var(--text-muted)]">
          © {new Date().getFullYear()} FindMyDoctor. All rights reserved. Built
          with Next.js, TypeORM & Tailwind CSS.
        </div>
      </div>
    </footer>
  );
}
