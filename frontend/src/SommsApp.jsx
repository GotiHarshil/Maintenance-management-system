import { useState, useEffect, useCallback, createContext, useContext } from "react";
import {
  LayoutDashboard, Ticket, Users, FileText, CreditCard, BarChart3,
  Wrench, Bell, LogOut, Menu, X, Plus, ChevronRight, Clock,
  AlertTriangle, CheckCircle, XCircle, Eye, ArrowLeft, Filter,
  RefreshCw, Search, ChevronDown, Edit, Trash2, MapPin, Settings,
  TrendingUp, DollarSign, Timer, Shield, Loader2
} from "lucide-react";

/* ─── API Layer ─── */
const API_BASE = "http://localhost:5000/api";

const api = {
  token: null,
  setToken(t) { this.token = t; localStorage.setItem("token", t); },
  getToken() { return this.token || localStorage.getItem("token"); },
  clearToken() { this.token = null; localStorage.removeItem("token"); localStorage.removeItem("user"); },
  async req(method, path, body) {
    const headers = { "Content-Type": "application/json" };
    const t = this.getToken();
    if (t) headers["Authorization"] = `Bearer ${t}`;
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        method, headers, body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      if (!res.ok) throw { status: res.status, message: data.message || "Request failed" };
      return data;
    } catch (e) {
      if (e.status === 401) { this.clearToken(); window.location.hash = "#/login"; }
      throw e;
    }
  },
  get: (p) => api.req("GET", p),
  post: (p, b) => api.req("POST", p, b),
  patch: (p, b) => api.req("PATCH", p, b),
  delete: (p) => api.req("DELETE", p),
};

/* ─── Auth Context ─── */
const AuthCtx = createContext();
const useAuth = () => useContext(AuthCtx);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = api.getToken();
    if (t) {
      api.get("/auth/me").then(setUser).catch(() => api.clearToken()).finally(() => setLoading(false));
    } else setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await api.post("/auth/login", { email, password });
    api.setToken(data.token);
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => { api.clearToken(); setUser(null); };

  return <AuthCtx.Provider value={{ user, login, logout, loading }}>{children}</AuthCtx.Provider>;
}

/* ─── Tiny Router ─── */
function useRouter() {
  const [route, setRoute] = useState(window.location.hash.slice(2) || "login");
  useEffect(() => {
    const h = () => setRoute(window.location.hash.slice(2) || "login");
    window.addEventListener("hashchange", h);
    return () => window.removeEventListener("hashchange", h);
  }, []);
  const nav = (r) => { window.location.hash = `#/${r}`; };
  const path = route.split("/")[0];
  const param = route.split("/")[1];
  return { route, path, param, nav };
}

/* ─── UI Components ─── */
const cn = (...c) => c.filter(Boolean).join(" ");

function Badge({ children, variant = "default", className }) {
  const v = {
    default: "bg-slate-100 text-slate-700",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    danger: "bg-red-50 text-red-700 border border-red-200",
    info: "bg-blue-50 text-blue-700 border border-blue-200",
    purple: "bg-violet-50 text-violet-700 border border-violet-200",
  };
  return <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", v[variant], className)}>{children}</span>;
}

function Button({ children, variant = "primary", size = "md", className, loading: ld, ...props }) {
  const v = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 shadow-sm",
    secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 shadow-sm",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
    ghost: "text-slate-600 hover:bg-slate-100",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
  };
  const s = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-6 py-2.5 text-base" };
  return (
    <button className={cn("inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed", v[variant], s[size], className)} disabled={ld || props.disabled} {...props}>
      {ld && <Loader2 size={14} className="animate-spin" />}{children}
    </button>
  );
}

function Card({ children, className, ...props }) {
  return <div className={cn("bg-white rounded-xl border border-slate-200 shadow-sm", className)} {...props}>{children}</div>;
}

function Input({ label, className, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}
      <input className={cn("w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all placeholder:text-slate-400", className)} {...props} />
    </div>
  );
}

function Select({ label, options, className, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}
      <select className={cn("w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white", className)} {...props}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Textarea({ label, className, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}
      <textarea className={cn("w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent placeholder:text-slate-400 resize-none", className)} rows={4} {...props} />
    </div>
  );
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={18} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, desc, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4"><Icon size={24} className="text-slate-400" /></div>
      <h3 className="text-base font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 mb-4 max-w-sm">{desc}</p>
      {action}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, trend, color = "slate" }) {
  const colors = { slate: "bg-slate-50 text-slate-600", emerald: "bg-emerald-50 text-emerald-600", amber: "bg-amber-50 text-amber-600", red: "bg-red-50 text-red-600", blue: "bg-blue-50 text-blue-600", violet: "bg-violet-50 text-violet-600" };
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div><p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p><p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>{trend && <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1"><TrendingUp size={12} />{trend}</p>}</div>
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", colors[color])}><Icon size={20} /></div>
      </div>
    </Card>
  );
}

function LoadingSpinner() {
  return <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-slate-400" /></div>;
}

