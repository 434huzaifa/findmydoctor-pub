import Link from "next/link";

const services = [
  {
    icon: "🩺",
    title: "Find Doctors",
    desc: "Browse specialists, check availability, and book appointments online.",
    href: "/doctors",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: "💊",
    title: "Pharmacy",
    desc: "Order medicines online with home delivery. No prescription hassle.",
    href: "/pharmacy",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: "🚑",
    title: "Ambulance",
    desc: "Emergency ambulance dispatch with real-time availability tracking.",
    href: "/ambulances",
    color: "bg-red-50 text-red-600",
  },
  {
    icon: "🏠",
    title: "Home Doctor",
    desc: "Request emergency doctor home visits. Pay online, get treated at home.",
    href: "/doctor-home-service",
    color: "bg-purple-50 text-purple-600",
  },
];

const stats = [
  { value: "500+", label: "Doctors", href: "/doctors" },
  { value: "50K+", label: "Patients", href: "/testimonials" },
  { value: "100+", label: "Medicines", href: "/pharmacy" },
  { value: "24/7", label: "Support", href: "/support" },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[color:var(--teal)] via-[#0d5a46] to-[#0a4436]">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
              🏥 Bangladesh&apos;s Healthcare Platform
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">
              Healthcare Made
              <br />
              <span className="text-[color:var(--teal-pale)]">Simple & Accessible</span>
            </h1>
            <p className="mx-auto mt-4 sm:mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-white/80">
              Find doctors, book appointments, order medicines, and access
              emergency services — all from one platform.
            </p>
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link
                href="/doctors"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 sm:px-7 py-3 sm:py-3.5 text-sm font-semibold text-[color:var(--teal)] shadow-lg transition hover:bg-[color:var(--teal-pale)]"
              >
                Find a Doctor
                <span>→</span>
              </Link>
              <Link
                href="/pharmacy"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 px-6 sm:px-7 py-3 sm:py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                Order Medicine
              </Link>
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            className="w-full"
          >
            <path
              d="M0 120L60 105C120 90 240 60 360 52.5C480 45 600 60 720 67.5C840 75 960 75 1080 67.5C1200 60 1320 45 1380 37.5L1440 30V120H0Z"
              fill="#f7fcfa"
            />
          </svg>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#f7fcfa] py-8 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
            {stats.map((stat) => (
              <Link
                key={stat.label}
                href={stat.href}
                className="rounded-2xl border border-[color:var(--border)] bg-white p-4 sm:p-6 text-center shadow-sm transition hover:shadow-md hover:border-[color:var(--teal)]"
              >
                <p className="text-2xl sm:text-3xl font-extrabold text-[color:var(--teal)]">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs sm:text-sm font-medium text-[color:var(--text-muted)]">
                  {stat.label}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[color:var(--text)]">
              Our Services
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[color:var(--text-muted)]">
              Everything you need for your healthcare journey
            </p>
          </div>
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <Link
                key={service.title}
                href={service.href}
                className="group flex flex-col rounded-2xl border border-[color:var(--border)] bg-white p-5 sm:p-6 shadow-sm transition hover:shadow-lg hover:border-[color:var(--teal-light)]"
              >
                <div
                  className={`mb-4 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl text-2xl sm:text-3xl ${service.color}`}
                >
                  {service.icon}
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-[color:var(--text)] group-hover:text-[color:var(--teal)]">
                  {service.title}
                </h3>
                <p className="mt-2 flex-1 text-xs sm:text-sm leading-relaxed text-[color:var(--text-muted)]">
                  {service.desc}
                </p>
                <div className="mt-4 text-xs sm:text-sm font-medium text-[color:var(--teal)] flex items-center gap-1 group-hover:gap-2 transition-all">
                  Learn more <span>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[color:var(--teal)] py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
            Need Emergency Care?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm sm:text-base text-white/80">
            Our emergency services are available 24/7. Request an ambulance or
            home doctor visit instantly.
          </p>
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/ambulances"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-6 sm:px-7 py-3 sm:py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-red-600"
            >
              🚑 Call Ambulance
            </Link>
            <Link
              href="/doctor-home-service"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 sm:px-7 py-3 sm:py-3.5 text-sm font-semibold text-[color:var(--teal)] transition hover:bg-[color:var(--teal-pale)]"
            >
              🏠 Home Doctor Visit
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
