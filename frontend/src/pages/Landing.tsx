import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, Link2, Shield, Sparkles, Zap } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen">
      <header className="max-w-6xl mx-auto flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="font-bold text-xl">Shortly</span>
        </div>
        <div className="flex gap-3">
          <Link to="/login" className="btn-ghost text-sm">Login</Link>
          <Link to="/register" className="btn-primary text-sm">Get Started</Link>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-16 pb-24 text-center animate-fadeIn">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs text-white/70 mb-6">
          <Zap size={12} className="text-purple-400" /> Now with click analytics & custom aliases
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.05] tracking-tight">
          <span className="gradient-text">Shorten. Share.</span>
          <br />
          <span className="text-white">Track everything.</span>
        </h1>
        <p className="mt-6 text-lg text-white/60 max-w-2xl mx-auto">
          A blazing-fast link shortener with custom aliases, click tracking, and expiry controls — wrapped in a beautiful dashboard you'll actually enjoy using.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Link to="/register" className="btn-primary inline-flex items-center gap-2">
            Get Started <ArrowRight size={16} />
          </Link>
          <Link to="/login" className="btn-ghost">I already have an account</Link>
        </div>

        {/* preview card */}
        <div className="mt-16 glass p-6 max-w-3xl mx-auto text-left animate-float">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
          </div>
          <div className="flex flex-col md:flex-row items-stretch gap-3">
            <div className="flex-1 input flex items-center text-white/50">https://example.com/really/long/marketing/campaign/url</div>
            <button className="btn-primary flex items-center gap-2 justify-center">
              <Link2 size={16} /> Shorten
            </button>
          </div>
          <div className="mt-3 text-sm text-purple-300">→ http://localhost:5000/johndoe/launch-day</div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-4">
        {[
          { icon: Link2, title: "Custom Aliases", desc: "Choose memorable, on-brand short links instead of random codes." },
          { icon: BarChart3, title: "Click Tracking", desc: "See exactly how each link is performing in real time." },
          { icon: Shield, title: "Expiry & Limits", desc: "Auto-expire links or cap them by clicks. You stay in control." },
        ].map((f, i) => (
          <div key={i} className="glass glass-hover p-6">
            <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center mb-4">
              <f.icon size={18} className="text-white" />
            </div>
            <h3 className="font-semibold text-lg">{f.title}</h3>
            <p className="text-sm text-white/60 mt-1.5">{f.desc}</p>
          </div>
        ))}
      </section>

      <footer className="max-w-6xl mx-auto px-6 py-8 text-center text-white/40 text-sm border-t border-white/5">
        © {new Date().getFullYear()} Shortly. Built with ❤️
      </footer>
    </div>
  );
}
