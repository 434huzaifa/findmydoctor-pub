"use client";

import Link from "next/link";
import { Card, CardFooter } from "@/shared/components/ui/Card";
import { AvailabilityBadge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { formatCurrency } from "@/shared/lib/utils";
import { ROUTES } from "@/shared/constants";
import type { Doctor } from "../types";

export interface DoctorCardProps {
  doctor: Doctor;
  compact?: boolean;
}

export function DoctorCard({ doctor, compact = false }: DoctorCardProps) {
  return (
    <Link href={ROUTES.booking(doctor.id)} className="block group">
      <Card hover className="flex flex-col h-full">
        <div className="h-1.5 bg-gradient-to-r from-blue-400 to-indigo-500 -mx-4 sm:-mx-5 -mt-4 sm:-mt-5 mb-4" />

        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-2xl shrink-0">
            {doctor.specialty?.icon || "👨‍⚕️"}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {doctor.name}
            </h3>
            <p className="text-xs text-gray-500">{doctor.specialty?.name}</p>
            {!compact && <p className="text-xs text-gray-400 truncate">{doctor.degrees}</p>}
          </div>
          <AvailabilityBadge used={doctor.usedSeats} total={doctor.totalSeats} />
        </div>

        {/* Details */}
        {!compact && (
          <div className="mt-4 space-y-2 text-sm text-gray-500">
            <DetailRow icon="🏥" text={doctor.hospital} />
            <DetailRow
              icon="📍"
              text={
                <>
                  {doctor.city}
                  {doctor.roomNumber && (
                    <span className="ml-1 text-blue-600 font-medium">· Room: {doctor.roomNumber}</span>
                  )}
                </>
              }
            />
            <DetailRow icon="⭐" text={`${doctor.rating} · ${doctor.exp} years exp`} />
            {doctor.isOnlineForVideo && (
              <div className="flex items-center gap-2 text-green-600">
                <span className="animate-pulse">🟢</span>
                <span className="font-medium">Online for Video Calls</span>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <CardFooter className="mt-auto">
          <div>
            <p className="text-xl font-bold text-blue-600">{formatCurrency(doctor.fee)}</p>
            {doctor.advanceFee > 0 && (
              <p className="text-xs text-gray-400">Advance: {formatCurrency(doctor.advanceFee)}</p>
            )}
          </div>
          <Button size="sm">Book Now</Button>
        </CardFooter>
      </Card>
    </Link>
  );
}

function DetailRow({ icon, text }: { icon: string; text: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span>{icon}</span>
      <span className="truncate">{text}</span>
    </div>
  );
}

export function DoctorCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <div className="h-1.5 bg-gray-200 -mx-4 sm:-mx-5 -mt-4 sm:-mt-5 mb-4" />
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 rounded-full bg-gray-200" />
        <div className="flex-1">
          <div className="h-4 w-2/3 bg-gray-200 rounded" />
          <div className="h-3 w-1/3 bg-gray-200 rounded mt-2" />
        </div>
        <div className="h-5 w-16 bg-gray-200 rounded-full" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full bg-gray-200 rounded" />
        <div className="h-3 w-3/4 bg-gray-200 rounded" />
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
        <div className="h-6 w-20 bg-gray-200 rounded" />
        <div className="h-8 w-24 bg-gray-200 rounded-lg" />
      </div>
    </Card>
  );
}
