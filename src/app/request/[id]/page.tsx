"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Leaf, Wrench, AlertTriangle, Clock, Recycle, Droplets, TreePine } from "lucide-react";

export default function RequestDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("diagnosis");

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/auth/login"); return; }
    if (params.id) {
      const fetchRequest = async (retries = 3) => {
        for (let i = 0; i < retries; i++) {
          try {
            const res = await fetch("/api/requests/" + params.id);
            if (res.ok) {
              const data = await res.json();
              setRequest(data);
              setLoading(false);
              return;
            }
            if (res.status === 401 && i < retries - 1) {
              await new Promise(r => setTimeout(r, 500));
              continue;
            }
            throw new Error("Not found");
          } catch {
            if (i === retries - 1) { setRequest(null); setLoading(false); }
          }
        }
      };
      fetchRequest();
    }
  }, [status, params.id, router]);

  if (status === "loading" || loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!request?._id) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="text-center">
        <p className="text-gray-500 mb-4">Request not found</p>
        <Link href="/dashboard" className="text-emerald-600 font-medium hover:text-emerald-700">Back to Dashboard</Link>
      </div>
    </div>
  );

  const d = request.diagnosis;
  const imp = request.impact;
  const diy = request.diyGuide;

  const tabs = [
    { id: "diagnosis", label: "Diagnosis", icon: AlertTriangle },
    { id: "impact", label: "Impact", icon: Leaf },
    { id: "fix", label: "Fix It", icon: Wrench },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-semibold text-gray-900">Diagnosis Results</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-6">
        {/* Image */}
        <div className="mb-6">
          <img src={request.imageUrl} alt="item" className="w-full h-64 object-cover rounded-xl border border-gray-200 bg-gray-100" />
          <p className="text-sm text-gray-500 mt-2">{request.description}</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={"flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 " +
                (activeTab === t.id ? "bg-white text-emerald-600 shadow-sm" : "text-gray-500 hover:text-gray-700")}>
              <t.icon size={15} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-4">
          {activeTab === "diagnosis" && (
            <>
              {/* Repair Score */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-semibold text-gray-900">Repair Score</h3>
                  <span className={"text-xs font-semibold px-3 py-1 rounded-full " + (
                    d.severity === "Low" ? "bg-emerald-50 text-emerald-600" :
                    d.severity === "Medium" ? "bg-amber-50 text-amber-600" :
                    d.severity === "High" ? "bg-orange-50 text-orange-600" :
                    "bg-red-50 text-red-600"
                  )}>{d.severity}</span>
                </div>
                <div className="flex items-center gap-5">
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <svg className="w-20 h-20 -rotate-90">
                      <circle cx="40" cy="40" r="35" stroke="#f3f4f6" strokeWidth="6" fill="none" />
                      <circle cx="40" cy="40" r="35"
                        stroke={d.repairScore >= 70 ? "#10b981" : d.repairScore >= 40 ? "#f59e0b" : "#ef4444"}
                        strokeWidth="6" fill="none" strokeLinecap="round"
                        strokeDasharray={((d.repairScore / 100) * 220) + " 220"} className="transition-all duration-700" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-gray-900">{d.repairScore}</span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{d.problem}</p>
                </div>
              </div>

              {/* Cost Comparison */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Cost Comparison</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-50 rounded-xl p-4 text-center">
                    <p className="text-xs font-medium text-emerald-600 mb-1">Repair</p>
                    <p className="text-2xl font-bold text-emerald-700">{"\u20B9"}{d.estimatedRepairCost}</p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4 text-center">
                    <p className="text-xs font-medium text-red-500 mb-1">Replace</p>
                    <p className="text-2xl font-bold text-red-600">{"\u20B9"}{d.estimatedReplaceCost}</p>
                  </div>
                </div>
                <div className={"mt-4 px-4 py-3 rounded-xl text-center text-sm font-medium " +
                  (d.worthRepairing ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100")}>
                  {d.worthRepairing ? "Worth repairing \u2014 save " + "\u20B9" + (d.estimatedReplaceCost - d.estimatedRepairCost) : "Consider replacing"}
                </div>
              </div>
            </>
          )}

          {activeTab === "impact" && (
            <>
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-5">Environmental Impact</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/15 rounded-xl p-4 text-center">
                    <TreePine className="mx-auto mb-2" size={22} />
                    <p className="text-2xl font-bold">{imp.co2Saved}kg</p>
                    <p className="text-xs text-emerald-100 mt-0.5">CO\u2082 Saved</p>
                  </div>
                  <div className="bg-white/15 rounded-xl p-4 text-center">
                    <Droplets className="mx-auto mb-2" size={22} />
                    <p className="text-2xl font-bold">{imp.waterSaved}L</p>
                    <p className="text-xs text-emerald-100 mt-0.5">Water Saved</p>
                  </div>
                  <div className="bg-white/15 rounded-xl p-4 text-center">
                    <Recycle className="mx-auto mb-2" size={22} />
                    <p className="text-2xl font-bold">{imp.wastePrevented}kg</p>
                    <p className="text-xs text-emerald-100 mt-0.5">Waste Prevented</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
                <Leaf className="mx-auto text-emerald-500 mb-3" size={28} />
                <p className="text-sm text-gray-600">Equivalent to planting <span className="font-semibold text-emerald-600">{(imp.co2Saved / 21).toFixed(1)} trees</span> worth of carbon absorption</p>
              </div>
            </>
          )}

          {activeTab === "fix" && (
            <>
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-semibold text-gray-900">DIY Repair Guide</h3>
                  <span className={"text-sm font-semibold " + (
                    diy.difficulty === "Beginner" ? "text-emerald-600" :
                    diy.difficulty === "Intermediate" ? "text-amber-600" : "text-red-600"
                  )}>{diy.difficulty}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-5">
                  <Clock size={13} />
                  <span>{diy.estimatedTime}</span>
                </div>
                <div className="mb-5">
                  <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">Tools Needed</p>
                  <div className="flex flex-wrap gap-2">
                    {diy.tools.map((t: any, i: number) => (
                      <span key={i} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">{t}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wider">Steps</p>
                  <div className="space-y-3">
                    {diy.steps.map((s: string, i: number) => (
                      <div key={i} className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">{i + 1}</div>
                        <p className="text-sm text-gray-600 leading-relaxed">{s}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {diy.safetyNotes && (
                  <div className="mt-5 bg-amber-50 border border-amber-100 rounded-xl p-4">
                    <p className="flex items-center gap-2 text-amber-700 font-semibold text-xs uppercase tracking-wider mb-1">
                      <AlertTriangle size={13} />Safety Notes
                    </p>
                    <p className="text-amber-600 text-sm mt-1 leading-relaxed">{diy.safetyNotes}</p>
                  </div>
                )}
              </div>
              <Link href="/services" className="block bg-white rounded-xl border border-gray-100 p-5 hover:border-gray-200 hover:shadow-sm transition-all duration-200">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Wrench className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">Find a Professional</h3>
                    <p className="text-xs text-gray-500">Browse nearby repair shops</p>
                  </div>
                </div>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}