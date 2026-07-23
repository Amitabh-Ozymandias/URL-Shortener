import { QRCodeCanvas } from "qrcode.react";
import { Download, X, Copy, Check } from "lucide-react";
import { useState } from "react";
import Modal from "./Modal";
import toast from "react-hot-toast";

interface QRCodeModalProps {
  url: string | null;
  alias: string;
  onClose: () => void;
}

export default function QRCodeModal({ url, alias, onClose }: QRCodeModalProps) {
  const [copied, setCopied] = useState(false);

  if (!url) return null;

  const downloadQR = () => {
    const canvas = document.getElementById("qr-canvas") as HTMLCanvasElement;
    if (!canvas) return;

    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = `qr-${alias}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("QR Code downloaded!");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Short URL copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal open={!!url} onClose={onClose} title="QR Code Generator">
      <div className="flex flex-col items-center space-y-6 py-2">
        <div className="p-4 bg-white rounded-2xl shadow-2xl shadow-purple-500/20 border border-purple-500/30 flex items-center justify-center">
          <QRCodeCanvas
            id="qr-canvas"
            value={url}
            size={200}
            bgColor="#ffffff"
            fgColor="#0f0f1a"
            level="H"
            includeMargin={true}
          />
        </div>

        <div className="text-center space-y-1 w-full">
          <div className="text-xs text-white/50 uppercase tracking-wider font-semibold">Short Link</div>
          <div className="text-sm font-mono text-purple-300 bg-white/5 p-2.5 rounded-xl border border-white/10 truncate flex items-center justify-between gap-2">
            <span className="truncate">{url}</span>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition text-white"
              title="Copy URL"
            >
              {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        <div className="flex gap-3 w-full justify-end">
          <button onClick={onClose} className="btn-ghost text-sm flex-1">
            Close
          </button>
          <button onClick={downloadQR} className="btn-primary text-sm flex-1 inline-flex items-center justify-center gap-2">
            <Download size={16} /> Download PNG
          </button>
        </div>
      </div>
    </Modal>
  );
}
