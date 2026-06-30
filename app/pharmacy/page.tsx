"use client";

import { useState, useMemo, type FormEvent } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  useGetMedicinesQuery,
  useCreateMedicineOrderMutation,
} from "@/store/fmdApi";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  selectCartItems,
  selectCartCount,
  selectCartTotal,
} from "@/store/cartSlice";
import { AppModal } from "@/components/common/AppModal";
import type { Medicine, MedicineListParams } from "@/types/domain";
import { isValidPhone, normalizePhoneInput } from "@/shared/lib/utils";

const PAGE_SIZE = 12;

export default function PharmacyPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const cartItems = useAppSelector(selectCartItems);
  const cartCount = useAppSelector(selectCartCount);
  const cartTotal = useAppSelector(selectCartTotal);

  const [params, setParams] = useState({ page: "1", limit: String(PAGE_SIZE), sort: "asc" as "asc" | "desc" });
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [showCart, setShowCart] = useState(false);

  // Checkout form
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const [createOrder] = useCreateMedicineOrderMutation();

  const queryParams = useMemo<MedicineListParams>(() => {
    const result: MedicineListParams = { page: params.page, limit: params.limit };
    if (search.trim()) result.search = search.trim();
    if (classFilter.trim()) result.class = classFilter.trim();
    if (companyFilter.trim()) result.company = companyFilter.trim();
    if (params.sort) result.sort = params.sort;
    return result;
  }, [search, classFilter, companyFilter, params]);

  const { data, isFetching, isLoading } = useGetMedicinesQuery(queryParams);
  const medicines = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const activePage = Number(params.page);

  function handleAddToCart(medicine: Medicine) {
    const price = typeof medicine.price === "string" ? parseFloat(medicine.price) : medicine.price;
    dispatch(addToCart({
      medicineId: medicine.id,
      name: medicine.name,
      price,
      company: medicine.company,
      stock: medicine.stock,
    }));
    toast.success(`${medicine.name} added to cart`);
  }

  async function handleCheckout(e: FormEvent) {
    e.preventDefault();
    if (!guestPhone.trim() || !address.trim()) {
      toast.error("Phone and address are required");
      return;
    }
    if (!isValidPhone(guestPhone)) {
      toast.error("Phone number must be exactly 11 digits.");
      return;
    }

    setIsProcessing(true);

    try {
      // Fake payment simulation
      toast.loading("Processing payment...");
      await new Promise((r) => setTimeout(r, 2000));
      toast.dismiss();
      toast.success("💳 Payment successful!");

      // Create orders for each cart item
      for (const item of cartItems) {
        await createOrder({
          medicineId: item.medicineId,
          quantity: item.quantity,
          guestName: guestName.trim() || undefined,
          guestPhone: guestPhone.trim(),
          address: address.trim(),
        }).unwrap();
      }

      toast.success(`✅ ${cartItems.length} order(s) placed! We will call ${guestPhone}`);
      dispatch(clearCart());
      setShowCart(false);
      setGuestName("");
      setGuestPhone("");
      setAddress("");
      router.push("/success");
    } catch (error: unknown) {
      toast.error((error as { data?: { message?: string } })?.data?.message ?? "Order failed");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-br from-green-600 to-emerald-700 py-10 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-white">💊 Online Pharmacy</h1>
            <p className="mt-2 text-sm sm:text-base text-white/80 max-w-xl mx-auto">Browse medicines, add to cart, and checkout with home delivery.</p>
          </div>

          {/* Filters */}
          <div className="mt-6 sm:mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-4">
            <input type="text" placeholder="Search medicines..." value={search}
              onChange={(e) => { setSearch(e.target.value); setParams((p) => ({ ...p, page: "1" })); }}
              className="w-full sm:w-64 rounded-xl border-0 bg-white/95 px-4 py-3 text-sm shadow-lg outline-none" />
            <input type="text" placeholder="Filter by class..." value={classFilter}
              onChange={(e) => { setClassFilter(e.target.value); setParams((p) => ({ ...p, page: "1" })); }}
              className="w-full sm:w-44 rounded-xl border-0 bg-white/95 px-4 py-3 text-sm shadow-lg outline-none" />
            <input type="text" placeholder="Filter by company..." value={companyFilter}
              onChange={(e) => { setCompanyFilter(e.target.value); setParams((p) => ({ ...p, page: "1" })); }}
              className="w-full sm:w-44 rounded-xl border-0 bg-white/95 px-4 py-3 text-sm shadow-lg outline-none" />
            <select value={params.sort} onChange={(e) => setParams((p) => ({ ...p, sort: e.target.value as "asc" | "desc", page: "1" }))}
              className="w-full sm:w-44 rounded-xl border-0 bg-white/95 px-4 py-3 text-sm shadow-lg outline-none">
              <option value="asc">Price: Low → High</option>
              <option value="desc">Price: High → Low</option>
            </select>
          </div>
        </div>
      </section>

      {/* Floating Cart Button */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 right-6 z-40">
          <button onClick={() => setShowCart(true)}
            className="flex items-center gap-3 rounded-2xl bg-green-600 px-6 py-4 text-white shadow-2xl shadow-green-600/30 hover:bg-green-700 transition">
            <span className="text-xl">🛒</span>
            <span className="font-semibold">{cartCount} items</span>
            <span className="bg-white/20 rounded-lg px-2 py-0.5 text-sm font-bold">৳{cartTotal.toFixed(2)}</span>
          </button>
        </div>
      )}

      {/* Grid */}
      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-6 text-sm text-gray-500">Showing {medicines.length} of {total} medicines</p>

          {isLoading || isFetching ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />
            </div>
          ) : medicines.length === 0 ? (
            <div className="rounded-2xl border bg-white p-12 text-center">
              <p className="text-3xl mb-3">🔍</p>
              <p className="text-gray-500">No medicines found.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {medicines.map((m) => {
                const price = typeof m.price === "string" ? parseFloat(m.price) : m.price;
                const inCart = cartItems.find((c) => c.medicineId === m.id);
                return (
                  <div key={m.id} className="flex flex-col rounded-2xl border bg-white shadow-sm overflow-hidden hover:shadow-lg transition">
                    <div className="h-1.5 bg-gradient-to-r from-green-400 to-emerald-500" />
                    <div className="flex flex-col flex-1 p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-2xl">💊</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${m.stock > 0 ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {m.stock > 0 ? `${m.stock} in stock` : "Out of stock"}
                        </span>
                      </div>
                      <h3 className="mt-3 font-semibold text-gray-900 line-clamp-1">{m.name}</h3>
                      <p className="text-xs text-gray-500">{m.company}</p>
                      {m.class && <span className="mt-2 inline-block text-xs px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 w-fit">{m.class}</span>}
                      <p className="mt-2 text-xs sm:text-sm text-gray-500 line-clamp-2 flex-1">{m.description}</p>
                      <div className="mt-4 flex items-end justify-between border-t pt-4">
                        <p className="text-xl font-bold text-green-600">৳{price.toFixed(2)}</p>
                        {inCart ? (
                          <div className="flex items-center gap-2">
                            <button onClick={() => inCart.quantity <= 1 ? dispatch(removeFromCart(m.id)) : dispatch(updateQuantity({ medicineId: m.id, quantity: inCart.quantity - 1 }))}
                              className="h-8 w-8 rounded-lg border text-sm font-bold">−</button>
                            <span className="text-sm font-semibold w-6 text-center">{inCart.quantity}</span>
                            <button onClick={() => dispatch(updateQuantity({ medicineId: m.id, quantity: inCart.quantity + 1 }))}
                              className="h-8 w-8 rounded-lg border text-sm font-bold">+</button>
                          </div>
                        ) : (
                          <button onClick={() => handleAddToCart(m)} disabled={m.stock <= 0}
                            className="rounded-lg bg-green-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50">
                            Add to Cart
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setParams((prev) => ({ ...prev, page: String(p) }))}
                  className={`h-10 w-10 rounded-lg text-sm font-medium transition ${p === activePage ? "bg-green-600 text-white" : "bg-white border text-gray-500 hover:border-green-300"}`}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Cart Modal */}
      <AppModal isOpen={showCart} onClose={() => setShowCart(false)} title={`🛒 Cart (${cartCount} items)`} size="lg"
        footer={
          <>
            <button onClick={() => setShowCart(false)} className="rounded-lg border px-4 py-2 text-sm">Continue Shopping</button>
            <button type="submit" form="checkout-form" disabled={isProcessing || cartItems.length === 0}
              className="rounded-lg bg-green-600 px-6 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50">
              {isProcessing ? "Processing..." : `💳 Pay ৳${cartTotal.toFixed(2)}`}
            </button>
          </>
        }>
        {cartItems.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Your cart is empty</p>
        ) : (
          <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4">
            {/* Cart Items */}
            <div className="space-y-3">
              {cartItems.map((item) => {
                const price = typeof item.price === "string" ? parseFloat(item.price) : item.price;
                return (
                  <div key={item.medicineId} className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 p-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.company} · ৳{price.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => item.quantity <= 1 ? dispatch(removeFromCart(item.medicineId)) : dispatch(updateQuantity({ medicineId: item.medicineId, quantity: item.quantity - 1 }))}
                        className="h-7 w-7 rounded border text-xs font-bold">−</button>
                      <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                      <button type="button" onClick={() => dispatch(updateQuantity({ medicineId: item.medicineId, quantity: item.quantity + 1 }))}
                        className="h-7 w-7 rounded border text-xs font-bold">+</button>
                      <button type="button" onClick={() => dispatch(removeFromCart(item.medicineId))}
                        className="ml-2 text-red-500 text-xs hover:underline">✕</button>
                    </div>
                    <p className="font-semibold text-sm w-20 text-right">৳{(price * item.quantity).toFixed(2)}</p>
                  </div>
                );
              })}
            </div>

            <div className="rounded-xl bg-green-50 p-4 flex justify-between items-center">
              <span className="font-semibold">Total</span>
              <span className="text-2xl font-bold text-green-600">৳{cartTotal.toFixed(2)}</span>
            </div>

            <hr />

            {/* Customer Info */}
            <div>
              <label className="block text-sm font-medium mb-1">Your Name</label>
              <input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Optional" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number *</label>
              <input type="tel" inputMode="numeric" maxLength={11} required value={guestPhone} onChange={(e) => setGuestPhone(normalizePhoneInput(e.target.value))}
                className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="+880 1XXX-XXXXXX" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Delivery Address *</label>
              <textarea required value={address} onChange={(e) => setAddress(e.target.value)} rows={2}
                className="w-full rounded-lg border px-3 py-2 text-sm resize-none" placeholder="Full address" />
            </div>


          </form>
        )}
      </AppModal>
    </div>
  );
}
