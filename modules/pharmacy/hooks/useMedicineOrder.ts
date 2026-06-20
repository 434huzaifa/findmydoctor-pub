"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCreateMedicineOrderMutation } from "@/store/fmdApi";
import { useAppDispatch } from "@/store/hooks";
import { setMedicineOrderInfo } from "@/store/bookingSlice";
import { ROUTES } from "@/shared/constants";
import { delay } from "@/shared/lib/utils";
import type { Medicine, MedicineOrderForm } from "../types";

// ─── Types ──────────────────────────────────────────────────────────────────

interface UseMedicineOrderReturn {
  // State
  selectedMedicine: Medicine | null;
  isModalOpen: boolean;
  isOrdering: boolean;
  
  // Form state
  form: Omit<MedicineOrderForm, "medicineId">;
  setFormField: <K extends keyof Omit<MedicineOrderForm, "medicineId">>(
    key: K,
    value: MedicineOrderForm[K]
  ) => void;
  
  // Actions
  openOrderModal: (medicine: Medicine) => void;
  closeOrderModal: () => void;
  submitOrder: () => Promise<void>;
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useMedicineOrder(): UseMedicineOrderReturn {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const [createOrder, { isLoading: isOrdering }] = useCreateMedicineOrderMutation();
  
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [form, setForm] = useState<Omit<MedicineOrderForm, "medicineId">>({
    quantity: 1,
    guestName: "",
    guestPhone: "",
    address: "",
    paymentMethod: "online",
  });

  const isModalOpen = !!selectedMedicine;

  const setFormField = <K extends keyof Omit<MedicineOrderForm, "medicineId">>(
    key: K,
    value: MedicineOrderForm[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setForm({
      quantity: 1,
      guestName: "",
      guestPhone: "",
      address: "",
      paymentMethod: "online",
    });
  };

  const openOrderModal = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    resetForm();
  };

  const closeOrderModal = () => {
    setSelectedMedicine(null);
    resetForm();
  };

  const submitOrder = async () => {
    if (!selectedMedicine) return;

    try {
      // Simulate online payment
      if (form.paymentMethod === "online") {
        toast.loading("Processing payment...");
        await delay(1500);
        toast.dismiss();
        toast.success("Payment successful!");
      }

      const result = await createOrder({
        medicineId: selectedMedicine.id,
        quantity: form.quantity,
        guestName: form.guestName.trim() || undefined,
        guestPhone: form.guestPhone.trim(),
        address: form.address.trim(),
      }).unwrap();

      dispatch(setMedicineOrderInfo(result));
      toast.success(`Order placed! We will call you at ${form.guestPhone}`);
      closeOrderModal();
      router.push(ROUTES.success);
    } catch (error: unknown) {
      const message = 
        (error as { data?: { message?: string } })?.data?.message ??
        "Failed to place order";
      toast.error(message);
    }
  };

  return {
    selectedMedicine,
    isModalOpen,
    isOrdering,
    form,
    setFormField,
    openOrderModal,
    closeOrderModal,
    submitOrder,
  };
}
