import { Suspense } from "react";
import SignupClient from "./SignupClient";

export default function SignupPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-3xl px-5 py-16 text-bone">Loading signup...</main>}>
      <SignupClient />
    </Suspense>
  );
}
