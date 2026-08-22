import Link from "next/link";
import { ArrowRight, Upload, Search, MapPin, Leaf, Shield, Zap, ChevronRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Leaf size={18} className="text-white" />
            </div>
            <span className="font-semibold text-lg text-gray-900">RepairConnect</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 transition-colors">
              Sign in
            </Link>
            <Link href="/auth/register" className="text-sm font-medium bg-gray-900 text-white px-5 py-2.5 rounded-full hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-sm font-medium px-4 py-2 rounded-full mb-8 border border-emerald-100">
            <Zap size={14} />
            <span>AI-Powered Repair Intelligence</span>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight leading-[1.08] mb-6">
            Your stuff is broken.
            <br />
            <span className="text-emerald-600">Don&apos;t trash it &mdash; fix it.</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload a photo, get instant AI diagnosis with cost estimates, DIY repair guides, and connect with nearby professionals.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register" className="group flex items-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-full text-base font-semibold hover:bg-emerald-700 transition-all duration-200 shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-200 w-full sm:w-auto justify-center">
              Start repairing
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="#how-it-works" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 px-6 py-4 text-base font-medium transition-colors w-full sm:w-auto justify-center">
              See how it works
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof Strip */}
      <section className="py-12 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span>AI-powered diagnosis</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span>Cost comparison</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span>DIY repair guides</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span>Find local shops</span>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-3">How it works</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Three steps to repair</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: Upload,
                title: "Upload a photo",
                desc: "Snap a picture of the damaged item and describe the problem in a few words.",
              },
              {
                step: "02",
                icon: Search,
                title: "Get AI diagnosis",
                desc: "Our AI identifies the issue, estimates repair costs, and suggests DIY fixes or professionals.",
              },
              {
                step: "03",
                icon: MapPin,
                title: "Find repair help",
                desc: "Browse nearby repair shops, compare options, and get your item fixed.",
              },
            ].map((item) => (
              <div key={item.step} className="group">
                <div className="w-12 h-12 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center mb-5 group-hover:bg-emerald-50 group-hover:border-emerald-200 transition-colors duration-300">
                  <item.icon size={22} className="text-gray-400 group-hover:text-emerald-600 transition-colors duration-300" />
                </div>
                <p className="text-xs font-semibold text-gray-300 mb-2">{item.step}</p>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-3">Why RepairConnect</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Repair smarter, not harder</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { icon: Shield, title: "Is it worth fixing?", desc: "Get a repair score and cost comparison so you never waste money on hopeless items." },
              { icon: Leaf, title: "Track your impact", desc: "See how many kg of CO₂ you've saved, water conserved, and waste prevented." },
              { icon: Search, title: "DIY or professional?", desc: "Receive step-by-step repair guides with difficulty ratings and tool lists." },
              { icon: MapPin, title: "Find nearby help", desc: "Connect with verified repair shops in your area with ratings and phone numbers." },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 transition-colors duration-200">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
                  <f.icon size={20} className="text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gray-900 rounded-3xl p-10 sm:p-14 text-center">
            <p className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3">Sustainability impact</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-10">Every repair cEvery repair counts</h2>
            <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
              {[{ value: "12kg", label: "CO2 saved per repair" }, { value: "3.2L", label: "Water conserved" }, { value: "0.8kg", label: "Waste prevented" }].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl sm:text-3xl font-bold text-emerald-400">{s.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Start repairing today</h2>
          <p className="text-gray-500 text-lg mb-8 max-w-xl mx-auto">Upload a photo of your broken item and let AI help you fix it.</p>
          <Link href="/auth/register" className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-full text-base font-semibold hover:bg-emerald-700 transition-all duration-200 shadow-lg shadow-emerald-200">
            Create free account <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center"><Leaf size={14} className="text-white" /></div>
            <span className="font-medium text-sm text-gray-900">RepairConnect</span>
          </div>
          <p className="text-xs text-gray-400">Repair, don’t replace.</p>
        </div>
      </footer>
    </div>
  );
}