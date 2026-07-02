"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import type { AuthUser } from "@/types/domain";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("admin" | "doctor")[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles = ["admin", "doctor"],
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user) as AuthUser | null;

  useEffect(() => {
    if (!user) {
      router.replace(redirectTo);
      return;
    }

    if (!allowedRoles.includes(user.role as any)) {
      router.replace("/login");
    }
  }, [user, allowedRoles, router, redirectTo]);

  if (!user || !allowedRoles.includes(user.role as any)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-teal-600" />
          <p className="text-sm text-gray-500">Checking access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
