import { useState } from "react";
import { Link as RLink, useNavigate } from "react-router-dom";
import { Sparkles, Mail, Lock, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { api, extractError } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error("Email and password are required"); return; }
    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", form);
      login(res.data.token, res.data.user);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(extractError(err, "Invalid credentials."));
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-fadeIn">
        <RLink to="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <span className="font-bold text-2xl">Shortly</span>
        </RLink>

        <div className="glass p-8">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-sm text-white/60 mt-1">Login to manage your links</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="text-xs text-white/60 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input type="email" className="input pl-10" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>
            <div>
              <label className="text-xs text-white/60 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input type="password" className="input pl-10" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              </div>
            </div>
            <button disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading && <Loader2 size={16} className="animate-spin" />} Login
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-white/60">
            No account? <RLink to="/register" className="text-purple-400 hover:text-purple-300">Sign up</RLink>
          </div>
        </div>
      </div>
    </div>
  );
}
