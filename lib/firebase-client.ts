"use client";

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  type Auth,
} from "firebase/auth";

/**
 * Browser-side Firebase SDK.
 *
 * Firebase only handles "prove this person owns a Google account". It hands
 * back an ID token, which is posted to NextAuth, which verifies it with the
 * Admin SDK and starts a session in this app's own database. Firebase never
 * sees an enrolment, an order or a kwacha.
 */

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

/** The three values that must be present for the browser SDK to start at all. */
export function isFirebaseClientConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId,
  );
}

let app: FirebaseApp | undefined;

function getFirebaseAuth(): Auth {
  if (!app) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }
  return getAuth(app);
}

export type GoogleSignInResult =
  | { ok: true; idToken: string }
  | { ok: false; reason: "not-configured" | "cancelled" | "failed" };

/**
 * Run the Google popup and return the ID token.
 *
 * The popup is used rather than a redirect because it keeps the student on the
 * page they were on — no round trip through Firebase's own domain, and no
 * losing the course they were looking at.
 */
export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  if (!isFirebaseClientConfigured()) return { ok: false, reason: "not-configured" };

  try {
    const provider = new GoogleAuthProvider();
    // Always show the account picker: a student with more than one Google
    // account should choose, not be silently signed in as the wrong one.
    provider.setCustomParameters({ prompt: "select_account" });

    const credential = await signInWithPopup(getFirebaseAuth(), provider);
    const idToken = await credential.user.getIdToken();

    return { ok: true, idToken };
  } catch (error) {
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? String((error as { code?: unknown }).code)
        : "";

    // The student closed the popup. That is not an error worth telling them off
    // for, so it is reported as a plain cancellation.
    if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
      return { ok: false, reason: "cancelled" };
    }
    return { ok: false, reason: "failed" };
  }
}