function Toast({ message, type = "success", onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  const c = type === "error" ? "bg-red-600" : type === "warning" ? "bg-amber-500" : "bg-emerald-600";
  return (
    <div className={cn("fixed top-4 right-4 z-[100] text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium animate-slide-in", c)}>
      {type === "error" ? <XCircle size={16} /> : <CheckCircle size={16} />}{message}
    </div>
  );
}

/* ─── Status & Priority Helpers ─── */
const statusColors = { CREATED: "info", REVIEWED: "info", ASSIGNED: "purple", ACCEPTED: "purple", ESTIMATION_SUBMITTED: "warning", ESTIMATION_APPROVED: "warning", IN_PROGRESS: "info", ON_HOLD: "warning", WORK_COMPLETED: "success", VERIFIED: "success", DISPUTED: "danger", BILLED: "purple", PAID: "success", CLOSED: "default" };
const priorityColors = { LOW: "default", MEDIUM: "info", HIGH: "warning", EMERGENCY: "danger" };
const statusLabel = (s) => s?.replace(/_/g, " ") || "";

/* ─── SIDEBAR LAYOUT ─── */
function Layout({ children }) {
  const { user, logout } = useAuth();
  const { path, nav } = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    if (user) api.get("/notifications?unreadOnly=true&limit=1").then(d => setNotifCount(d.unreadCount || 0)).catch(() => {});
  }, [user, path]);

  const role = user?.role;
  const links = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "TECHNICIAN", "USER", "FINANCE"] },
    { id: "tickets", label: "Tickets", icon: Ticket, roles: ["ADMIN", "TECHNICIAN", "USER", "FINANCE"] },
    { id: "technician-board", label: "My Tasks", icon: Wrench, roles: ["TECHNICIAN"] },
    { id: "users", label: "Users", icon: Users, roles: ["ADMIN"] },
    { id: "locations", label: "Locations", icon: MapPin, roles: ["ADMIN"] },
    { id: "invoices", label: "Invoices", icon: FileText, roles: ["ADMIN", "FINANCE"] },
    { id: "analytics", label: "Analytics", icon: BarChart3, roles: ["ADMIN", "FINANCE"] },
    { id: "notifications", label: "Notifications", icon: Bell, roles: ["ADMIN", "TECHNICIAN", "USER", "FINANCE"], badge: notifCount },
  ].filter(l => l.roles.includes(role));

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className={cn("flex flex-col bg-white border-r border-slate-200 transition-all duration-200", collapsed ? "w-16" : "w-60")}>
        <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-200">
          <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-lg hover:bg-slate-100"><Menu size={18} /></button>
          {!collapsed && <span className="font-bold text-slate-900 text-sm tracking-tight">SOMMS</span>}
        </div>
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {links.map(l => (
            <button key={l.id} onClick={() => nav(l.id)} className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all", path === l.id ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900")}>
              <l.icon size={18} />
              {!collapsed && <span className="flex-1 text-left">{l.label}</span>}
              {!collapsed && l.badge > 0 && <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">{l.badge}</span>}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-200">
          {!collapsed && (
            <div className="flex items-center gap-3 px-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">{user?.fullName?.[0]}</div>
              <div className="flex-1 min-w-0"><p className="text-sm font-medium text-slate-900 truncate">{user?.fullName}</p><p className="text-xs text-slate-500">{role}</p></div>
            </div>
          )}
          <button onClick={logout} className={cn("w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-all", collapsed && "justify-center")}>
            <LogOut size={18} />{!collapsed && "Logout"}
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

/* ─── LOGIN PAGE ─── */
function LoginPage() {
  const { login } = useAuth();
  const { nav } = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      nav("dashboard");
    } catch (e) { setError(e.message || "Login failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"><Wrench size={28} className="text-white" /></div>
          <h1 className="text-2xl font-bold text-slate-900">SOMMS</h1>
          <p className="text-slate-500 text-sm mt-1">Smart Organization Maintenance Management</p>
        </div>
        <Card className="p-8">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-5 flex items-center gap-2"><AlertTriangle size={16} />{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Email" type="email" placeholder="admin@somms.com" value={email} onChange={e => setEmail(e.target.value)} required />
            <Input label="Password" type="password" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} required />
            <Button type="submit" className="w-full" loading={loading}>Sign In</Button>
          </form>
          <div className="mt-6 pt-5 border-t border-slate-200">
            <p className="text-xs text-slate-500 text-center">Default: admin@somms.com / Admin@123456</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ─── DASHBOARD PAGE ─── */
function DashboardPage() {
  const { user } = useAuth();
  const { nav } = useRouter();
  const [stats, setStats] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      ["ADMIN", "FINANCE"].includes(user?.role) ? api.get("/analytics/dashboard").catch(() => null) : null,
      api.get("/tickets?limit=5").catch(() => ({ tickets: [] })),
    ]).then(([s, t]) => { setStats(s); setRecentTickets(t?.tickets || []); setLoading(false); });
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.fullName?.split(" ")[0]}</h1>
        <p className="text-slate-500 text-sm mt-1">Here's what's happening with your maintenance operations</p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Tickets" value={stats.slaStats?.totalTickets || 0} icon={Ticket} color="blue" />
          <StatCard label="SLA Compliance" value={`${stats.slaStats?.slaComplianceRate || 100}%`} icon={Shield} color="emerald" />
          <StatCard label="Avg Resolution" value={`${stats.avgResolutionHours || 0}h`} icon={Timer} color="amber" />
          <StatCard label="Revenue" value={`₹${(stats.revenueStats?.totalRevenue || 0).toLocaleString()}`} icon={DollarSign} color="violet" />
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Tickets by Status</h3>
            <div className="space-y-2.5">
              {(stats.ticketsByStatus || []).map(s => {
                const total = stats.slaStats?.totalTickets || 1;
                const pct = Math.round((s.count / total) * 100);
                return (
                  <div key={s._id} className="flex items-center gap-3">
                    <span className="text-xs text-slate-600 w-36 truncate">{statusLabel(s._id)}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-slate-700 rounded-full transition-all" style={{ width: `${pct}%` }} /></div>
                    <span className="text-xs font-medium text-slate-700 w-8 text-right">{s.count}</span>
                  </div>
                );
              })}
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Tickets by Priority</h3>
            <div className="grid grid-cols-2 gap-3">
              {["LOW", "MEDIUM", "HIGH", "EMERGENCY"].map(p => {
                const item = (stats.ticketsByPriority || []).find(i => i._id === p);
                return (
                  <div key={p} className="bg-slate-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-slate-900">{item?.count || 0}</p>
                    <Badge variant={priorityColors[p]} className="mt-1">{p}</Badge>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      <Card>
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-800">Recent Tickets</h3>
          <Button variant="ghost" size="sm" onClick={() => nav("tickets")}>View All <ChevronRight size={14} /></Button>
        </div>
        {recentTickets.length === 0 ? (
          <EmptyState icon={Ticket} title="No tickets yet" desc="Create your first maintenance ticket to get started" action={<Button size="sm" onClick={() => nav("tickets")}><Plus size={14} />Create Ticket</Button>} />
        ) : (
          <div className="divide-y divide-slate-100">
            {recentTickets.map(t => (
              <div key={t._id} onClick={() => nav(`ticket/${t._id}`)} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 cursor-pointer transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-mono text-slate-400">{t.ticketNumber}</span>
                    <Badge variant={priorityColors[t.priority]}>{t.priority}</Badge>
                  </div>
                  <p className="text-sm font-medium text-slate-800 truncate">{t.title}</p>
                </div>
                <Badge variant={statusColors[t.status]}>{statusLabel(t.status)}</Badge>
                <ChevronRight size={16} className="text-slate-300" />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ─── TICKETS PAGE ─── */
function TicketsPage() {
  const { user } = useAuth();
  const { nav } = useRouter();
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filters, setFilters] = useState({ status: "", priority: "", page: 1 });
  const [locations, setLocations] = useState([]);
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({ title: "", description: "", category: "ELECTRICAL", priority: "MEDIUM", locationId: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchTickets = useCallback(() => {
    setLoading(true);
    const params = Object.entries(filters).filter(([_, v]) => v).map(([k, v]) => `${k}=${v}`).join("&");
    api.get(`/tickets?limit=15&${params}`).then(d => { setTickets(d.tickets || []); setPagination(d.pagination || {}); }).catch(() => {}).finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);
  useEffect(() => { api.get("/locations").then(setLocations).catch(() => {}); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/tickets", form);
      setShowCreate(false);
      setForm({ title: "", description: "", category: "ELECTRICAL", priority: "MEDIUM", locationId: "" });
      setToast({ message: "Ticket created successfully", type: "success" });
      fetchTickets();
    } catch (e) { setToast({ message: e.message, type: "error" }); }
    finally { setSubmitting(false); }
  };

  const canCreate = user?.permissions?.includes("CREATE_TICKET");

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-slate-900">Tickets</h1><p className="text-slate-500 text-sm mt-0.5">Manage maintenance requests</p></div>
        {canCreate && <Button onClick={() => setShowCreate(true)}><Plus size={16} />New Ticket</Button>}
      </div>

      <Card className="mb-4">
        <div className="flex flex-wrap items-center gap-3 p-4">
          <Filter size={16} className="text-slate-400" />
          <select className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value, page: 1 })}>
            <option value="">All Status</option>
            {["CREATED","REVIEWED","ASSIGNED","ACCEPTED","ESTIMATION_SUBMITTED","ESTIMATION_APPROVED","IN_PROGRESS","ON_HOLD","WORK_COMPLETED","VERIFIED","DISPUTED","BILLED","PAID","CLOSED"].map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
          </select>
          <select className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white" value={filters.priority} onChange={e => setFilters({ ...filters, priority: e.target.value, page: 1 })}>
            <option value="">All Priority</option>
            {["LOW","MEDIUM","HIGH","EMERGENCY"].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <Button variant="ghost" size="sm" onClick={fetchTickets}><RefreshCw size={14} /></Button>
        </div>
      </Card>

      <Card>
        {loading ? <LoadingSpinner /> : tickets.length === 0 ? (
          <EmptyState icon={Ticket} title="No tickets found" desc="Adjust your filters or create a new ticket" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-slate-200 bg-slate-50/50">
                  {["Ticket", "Title", "Category", "Priority", "Status", "Assigned To", "Created"].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {tickets.map(t => (
                    <tr key={t._id} onClick={() => nav(`ticket/${t._id}`)} className="hover:bg-slate-50 cursor-pointer transition-colors">
                      <td className="px-5 py-3.5 text-xs font-mono text-slate-500">{t.ticketNumber}</td>
                      <td className="px-5 py-3.5 text-sm font-medium text-slate-800 max-w-xs truncate">{t.title}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-600">{t.category?.replace(/_/g, " ")}</td>
                      <td className="px-5 py-3.5"><Badge variant={priorityColors[t.priority]}>{t.priority}</Badge></td>
                      <td className="px-5 py-3.5"><Badge variant={statusColors[t.status]}>{statusLabel(t.status)}</Badge></td>
                      <td className="px-5 py-3.5 text-sm text-slate-600">{t.assignedTo?.fullName || "—"}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200">
                <span className="text-xs text-slate-500">Page {pagination.page} of {pagination.pages} ({pagination.total} total)</span>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" disabled={pagination.page <= 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })}>Prev</Button>
                  <Button variant="secondary" size="sm" disabled={pagination.page >= pagination.pages} onClick={() => setFilters({ ...filters, page: filters.page + 1 })}>Next</Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create New Ticket">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Title" placeholder="Brief description of the issue" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          <Textarea label="Description" placeholder="Detailed description..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} options={["ELECTRICAL","PLUMBING","HVAC","STRUCTURAL","CLEANING","IT_NETWORK","FURNITURE","SECURITY","OTHER"].map(c => ({ value: c, label: c.replace(/_/g, " ") }))} />
            <Select label="Priority" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} options={["LOW","MEDIUM","HIGH","EMERGENCY"].map(p => ({ value: p, label: p }))} />
          </div>
          <Select label="Location" value={form.locationId} onChange={e => setForm({ ...form, locationId: e.target.value })} options={[{ value: "", label: "Select location..." }, ...locations.map(l => ({ value: l._id, label: `${l.name} (${l.type})` }))]} />
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={submitting} className="flex-1">Create Ticket</Button>
            <Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

/* ─── TICKET DETAIL PAGE ─── */
function TicketDetailPage({ ticketId }) {
  const { user } = useAuth();
  const { nav } = useRouter();
  const [ticket, setTicket] = useState(null);
  const [history, setHistory] = useState([]);
  const [estimates, setEstimates] = useState([]);
  const [workLogs, setWorkLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [actionLoading, setActionLoading] = useState("");
  const [showEstimate, setShowEstimate] = useState(false);
  const [showWorkLog, setShowWorkLog] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTech, setSelectedTech] = useState("");

  const [estForm, setEstForm] = useState({ visitCost: 0, laborCost: 0, materialCost: 0, otherCost: 0 });
  const [wlForm, setWlForm] = useState({ workDescription: "", hoursWorked: 1 });

  const fetchAll = () => {
    Promise.all([
      api.get(`/tickets/${ticketId}`),
      api.get(`/tickets/${ticketId}/history`),
      api.get(`/estimates/ticket/${ticketId}`).catch(() => []),
      api.get(`/work-logs/ticket/${ticketId}`).catch(() => []),
    ]).then(([t, h, e, w]) => {
      setTicket(t); setHistory(h); setEstimates(Array.isArray(e) ? e : []); setWorkLogs(Array.isArray(w) ? w : []);
    }).catch(() => setToast({ message: "Failed to load ticket", type: "error" })).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, [ticketId]);

  const handleTransition = async (newStatus, extra = {}) => {
    setActionLoading(newStatus);
    try {
      await api.patch(`/tickets/${ticketId}/status`, { newStatus, ...extra });
      setToast({ message: `Status updated to ${statusLabel(newStatus)}`, type: "success" });
      fetchAll();
    } catch (e) { setToast({ message: e.message, type: "error" }); }
    finally { setActionLoading(""); }
  };

  const handleAssign = async () => {
    if (!selectedTech) return;
    setActionLoading("ASSIGNED");
    try {
      await api.patch(`/tickets/${ticketId}/status`, { newStatus: "ASSIGNED", assignedTo: selectedTech });
      setShowAssign(false);
      setToast({ message: "Technician assigned", type: "success" });
      fetchAll();
    } catch (e) { setToast({ message: e.message, type: "error" }); }
    finally { setActionLoading(""); }
  };

  const submitEstimate = async (e) => {
    e.preventDefault();
    setActionLoading("est");
    const total = Number(estForm.visitCost) + Number(estForm.laborCost) + Number(estForm.materialCost) + Number(estForm.otherCost);
    try {
      await api.post("/estimates", { ticketId, ...estForm, totalEstimatedCost: total });
      await api.patch(`/tickets/${ticketId}/status`, { newStatus: "ESTIMATION_SUBMITTED" });
      setShowEstimate(false);
      setToast({ message: "Estimate submitted", type: "success" });
      fetchAll();
    } catch (e) { setToast({ message: e.message, type: "error" }); }
    finally { setActionLoading(""); }
  };

  const submitWorkLog = async (e) => {
    e.preventDefault();
    setActionLoading("wl");
    try {
      await api.post("/work-logs", { ticketId, ...wlForm });
      setShowWorkLog(false);
      setToast({ message: "Work log added", type: "success" });
      fetchAll();
    } catch (e) { setToast({ message: e.message, type: "error" }); }
    finally { setActionLoading(""); }
  };

  const approveEstimate = async (estId) => {
    try {
      await api.patch(`/estimates/${estId}/approve`);
      await api.patch(`/tickets/${ticketId}/status`, { newStatus: "ESTIMATION_APPROVED" });
      setToast({ message: "Estimate approved", type: "success" });
      fetchAll();
    } catch (e) { setToast({ message: e.message, type: "error" }); }
  };

  if (loading) return <LoadingSpinner />;
  if (!ticket) return <EmptyState icon={Ticket} title="Ticket not found" desc="This ticket may have been deleted" />;

  const trans = ticket.availableTransitions || [];
  const role = user?.role;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <button onClick={() => nav("tickets")} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-4 transition-colors"><ArrowLeft size={16} />Back to Tickets</button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-sm font-mono text-slate-400">{ticket.ticketNumber}</span>
            <Badge variant={priorityColors[ticket.priority]}>{ticket.priority}</Badge>
            <Badge variant={statusColors[ticket.status]}>{statusLabel(ticket.status)}</Badge>
            {ticket.slaBreached && <Badge variant="danger">SLA BREACHED</Badge>}
          </div>
          <h1 className="text-xl font-bold text-slate-900">{ticket.title}</h1>
        </div>
      </div>

      {/* Action Buttons */}
      {trans.length > 0 && (
        <Card className="p-4 mb-6">
          <p className="text-xs font-medium text-slate-500 mb-3">AVAILABLE ACTIONS</p>
          <div className="flex flex-wrap gap-2">
            {trans.includes("ASSIGNED") && role === "ADMIN" && (
              <Button size="sm" onClick={async () => { try { const t = await api.get("/users/technicians"); setTechnicians(t); } catch {} setShowAssign(true); }} loading={actionLoading === "ASSIGNED"}>Assign Technician</Button>
            )}
            {trans.includes("REVIEWED") && <Button size="sm" onClick={() => handleTransition("REVIEWED")} loading={actionLoading === "REVIEWED"}>Mark Reviewed</Button>}
            {trans.includes("ACCEPTED") && <Button size="sm" variant="success" onClick={() => handleTransition("ACCEPTED")} loading={actionLoading === "ACCEPTED"}>Accept Task</Button>}
            {trans.includes("ESTIMATION_SUBMITTED") && <Button size="sm" onClick={() => setShowEstimate(true)}>Submit Estimate</Button>}
            {trans.includes("ESTIMATION_APPROVED") && <Button size="sm" variant="success" onClick={() => { const est = estimates.find(e => e.status === "PENDING"); if (est) approveEstimate(est._id); }}>Approve Estimate</Button>}
            {trans.includes("IN_PROGRESS") && <Button size="sm" variant="success" onClick={() => handleTransition("IN_PROGRESS")} loading={actionLoading === "IN_PROGRESS"}>Start Work</Button>}
            {trans.includes("WORK_COMPLETED") && <Button size="sm" variant="success" onClick={() => handleTransition("WORK_COMPLETED")} loading={actionLoading === "WORK_COMPLETED"}>Complete Work</Button>}
            {trans.includes("VERIFIED") && <Button size="sm" variant="success" onClick={() => handleTransition("VERIFIED")} loading={actionLoading === "VERIFIED"}>Verify Work</Button>}
            {trans.includes("DISPUTED") && <Button size="sm" variant="danger" onClick={() => handleTransition("DISPUTED", { reason: "Work quality issue" })} loading={actionLoading === "DISPUTED"}>Dispute</Button>}
            {trans.includes("BILLED") && <Button size="sm" onClick={async () => { try { await api.post("/invoices", { ticketId }); await handleTransition("BILLED"); } catch (e) { setToast({ message: e.message, type: "error" }); }}} loading={actionLoading === "BILLED"}>Generate Invoice</Button>}
            {trans.includes("CLOSED") && <Button size="sm" variant="secondary" onClick={() => handleTransition("CLOSED")} loading={actionLoading === "CLOSED"}>Close Ticket</Button>}
          </div>
        </Card>
      )}

      {/* Work Log Button */}
      {ticket.status === "IN_PROGRESS" && role === "TECHNICIAN" && (
        <div className="mb-4"><Button variant="secondary" size="sm" onClick={() => setShowWorkLog(true)}><Plus size={14} />Add Work Log</Button></div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Description</h3>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">{ticket.description}</p>
          </Card>

          {estimates.length > 0 && (
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Estimates</h3>
              {estimates.map(e => (
                <div key={e._id} className="bg-slate-50 rounded-xl p-4 mb-2 last:mb-0">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={e.status === "APPROVED" ? "success" : e.status === "REJECTED" ? "danger" : "warning"}>{e.status}</Badge>
                    <span className="text-lg font-bold text-slate-900">₹{e.totalEstimatedCost?.toLocaleString()}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs text-slate-600">
                    <div>Visit: ₹{e.visitCost}</div><div>Labor: ₹{e.laborCost}</div><div>Material: ₹{e.materialCost}</div><div>Other: ₹{e.otherCost}</div>
                  </div>
                </div>
              ))}
            </Card>
          )}

          {workLogs.length > 0 && (
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Work Logs</h3>
              {workLogs.map(w => (
                <div key={w._id} className="bg-slate-50 rounded-xl p-4 mb-2 last:mb-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-800">{w.technicianId?.fullName || "Technician"}</span>
                    <span className="text-xs text-slate-500">{w.hoursWorked}h — {new Date(w.loggedAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-slate-600">{w.workDescription}</p>
                </div>
              ))}
            </Card>
          )}

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Status History</h3>
            <div className="space-y-3">
              {history.map((h, i) => (
                <div key={h._id} className="flex gap-3">
                  <div className="flex flex-col items-center"><div className="w-2.5 h-2.5 rounded-full bg-slate-300 mt-1.5" />{i < history.length - 1 && <div className="w-px flex-1 bg-slate-200" />}</div>
                  <div className="pb-3">
                    <div className="flex items-center gap-2"><Badge variant={statusColors[h.newStatus]}>{statusLabel(h.newStatus)}</Badge><span className="text-xs text-slate-400">from {statusLabel(h.previousStatus)}</span></div>
                    <p className="text-xs text-slate-500 mt-1">{h.changedBy?.fullName || "System"} — {new Date(h.changedAt).toLocaleString()}</p>
                    {h.changeReason && <p className="text-xs text-slate-400 mt-0.5">{h.changeReason}</p>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-800">Details</h3>
            {[
              ["Category", ticket.category?.replace(/_/g, " ")],
              ["Location", ticket.locationId?.name || "—"],
              ["Created By", ticket.createdBy?.fullName || "—"],
              ["Assigned To", ticket.assignedTo?.fullName || "Unassigned"],
              ["Created", new Date(ticket.createdAt).toLocaleDateString()],
              ["SLA Deadline", ticket.slaDeadline ? new Date(ticket.slaDeadline).toLocaleString() : "—"],
            ].map(([k, v]) => (
              <div key={k}><p className="text-xs text-slate-500">{k}</p><p className="text-sm font-medium text-slate-800">{v}</p></div>
            ))}
          </Card>
        </div>
      </div>

      {/* Assign Modal */}
      <Modal open={showAssign} onClose={() => setShowAssign(false)} title="Assign Technician">
        <Select label="Select Technician" value={selectedTech} onChange={e => setSelectedTech(e.target.value)} options={[{ value: "", label: "Choose..." }, ...technicians.map(t => ({ value: t._id, label: `${t.fullName} (${t.email})` }))]} />
        <div className="flex gap-3 mt-5"><Button onClick={handleAssign} loading={actionLoading === "ASSIGNED"} className="flex-1">Assign</Button><Button variant="secondary" onClick={() => setShowAssign(false)}>Cancel</Button></div>
      </Modal>

      {/* Estimate Modal */}
      <Modal open={showEstimate} onClose={() => setShowEstimate(false)} title="Submit Cost Estimate">
        <form onSubmit={submitEstimate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Visit Cost (₹)" type="number" min="0" value={estForm.visitCost} onChange={e => setEstForm({ ...estForm, visitCost: e.target.value })} />
            <Input label="Labor Cost (₹)" type="number" min="0" value={estForm.laborCost} onChange={e => setEstForm({ ...estForm, laborCost: e.target.value })} />
            <Input label="Material Cost (₹)" type="number" min="0" value={estForm.materialCost} onChange={e => setEstForm({ ...estForm, materialCost: e.target.value })} />
            <Input label="Other Cost (₹)" type="number" min="0" value={estForm.otherCost} onChange={e => setEstForm({ ...estForm, otherCost: e.target.value })} />
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center"><span className="text-sm text-slate-600">Total: </span><span className="text-lg font-bold text-slate-900">₹{(Number(estForm.visitCost) + Number(estForm.laborCost) + Number(estForm.materialCost) + Number(estForm.otherCost)).toLocaleString()}</span></div>
          <div className="flex gap-3"><Button type="submit" loading={actionLoading === "est"} className="flex-1">Submit Estimate</Button><Button type="button" variant="secondary" onClick={() => setShowEstimate(false)}>Cancel</Button></div>
        </form>
      </Modal>

      {/* Work Log Modal */}
      <Modal open={showWorkLog} onClose={() => setShowWorkLog(false)} title="Add Work Log">
        <form onSubmit={submitWorkLog} className="space-y-4">
          <Textarea label="Work Description" placeholder="What did you do?" value={wlForm.workDescription} onChange={e => setWlForm({ ...wlForm, workDescription: e.target.value })} required />
          <Input label="Hours Worked" type="number" min="0.25" step="0.25" value={wlForm.hoursWorked} onChange={e => setWlForm({ ...wlForm, hoursWorked: e.target.value })} required />
          <div className="flex gap-3"><Button type="submit" loading={actionLoading === "wl"} className="flex-1">Add Log</Button><Button type="button" variant="secondary" onClick={() => setShowWorkLog(false)}>Cancel</Button></div>
        </form>
      </Modal>
    </div>
  );
}

/* ─── TECHNICIAN BOARD ─── */
function TechnicianBoard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { nav } = useRouter();

  useEffect(() => { api.get("/tickets?limit=50").then(d => setTickets(d.tickets || [])).catch(() => {}).finally(() => setLoading(false)); }, []);

  if (loading) return <LoadingSpinner />;

  const columns = [
    { key: "ASSIGNED,ACCEPTED", label: "To Do", color: "bg-amber-400", statuses: ["ASSIGNED", "ACCEPTED"] },
    { key: "ESTIMATION_SUBMITTED,ESTIMATION_APPROVED,IN_PROGRESS", label: "In Progress", color: "bg-blue-400", statuses: ["ESTIMATION_SUBMITTED", "ESTIMATION_APPROVED", "IN_PROGRESS"] },
    { key: "WORK_COMPLETED,VERIFIED", label: "Done", color: "bg-emerald-400", statuses: ["WORK_COMPLETED", "VERIFIED", "BILLED", "PAID", "CLOSED"] },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">My Task Board</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 min-h-[70vh]">
        {columns.map(col => {
          const items = tickets.filter(t => col.statuses.includes(t.status));
          return (
            <div key={col.key} className="bg-slate-100/50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className={cn("w-3 h-3 rounded-full", col.color)} />
                <h3 className="text-sm font-semibold text-slate-700">{col.label}</h3>
                <span className="text-xs bg-white text-slate-500 px-2 py-0.5 rounded-full ml-auto">{items.length}</span>
              </div>
              <div className="space-y-2.5">
                {items.map(t => (
                  <Card key={t._id} className="p-3.5 cursor-pointer hover:shadow-md transition-shadow" onClick={() => nav(`ticket/${t._id}`)}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-mono text-slate-400">{t.ticketNumber}</span>
                      <Badge variant={priorityColors[t.priority]} className="text-[10px]">{t.priority}</Badge>
                    </div>
                    <p className="text-sm font-medium text-slate-800 mb-2 line-clamp-2">{t.title}</p>
                    <Badge variant={statusColors[t.status]} className="text-[10px]">{statusLabel(t.status)}</Badge>
                  </Card>
                ))}
                {items.length === 0 && <p className="text-xs text-slate-400 text-center py-8">No tasks</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── USERS PAGE ─── */
function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => { api.get("/users?limit=50").then(d => setUsers(d.users || [])).catch(() => {}).finally(() => setLoading(false)); }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-slate-900">Users</h1><p className="text-slate-500 text-sm">Manage system users and roles</p></div>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-slate-200 bg-slate-50/50">
              {["Name", "Email", "Phone", "Role", "Status"].map(h => <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => (
                <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">{u.fullName?.[0]}</div>
                      <span className="text-sm font-medium text-slate-800">{u.fullName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{u.email}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{u.phone}</td>
                  <td className="px-5 py-3.5"><Badge variant="purple">{u.roleId?.name}</Badge></td>
                  <td className="px-5 py-3.5"><Badge variant={u.isActive ? "success" : "danger"}>{u.isActive ? "Active" : "Inactive"}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ─── LOCATIONS PAGE ─── */
function LocationsPage() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", type: "BUILDING", description: "" });
  const [toast, setToast] = useState(null);

  const fetch = () => api.get("/locations").then(setLocations).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { fetch(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try { await api.post("/locations", form); setShowCreate(false); setForm({ name: "", type: "BUILDING", description: "" }); setToast({ message: "Location created", type: "success" }); fetch(); }
    catch (e) { setToast({ message: e.message, type: "error" }); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-slate-900">Locations</h1><p className="text-slate-500 text-sm">Manage buildings, floors, and rooms</p></div>
        <Button onClick={() => setShowCreate(true)}><Plus size={16} />Add Location</Button>
      </div>
      <Card>
        {locations.length === 0 ? <EmptyState icon={MapPin} title="No locations" desc="Add your first location" /> : (
          <div className="divide-y divide-slate-100">
            {locations.map(l => (
              <div key={l._id} className="flex items-center gap-4 px-5 py-3.5">
                <MapPin size={16} className="text-slate-400" />
                <div className="flex-1"><p className="text-sm font-medium text-slate-800">{l.name}</p>{l.description && <p className="text-xs text-slate-500">{l.description}</p>}</div>
                <Badge variant="info">{l.type}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add Location">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Name" placeholder="Building A" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <Select label="Type" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} options={["BUILDING","FLOOR","ROOM","ZONE","CAMPUS"].map(t => ({ value: t, label: t }))} />
          <Input label="Description" placeholder="Optional description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <div className="flex gap-3"><Button type="submit" className="flex-1">Create</Button><Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button></div>
        </form>
      </Modal>
    </div>
  );
}

/* ─── INVOICES PAGE ─── */
function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showPay, setShowPay] = useState(null);
  const [payForm, setPayForm] = useState({ paymentMethod: "CASH", amountPaid: 0 });

  useEffect(() => { api.get("/invoices?limit=50").then(d => setInvoices(d.invoices || [])).catch(() => {}).finally(() => setLoading(false)); }, []);

  const handlePay = async () => {
    try {
      await api.post("/payments", { invoiceId: showPay._id, ...payForm, amountPaid: Number(payForm.amountPaid) });
      // Transition ticket to PAID
      if (showPay.ticketId?._id) {
        try { await api.patch(`/tickets/${showPay.ticketId._id}/status`, { newStatus: "PAID" }); } catch {}
      }
      setShowPay(null);
      setToast({ message: "Payment recorded", type: "success" });
      api.get("/invoices?limit=50").then(d => setInvoices(d.invoices || []));
    } catch (e) { setToast({ message: e.message, type: "error" }); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="mb-6"><h1 className="text-2xl font-bold text-slate-900">Invoices</h1><p className="text-slate-500 text-sm">Billing and payment management</p></div>
      <Card>
        {invoices.length === 0 ? <EmptyState icon={FileText} title="No invoices yet" desc="Invoices are generated when tickets are verified" /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-slate-200 bg-slate-50/50">
                {["Invoice #", "Ticket", "Amount", "Tax", "Total", "Status", "Due Date", ""].map(h => <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map(inv => (
                  <tr key={inv._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-mono text-slate-700">{inv.invoiceNumber}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">{inv.ticketId?.ticketNumber || "—"}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-700">₹{inv.subtotal?.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">₹{inv.taxAmount?.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-slate-900">₹{inv.totalAmount?.toLocaleString()}</td>
                    <td className="px-5 py-3.5"><Badge variant={inv.status === "PAID" ? "success" : inv.status === "OVERDUE" ? "danger" : "warning"}>{inv.status}</Badge></td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "—"}</td>
                    <td className="px-5 py-3.5">
                      {["GENERATED", "SENT"].includes(inv.status) && (
                        <Button size="sm" variant="success" onClick={() => { setShowPay(inv); setPayForm({ paymentMethod: "CASH", amountPaid: inv.totalAmount }); }}>Record Payment</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <Modal open={!!showPay} onClose={() => setShowPay(null)} title="Record Payment">
        {showPay && (
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-4 text-center"><p className="text-sm text-slate-500">Invoice {showPay.invoiceNumber}</p><p className="text-2xl font-bold text-slate-900 mt-1">₹{showPay.totalAmount?.toLocaleString()}</p></div>
            <Select label="Payment Method" value={payForm.paymentMethod} onChange={e => setPayForm({ ...payForm, paymentMethod: e.target.value })} options={["CASH","CARD","BANK_TRANSFER","UPI","CHEQUE"].map(m => ({ value: m, label: m.replace(/_/g, " ") }))} />
            <Input label="Amount" type="number" min="0" value={payForm.amountPaid} onChange={e => setPayForm({ ...payForm, amountPaid: e.target.value })} />
            <div className="flex gap-3"><Button onClick={handlePay} variant="success" className="flex-1">Confirm Payment</Button><Button variant="secondary" onClick={() => setShowPay(null)}>Cancel</Button></div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ─── ANALYTICS PAGE ─── */
function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get("/analytics/dashboard").then(setStats).catch(() => {}).finally(() => setLoading(false)); }, []);

  if (loading) return <LoadingSpinner />;
  if (!stats) return <EmptyState icon={BarChart3} title="No data" desc="Analytics will appear once tickets are created" />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6"><h1 className="text-2xl font-bold text-slate-900">Analytics</h1><p className="text-slate-500 text-sm">System performance and insights</p></div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Tickets" value={stats.slaStats?.totalTickets || 0} icon={Ticket} color="blue" />
        <StatCard label="SLA Breached" value={stats.slaStats?.slaBreached || 0} icon={AlertTriangle} color="red" />
        <StatCard label="Compliance Rate" value={`${stats.slaStats?.slaComplianceRate || 100}%`} icon={Shield} color="emerald" />
        <StatCard label="Avg Resolution" value={`${stats.avgResolutionHours || 0}h`} icon={Timer} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Tickets by Category</h3>
          <div className="space-y-3">
            {(stats.ticketsByCategory || []).map(c => (
              <div key={c._id} className="flex items-center gap-3">
                <span className="text-xs text-slate-600 w-28 truncate">{c._id?.replace(/_/g, " ")}</span>
                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-slate-600 rounded-full" style={{ width: `${Math.round((c.count / (stats.slaStats?.totalTickets || 1)) * 100)}%` }} /></div>
                <span className="text-xs font-medium text-slate-700 w-8 text-right">{c.count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Top Technicians</h3>
          {(stats.topTechnicians || []).length === 0 ? <p className="text-sm text-slate-400 py-4 text-center">No data yet</p> : (
            <div className="space-y-3">
              {stats.topTechnicians.map((t, i) => (
                <div key={t._id} className="flex items-center gap-3">
                  <span className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold", i === 0 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500")}>{i + 1}</span>
                  <span className="flex-1 text-sm text-slate-800">{t.fullName}</span>
                  <span className="text-sm font-bold text-slate-900">{t.completedCount} tickets</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Revenue Summary</h3>
        <div className="grid grid-cols-3 gap-6 text-center">
          <div><p className="text-xs text-slate-500">Total Revenue</p><p className="text-2xl font-bold text-slate-900">₹{(stats.revenueStats?.totalRevenue || 0).toLocaleString()}</p></div>
          <div><p className="text-xs text-slate-500">Invoices Paid</p><p className="text-2xl font-bold text-slate-900">{stats.revenueStats?.invoiceCount || 0}</p></div>
          <div><p className="text-xs text-slate-500">Avg Invoice</p><p className="text-2xl font-bold text-slate-900">₹{Math.round(stats.revenueStats?.avgInvoice || 0).toLocaleString()}</p></div>
        </div>
      </Card>
    </div>
  );
}

/* ─── NOTIFICATIONS PAGE ─── */
function NotificationsPage() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { nav } = useRouter();

  const fetchN = () => api.get("/notifications?limit=50").then(d => setNotifs(d.notifications || [])).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { fetchN(); }, []);

  const markRead = async (id) => { await api.patch(`/notifications/${id}/read`); fetchN(); };
  const markAll = async () => { await api.patch("/notifications/read-all"); fetchN(); };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-slate-900">Notifications</h1></div>
        <Button variant="ghost" size="sm" onClick={markAll}>Mark all read</Button>
      </div>
      <Card>
        {notifs.length === 0 ? <EmptyState icon={Bell} title="All clear" desc="No notifications right now" /> : (
          <div className="divide-y divide-slate-100">
            {notifs.map(n => (
              <div key={n._id} onClick={() => { if (!n.isRead) markRead(n._id); if (n.ticketId) nav(`ticket/${n.ticketId._id || n.ticketId}`); }}
                className={cn("flex items-start gap-3 px-5 py-4 cursor-pointer transition-colors", n.isRead ? "bg-white" : "bg-blue-50/50")}>
                <div className={cn("w-2 h-2 rounded-full mt-2 flex-shrink-0", n.isRead ? "bg-transparent" : "bg-blue-500")} />
                <div className="flex-1">
                  <p className={cn("text-sm", n.isRead ? "text-slate-600" : "text-slate-900 font-medium")}>{n.message}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                <Badge variant="default" className="text-[10px] flex-shrink-0">{n.type?.replace(/_/g, " ")}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ─── MAIN APP ─── */
export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
      <style>{`
        @keyframes slide-in { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </AuthProvider>
  );
}

function AppRouter() {
  const { user, loading } = useAuth();
  const { path, param, nav } = useRouter();

  useEffect(() => {
    if (!loading && !user && path !== "login") nav("login");
    if (!loading && user && path === "login") nav("dashboard");
  }, [loading, user, path]);

  if (loading) return <div className="flex items-center justify-center h-screen bg-slate-50"><Loader2 size={40} className="animate-spin text-slate-400" /></div>;

  if (path === "login" || !user) return <LoginPage />;

  const pageMap = {
    dashboard: <DashboardPage />,
    tickets: <TicketsPage />,
    ticket: <TicketDetailPage ticketId={param} />,
    "technician-board": <TechnicianBoard />,
    users: <UsersPage />,
    locations: <LocationsPage />,
    invoices: <InvoicesPage />,
    analytics: <AnalyticsPage />,
    notifications: <NotificationsPage />,
  };

  return <Layout>{pageMap[path] || <DashboardPage />}</Layout>;
}
