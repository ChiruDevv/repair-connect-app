"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Star, MapPin, Phone, Loader2, GitCompareArrows, Check } from "lucide-react";

const categories = ["all", "electronics", "furniture", "bicycle", "appliance", "other"];

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState("");
  const [compareMode, setCompareMode] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("rating");

  const fetchServices = (category: string, lat?: number, lng?: number) => {
    setLoading(true);
    let url = "/api/services?category=" + category;
    if (lat !== undefined && lng !== undefined) url += "&lat=" + lat + "&lng=" + lng;
    fetch(url).then(r => r.json()).then(d => { setServices(d); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => {
    if (!navigator.geolocation) { setLocationError("Geolocation not supported"); setLocationLoading(false); fetchServices(filter); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => { const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }; setLocation(loc); setLocationLoading(false); fetchServices(filter, loc.lat, loc.lng); },
      () => { setLocationError("Location access denied. Showing all shops."); setLocationLoading(false); fetchServices(filter); }
    );
  }, []);

  useEffect(() => { if (location) fetchServices(filter, location.lat, location.lng); }, [filter]);

  const toggleSelect = (id: string) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const selectedShops = services.filter(s => selected.includes(s._id));
  const sortedShops = [...selectedShops].sort((a: any, b: any) => {
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "price") return (a.priceRange || "").length - (b.priceRange || "").length;
    return 0;
  });

  return (
    <div className="site-canvas min-h-screen">
      <div className="bg-white/75 backdrop-blur border-b border-emerald-950/10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors"><ArrowLeft size={20} /></Link>
            <h1 className="font-semibold text-gray-900">Repair Services</h1>
          </div>
          {services.length > 0 && (
            <button onClick={() => { setCompareMode(!compareMode); setSelected([]); }}
              className={"flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors " + (compareMode ? "bg-[#123f35] text-white" : "text-gray-500 hover:text-gray-700 border border-emerald-950/10")}>
              <GitCompareArrows size={15} />{compareMode ? "Done" : "Compare"}
            </button>
          )}
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-6 py-6">
        {locationLoading && (<div className="paper-card rounded-2xl p-4 mb-6 flex items-center gap-3"><Loader2 size={16} className="animate-spin text-emerald-600" /><p className="text-sm text-gray-500">Detecting your location...</p></div>)}
        {location && (<div className="bg-emerald-50/80 border border-emerald-900/10 rounded-2xl p-3 mb-6 flex items-center gap-2 text-sm text-emerald-700"><MapPin size={15} /> Showing shops near you</div>)}
        {locationError && (<div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-6"><p className="text-sm text-amber-700">{locationError}</p></div>)}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {categories.map(c => (<button key={c} onClick={() => setFilter(c)} className={"px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-all flex-shrink-0 " + (filter === c ? "bg-[#123f35] text-white" : "bg-white/80 text-gray-500 border border-emerald-950/10")}>{c}</button>))}
        </div>
        {compareMode && (<div className="bg-[#123f35] text-white rounded-2xl p-4 mb-6 flex items-center justify-between"><p className="text-sm font-medium">Select 2+ shops to compare ({selected.length} selected)</p>{selected.length >= 2 && (<select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-white/15 text-white text-xs px-3 py-1.5 rounded-lg border border-white/20"><option value="rating">Sort by Rating</option><option value="price">Sort by Price</option></select>)}</div>)}
        {compareMode && selected.length >= 2 && (
          <div className="paper-card rounded-2xl overflow-hidden mb-6"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-emerald-950/10">
            <th className="text-left p-3 font-semibold text-gray-900">Shop</th><th className="text-center p-3 font-semibold text-gray-900">Rating</th><th className="text-center p-3 font-semibold text-gray-900">Price</th><th className="text-left p-3 font-semibold text-gray-900">Specialties</th><th className="text-center p-3 font-semibold text-gray-900">Category</th>
          </tr></thead><tbody>{sortedShops.map((s: any, i: number) => (
            <tr key={s._id} className={"border-b border-emerald-950/5 " + (i % 2 === 0 ? "bg-emerald-50/30" : "")}>
              <td className="p-3"><p className="font-medium text-gray-900">{s.name}</p><p className="text-xs text-gray-500">{s.address}</p></td>
              <td className="p-3 text-center"><div className="flex items-center justify-center gap-1"><Star size={12} className="text-amber-400 fill-amber-400" /><span className="font-medium">{s.rating}</span></div></td>
              <td className="p-3 text-center"><span className="font-medium text-emerald-600">{s.priceRange || "-"}</span></td>
              <td className="p-3"><div className="flex flex-wrap gap-1">{(s.specialties || []).slice(0, 3).map((sp: string, j: number) => (<span key={j} className="bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded-full">{sp}</span>))}</div></td>
              <td className="p-3 text-center capitalize text-gray-600">{s.category}</td>
            </tr>
          ))}</tbody></table></div></div>
        )}
        {loading ? (<div className="text-center py-16"><div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" /></div>) : (
          <div className="space-y-3">{services.map((s: any) => (
            <div key={s._id} onClick={() => compareMode && toggleSelect(s._id)} className={"paper-card rounded-2xl p-5 transition-all duration-200 " + (compareMode ? "cursor-pointer " + (selected.includes(s._id) ? "ring-2 ring-[#123f35]" : "") : "hover:-translate-y-0.5")}>
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {compareMode && (<div className={"w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 " + (selected.includes(s._id) ? "bg-[#123f35] border-[#123f35]" : "border-gray-300")}>{selected.includes(s._id) && <Check size={12} className="text-white" />}</div>)}
                    <h3 className="font-semibold text-gray-900 text-sm">{s.name}</h3>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 ml-7"><Star size={13} className="text-amber-400 fill-amber-400" /><span className="text-xs font-medium text-gray-700">{s.rating}</span><span className="text-gray-200">|</span><span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded capitalize">{s.category}</span></div>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500 ml-7"><MapPin size={13} /><span className="truncate">{s.address}</span></div>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500 ml-7"><Phone size={13} /><span>{s.phone}</span></div>
                </div>
              </div>
              {s.specialties && s.specialties.length > 0 && (<div className="flex flex-wrap gap-1.5 mt-3 ml-7">{s.specialties.map((sp: string, i: number) => (<span key={i} className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-medium">{sp}</span>))}</div>)}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50 ml-7">
                <span className="text-xs text-gray-500">Price: {s.priceRange}</span>
                {!compareMode && (<a href={"tel:" + s.phone} className="flex items-center gap-1.5 forest-button text-white px-4 py-2 rounded-xl text-xs font-semibold"><Phone size={13} />Call Shop</a>)}
              </div>
            </div>
          ))}{services.length === 0 && (<div className="paper-card rounded-2xl p-10 text-center"><p className="text-gray-500 text-sm">No shops found</p></div>)}</div>
        )}
      </div>
    </div>
  );
}
