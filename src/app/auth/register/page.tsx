"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Leaf, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Registration failed"); setLoading(false); return; }
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) { setError("Account created but login failed. Try signing in."); setLoading(false); }
      else { router.push("/dashboard"); router.refresh(); }
    } catch { setError("Something went wrong"); setLoading(false); }
  };

  return (
    <div className="site-canvas min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute w-96 h-96 rounded-full bg-emerald-200/30 blur-3xl -top-36 -right-20" />
      <div className="w-full max-w-sm relative">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#123f35] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-950/15">
            <Leaf size={24} className="text-white" />
          </div>
          <p className="eyebrow text-[#16745c] mb-2">RepairConnect</p>
          <h1 className="text-3xl font-bold tracking-tight text-[#153f35]">Create your account</h1>
          <p className="text-sm text-gray-500 mt-1">Create a free account to diagnose, track, and repair your broken items</p>
        </div>

        <form onSubmit={handleSubmit} className="paper-card rounded-3xl p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white transition-colors" placeholder="Your name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white transition-colors" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white transition-colors" placeholder="Min 6 characters" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 forest-button text-white py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 mt-2">
            {loading ? "Creating account..." : "Create account"}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account? <Link href="/auth/login" className="text-emerald-600 font-medium hover:text-emerald-700">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
