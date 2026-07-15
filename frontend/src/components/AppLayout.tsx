import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Link2, LogOut, Menu, X, Sparkles } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/links", label: "My Links", icon: Link2 },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-white/5 p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="font-bold text-xl">Shortly</span>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-brand-gradient text-white shadow-lg shadow-purple-500/30"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`
              }>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="glass p-4">
          <div className="text-xs text-white/50">Signed in as</div>
          <div className="font-semibold truncate">{user?.username}</div>
          <div className="text-xs text-white/50 truncate">{user?.email}</div>
          <button onClick={handleLogout} className="mt-3 w-full btn-ghost flex items-center justify-center gap-2 text-sm">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between p-4 bg-[#0f0f1a]/80 backdrop-blur border-b border-white/5">
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
        <div className="lg:hidden fixed top-16 inset-x-0 z-40 p-4 glass mx-4">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl mb-1 ${
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
