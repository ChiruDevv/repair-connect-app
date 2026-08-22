"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import FileUpload from "@/components/FileUpload";
import { Wrench, ArrowLeft } from "lucide-react";

const categories = [
  { value: "electronics", label: "Electronics", icon: "💻" },
  { value: "furniture", label: "Furniture", icon: "🪑" },
  { value: "bicycle", label: "Bicycle", icon: "🚲" },
  { value: "appliance", label: "Appliance", icon: "🏠" },
  { value: "other", label: "Other", icon: "📦" },
];

export default function NewRequestPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-green-600 border-t-transparent" />
      </div>
    );
  }

  if (status === "unauthenticated" || !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in required</h2>
          <p className="text-gray-600 mb-6">You need to be signed in to create a repair request.</p>
          <Link href="/auth/login" className="bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 inline-block">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!imageUrl) { setError("Please upload a photo or video"); return; }
    if (!description) { setError("Please describe the issue"); return; }
    if (!category) { setError("Please select a category"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl, description, category }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Check the console for details.");
        console.error("API Error:", data);
        return;
      }

      window.location.href = "/request/" + data._id;
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to submit request. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">New Repair Request</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Photo or Video of the Issue
            </label>
            <FileUpload onUpload={setImageUrl} />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Category
            </label>
            <div className="grid grid-cols-5 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    category === cat.value
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-2xl">{cat.icon}</div>
                  <div className="text-xs font-bold text-gray-900 mt-1">{cat.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Describe the Issue
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none text-gray-900"
              placeholder="What's wrong? When did it start? Any error messages?"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading || !imageUrl}
            className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                Analyzing with AI...
              </>
            ) : (
              <>
                <Wrench size={20} />
                Analyze My Item
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
