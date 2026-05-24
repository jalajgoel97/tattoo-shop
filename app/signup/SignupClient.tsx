"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import AddressForm from "@/components/AddressForm";
import Toast from "@/components/Toast";

const blank = { label: "Home", state: "", city: "", country: "India" };

export default function SignupClient() {
  const params = useSearchParams();
  const [form, setForm] = useState<any>(blank);
  const [email, setEmail] = useState(params.get("email") || "");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"details" | "otp">("details");
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);

  const payload = { ...form, fullName: form.name || form.fullName, email, mode: "signup" };
  const cityReady = form.city && (form.city !== "__OTHER__" || form.cityOther);

  function showError(msg: string) {
    setMessage("");
    setToast(msg);
  }

  async function createAccount() {
    setLoading(true);
    setMessage("");
    setToast("");
    const res = await fetch("/api/auth/otp", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (res.ok) {
      setStep("otp");
      setMessage("OTP sent. Enter it below to complete signup.");
    } else showError(data?.error || "Could not send OTP. Check SMTP settings.");
  }

  async function verifyAndSignup() {
    setLoading(true);
    setMessage("");
    setToast("");
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, code })
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (res.ok) window.location.href = data?.user?.role === "ADMIN" ? "/admin/orders" : "/";
    else showError(data?.error || "Invalid OTP");
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <Toast message={toast} onClose={() => setToast("")} />
      <div className="border border-line bg-panel p-8 shadow-card">
        <p className="text-sm font-bold uppercase tracking-[.35em] text-blood">Join the drop</p>
        <h1 className="section-title mt-3">Sign up</h1>
        <p className="mt-2 text-smoke">Name, phone number and one delivery address are mandatory.</p>

        <div className="mt-7 grid gap-3 md:grid-cols-2">
          <input className="input" placeholder="Full name" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value, fullName: e.target.value })} disabled={step === "otp"} />
          <input className="input" placeholder="Phone number" value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} disabled={step === "otp"} />
          <input className="input md:col-span-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={step === "otp"} />
        </div>

        <div className="mt-4">
          <AddressForm value={form} onChange={setForm} disabled={step === "otp"} showFullName={false} />
        </div>

        {step === "details" ? (
          <button className="btn-primary mt-4 w-full" onClick={createAccount} disabled={loading || !email || !form.name || !form.phone || !form.line1 || !form.state || !cityReady || !form.pincode}>
            Send OTP & create account
          </button>
        ) : (
          <>
            <input className="input mt-4" placeholder="6 digit OTP" value={code} onChange={(e) => setCode(e.target.value)} />
            <button className="btn-primary mt-4 w-full" onClick={verifyAndSignup} disabled={loading || !code}>Verify OTP & finish signup</button>
            <button className="btn-outline mt-3 w-full" onClick={createAccount} disabled={loading}>Resend OTP</button>
          </>
        )}

        {message && <p className="mt-4 text-sm text-smoke">{message}</p>}

        <button className="btn mt-5 w-full bg-bone text-black" onClick={() => signIn("google", { callbackUrl: "/account/addresses" })}>
          Continue with Google
        </button>

        <p className="mt-6 text-center text-sm text-smoke">
          Already have an account? <Link className="font-bold text-blood" href="/login">Login</Link>
        </p>
      </div>
    </main>
  );
}
