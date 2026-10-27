import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AuthForm } from "@/components/auth-form";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = pageMeta({
  title: "Sign In",
  description: "Sign in to The $100 Guy courses platform.",
  path: "/login",
  noindex: true,
});

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const target = next && next.startsWith("/") ? next : "/dashboard";

  const session = await auth();
  if (session?.user) redirect(target);

  return (
    <div className="section">
      <div className="wrap grid gap-12 lg:grid-cols-[1fr_440px]">
        <div className="max-w-xl">
          <span className="eyebrow">Welcome back</span>
          <h1 className="h-display text-[2.1rem] sm:text-[2.6rem]">
            Sign in to keep learning
          </h1>
          <p className="mt-4 text-[1.02rem] leading-relaxed text-muted">
            Your courses, your progress and your certificate are all waiting
            where you left them.
          </p>

          <ul className="mt-8 space-y-3.5 text-[0.96rem] text-muted">
            {[
              "Every course you have enrolled in, in one place",
              "Your lesson progress, saved as you go",
              "Certificates issued the moment you finish",
              "New lessons and bonus sessions added free",
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-7">
          <h2 className="text-[1.25rem] font-semibold">Sign in</h2>
          <p className="mt-1.5 text-[0.92rem] text-muted">
            Use the email you registered with.
          </p>

          {error && (
            <p className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-[0.9rem] text-red-700">
              We could not sign you in. Check your details and try again.
            </p>
          )}

          <div className="mt-6">
            <AuthForm
              mode="login"
              next={target}
              googleEnabled={Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
