"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, ArrowRight } from "lucide-react";
import FileUpload from "@/components/FileUpload";

const categories = ["electronics", "furniture", "bicycle", "appliance", "other"];

export default function NewRequestPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Sign in required to create a repair request.</p>
          <Link href="/auth/login" className="text-emerald-600 font-medium hover:text-emerald-700">Sign in</Link>
        </div>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!imageUrl || !description || !category) { setError("Please upload a photo, select a category, and describe the issue."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl, description, category }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Failed to create repair request"); setLoading(false); return; }
      const data = await res.json();
      window.location.href = "/request/" + data._id;
    } catch { setError("Something went wrong. Please try again."); setLoading(false); }
  };

  return (
    <div className="site-canvas min-h-screen">
      {/* Header */}
      <div className="bg-white/75 backdrop-blur border-b border-emerald-950/10">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-semibold text-gray-900">New Repair Request</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Progress Steps */}
        <div className="flex items-center gap-3 mb-8">
          {[{ n: 1, l: "Upload" }, { n: 2, l: "Describe" }, { n: 3, l: "Analyze" }].map((s, i) => (
            <div key={s.n} className="flex items-center gap-3 flex-1">
              <div className={"w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 transition-colors " +
                (imageUrl && category && description ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-500")}>{s.n}</div>
              <span className="text-sm text-gray-500 hidden sm:block">{s.l}</span>
              {i < 2 && <div className="flex-1 h-px bg-gray-200 mx-2" />}
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="paper-card rounded-3xl p-6 sm:p-8 space-y-6">
          {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}

          {/* Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Photo of the damaged item</label>
            <FileUpload onUpload={setImageUrl} />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(c => (
                <button key={c} onClick={() => setCategory(c)}
                  className={"px-4 py-2 rounded-lg text-sm font-medium capitalize border transition-all duration-150 " +
                    (category === c ? "bg-[#123f35] text-white border-[#123f35] shadow-sm" : "bg-white/80 text-gray-600 border-emerald-950/10 hover:border-emerald-800/25")}>{c}</button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Describe the problem</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white transition-colors resize-none"
              placeholder="e.g. Screen flickering, hinge broken, water damage..." />
          </div>

          {/* Submit */}
          <button onClick={handleSubmit} disabled={loading || !imageUrl || !description || !category}
            className="w-full flex items-center justify-center gap-2 forest-button text-white py-3.5 rounded-xl font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed">
            {loading ? (
              <><Loader2 size={18} className="animate-spin" />Analyzing your item...</>
            ) : (
              <>Analyze My Item<ArrowRight size={16} /></>
            )}
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">AI will analyze the issue, estimate costs, and suggest repair options</p>
      </div>
    </div>
  );
}
