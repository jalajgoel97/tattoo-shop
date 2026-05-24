import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-md px-5 py-16 text-bone">Loading login...</main>}>
      <LoginClient />
    </Suspense>
  );
}
