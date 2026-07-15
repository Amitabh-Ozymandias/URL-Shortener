import { Link } from "../lib/types";

export function getLinkStatus(link: Link): "active" | "expired" | "disabled" | "clicklimit" {
  if (!link.active) return "disabled";
  if (link.expiresAt && new Date(link.expiresAt) < new Date()) return "expired";
  if (typeof link.maxClicks === "number" && link.clicks >= link.maxClicks) return "clicklimit";
  return "active";
}

export default function StatusBadge({ status }: { status: ReturnType<typeof getLinkStatus> }) {
  const map = {
    active: { cls: "badge-green", label: "Active" },
    expired: { cls: "badge-orange", label: "Expired" },
    disabled: { cls: "badge-red", label: "Disabled" },
    clicklimit: { cls: "badge-yellow", label: "Limit Reached" },
  } as const;
  const s = map[status];
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}
