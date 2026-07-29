import { Suspense } from "react";

import LoginForm from "@/features/auth/components/LoginForm";

function LoginLoading() {
  return (
    <div className="flex min-h-[420px] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#0B2D5C]" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  );
}