"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Star, MapPin, Phone, Navigation, Loader2 } from "lucide-react";

const categories = ["all", "electronics", "furniture", "bicycle", "appliance", "other"];

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  useEffect(() => {
    fetch("/api/services?category=" + filter)
      .then(r => r.json())
      .then(d => { setServices(d); setLoading(false); });
  }, [filter]);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported");
      return;
    }
    setLocationLoading(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationLoading(false);
      },
      () => {
        setLocationError("Location access denied. Showing all shops.");
        setLocationLoading(false);
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></Link>
          <h1 className="text-xl font-bold text-gray-900">Repair Services</h1>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Location Banner */}
        {!location && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 flex items-center justify-between">
            <div>
              <p className="font-medium text-blue-900">Find shops near you</p>
              <p className="text-sm text-blue-600">Grant location access to see nearby repair services</p>
            </div>
            <button onClick={requestLocation} disabled={locationLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50">
              {locationLoading ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
              {locationLoading ? "Getting..." : "Enable Location"}
            </button>
          </div>
        )}
        {location && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-3 mb-6 flex items-center gap-2 text-sm text-green-700">
            <MapPin size={16} /> Location enabled — showing shops near you
          </div>
        )}
        {locationError && <p className="text-orange-600 text-sm mb-4">{locationError}</p>}

        {/* Category Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map(c => (
            <button key={c} onClick={() => setFilter(c)}
              className={"px-4 py-2 rounded-full font-medium capitalize whitespace-nowrap " + (filter===c ? "bg-green-600 text-white" : "bg-white text-gray-600 border")}>{c}</button>
          ))}
        </div>

        {/* Shop Cards */}
        {loading ? <div className="text-center py-12 text-gray-400">Loading...</div> : (
          <div className="grid gap-4">
            {services.map(s => (
              <div key={s._id} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{s.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Star size={14} className="text-yellow-400 fill-yellow-400"/>
                      <span className="text-sm font-medium">{s.rating}</span>
                      <span className="text-gray-300 mx-1">|</span>
                      <span className="text-sm bg-gray-100 px-2 py-0.5 rounded capitalize">{s.category}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-sm text-gray-500"><MapPin size={14}/>{s.address}</div>
                    <div className="flex items-center gap-1 mt-1 text-sm text-gray-500"><Phone size={14}/>{s.phone}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {s.specialties.map((sp: string, i: number) => (<span key={i} className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full">{sp}</span>))}
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <span className="text-sm text-gray-500">Price: {s.priceRange}</span>
                  <a href={"tel:" + s.phone} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-700">Call Shop</a>
                </div>
              </div>
            ))}
            {services.length === 0 && <p className="text-center text-gray-400 py-8">No shops found in this category</p>}
          </div>
        )}
      </div>
    </div>
  );
}