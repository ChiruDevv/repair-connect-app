"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Star, MapPin, Phone, Filter } from "lucide-react";

const categories = ["all", "electronics", "furniture", "bicycle", "appliance"];

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/services?category=" + filter)
      .then(r => r.json())
      .then(d => { setServices(d); setLoading(false); });
  }, [filter]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></Link>
          <h1 className="text-xl font-bold text-gray-900">Repair Services</h1>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map(c => (
            <button key={c} onClick={() => setFilter(c)} className={"px-4 py-2 rounded-full font-medium capitalize whitespace-nowrap " + (filter===c ? "bg-green-600 text-white" : "bg-white text-gray-600 border")}>{c}</button>
          ))}
        </div>
        {loading ? <div className="text-center py-12 text-gray-400">Loading...</div> : (
          <div className="grid gap-4">
            {services.map(s => (
              <div key={s._id} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{s.name}</h3>
                    <div className="flex items-center gap-1 mt-1"><Star size={14} className="text-yellow-400 fill-yellow-400"/><span className="text-sm font-medium">{s.rating}</span></div>
                    <div className="flex items-center gap-1 mt-1 text-sm text-gray-500"><MapPin size={14}/>{s.address}</div>
                    <div className="flex items-center gap-1 mt-1 text-sm text-gray-500"><Phone size={14}/>{s.phone}</div>
                  </div>
                  <span className="text-sm bg-gray-100 px-3 py-1 rounded-full capitalize">{s.category}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {s.specialties.map((sp: string, i: number) => (<span key={i} className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full">{sp}</span>))}
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <span className="text-sm text-gray-500">Price: {s.priceRange}</span>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">Contact Shop</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
