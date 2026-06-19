
import type { Metadata } from "next";
export const metadata: Metadata = { title: "About" };
export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="font-serif text-4xl font-black text-[color:var(--teal)]">About FindMyDoctor</h1>
      <p className="mt-6 text-base leading-relaxed text-[color:var(--text-muted)]">
        FindMyDoctor is a centralized doctor information and appointment system for Bangladesh. Our mission is to make quality
        healthcare accessible to everyone by connecting patients with qualified physicians across the country.
      </p>
      <p className="mt-4 text-base leading-relaxed text-[color:var(--text-muted)]">
        The platform allows patients to search for specialists, view doctor profiles, check availability, and book
        appointments instantly — all in one place. Doctors and admins can manage appointments and view analytics through
        dedicated dashboards.
      </p>
      <div className="mt-10 rounded-2xl bg-[color:var(--teal-pale)] p-6">
        <h2 className="font-serif text-2xl font-bold text-[color:var(--teal)]">Key Features</h2>
        <ul className="mt-4 space-y-2 text-sm text-[color:var(--text)]">
          <li>🔍 Search & filter doctors by specialty, city, and availability</li>
          <li>📅 Book appointments with advance or full payment options</li>
          <li>📱 Track appointments via phone number OTP verification</li>
          <li>👨‍⚕️ Doctor dashboard for managing patient lists and marking payments</li>
          <li>🔐 Admin panel for complete system management</li>
        </ul>
      </div>
    </div>
  );
}
