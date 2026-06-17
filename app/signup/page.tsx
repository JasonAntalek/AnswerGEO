import { AuthForm } from "@/components/AuthForm";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-16">
      <div className="mb-6 text-center">
        <Link href="/" className="text-sm font-semibold text-indigo-600">
          ← Back to Answerspot
        </Link>
      </div>
      <AuthForm mode="signup" />
    </div>
  );
}
