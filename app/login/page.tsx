"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLoginMutation } from "@/store/fmdApi";
import { setCredentials } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const router = useRouter();
  const [login, { isLoading, error }] = useLoginMutation();
  const [form, setForm] = useState({ email: "", password: "" });
  useEffect(() => {
    if (user)
      router.replace(user.role === "admin" ? "/admin" : "/doctor-dashboard");
  }, [user, router]);
  if (user) return null;
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const result = await login(form).unwrap();
      dispatch(
        setCredentials({ user: result.user, token: result.accessToken }),
      );
      router.push(
        result.user.role === "admin" ? "/admin" : "/doctor-dashboard",
      );
    } catch {}
  }
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-[color:var(--border)] bg-white p-8 shadow-lg">
        <h1 className="font-serif text-3xl font-black text-[color:var(--teal)]">
          Staff Sign In
        </h1>
        <p className="mt-1 text-sm text-[color:var(--text-muted)]">
          For doctors and administrators
        </p>
        {error && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {"data" in error
              ? ((error.data as { message?: string })?.message ??
                "Login failed")
              : "Login failed"}
          </p>
        )}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-semibold text-[color:var(--text)]">
            Email
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 block w-full rounded-xl border border-[color:var(--border)] px-4 py-3 text-sm focus:border-[color:var(--teal)] focus:outline-none"
            />
          </label>
          <label className="block text-sm font-semibold text-[color:var(--text)]">
            Password
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-1 block w-full rounded-xl border border-[color:var(--border)] px-4 py-3 text-sm focus:border-[color:var(--teal)] focus:outline-none"
            />
          </label>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-[color:var(--teal)] py-3 font-semibold text-white hover:bg-[color:var(--teal-light)] disabled:opacity-60"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
