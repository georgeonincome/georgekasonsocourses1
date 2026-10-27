"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";

import { GoogleSignInButton } from "@/components/google-sign-in-button";

type Mode = "login" | "register";

export function AuthForm({
  mode,
  next = "/dashboard",
  googleEnabled = false,
}: {
  mode: Mode;
  next?: string;
  googleEnabled?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    try {
      if (mode === "register") {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name, email, password, phone }),
        });
        const body = await res.json().catch(() => null);
        if (!res.ok) {
          setError(body?.error ?? "Could not create that account.");
          setBusy(false);
          return;
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(
          mode === "register"
            ? "That account could not be signed into. Check your password and try again."
            : "That email and password do not match.",
        );
        setBusy(false);
        return;
      }

      window.location.assign(next);
    } catch {
      setError("Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div>
      {googleEnabled && (
        <>
          <GoogleSignInButton next={next} />
          <div className="my-6 flex items-center gap-4">
            <span className="h-px flex-1 bg-line" />
            <span className="text-[0.82rem] uppercase tracking-[0.12em] text-muted">
              or
            </span>
            <span className="h-px flex-1 bg-line" />
          </div>
        </>
      )}

      <form onSubmit={onSubmit} className="space-y-5">
        {mode === "register" && (
          <label className="block">
            <span className="text-[0.9rem] font-medium">Full name</span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-line bg-white px-4 py-3 text-[0.95rem] outline-none focus:border-gold"
              placeholder="George Kasonso"
              autoComplete="name"
            />
          </label>
        )}

        <label className="block">
          <span className="text-[0.9rem] font-medium">Email</span>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-line bg-white px-4 py-3 text-[0.95rem] outline-none focus:border-gold"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </label>

        {mode === "register" && (
          <label className="block">
            <span className="text-[0.9rem] font-medium">
              Phone{" "}
              <span className="font-normal text-muted">(optional)</span>
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-line bg-white px-4 py-3 text-[0.95rem] outline-none focus:border-gold"
              placeholder="+260 …"
              autoComplete="tel"
            />
          </label>
        )}

        <label className="block">
          <span className="text-[0.9rem] font-medium">Password</span>
          <input
            required
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-line bg-white px-4 py-3 text-[0.95rem] outline-none focus:border-gold"
            placeholder={mode === "register" ? "At least 8 characters" : "Your password"}
            autoComplete={mode === "register" ? "new-password" : "current-password"}
          />
        </label>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-[0.9rem] text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="btn btn-gold w-full disabled:opacity-60"
        >
          {busy
            ? mode === "register"
              ? "Creating your account…"
              : "Signing you in…"
            : mode === "register"
              ? "Create my account"
              : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-[0.92rem] text-muted">
        {mode === "login" ? (
          <>
            No account yet?{" "}
            <Link
              href={`/register?next=${encodeURIComponent(next)}`}
              className="font-semibold text-gold-600 hover:text-gold"
            >
              Register as a student
            </Link>
          </>
        ) : (
          <>
            Already registered?{" "}
            <Link
              href={`/login?next=${encodeURIComponent(next)}`}
              className="font-semibold text-gold-600 hover:text-gold"
            >
              Sign in instead
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
