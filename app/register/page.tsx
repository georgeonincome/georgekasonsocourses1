import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AuthForm } from "@/components/auth-form";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = pageMeta({
  title: "Student Registration",
  description: "Register as a student on The $100 Guy courses platform.",
  path: "/register",
  noindex: true,
});

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const target = next && next.startsWith("/") ? next : "/dashboard";

  const session = await auth();
  if (session?.user) redirect(target);

  return (
    <div className="section">
      <div className="wrap grid gap-12 lg:grid-cols-[1fr_440px]">
        <div className="max-w-xl">
          <span className="eyebrow">Student registration</span>
          <h1 className="h-display text-[2.1rem] sm:text-[2.6rem]">
            Create your account
          </h1>
          <p className="mt-4 text-[1.02rem] leading-relaxed text-muted">
            One account gives you every course you buy, your progress, your
            certificates, and the WhatsApp group.
          </p>

          <div className="mt-9 rounded-2xl border border-line bg-surface p-6">
            <h2 className="text-[1.05rem] font-semibold">
              Start with the free ones
            </h2>
            <p className="mt-2 text-[0.94rem] leading-relaxed text-muted">
              You do not have to buy anything to start. Several courses have
              a free first module, and the WhatsApp group is open to anyone
              who wants to ask a question.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href="https://wa.me/260979982819?text=Hi%20George%2C%20I%27d%20like%20to%20join%20the%20group."
                className="btn btn-navy"
                target="_blank"
                rel="noopener noreferrer"
              >
                Join the WhatsApp group
              </a>
              <a
                href="/courses"
                className="btn btn-ghost"
              >
                Browse free modules
              </a>
            </div>
          </div>
        </div>

        <div className="card p-7">
          <h2 className="text-[1.25rem] font-semibold">Register</h2>
          <p className="mt-1.5 text-[0.92rem] text-muted">
            It takes about a minute.
          </p>

          <div className="mt-6">
            <AuthForm
              mode="register"
              next={target}
              googleEnabled={Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
