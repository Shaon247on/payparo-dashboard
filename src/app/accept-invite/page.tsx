
import { verifyInviteTokenAction } from "@/actions/kyc.action";
import AcceptInviteForm from "@/components/auth/InviteAcceptForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function AcceptInvitePage({ searchParams }: PageProps) {
  const { token } = await searchParams;

  // ── No token in URL ────────────────────────────────────────────────────────
  if (!token) {
    return <InviteError message="Invalid invitation link. No token was provided." />;
  }

  // ── Verify the token server-side before rendering the form ─────────────────
  const result = await verifyInviteTokenAction(token);

  if (!result.success) {
    return (
      <InviteError message={result.error} />
    );
  }

  const { email, role } = result.data;

  // ── Valid token — show the account setup form ──────────────────────────────
  return (
    <div className="min-h-screen bg-[#0d0f17] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <h1 className="text-white text-2xl font-bold">Set Up Your Account</h1>
          <p className="text-white/40 text-sm">
            You&apos;ve been invited as a{" "}
            <span className="text-white/70 capitalize">{role.replace("_", " ")}</span>.
            Complete the form below to get started.
          </p>
        </div>

        {/* Form card */}
        <Card className="bg-[#13151e] border-white/5">
          <CardHeader className="px-5 pt-5 pb-4 border-b border-white/5">
            <CardTitle className="text-white text-base font-semibold">
              Create Your Account
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 py-5">
            <AcceptInviteForm token={token} email={email} />
          </CardContent>
        </Card>

        <p className="text-center text-white/25 text-xs">
          Already have an account?{" "}
          <Link href="/login" className="text-white/50 hover:text-white underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

// ── Reusable error state ───────────────────────────────────────────────────────

function InviteError({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-[#0d0f17] flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-5">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20">
          <AlertCircle className="w-6 h-6 text-rose-400" />
        </div>
        <div>
          <h1 className="text-white text-xl font-bold mb-2">Invalid Invitation</h1>
          <p className="text-white/40 text-sm">{message}</p>
        </div>
        <Link
          href="/login"
          className="inline-block text-sm text-white/50 hover:text-white underline-offset-4 hover:underline"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}