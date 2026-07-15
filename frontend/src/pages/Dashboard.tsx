import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, BASE_URL, extractError } from "../lib/api";
import { DashboardStats, Link as LinkT } from "../lib/types";
import { Link2, TrendingUp, CheckCircle2, XCircle, Clock, MousePointerClick, Gauge, ExternalLink } from "lucide-react";
import StatusBadge, { getLinkStatus } from "../components/StatusBadge";
import CopyButton from "../components/CopyButton";
import toast from "react-hot-toast";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface DashData { stats: DashboardStats; mostClicked?: any; recentLinks: LinkT[]; }

const STAT_ICONS = [Link2, CheckCircle2, Clock, XCircle, Gauge, MousePointerClick];
const STAT_COLORS = ["from-indigo-500 to-purple-500","from-emerald-500 to-teal-500","from-orange-500 to-amber-500","from-rose-500 to-red-500","from-yellow-500 to-orange-500","from-fuchsia-500 to-pink-500"];

export default function Dashboard() {
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/dashboard")
      .then((res) => setData(res.data))
      .catch((err) => toast.error(extractError(err, "Failed to load dashboard")))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <SkeletonDash />;
  if (!data) return <div className="text-white/60">No data.</div>;

  const s = data.stats;
  const cards = [
    { label: "Total Links", value: s.totalLinks },
    { label: "Active Links", value: s.activeLinks },
    { label: "Expired Links", value: s.expiredLinks },
    { label: "Disabled Links", value: s.disabledLinks },
    { label: "Limit Reached", value: s.clickLimitReached },
    { label: "Total Clicks", value: s.totalClicks },
  ];
  const pie = [
    { name: "Active", value: s.activeLinks, color: "#22c55e" },
    { name: "Expired", value: s.expiredLinks, color: "#fb923c" },
    { name: "Disabled", value: s.disabledLinks, color: "#ef4444" },
    { name: "Limit", value: s.clickLimitReached, color: "#eab308" },
  ].filter(x => x.value > 0);

  const mc = data.mostClicked;

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-white/60 text-sm mt-1">A snapshot of your links and clicks.</p>
        </div>
        <Link to="/links" className="btn-primary text-sm inline-flex items-center gap-2">
          Manage Links <ExternalLink size={14} />
        </Link>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {cards.map((c, i) => {
          const Icon = STAT_ICONS[i];
          return (
            <div key={c.label} className="glass glass-hover p-4">
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${STAT_COLORS[i]} flex items-center justify-center mb-3`}>
                <Icon size={16} className="text-white" />
              </div>
              <div className="text-2xl font-bold">{c.value}</div>
              <div className="text-xs text-white/60 mt-0.5">{c.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="glass p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-purple-400" />
            <h2 className="font-semibold">Most Clicked Link</h2>
          </div>
          {mc ? (
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="min-w-0 flex-1">
                <div className="text-xl font-bold truncate">{mc.alias}</div>
                <div className="text-sm text-purple-300 truncate mt-1">{`${BASE_URL}/${mc.slug}`}</div>
                {mc.originalUrl && <div className="text-xs text-white/50 truncate mt-1">→ {mc.originalUrl}</div>}
              </div>
              <div className="text-right">
                <div className="text-4xl font-extrabold gradient-text">{mc.clicks}</div>
                <div className="text-xs text-white/50">clicks</div>
              </div>
              <CopyButton text={`${BASE_URL}/${mc.slug}`} />
            </div>
          ) : <div className="text-white/50 text-sm">No clicks yet.</div>}
        </div>

        <div className="glass p-6">
          <h2 className="font-semibold mb-2">Link Distribution</h2>
          {pie.length ? (
            <div className="h-48">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pie} innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                    {pie.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : <div className="text-sm text-white/50">No data.</div>}
          <div className="flex flex-wrap gap-3 mt-2 text-xs">
            {pie.map(p => <div key={p.name} className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: p.color }} />{p.name}: {p.value}</div>)}
          </div>
        </div>
      </div>

      <div className="glass p-6">
        <h2 className="font-semibold mb-4">Recent Links</h2>
        {data.recentLinks?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-white/50 text-xs uppercase">
                <tr>
                  <th className="py-2 pr-4">Alias</th>
                  <th className="py-2 pr-4">Short URL</th>
                  <th className="py-2 pr-4">Clicks</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Created</th>
                </tr>
              </thead>
              <tbody>
                {data.recentLinks.map(l => (
                  <tr key={l._id} className="border-t border-white/5 hover:bg-white/[0.02]">
                    <td className="py-3 pr-4 font-medium">{l.alias}</td>
                    <td className="py-3 pr-4 text-purple-300 truncate max-w-[240px]">{`${BASE_URL}/${l.slug}`}</td>
                    <td className="py-3 pr-4">{l.clicks}</td>
                    <td className="py-3 pr-4"><StatusBadge status={getLinkStatus(l)} /></td>
                    <td className="py-3 pr-4 text-white/60 text-xs">{new Date(l.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="text-white/50 text-sm">No links yet.</div>}
      </div>
    </div>
  );
}

function SkeletonDash() {
  return (
    <div className="space-y-6">
      <div className="skeleton h-10 w-64" />
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {Array.from({length:6}).map((_,i)=><div key={i} className="skeleton h-24" />)}
      </div>
      <div className="skeleton h-40" />
      <div className="skeleton h-64" />
    </div>
  );
}
