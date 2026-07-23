import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, Link2, Shield, Sparkles, Zap, QrCode, Cpu } from "lucide-react";
import { BASE_URL } from "../lib/api";
import { useState } from "react";

export default function Landing() {
  const [demoInput, setDemoInput] = useState("https://example.com/summer-campaign-analytics-2026");
  const [demoAlias, setDemoAlias] = useState("summer26");

  return (
    <div className="min-h-screen">
      <header className="max-w-6xl mx-auto flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">Shortly</span>
        </div>
        <div className="flex gap-3">
          <Link to="/login" className="btn-ghost text-sm">Login</Link>
          <Link to="/register" className="btn-primary text-sm">Get Started</Link>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-16 pb-24 text-center animate-fadeIn space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-xs text-purple-300 font-semibold border border-purple-500/30">
          <Zap size={14} className="text-amber-400 animate-pulse" /> Supercharged with Sub-Millisecond Redis & In-Memory Caching
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.05] tracking-tight">
          <span className="gradient-text">Shorten. Share.</span>
          <br />
          <span className="text-white">Track at Lightning Speed.</span>
        </h1>

        <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
          An enterprise-grade, ultra-low latency link shortener with custom aliases, instant QR codes, real-time telemetry, and non-blocking analytics.
        </p>

        <div className="pt-2 flex flex-wrap gap-3 justify-center">
          <Link to="/register" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-3.5">
            Get Started Free <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn-ghost text-base px-6 py-3.5">I already have an account</Link>
        </div>

        {/* Live Interactive Shortener Demo Preview Card */}
        <div className="mt-16 glass p-6 max-w-3xl mx-auto text-left border border-purple-500/20 shadow-2xl shadow-purple-500/10">
          <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="text-xs font-mono text-white/40 ml-2">shortly-demo-widget</span>
            </div>
            <span className="badge badge-green text-[10px]">Sub-ms Engine Active</span>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col md:flex-row items-stretch gap-3">
              <input
                className="input flex-1 text-sm font-mono"
                value={demoInput}
                onChange={(e) => setDemoInput(e.target.value)}
              />
              <button className="btn-primary flex items-center gap-2 justify-center px-6">
                <Link2 size={16} /> Shorten
              </button>
            </div>

            <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-center justify-between flex-wrap gap-2 text-sm">
              <div className="font-mono text-purple-300">
                → {BASE_URL}/demo/{demoAlias}
              </div>
              <div className="text-xs text-green-400 font-mono flex items-center gap-1">
                <Zap size={12} /> Response Time: 0.4ms
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-6xl mx-auto px-6 pb-24 grid md:grid-cols-4 gap-4">
        {[
          { icon: Link2, title: "Custom Short Aliases", desc: "Craft branded, memorable short links instead of random code strings." },
          { icon: Zap, title: "Sub-Millisecond Engine", desc: "In-memory LRU + L2 Redis caching for ultra-fast redirect resolutions." },
          { icon: QrCode, title: "Instant QR Codes", desc: "One-click QR code generation & high-res PNG downloads for print & social." },
          { icon: BarChart3, title: "Non-Blocking Analytics", desc: "Asynchronous batch analytics queues tracking clicks without slowing redirects." },
        ].map((f, i) => (
          <div key={i} className="glass glass-hover p-6 border border-white/5">
            <div className="w-11 h-11 rounded-xl bg-brand-gradient flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20">
              <f.icon size={20} className="text-white" />
            </div>
            <h3 className="font-bold text-base">{f.title}</h3>
            <p className="text-xs text-white/60 mt-2 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      <footer className="max-w-6xl mx-auto px-6 py-8 text-center text-white/40 text-xs border-t border-white/5">
        © {new Date().getFullYear()} Shortly. Built with high-performance Node.js, React & Redis.
      </footer>
    </div>
  );
}
