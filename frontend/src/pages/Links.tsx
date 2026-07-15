import { useEffect, useState, useCallback } from "react";
import { api, BASE_URL, extractError } from "../lib/api";
import { Link as LinkT } from "../lib/types";
import { Search, Plus, Trash2, Edit3, ChevronLeft, ChevronRight, Loader2, ExternalLink, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "../components/Modal";
import CopyButton from "../components/CopyButton";
import StatusBadge, { getLinkStatus } from "../components/StatusBadge";

const ALIAS_RE = /^[a-zA-Z0-9_-]{3,30}$/;

export default function Links() {
  const [links, setLinks] = useState<LinkT[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [order, setOrder] = useState<"asc"|"desc">("desc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLinks, setTotalLinks] = useState(0);

  const [createOpen, setCreateOpen] = useState(false);
  const [editLink, setEditLink] = useState<LinkT | null>(null);
  const [confirmDel, setConfirmDel] = useState<LinkT | null>(null);

  const fetchLinks = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 10, sort, order };
      if (search) params.search = search;
      if (status) params.status = status;
      const res = await api.get("/api/links", { params });
      setLinks(res.data.links || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalLinks(res.data.totalLinks || 0);
    } catch (err: any) { toast.error(extractError(err, "Failed to load links")); }
    finally { setLoading(false); }
  }, [page, sort, order, search, status]);

  useEffect(() => {
    const t = setTimeout(fetchLinks, 250);
    return () => clearTimeout(t);
  }, [fetchLinks]);

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">My Links</h1>
          <p className="text-white/60 text-sm mt-1">{totalLinks} total</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="btn-primary text-sm inline-flex items-center gap-2">
          <Plus size={16} /> New Link
        </button>
      </header>

      <div className="glass p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input placeholder="Search alias or URL..." className="input pl-10"
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="input max-w-[180px]" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="disabled">Disabled</option>
          <option value="clicklimit">Click Limit</option>
        </select>
        <select className="input max-w-[180px]" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="createdAt">Sort: Created</option>
          <option value="clicks">Sort: Clicks</option>
          <option value="alias">Sort: Alias</option>
        </select>
        <select className="input max-w-[130px]" value={order} onChange={(e) => setOrder(e.target.value as any)}>
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
      </div>

      {loading ? (
        <div className="grid gap-3">
          {Array.from({length:4}).map((_,i)=><div key={i} className="skeleton h-28" />)}
        </div>
      ) : links.length === 0 ? (
        <div className="glass p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-gradient flex items-center justify-center mx-auto mb-4">
            <Sparkles size={22} className="text-white" />
          </div>
          <h3 className="text-lg font-semibold">No links yet</h3>
          <p className="text-white/60 text-sm mt-1">Create your first short link to get started.</p>
          <button onClick={() => setCreateOpen(true)} className="btn-primary mt-5 inline-flex items-center gap-2">
            <Plus size={16} /> Create link
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          {links.map(l => <LinkCard key={l._id} link={l} onEdit={() => setEditLink(l)} onDelete={() => setConfirmDel(l)} />)}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between glass p-3">
          <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p-1))} className="btn-ghost text-sm inline-flex items-center gap-1 disabled:opacity-40">
            <ChevronLeft size={14} /> Prev
          </button>
          <div className="text-sm text-white/60">Page {page} of {totalPages}</div>
          <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p+1))} className="btn-ghost text-sm inline-flex items-center gap-1 disabled:opacity-40">
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}

      <CreateModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={fetchLinks} />
      <EditModal link={editLink} onClose={() => setEditLink(null)} onSaved={fetchLinks} />
      <DeleteModal link={confirmDel} onClose={() => setConfirmDel(null)} onDeleted={fetchLinks} />
    </div>
  );
}

function LinkCard({ link, onEdit, onDelete }: { link: LinkT; onEdit: () => void; onDelete: () => void }) {
  const shortUrl = `${BASE_URL}/${link.slug}`;
  const max = link.maxClicks ?? 10;
  const pct = Math.min(100, Math.round((link.clicks / Math.max(1, max)) * 100));
  return (
    <div className="glass glass-hover p-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <a href={shortUrl} target="_blank" rel="noreferrer" className="text-lg font-semibold hover:text-purple-300 inline-flex items-center gap-1.5">
              {link.alias} <ExternalLink size={13} className="opacity-60" />
            </a>
            <StatusBadge status={getLinkStatus(link)} />
          </div>
          <div className="text-sm text-purple-300 truncate mt-1 flex items-center gap-2">
            <span className="truncate">{shortUrl}</span>
            <CopyButton text={shortUrl} />
          </div>
          {link.originalUrl && <div className="text-xs text-white/50 truncate mt-1">→ {link.originalUrl}</div>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onEdit} className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-purple-400/40 hover:bg-white/10 transition" title="Edit"><Edit3 size={15} /></button>
          <button onClick={onDelete} className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-red-400/40 hover:bg-red-500/10 transition" title="Delete"><Trash2 size={15} className="text-red-300" /></button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div>
          <div className="text-white/50">Clicks</div>
          <div className="font-semibold text-sm mt-0.5">{link.clicks} / {max}</div>
          <div className="progress mt-1.5"><div style={{ width: `${pct}%` }} /></div>
        </div>
        <div>
          <div className="text-white/50">Expires</div>
          <div className="font-medium mt-0.5">{link.expiresAt ? new Date(link.expiresAt).toLocaleDateString() : "—"}</div>
        </div>
        <div>
          <div className="text-white/50">Created</div>
          <div className="font-medium mt-0.5">{new Date(link.createdAt).toLocaleDateString()}</div>
        </div>
        <div>
          <div className="text-white/50">Active</div>
          <div className="font-medium mt-0.5">{link.active ? "Yes" : "No"}</div>
        </div>
      </div>
    </div>
  );
}

function CreateModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<{ shortUrl: string } | null>(null);

  const reset = () => { setUrl(""); setAlias(""); setCreated(null); };
  const close = () => { reset(); onClose(); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { new URL(url); } catch { toast.error("Enter a valid URL"); return; }
    if (!ALIAS_RE.test(alias)) { toast.error("Alias: 3-30 chars, letters/numbers/_/-"); return; }
    setLoading(true);
    try {
      const res = await api.post("/api/links", { url, alias });
      setCreated({ shortUrl: res.data.link.shortUrl });
      toast.success("Link created!");
      onCreated();
    } catch (err: any) { toast.error(extractError(err, "Failed to create link")); }
    finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={close} title={created ? "Link created 🎉" : "Create new link"}>
      {created ? (
        <div className="space-y-4">
          <div className="glass p-4 flex items-center justify-between gap-3">
            <span className="text-purple-300 truncate">{created.shortUrl}</span>
            <CopyButton text={created.shortUrl} label="Copy" />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={reset} className="btn-ghost">Create another</button>
            <button onClick={close} className="btn-primary">Done</button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs text-white/60 mb-1.5 block">Long URL</label>
            <input className="input" placeholder="https://example.com/…" value={url} onChange={(e) => setUrl(e.target.value)} required />
          </div>
          <div>
            <label className="text-xs text-white/60 mb-1.5 block">Custom alias</label>
            <input className="input" placeholder="my-alias" value={alias} onChange={(e) => setAlias(e.target.value)} required />
            <p className="mt-1.5 text-[11px] text-white/40">3-30 chars: letters, numbers, _ or -</p>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={close} className="btn-ghost">Cancel</button>
            <button disabled={loading} className="btn-primary inline-flex items-center gap-2">
              {loading && <Loader2 size={14} className="animate-spin" />} Create
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

function EditModal({ link, onClose, onSaved }: { link: LinkT | null; onClose: () => void; onSaved: () => void }) {
  const [alias, setAlias] = useState("");
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (link) { setAlias(link.alias); setActive(link.active); }
  }, [link]);

  if (!link) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body: any = {};
    if (alias && alias !== link.alias) {
      if (!ALIAS_RE.test(alias)) { toast.error("Alias: 3-30 chars, letters/numbers/_/-"); return; }
      body.alias = alias;
    }
    if (active !== link.active) body.active = active;
    if (!Object.keys(body).length) { toast("No changes"); onClose(); return; }
    setLoading(true);
    try {
      await api.patch(`/api/links/${link._id}`, body);
      toast.success("Link updated");
      onSaved(); onClose();
    } catch (err: any) { toast.error(extractError(err, "Update failed")); }
    finally { setLoading(false); }
  };

  return (
    <Modal open={!!link} onClose={onClose} title="Edit link">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-xs text-white/60 mb-1.5 block">Alias</label>
          <input className="input" value={alias} onChange={(e) => setAlias(e.target.value)} />
        </div>
        <div className="flex items-center justify-between glass p-3">
          <div>
            <div className="text-sm font-medium">Active</div>
            <div className="text-xs text-white/50">Toggle the link on or off</div>
          </div>
          <button type="button" onClick={() => setActive(!active)}
            className={`relative w-12 h-7 rounded-full transition ${active ? "bg-brand-gradient" : "bg-white/10"}`}>
            <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${active ? "left-6" : "left-1"}`} />
          </button>
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button disabled={loading} className="btn-primary inline-flex items-center gap-2">
            {loading && <Loader2 size={14} className="animate-spin" />} Save
          </button>
        </div>
      </form>
    </Modal>
  );
}

function DeleteModal({ link, onClose, onDeleted }: { link: LinkT | null; onClose: () => void; onDeleted: () => void }) {
  const [loading, setLoading] = useState(false);
  if (!link) return null;
  const submit = async () => {
    setLoading(true);
    try {
      await api.delete(`/api/links/${link._id}`);
      toast.success("Link disabled");
      onDeleted(); onClose();
    } catch (err: any) { toast.error(extractError(err, "Delete failed")); }
    finally { setLoading(false); }
  };
  return (
    <Modal open={!!link} onClose={onClose} title="Disable this link?">
      <p className="text-sm text-white/70">
        This will soft-delete <span className="font-semibold text-white">{link.alias}</span>. It will no longer redirect and will be hidden from your active links.
      </p>
      <div className="flex gap-2 justify-end mt-6">
        <button onClick={onClose} className="btn-ghost">Cancel</button>
        <button onClick={submit} disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-red-500 to-rose-600 hover:shadow-lg hover:shadow-red-500/30 transition disabled:opacity-60">
          {loading && <Loader2 size={14} className="animate-spin" />} Disable
        </button>
      </div>
    </Modal>
  );
}
