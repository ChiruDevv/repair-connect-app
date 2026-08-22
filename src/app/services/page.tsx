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
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState("");

  const fetchServices = (category: string, lat?: number, lng?: number) => {
    setLoading(true);
    let url = "/api/services?category=" + category;
    if (lat !== undefined && lng !== undefined) {
      url += "&lat=" + lat + "&lng=" + lng;
    }
    fetch(url)
      .then(r => r.json())
      .then(d => { setServices(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  // Auto-request location on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported");
      setLocationLoading(false);
      fetchServices(filter);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(loc);
        setLocationLoading(false);
        fetchServices(filter, loc.lat, loc.lng);
      },
      () => {
        setLocationError("Location access denied. Showing all shops.");
        setLocationLoading(false);
        fetchServices(filter);
      }
    );
  }, []);

  useEffect(() => {
    if (location) {
      fetchServices(filter, location.lat, location.lng);
    }
  }, [filter]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-semibold text-gray-900">Repair Services</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Location Status */}
        {locationLoading && (
          <div className="bg-white border border-gray-100 rounded-xl p-4 mb-6 flex items-center gap-3">
            <Loader2 size={16} className="animate-spin text-emerald-600" />
            <p className="text-sm text-gray-500">Detecting your location...</p>
          </div>
        )}
        {location && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 mb-6 flex items-center gap-2 text-sm text-emerald-700">
            <MapPin size={15} /> Showing shops near you (sorted by proximity)
          </div>
        )}
        {locationError && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-6 flex items-center justify-between">
            <p className="text-sm text-amber-700">{locationError}</p>
            <button onClick={() => {
              setLocationLoading(true);
              setLocationError("");
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                  setLocation(loc);
                  setLocationLoading(false);
                  fetchServices(filter, loc.lat, loc.lng);
                },
                () => { setLocationError("Location access denied."); setLocationLoading(false); }
              );
            }} className="text-sm font-medium text-amber-700 underline">Try again</button>
          </div>
        )}

        {/* Category Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 -mx-1 px-1">
          {categories.map(c => (
            <button key={c} onClick={() => setFilter(c)}
              className={"px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-all duration-150 flex-shrink-0 " +
                (filter === c ? "bg-gray-900 text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300")}>{c}</button>
          ))}
        </div>

        {/* Shop Cards */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <div className="space-y-3">
            {services.map((s: any) => (
              <div key={s._id} className="bg-white rounded-xl border border-gray-100 p-5 hover:border-gray-200 hover:shadow-sm transition-all duration-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm">{s.name}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex items-center gap-1">
                        <Star size={13} className="text-amber-400 fill-amber-400" />
                        <span className="text-xs font-medium text-gray-700">{s.rating}</span>
                      </div>
                      <span className="text-gray-200">|</span>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded capitalize">{s.category}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
                      <MapPin size={13} className="flex-shrink-0" />
                      <span className="truncate">{s.address}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
                      <Phone size={13} className="flex-shrink-0" />
                      <span>{s.phone}</span>
                    </div>
                  </div>
                </div>
                {s.specialties && s.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {s.specialties.map((sp: string, i: number) => (
                      <span key={i} className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-medium">{sp}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                  <span className="text-xs text-gray-500">Price: {s.priceRange}</span>
                  <a href={"tel:" + s.phone}
                    className="flex items-center gap-1.5 bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors">
                    <Phone size={13} />Call Shop
                  </a>
                </div>
              </div>
            ))}
            {services.length === 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
                <p className="text-gray-500 text-sm">No shops found in this category</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
