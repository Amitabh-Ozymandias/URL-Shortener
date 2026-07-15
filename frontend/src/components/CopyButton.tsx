import { Check, Copy } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const onClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1500);
    } catch { toast.error("Copy failed"); }
  };
  return (
    <button onClick={onClick} className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-purple-400/40 hover:bg-white/10 transition">
      {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
      {label ?? (copied ? "Copied" : "Copy")}
    </button>
  );
}
