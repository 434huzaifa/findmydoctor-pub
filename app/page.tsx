
"use client";
import Link from "next/link";
import { useGetFeaturedDoctorsQuery, useGetSpecialtiesQuery } from "@/store/fmdApi";
import { DoctorCard } from "@/features/doctors/DoctorCard";

export default function HomePage() {
  const { data: doctors, isLoading } = useGetFeaturedDoctorsQuery();
  const { data: specialties } = useGetSpecialtiesQuery();
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#04342C] to-[#0f6e56] px-[5%] py-24 text-center text-white">
        <h1 className="font-serif text-5xl font-black">Find The Right Doctor<br />In Bangladesh</h1>
        <p className="mt-4 text-lg text-white/80">Book appointments instantly with trusted specialists across the country</p>
        <Link href="/doctors" className="mt-8 inline-block rounded-full bg-white px-10 py-4 font-semibold text-[color:var(--teal)] hover:bg-[#e6f4f1]">
          Find a Doctor
        </Link>
      </section>
      {/* Specialties */}
      {specialties && specialties.length > 0 && (
        <section className="px-[5%] py-14">
          <h2 className="font-serif text-3xl font-bold text-[color:var(--teal)]">Browse by Specialty</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {specialties.map((s) => (
              <Link key={s.id} href={`/doctors?specialty=${s.id}`} className="rounded-full border border-[color:var(--border)] bg-white px-5 py-2 text-sm font-semibold text-[color:var(--teal)] hover:bg-[color:var(--teal-pale)]">
                {s.icon} {s.name}
              </Link>
            ))}
          </div>
        </section>
      )}
      {/* Featured */}
      <section className="px-[5%] py-14">
        <h2 className="font-serif text-3xl font-bold text-[color:var(--teal)]">Featured Doctors</h2>
        {isLoading ? (
          <p className="mt-6 text-[color:var(--text-muted)]">Loading...</p>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {doctors?.map((d) => <DoctorCard key={d.id} doctor={d} />)}
          </div>
        )}
        <div className="mt-10 text-center">
          <Link href="/doctors" className="rounded-full bg-[color:var(--teal)] px-8 py-3 font-semibold text-white hover:bg-[color:var(--teal-light)]">
            View All Doctors
          </Link>
        </div>
      </section>
    </div>
  );
}
