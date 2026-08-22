"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Leaf, TreePine, Droplets, Recycle, DollarSign, Award, LogOut, Wrench } from "lucide-react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/auth/login"); return; }
    if (status === "authenticated") {
      Promise.all([
        fetch("/api/requests").then(r => r.json()),
        fetch("/api/impact/stats").then(r => r.json()),
      ]).then(([reqs, st]) => { setRequests(reqs); setStats(st); setLoading(false); });
    }
  }, [status, router]);

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-2 border-green-600 border-t-transparent" /></div>;

  const badgeEmoji: Record<string, string> = {
    "First Fix": "🔧", "DIY Master": "🛠️", "Eco Warrior": "🌱",
    "Carbon Cutter": "🌍", "Money Saver": "💰",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">Welcome, {session?.user?.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/new-request" className="bg-green-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-green-700 flex items-center gap-2">
              <Plus size={18} /> New Request
            </Link>
            <button onClick={() => signOut({ callbackUrl: "/" })} className="text-gray-400 hover:text-gray-600"><LogOut size={20} /></button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm"><div className="flex items-center gap-2 text-gray-500 text-sm mb-1"><Wrench size={14}/>Items Repaired</div><p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p></div>
            <div className="bg-white rounded-2xl p-4 shadow-sm"><div className="flex items-center gap-2 text-gray-500 text-sm mb-1"><TreePine size={14}/>CO2 Saved</div><p className="text-2xl font-bold text-green-600">{stats.totalCO2}kg</p></div>
            <div className="bg-white rounded-2xl p-4 shadow-sm"><div className="flex items-center gap-2 text-gray-500 text-sm mb-1"><Droplets size={14}/>Water Saved</div><p className="text-2xl font-bold text-blue-600">{stats.totalWater}L</p></div>
            <div className="bg-white rounded-2xl p-4 shadow-sm"><div className="flex items-center gap-2 text-gray-500 text-sm mb-1"><DollarSign size={14}/>Money Saved</div><p className="text-2xl font-bold text-purple-600">${stats.totalMoneySaved}</p></div>
          </div>
        )}

        {/* Badges */}
        {stats && stats.badges.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Award size={18}/>Badges Earned</h3>
            <div className="flex flex-wrap gap-3">
              {stats.badges.map((b: string) => (
                <div key={b} className="bg-green-50 text-green-700 px-4 py-2 rounded-full font-medium flex items-center gap-2">
                  {badgeEmoji[b] || "🏅"} {b}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Requests List */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Repair Requests</h2>
          {requests.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
              <Wrench className="mx-auto text-gray-300 mb-3" size={48}/>
              <p className="text-gray-500 mb-4">No repair requests yet</p>
              <Link href="/new-request" className="bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 inline-flex items-center gap-2">
                <Plus size={18}/> Upload Your First Item
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {requests.map((r) => (
                <Link key={r._id} href={"/request/" + r._id} className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md flex gap-4 items-center">
                  <img src={r.imageUrl} alt="" className="w-20 h-20 object-cover rounded-xl flex-shrink-0"/>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{r.description}</p>
                    <p className="text-sm text-gray-500">{r.category} · {new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium text-green-600">Score: {r.diagnosis?.repairScore}/100</p>
                    <span className={"text-xs px-2 py-1 rounded-full " + (r.status==="diagnosed"?"bg-green-100 text-green-700":"bg-gray-100 text-gray-600")}>{r.status}</span>
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
