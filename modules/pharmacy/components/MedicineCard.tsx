"use client";

import { Card, CardFooter } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { formatPrice } from "@/shared/lib/utils";
import { isInStock, getStockStatus, type Medicine } from "../types";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface MedicineCardProps {
  medicine: Medicine;
  onBuy: (medicine: Medicine) => void;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function MedicineCard({ medicine, onBuy }: MedicineCardProps) {
  const inStock = isInStock(medicine);
  const stockStatus = getStockStatus(medicine);

  return (
    <Card hover className="flex flex-col h-full">
      {/* Top accent */}
      <div className="h-1.5 bg-gradient-to-r from-green-400 to-emerald-500 -mx-4 sm:-mx-5 -mt-4 sm:-mt-5 mb-4" />

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-2xl">💊</span>
        <StockBadge status={stockStatus} stock={medicine.stock} />
      </div>

      {/* Details */}
      <div className="mt-3">
        <h3 className="font-semibold text-gray-900 line-clamp-1">
          {medicine.name}
        </h3>
        <p className="text-xs text-gray-500">{medicine.company}</p>

        {medicine.class && (
          <Badge variant="waiting" size="sm" className="mt-2">
            {medicine.class}
          </Badge>
        )}

        <p className="mt-2 text-xs sm:text-sm text-gray-500 line-clamp-2 flex-1">
          {medicine.description}
        </p>
      </div>

      {/* Footer */}
      <CardFooter className="mt-auto">
        <p className="text-xl font-bold text-green-600">
          {formatPrice(medicine.price)}
        </p>
        <Button
          size="sm"
          variant="success"
          onClick={() => onBuy(medicine)}
          disabled={!inStock}
        >
          Buy Now
        </Button>
      </CardFooter>
    </Card>
  );
}

// ─── Stock Badge ────────────────────────────────────────────────────────────

function StockBadge({ 
  status, 
  stock 
}: { 
  status: "in-stock" | "low-stock" | "out-of-stock";
  stock: number;
}) {
  if (status === "out-of-stock") {
    return <Badge variant="full" size="sm">Out of stock</Badge>;
  }

  if (status === "low-stock") {
    return <Badge variant="limited" size="sm">Only {stock} left</Badge>;
  }

  return <Badge variant="available" size="sm">{stock} in stock</Badge>;
}

// ─── Skeleton ───────────────────────────────────────────────────────────────

export function MedicineCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <div className="h-1.5 bg-gray-200 -mx-4 sm:-mx-5 -mt-4 sm:-mt-5 mb-4" />
      
      <div className="flex justify-between">
        <div className="h-8 w-8 bg-gray-200 rounded" />
        <div className="h-5 w-20 bg-gray-200 rounded-full" />
      </div>
      
      <div className="mt-3 space-y-2">
        <div className="h-4 w-3/4 bg-gray-200 rounded" />
        <div className="h-3 w-1/2 bg-gray-200 rounded" />
        <div className="h-5 w-16 bg-gray-200 rounded-md mt-2" />
        <div className="h-10 w-full bg-gray-200 rounded mt-2" />
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
        <div className="h-6 w-16 bg-gray-200 rounded" />
        <div className="h-8 w-20 bg-gray-200 rounded-lg" />
      </div>
    </Card>
  );
}
