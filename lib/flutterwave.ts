import crypto from "node:crypto";

/**
 * Flutterwave payment integration.
 *
 * Flutterwave is a pan-African gateway that settles in ZMW, so a Zambian
 * student can pay in kwacha with mobile money or a card without converting
 * currency. That is why it is the gateway here rather than a card-only one.
 *
 * Three keys are involved:
 *   FLW_PUBLIC_KEY    — sent to the browser (not used yet: the hosted
 *                        checkout link means we never need it in the client)
 *   FLW_SECRET_KEY    — server only, creates a payment
 *   FLW_SECRET_HASH   — server only, verifies the webhook signature
 */

const FLW_API = "https://api.flutterwave.com/v3/payments";

export function isFlutterwaveConfigured() {
  return Boolean(process.env.FLW_SECRET_KEY && process.env.FLW_SECRET_HASH);
}

export type PaymentRequest = {
  txRef: string;
  amount: number; // major units (kwacha, not minor)
  currency: string;
  email: string;
  name: string;
  phone?: string | null;
  description: string;
  redirectUrl: string;
  orderId: number;
};

export type PaymentResult =
  | { ok: true; paymentUrl: string; flwReference: string }
  | { ok: false; error: string };

export async function createFlutterwavePayment(
  req: PaymentRequest,
): Promise<PaymentResult> {
  const secret = process.env.FLW_SECRET_KEY;
  if (!secret) {
    return { ok: false, error: "FLW_SECRET_KEY is not configured" };
  }

  const body = {
    tx_ref: req.txRef,
    amount: req.amount,
    currency: req.currency,
    redirect_url: req.redirectUrl,
    payment_options: "mobilemoney,card,banktransfer",
    customer: {
      email: req.email,
      name: req.name,
      phonenumber: req.phone ?? "",
    },
    customizations: {
      title: "Learn2Earn",
      description: req.description,
      logo: "",
    },
    meta: {
      order_id: String(req.orderId),
      source: "learn2earn",
    },
  };

  try {
    const res = await fetch(FLW_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const json = await res.json().catch(() => null);

    if (!res.ok || json?.status !== "success") {
      const message =
        json?.message ??
        json?.data?.message ??
        `Flutterwave returned ${res.status}`;
      return { ok: false, error: message };
    }

    const link = json?.data?.link;
    if (!link) {
      return { ok: false, error: "Flutterwave did not return a payment link" };
    }

    return {
      ok: true,
      paymentUrl: link,
      flwReference: String(json?.data?.id ?? ""),
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not reach Flutterwave",
    };
  }
}

/**
 * Flutterwave does NOT sign the webhook body with an HMAC.
 *
 * When you set a "secret hash" in the dashboard (Settings -> Webhooks),
 * Flutterwave echoes that exact value back on every callback in a
 * `verif-hash` header. Verification is therefore a constant-time comparison
 * of that header against FLW_SECRET_HASH — not a hash of the payload.
 *
 * Constant-time matters: a plain `===` leaks the correct prefix through
 * response timing, which is enough to recover the value byte by byte.
 */
export function verifyWebhookHash(headerValue: string | null): boolean {
  const secretHash = process.env.FLW_SECRET_HASH;
  if (!secretHash || !headerValue) return false;

  const expected = Buffer.from(secretHash, "utf8");
  const received = Buffer.from(headerValue, "utf8");
  if (expected.length !== received.length) return false;
  return crypto.timingSafeEqual(expected, received);
}

export type VerifiedTransaction = {
  id: number | string;
  status: string;
  amount: number; // major units, as Flutterwave reports it
  currency: string;
  txRef: string;
};

/**
 * Re-query the transaction before granting access.
 *
 * A secret hash proves the request came from Flutterwave, but it is a static
 * string: if it ever leaks, anyone can POST a convincing payload. Confirming
 * the transaction against Flutterwave's own API — status, amount, currency and
 * tx_ref — is what makes a forged webhook useless.
 */
export async function verifyFlutterwaveTransaction(
  transactionId: string | number,
): Promise<{ ok: true; tx: VerifiedTransaction } | { ok: false; error: string }> {
  const secret = process.env.FLW_SECRET_KEY;
  if (!secret) return { ok: false, error: "FLW_SECRET_KEY is not configured" };

  try {
    const res = await fetch(
      `https://api.flutterwave.com/v3/transactions/${encodeURIComponent(String(transactionId))}/verify`,
      {
        headers: { Authorization: `Bearer ${secret}` },
        cache: "no-store",
      },
    );

    const json = await res.json().catch(() => null);

    if (!res.ok || json?.status !== "success" || !json?.data) {
      return {
        ok: false,
        error: json?.message ?? `Flutterwave returned ${res.status}`,
      };
    }

    const d = json.data;
    return {
      ok: true,
      tx: {
        id: d.id,
        status: String(d.status ?? ""),
        amount: Number(d.amount ?? 0),
        currency: String(d.currency ?? ""),
        txRef: String(d.tx_ref ?? ""),
      },
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not reach Flutterwave",
    };
  }
}
