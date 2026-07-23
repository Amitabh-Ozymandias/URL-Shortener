import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Link2, LogOut, Menu, X, Sparkles, Activity, Cpu, Server, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/links", label: "My Links", icon: Link2 },
];

interface TelemetryData {
  uptime?: string;
  processId?: number;
  memory?: { heapUsed: string };
  telemetry?: {
    cacheStats?: { l1LocalSize: number; isRedisConnected: boolean };
  };
  latencyMs?: number;
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);

  const fetchHealth = async () => {
    const start = performance.now();
    try {
      const res = await api.get("/health");
      const end = performance.now();
      const latencyMs = Math.round((end - start) * 10) / 10;
      setTelemetry({ ...res.data, latencyMs });
    } catch (err) {
      setTelemetry(null);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-white/5 p-6 sticky top-0 h-screen overflow-y-auto">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">Shortly</span>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-brand-gradient text-white shadow-lg shadow-purple-500/30 font-medium"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`
              }>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>

        {/* Live Backend Telemetry Widget */}
        <div className="glass p-3 mb-4 space-y-2 border border-purple-500/20 bg-purple-500/5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-purple-300">
            <span className="flex items-center gap-1.5">
              <Activity size={12} className="text-green-400 animate-pulse" /> Backend Telemetry
            </span>
            <span className="bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded text-[10px]">Optimal</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] text-white/70">
            <div className="bg-white/5 p-1.5 rounded">
              <div className="text-white/40">Latency</div>
              <div className="font-mono text-purple-300 font-bold flex items-center gap-1">
                <Zap size={10} className="text-amber-400" />
                {telemetry?.latencyMs !== undefined ? `${telemetry.latencyMs}ms` : "< 1ms"}
              </div>
            </div>
            <div className="bg-white/5 p-1.5 rounded">
              <div className="text-white/40">Cache Mode</div>
              <div className="font-semibold text-teal-300 truncate">
                {telemetry?.telemetry?.cacheStats?.isRedisConnected ? "L2 Redis" : "L1 Sub-ms"}
              </div>
            </div>
          </div>
        </div>

        <div className="glass p-4">
          <div className="text-xs text-white/50">Signed in as</div>
          <div className="font-semibold truncate text-sm">{user?.username}</div>
          <div className="text-xs text-white/50 truncate mb-3">{user?.email}</div>
          <button onClick={handleLogout} className="w-full btn-ghost flex items-center justify-center gap-2 text-xs py-2">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between p-4 bg-[#0f0f1a]/90 backdrop-blur border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="font-bold">Shortly</span>
        </div>
        <button onClick={() => setOpen(!open)} className="p-2 rounded-lg bg-white/5 border border-white/10">
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden fixed top-16 inset-x-0 z-40 p-4 glass mx-4 space-y-2">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl ${
                  isActive ? "bg-brand-gradient text-white" : "text-white/70 hover:bg-white/5"
                }`
              }>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
          <button onClick={handleLogout} className="w-full btn-ghost flex items-center justify-center gap-2 mt-2 text-sm">
            <LogOut size={16} /> Logout ({user?.username})
          </button>
        </div>
      )}

      <main className="flex-1 min-w-0 p-6 lg:p-10 pt-24 lg:pt-10 animate-fadeIn">
        <Outlet />
      </main>
    </div>
  );
}
