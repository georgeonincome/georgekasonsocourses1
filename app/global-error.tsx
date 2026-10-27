"use client";

// global-error replaces the ROOT LAYOUT when it activates, so it must supply
// its own <html> and <body> and import the global stylesheet — anything the
// root layout normally provides is gone at this point.
//
// This is the last resort: it fires when the root layout itself throws, which
// no other boundary can catch. Keep it dependency-light. Do not import server
// components here (SiteHeader, SiteFooter) — they rely on headers()/auth() and
// would fail in this position.
import { useEffect } from "react";

import "./globals.css";

const FONT_STACK =
  '"Outfit", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';

type GlobalErrorProps = {
  error: unknown;
  retry: () => void;
};

export default function GlobalError({ error, retry }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#0b111d",
          color: "#ffffff",
          fontFamily: FONT_STACK,
          lineHeight: 1.7,
          WebkitFontSmoothing: "antialiased",
        }}
      >
        <main
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "80px 24px",
          }}
        >
          <div style={{ maxWidth: "40rem" }}>
            <p
              style={{
                color: "#f1911d",
                fontSize: "0.78rem",
                fontWeight: 500,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                margin: "0 0 14px",
              }}
            >
              Site error
            </p>

            <h1
              style={{
                fontSize: "clamp(1.7rem, 4.5vw, 2.6rem)",
                fontWeight: 600,
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                margin: "0 0 20px",
              }}
            >
              The site hit a problem it could not recover from.
            </h1>

            <p
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: "1.02rem",
                margin: "0 0 36px",
              }}
            >
              This is a fault on our side. Nothing you paid for is at risk —
              reload the page, and if it comes back, tell me and I will find it
              in the logs.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
              <button
                type="button"
                onClick={() => retry()}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "9px",
                  padding: "13px 26px",
                  borderRadius: "10px",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  border: "1.5px solid transparent",
                  cursor: "pointer",
                  background: "#f1911d",
                  color: "#0b1114",
                }}
              >
                Reload the site
              </button>

              <a
                href="/"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "9px",
                  padding: "13px 26px",
                  borderRadius: "10px",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  border: "1.5px solid rgba(255,255,255,0.45)",
                  color: "#ffffff",
                  textDecoration: "none",
                  background: "transparent",
                }}
              >
                Go to the home page
              </a>
            </div>

            <p
              style={{
                marginTop: "40px",
                fontSize: "0.92rem",
                color: "rgba(255,255,255,0.55)",
              }}
            >
              Keeps happening?{" "}
              <a
                href="https://wa.me/260979982819?text=Hi%20George%2C%20your%20courses%20site%20keeps%20showing%20a%20site%20error."
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#f1911d", fontWeight: 500 }}
              >
                Message me on WhatsApp
              </a>
              .
            </p>
          </div>
        </main>
      </body>
    </html>
  );
}
