import { cert, getApps, getApp, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";

/**
 * Server-side Firebase Admin SDK.
 *
 * Firebase is the identity provider here; this app's own database stays the
 * source of truth for courses, orders and enrolments. That split is why the
 * SDK is loaded lazily — nothing is initialised at import time, so this module
 * can sit in the auth config without touching the client bundle or paying the
 * cost on requests that never sign in.
 *
 * Uses the `georgelearn2earn` project — the $100 Guy brand project, the same
 * one ShopZed runs on.
 */

let app: App | undefined;
let authInstance: Auth | undefined;

export function isFirebaseAdminConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_ADMIN_PROJECT_ID &&
      process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
      process.env.FIREBASE_ADMIN_PRIVATE_KEY,
  );
}

/**
 * A .env value cannot contain a real newline, so the service-account key is
 * stored with the two characters `\` and `n` where the PEM line breaks go.
 * It has to be unescaped before Node will parse it.
 */
function normalizePrivateKey(key: string): string {
  if (key.includes("\n")) return key.replace(/\r\n/g, "\n");
  return key.replace(/\\n/g, "\n").replace(/\r\n/g, "\n");
}

function getAdminApp(): App {
  if (app) return app;

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID!;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL!;
  const privateKey = normalizePrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY!);

  // Reuse an existing app if one was initialised elsewhere, otherwise start one
  // under a named handle so a second initialiseApp() can never throw.
  app = getApps().length
    ? getApp()
    : initializeApp(
        { credential: cert({ projectId, clientEmail, privateKey }), projectId },
        "courses-admin",
      );

  return app;
}

export function getAdminAuth(): Auth {
  if (!authInstance) authInstance = getAuth(getAdminApp());
  return authInstance;
}

export type FirebaseIdentity = {
  uid: string;
  email: string | null;
  name: string | null;
  picture: string | null;
  provider: string | null;
};

/**
 * Verify the ID token the browser got from Firebase and turn it into an
 * identity we can trust.
 *
 * `checkRevoked` matters: without it a token stolen before the user signed out
 * would still be accepted. Verification also confirms the token was issued for
 * this Firebase project, so a token from somebody else's project is rejected.
 */
export async function verifyFirebaseIdToken(
  idToken: string,
): Promise<FirebaseIdentity | null> {
  if (!isFirebaseAdminConfigured() || !idToken) return null;

  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken, true);

    return {
      uid: decoded.uid,
      email: decoded.email ?? null,
      name: decoded.name ?? null,
      picture: decoded.picture ?? null,
      provider: decoded.firebase?.sign_in_provider ?? null,
    };
  } catch {
    // Expired, malformed, revoked, or issued for another project. Every one of
    // these is a refusal to sign in — never leak which.
    return null;
  }
}
