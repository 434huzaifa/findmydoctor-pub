"use client";

import { type FormEvent } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { Input, Textarea } from "@/shared/components/ui/Input";
import { Button } from "@/shared/components/ui/Button";
import { formatPrice } from "@/shared/lib/utils";
import type { Medicine, MedicineOrderForm } from "../types";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface MedicineOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicine: Medicine | null;
  form: Omit<MedicineOrderForm, "medicineId">;
  onFormChange: <K extends keyof Omit<MedicineOrderForm, "medicineId">>(
    key: K,
    value: MedicineOrderForm[K]
  ) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function MedicineOrderModal({
  isOpen,
  onClose,
  medicine,
  form,
  onFormChange,
  onSubmit,
  isLoading,
}: MedicineOrderModalProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  if (!medicine) return null;

  const subtotal = medicine.price * form.quantity;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Order ${medicine.name}`}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={onSubmit}
            isLoading={isLoading}
          >
            Place Order
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Medicine Summary */}
        <MedicineSummary medicine={medicine} />

        {/* Quantity */}
        <Input
          label="Quantity"
          type="number"
          min={1}
          max={medicine.stock}
          value={form.quantity}
          onChange={(e) => onFormChange("quantity", Number(e.target.value))}
          hint={`Available: ${medicine.stock}`}
        />

        {/* Name */}
        <Input
          label="Your Name"
          value={form.guestName}
          onChange={(e) => onFormChange("guestName", e.target.value)}
          placeholder="John Doe"
        />

        {/* Phone */}
        <Input
          label="Phone Number"
          type="tel"
          required
          value={form.guestPhone}
          onChange={(e) => onFormChange("guestPhone", e.target.value)}
          placeholder="+880 1XXX-XXXXXX"
        />

        {/* Address */}
        <Textarea
          label="Delivery Address"
          required
          rows={2}
          value={form.address}
          onChange={(e) => onFormChange("address", e.target.value)}
          placeholder="House #, Road #, Area, City"
        />

        {/* Payment Method */}
        <PaymentMethodSelector
          value={form.paymentMethod}
          onChange={(value) => onFormChange("paymentMethod", value)}
        />

        {/* Subtotal */}
        <div className="rounded-lg bg-gray-50 p-3">
          <div className="flex justify-between text-sm">
            <span>Subtotal ({form.quantity}x)</span>
            <span className="font-semibold">{formatPrice(subtotal)}</span>
          </div>
        </div>
      </form>
    </Modal>
  );
}

// ─── Sub Components ─────────────────────────────────────────────────────────

function MedicineSummary({ medicine }: { medicine: Medicine }) {
  return (
    <div className="rounded-xl bg-green-50 p-4">
      <p className="font-semibold text-gray-900">{medicine.name}</p>
      <p className="text-sm text-gray-600">
        {medicine.company} · {medicine.class}
      </p>
      <p className="mt-2 text-xl font-bold text-green-600">
        {formatPrice(medicine.price)}
      </p>
    </div>
  );
}

function PaymentMethodSelector({
  value,
  onChange,
}: {
  value: "online" | "cash";
  onChange: (value: "online" | "cash") => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Payment Method
      </label>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={value === "online"}
            onChange={() => onChange("online")}
            className="text-green-600"
          />
          <span className="text-sm">Online (Mock)</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={value === "cash"}
            onChange={() => onChange("cash")}
            className="text-green-600"
          />
          <span className="text-sm">Cash on Delivery</span>
        </label>
      </div>
    </div>
  );
}
