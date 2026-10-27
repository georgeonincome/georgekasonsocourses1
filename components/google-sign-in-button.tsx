"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

import {
  isFirebaseClientConfigured,
  signInWithGoogle,
} from "@/lib/firebase-client";

/**
 * "Continue with Google", brokered by Firebase.
 *
 * The popup proves the student owns a Google account; Firebase returns an ID
 * token; that token is handed to NextAuth's `firebase` provider, which verifies
 * it with the Admin SDK before any session exists. The browser never decides
 * anything — it only carries the proof.
 */
export function GoogleSignInButton({ next = "/dashboard" }: { next?: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Nothing to render if the Firebase web config is missing. Silently dropping
  // the button is better than showing one that cannot work.
  if (!isFirebaseClientConfigured()) return null;

  async function handleGoogle() {
    if (busy) return;
    setBusy(true);
    setError(null);

    const result = await signInWithGoogle();

    if (!result.ok) {
      // A closed popup is the student changing their mind, not a failure worth
      // scolding them for.
      if (result.reason !== "cancelled") {
        setError(
          "Google sign-in did not complete. Try again, or use your email and password.",
        );
      }
      setBusy(false);
      return;
    }

    const session = await signIn("firebase", {
      idToken: result.idToken,
      redirect: false,
      callbackUrl: next,
    });

    if (session?.error) {
      setError("Google confirmed you, but a session could not be started. Try again.");
      setBusy(false);
      return;
    }

    window.location.assign(next);
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleGoogle}
        disabled={busy}
        className="btn btn-ghost w-full disabled:opacity-60"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.57c2.08-1.92 3.27-4.74 3.27-8.09Z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.76c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.6 10.6 0 0 0 12 1a11 11 0 0 0-9.82 6.05l3.66 2.84C6.71 6.68 9.71 4.75 12 4.75Z"
          />
        </svg>
        {busy ? "Opening Google…" : "Continue with Google"}
      </button>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-[0.9rem] text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
