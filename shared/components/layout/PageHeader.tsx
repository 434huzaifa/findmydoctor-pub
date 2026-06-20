"use client";

import { cn } from "@/shared/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PageHeaderProps {
  icon?: string;
  title: string;
  subtitle?: string;
  gradient?: string;
  children?: React.ReactNode;
  className?: string;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function PageHeader({
  icon,
  title,
  subtitle,
  gradient = "from-[color:var(--teal)] to-[color:var(--teal-light)]",
  children,
  className,
}: PageHeaderProps) {
  return (
    <section
      className={cn(
        "bg-gradient-to-br py-10 sm:py-16",
        gradient,
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {icon && (
            <span className="text-3xl sm:text-4xl mb-2 inline-block">
              {icon}
            </span>
          )}
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm sm:text-base text-white/80 max-w-xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {children && (
          <div className="mt-6 sm:mt-8">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Hero Header ────────────────────────────────────────────────────────────

export interface HeroHeaderProps {
  badge?: string;
  title: React.ReactNode;
  subtitle?: string;
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  className?: string;
}

export function HeroHeader({
  badge,
  title,
  subtitle,
  primaryAction,
  secondaryAction,
  className,
}: HeroHeaderProps) {
  return (
    <section className={cn("relative overflow-hidden", className)}>
      {/* Background pattern */}
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
          {badge && (
            <div className="mb-6 inline-flex items-center rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
              {badge}
            </div>
          )}

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">
            {title}
          </h1>

          {subtitle && (
            <p className="mx-auto mt-4 sm:mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-white/80">
              {subtitle}
            </p>
          )}

          {(primaryAction || secondaryAction) && (
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              {primaryAction}
              {secondaryAction}
            </div>
          )}
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" className="w-full">
          <path
            d="M0 120L60 105C120 90 240 60 360 52.5C480 45 600 60 720 67.5C840 75 960 75 1080 67.5C1200 60 1320 45 1380 37.5L1440 30V120H0Z"
            fill="#f7fcfa"
          />
        </svg>
      </div>
    </section>
  );
}
