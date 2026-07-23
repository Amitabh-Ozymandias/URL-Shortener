import { useState } from "react";
import Modal from "./Modal";
import { Link as LinkT } from "../lib/types";
import { BASE_URL } from "../lib/api";
import { MousePointerClick, Calendar, ShieldCheck, Globe, Cpu } from "lucide-react";
import StatusBadge, { getLinkStatus } from "./StatusBadge";

interface AnalyticsModalProps {
  link: LinkT | null;
  onClose: () => void;
}

export default function AnalyticsModal({ link, onClose }: AnalyticsModalProps) {
  if (!link) return null;

  const shortUrl = `${BASE_URL}/${link.slug}`;
  const max = link.maxClicks ?? 10;
  const remaining = Math.max(0, max - link.clicks);

  return (
    <Modal open={!!link} onClose={onClose} title={`Analytics: /${link.alias}`}>
      <div className="space-y-6 py-1">
        {/* Header summary */}
        <div className="glass p-4 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-purple-300 font-mono text-sm font-semibold truncate">{shortUrl}</span>
            <StatusBadge status={getLinkStatus(link)} />
          </div>
          {link.originalUrl && (
            <div className="text-xs text-white/60 truncate">
              Original: <a href={link.originalUrl} target="_blank" rel="noreferrer" className="underline hover:text-white">{link.originalUrl}</a>
            </div>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="glass p-4">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold mb-1">
              <MousePointerClick size={14} /> Total Clicks
            </div>
            <div className="text-2xl font-extrabold">{link.clicks}</div>
          </div>
          <div className="glass p-4">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-1">
              <Cpu size={14} /> Remaining Clicks
            </div>
            <div className="text-2xl font-extrabold">{remaining}</div>
          </div>
          <div className="glass p-4 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold mb-1">
              <ShieldCheck size={14} /> Active Status
            </div>
            <div className="text-lg font-bold">{link.active ? "Enabled" : "Disabled"}</div>
          </div>
        </div>

        {/* Link metadata details */}
        <div className="glass p-4 space-y-3 text-xs">
          <div className="font-semibold text-white/80 border-b border-white/10 pb-2">Link Properties</div>
          <div className="flex justify-between py-1">
            <span className="text-white/50">Created Date:</span>
            <span className="font-medium text-white/90">{new Date(link.createdAt).toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-1 border-t border-white/5">
            <span className="text-white/50">Expires At:</span>
            <span className="font-medium text-white/90">{link.expiresAt ? new Date(link.expiresAt).toLocaleString() : "Never"}</span>
          </div>
          <div className="flex justify-between py-1 border-t border-white/5">
            <span className="text-white/50">Max Allowed Clicks:</span>
            <span className="font-medium text-white/90">{max}</span>
          </div>
        </div>

        {/* Recent Visits Log */}
        <div className="glass p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Globe size={14} className="text-purple-400" /> Recent Visit Logs
            </h4>
            <span className="text-[11px] text-white/40">{link.visits?.length || 0} recorded</span>
          </div>

          {link.visits && link.visits.length > 0 ? (
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {link.visits.slice(-10).reverse().map((v, i) => (
                <div key={i} className="flex items-center justify-between text-xs bg-white/5 p-2.5 rounded-lg border border-white/5">
                  <div>
                    <div className="font-mono text-purple-300">{v.ip || "127.0.0.1"}</div>
                    <div className="text-[10px] text-white/40 truncate max-w-[200px]">{v.userAgent || "Browser"}</div>
                  </div>
                  <div className="text-[11px] text-white/50">{v.timestamp ? new Date(v.timestamp).toLocaleTimeString() : "Just now"}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-white/40 text-center py-6">No individual visit logs recorded yet.</div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button onClick={onClose} className="btn-primary text-sm px-6">
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
