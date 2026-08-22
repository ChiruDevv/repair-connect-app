"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Leaf, Wrench, AlertTriangle, CheckCircle, Clock, Recycle, Droplets, TreePine } from "lucide-react";

export default function RequestDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("diagnosis");

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/auth/login"); return; }
    if (status === "authenticated" && params.id) {
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

  if (status === "loading" || loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-2 border-green-600 border-t-transparent" /></div>;
  if (!request?._id) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center"><p className="text-gray-500 mb-4">Request not found</p><Link href="/dashboard" className="text-green-600 hover:underline">Back to Dashboard</Link></div></div>;

  const d = request.diagnosis;
  const imp = request.impact;
  const diy = request.diyGuide;
  const sevC: Record<string, string> = { Low: "bg-green-100 text-green-700", Medium: "bg-yellow-100 text-yellow-700", High: "bg-orange-100 text-orange-700", Critical: "bg-red-100 text-red-700" };
  const difC: Record<string, string> = { Beginner: "text-green-600", Intermediate: "text-yellow-600", Expert: "text-red-600" };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b"><div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3"><Link href="/dashboard" className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></Link><h1 className="text-xl font-bold">Diagnosis Results</h1></div></div>
      <div className="max-w-3xl mx-auto px-4 pt-6"><img src={request.imageUrl} alt="item" className="w-full h-64 object-cover rounded-2xl" /><p className="text-sm text-gray-500 mt-2">{request.description}</p></div>
      <div className="max-w-3xl mx-auto px-4 mt-6"><div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {[{id:"diagnosis",l:"Diagnosis",I:AlertTriangle},{id:"impact",l:"Impact",I:Leaf},{id:"fix",l:"Fix It",I:Wrench}].map((t: any) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={"flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium " + (activeTab===t.id ? "bg-white text-green-600 shadow-sm" : "text-gray-500")}><t.I size={16} />{t.l}</button>
        ))}
      </div></div>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {activeTab === "diagnosis" && <>
          <div className="bg-white rounded-2xl p-6 shadow-sm"><div className="flex items-center justify-between mb-4"><h3 className="font-semibold">Repair Score</h3><span className={"px-3 py-1 rounded-full text-sm font-medium " + sevC[d.severity]}>{d.severity}</span></div><div className="flex items-center gap-4"><div className="relative w-20 h-20"><svg className="w-20 h-20 -rotate-90"><circle cx="40" cy="40" r="35" stroke="#e5e7eb" strokeWidth="8" fill="none" /><circle cx="40" cy="40" r="35" stroke={d.repairScore>=70?"#22c55e":d.repairScore>=40?"#eab308":"#ef4444"} strokeWidth="8" fill="none" strokeDasharray={((d.repairScore/100)*220)+" 220"} /></svg><span className="absolute inset-0 flex items-center justify-center text-xl font-bold">{d.repairScore}</span></div><p className="text-gray-600">{d.problem}</p></div></div>
          <div className="bg-white rounded-2xl p-6 shadow-sm"><h3 className="font-semibold mb-4">Cost Comparison</h3><div className="grid grid-cols-2 gap-4"><div className="bg-green-50 rounded-xl p-4 text-center"><p className="text-sm text-green-600">Repair</p><p className="text-2xl font-bold text-green-700">{"$"}{d.estimatedRepairCost}</p></div><div className="bg-red-50 rounded-xl p-4 text-center"><p className="text-sm text-red-600">Replace</p><p className="text-2xl font-bold text-red-700">{"$"}{d.estimatedReplaceCost}</p></div></div><div className={"mt-4 p-3 rounded-xl text-center font-medium " + (d.worthRepairing?"bg-green-50 text-green-700":"bg-red-50 text-red-700")}>{d.worthRepairing?"Worth repairing! Save "+"$"+(d.estimatedReplaceCost-d.estimatedRepairCost):"Consider replacing"}</div></div>
        </>}
        {activeTab === "impact" && <>
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white"><h3 className="text-lg font-semibold mb-2">Environmental Impact</h3><div className="grid grid-cols-3 gap-4"><div className="bg-white/20 rounded-xl p-4 text-center"><TreePine className="mx-auto mb-2" size={24}/><p className="text-2xl font-bold">{imp.co2Saved}kg</p><p className="text-sm text-green-100">CO2 Saved</p></div><div className="bg-white/20 rounded-xl p-4 text-center"><Droplets className="mx-auto mb-2" size={24}/><p className="text-2xl font-bold">{imp.waterSaved}L</p><p className="text-sm text-green-100">Water Saved</p></div><div className="bg-white/20 rounded-xl p-4 text-center"><Recycle className="mx-auto mb-2" size={24}/><p className="text-2xl font-bold">{imp.wastePrevented}kg</p><p className="text-sm text-green-100">Waste Prevented</p></div></div></div>
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center"><Leaf className="mx-auto text-green-500 mb-2" size={32}/><p>Like planting <b className="text-green-600">{(imp.co2Saved/21).toFixed(1)} trees</b> worth of carbon absorption!</p></div>
        </>}
        {activeTab === "fix" && <>
          <div className="bg-white rounded-2xl p-6 shadow-sm"><div className="flex items-center justify-between mb-4"><h3 className="font-semibold">DIY Repair Guide</h3><span className={"font-medium "+difC[diy.difficulty]}>{diy.difficulty}</span></div><div className="flex items-center gap-4 text-sm text-gray-500 mb-4"><span className="flex items-center gap-1"><Clock size={14}/>{diy.estimatedTime}</span></div><div className="mb-4"><p className="text-sm font-medium text-gray-700 mb-2">Tools Needed:</p><div className="flex flex-wrap gap-2">{diy.tools.map((t: any, i: number)=>(<span key={i} className="bg-gray-100 px-3 py-1 rounded-full text-sm">{t}</span>))}</div></div><div className="space-y-3">{diy.steps.map((s: string, i: number)=>(<div key={i} className="flex gap-3"><div className="flex-shrink-0 w-7 h-7 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-bold">{i+1}</div><p className="text-gray-700">{s}</p></div>))}</div>{diy.safetyNotes&&<div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4"><p className="flex items-center gap-2 text-yellow-700 font-medium text-sm"><AlertTriangle size={16}/>Safety Notes</p><p className="text-yellow-600 text-sm mt-1">{diy.safetyNotes}</p></div>}</div>
          <Link href="/services" className="block bg-white rounded-2xl p-6 shadow-sm hover:shadow-md"><div className="flex items-center gap-3"><div className="bg-blue-100 p-3 rounded-xl"><Wrench className="text-blue-600" size={24}/></div><div><h3 className="font-semibold">Find a Professional</h3><p className="text-sm text-gray-500">Browse nearby repair shops</p></div></div></Link>
        </>}
      </div>
    </div>
  );
}