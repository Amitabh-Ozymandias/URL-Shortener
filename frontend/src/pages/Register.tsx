import { useState } from "react";
import { Link as RLink, useNavigate } from "react-router-dom";
import { Sparkles, Mail, Lock, User, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { api, extractError } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const USERNAME_RE = /^[a-zA-Z0-9_-]{3,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PW_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!USERNAME_RE.test(form.username)) return "Username must be 3-20 chars: letters, numbers, _ or -";
    if (!EMAIL_RE.test(form.email)) return "Invalid email address";
    if (!PW_RE.test(form.password)) return "Password: min 8 chars with upper, lower, and number";
    return null;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate(); if (err) { toast.error(err); return; }
    setLoading(true);
    try {
      const res = await api.post("/api/auth/register", form);
      login(res.data.token, res.data.user);
      toast.success("Account created!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(extractError(err, "Registration failed."));
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
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-white/60 mt-1">Start shortening in seconds</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="text-xs text-white/60 mb-1.5 block">Username</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input className="input pl-10" value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })} required />
              </div>
            </div>
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
              <p className="mt-1.5 text-[11px] text-white/40">Min 8 chars, 1 uppercase, 1 lowercase, 1 number.</p>
            </div>
            <button disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading && <Loader2 size={16} className="animate-spin" />} Create account
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-white/60">
            Already have an account? <RLink to="/login" className="text-purple-400 hover:text-purple-300">Login</RLink>
          </div>
        </div>
      </div>
    </div>
  );
}
