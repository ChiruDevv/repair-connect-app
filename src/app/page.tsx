import Link from "next/link";
import { Wrench, Leaf, Camera, ArrowRight, TreePine, Recycle, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center gap-2">
          <Wrench className="text-green-600" size={28} />
          <span className="text-xl font-bold text-gray-900">RepairConnect</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="text-gray-600 hover:text-gray-900 font-medium">Sign In</Link>
          <Link href="/auth/register" className="bg-green-600 text-white px-5 py-2 rounded-xl font-medium hover:bg-green-700">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-24 text-center">
        <div className="inline-block bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-medium mb-6">Repair, Don&apos;t Replace</div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight max-w-3xl mx-auto">
          Your stuff is broken.<br />
          <span className="text-green-600">Don&apos;t trash it — fix it.</span>
        </h1>
        <p className="text-lg text-gray-500 mt-6 max-w-xl mx-auto">
          Upload a photo, get AI-powered diagnosis, learn how to fix it yourself, or find a repair shop near you.
        </p>
        <div className="flex items-center justify-center gap-4 mt-10">
          <Link href="/auth/register" className="bg-green-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-green-700 flex items-center gap-2">
            Upload Your First Item <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Camera, title: "Upload a Photo", desc: "Snap a picture of your broken item and describe the issue." },
              { icon: Wrench, title: "Get AI Diagnosis", desc: "Our AI analyzes the problem, estimates costs, and gives you a step-by-step repair guide." },
              { icon: Leaf, title: "Fix or Find Help", desc: "DIY with our guide, or connect with nearby repair professionals." },
            ].map((step, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-sm text-center">
                <div className="bg-green-100 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <step.icon className="text-green-600" size={28} />
                </div>
                <div className="text-sm font-bold text-green-600 mb-2">Step {i + 1}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl p-12 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Make an Impact</h2>
            <p className="text-green-100 text-lg mb-10 max-w-xl mx-auto">Every repair counts. By fixing instead of replacing, you reduce waste, save resources, and lower your carbon footprint.</p>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/10 rounded-2xl p-6"><TreePine className="mx-auto mb-3" size={32}/><p className="text-3xl font-bold">21kg</p><p className="text-green-200">CO2 saved per repair</p></div>
              <div className="bg-white/10 rounded-2xl p-6"><Recycle className="mx-auto mb-3" size={32}/><p className="text-3xl font-bold">50M</p><p className="text-green-200">tons of e-waste/year</p></div>
              <div className="bg-white/10 rounded-2xl p-6"><Shield className="mx-auto mb-3" size={32}/><p className="text-3xl font-bold">70%</p><p className="text-green-200">repairs are DIY-able</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2"><Wrench size={20}/><span className="font-medium text-white">RepairConnect</span></div>
          <p className="text-sm">Built for a more sustainable future</p>
        </div>
      </footer>
    </div>
  );
}
