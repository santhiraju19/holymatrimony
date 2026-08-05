import {
  Suspense,
} from "react";

import {
  Loader2,
} from "lucide-react";

import VerifyEmailForm from "@/features/auth/components/VerifyEmailForm";

function VerificationFallback() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <Loader2
        size={32}
        className="animate-spin text-[#0B2D5C]"
      />
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <VerificationFallback />
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}