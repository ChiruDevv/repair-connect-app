"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, ArrowLeft, Leaf, TreePine, Droplets, Recycle, ArrowRight, Award, LogOut, Hammer, CheckCircle, CircleCheckBig } from "lucide-react";

interface RepairRequest {
  _id: string;
  description: string;
  imageUrl: string;
  category: string;
  status: string;
  diagnosis?: { problem: string; severity: string; repairScore: number; worthRepairing: boolean };
  impact?: { co2Saved: number; waterSaved: number; wastePrevented: number };
  createdAt: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState<RepairRequest[]>([]);
  const [stats, setStats] = useState({ totalItems: 0, totalCO2: 0, totalWater: 0, totalWaste: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/auth/login"); return; }
    if (status === "authenticated") {
      Promise.all([
        fetch("/api/requests").then(r => r.json()),
        fetch("/api/impact/stats").then(r => r.json()),
      ]).then(([reqs, s]) => {
        setRequests(reqs);
        setStats(s);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [status, router]);

  const markAsRepaired = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const res = await fetch("/api/requests/" + id, {
      method: "DELETE",
    });
    if (res.ok) {
      setRequests(prev => prev.filter(r => r._id !== id));
      setStats(prev => ({ ...prev, totalItems: prev.totalItems - 1 }));
    }
  };

  if (status === "loading" || loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const badges = [
    { threshold: 1, icon: Leaf, label: "First Repair", color: "text-emerald-600 bg-emerald-50" },
    { threshold: 5, icon: Hammer, label: "DIY Starter", color: "text-amber-600 bg-amber-50" },
    { threshold: 10, icon: TreePine, label: "Eco Warrior", color: "text-green-600 bg-green-50" },
  ];

  const earnedBadges = badges.filter(b => stats.totalItems >= b.threshold);

  return (
    <div className="site-canvas min-h-screen">
      {/* Header */}
      <div className="bg-white/75 backdrop-blur border-b border-emerald-950/10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#123f35] rounded-xl flex items-center justify-center shadow-sm">
              <Leaf size={16} className="text-white" />
            </div>
            <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors"><ArrowLeft size={20} /></Link><span className="font-semibold text-gray-900">Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/services" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">Services</Link>
            <Link href="/new-request" className="flex items-center gap-1.5 forest-button text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
              <Plus size={16} />New Repair
            </Link>
            <button onClick={() => signOut({ callbackUrl: "/auth/login" })} className="text-gray-400 hover:text-gray-600 transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <p className="eyebrow text-[#16745c] mb-2">Your circular dashboard</p>
          <h1 className="text-3xl font-bold tracking-tight text-[#153f35]">Welcome, {session?.user?.name || "there"}</h1>
          <p className="text-gray-500 text-sm mt-1">Everything you&apos;ve kept in use, in one place.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Hammer, value: stats.totalItems, label: "Repairs", color: "bg-emerald-50 text-emerald-600" },
            { icon: TreePine, value: stats.totalCO2 + "kg", label: "CO\u2082 Saved", color: "bg-green-50 text-green-600" },
            { icon: Droplets, value: stats.totalWater + "L", label: "Water Saved", color: "bg-blue-50 text-blue-600" },
            { icon: Recycle, value: stats.totalWaste + "kg", label: "Waste Prevented", color: "bg-amber-50 text-amber-600" },
          ].map(s => (
            <div key={s.label} className="paper-card rounded-2xl p-4 sm:p-5">
              <div className={"w-9 h-9 rounded-lg flex items-center justify-center mb-3 " + s.color}>
                <s.icon size={18} />
              </div>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Badges */}
        {earnedBadges.length > 0 && (
          <div className="paper-card rounded-2xl p-5 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Award size={16} className="text-amber-500" />
              <h2 className="text-sm font-semibold text-gray-900">Badges Earned</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {earnedBadges.map((b, i) => (
                <div key={i} className={"flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium " + b.color}>
                  <b.icon size={14} />
                  {b.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Requests */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Recent Requests</h2>
            <span className="text-xs text-gray-400">{requests.length} total</span>
          </div>
          {requests.length === 0 ? (
            <div className="paper-card rounded-2xl p-10 text-center">
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Hammer size={20} className="text-gray-300" />
              </div>
              <p className="text-gray-500 mb-4">No repair requests yet</p>
              <Link href="/new-request" className="inline-flex items-center gap-1.5 forest-button text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
                Start your first repair <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.slice(0, 10).map(r => (
                <Link key={r._id} href={"/request/" + r._id} className="block paper-card rounded-2xl p-4 hover:border-emerald-800/20 hover:-translate-y-0.5 transition-all duration-200">
                  <div className="flex items-start gap-4">
                    <img src={r.imageUrl} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0 bg-gray-100" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 text-sm truncate">{r.diagnosis?.problem || r.description}</h3>
                        <span className={"text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 " +
                          (r.status === "completed" ? "bg-emerald-50 text-emerald-600" :
                           r.status === "diagnosed" ? "bg-blue-50 text-blue-600" :
                           "bg-gray-100 text-gray-500")}>{r.status}</span>
                      </div>
                      <p className="text-xs text-gray-400 truncate">{r.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-gray-400 capitalize">{r.category}</span>
                        {r.diagnosis?.repairScore != null && (
                          <span className={"text-xs font-medium px-2 py-0.5 rounded-full " +
                            (r.diagnosis.repairScore >= 70 ? "bg-emerald-50 text-emerald-600" :
                             r.diagnosis.repairScore >= 40 ? "bg-amber-50 text-amber-600" :
                             "bg-red-50 text-red-600")}>Score: {r.diagnosis.repairScore}</span>
                        )}
                        {r.impact && (
                          <span className="text-xs text-green-600">{r.impact.co2Saved}kg CO2 saved</span>
                        )}
                      </div>
                    </div>
                    <button onClick={(e) => markAsRepaired(e, r._id)}
                        className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-emerald-100 transition-colors flex-shrink-0"
                        title="Mark as repaired">
                        <CircleCheckBig size={14} /> Repaired
                      </button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
