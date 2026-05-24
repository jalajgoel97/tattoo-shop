"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Toast from "@/components/Toast";

export default function LoginClient() {
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/";
  const [email, setEmail] = useState(params.get("email") || "");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);

  function showError(msg: string) {
    setMessage("");
    setToast(msg);
  }

  async function sendOtp() {
    setLoading(true);
    setMessage("");
    setToast("");
    const res = await fetch("/api/auth/otp", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, mode: "login" })
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (res.ok) setMessage("OTP sent. Check your email.");
    else {
      showError(data?.error || "Could not send OTP. Check SMTP settings and email address.");
      if (data?.signupRequired || res.status === 404) {
        setTimeout(() => {
          window.location.href = `/signup?email=${encodeURIComponent(email)}`;
        }, 1400);
      }
    }
  }

  async function verify() {
    setLoading(true);
    setMessage("");
    setToast("");
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, mode: "login" })
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (res.ok) {
      window.dispatchEvent(new Event("cart-updated"));
      window.location.href = data?.user?.role === "ADMIN" ? "/admin/orders" : redirect;
    } else {
      showError(data?.error || "Invalid OTP");
      if (data?.signupRequired || res.status === 404) {
        setTimeout(() => {
          window.location.href = `/signup?email=${encodeURIComponent(email)}`;
        }, 1400);
      }
    }
  }

  return (
    <main className="mx-auto max-w-md px-5 py-16">
      <Toast message={toast} onClose={() => setToast("")} />
      <div className="border border-line bg-panel p-8 shadow-card">
        <p className="text-sm font-bold uppercase tracking-[.35em] text-blood">Customer access</p>
        <h1 className="section-title mt-3">Login</h1>
        <p className="mt-2 text-smoke">Use email OTP or Google login.</p>

        <input className="input mt-7" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button className="btn-primary mt-3 w-full" onClick={sendOtp} disabled={loading || !email}>Send OTP</button>

        <input className="input mt-4" placeholder="6 digit OTP" value={code} onChange={(e) => setCode(e.target.value)} />
        <button className="btn-outline mt-3 w-full" onClick={verify} disabled={loading || !email || !code}>Verify OTP & login</button>

        {message && <p className="mt-4 text-sm text-smoke">{message}</p>}

        <button className="btn mt-5 w-full bg-bone text-black" onClick={() => signIn("google", { callbackUrl: redirect })}>Continue with Google</button>

        <p className="mt-6 text-center text-sm text-smoke">New here? <Link className="font-bold text-blood" href={`/signup?email=${encodeURIComponent(email)}`}>Create an account</Link></p>
      </div>
    </main>
  );
}
