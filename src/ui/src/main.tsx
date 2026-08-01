import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bell,
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Gauge,
  Home,
  KeyRound,
  LifeBuoy,
  LockKeyhole,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  PlugZap,
  ReceiptText,
  Router,
  Search,
  Settings2,
  ShieldCheck,
  SignalHigh,
  Smartphone,
  Sparkles,
  UserRoundCheck,
  WalletCards,
  Wifi
} from "lucide-react";
import "./styles.css";

type Tone = "good" | "watch" | "danger" | "info";

type Metric = {
  label: string;
  value: string;
  detail: string;
  tone: Tone;
  icon: typeof Home;
};

type Room = {
  id: string;
  tenant: string;
  building: string;
  rent: string;
  wifi: string;
  status: string;
  tone: Tone;
};

type ActivityItem = {
  title: string;
  meta: string;
  tone: Tone;
};

const metrics: Metric[] = [
  { label: "Occupied rooms", value: "184", detail: "+12 this month", tone: "good", icon: Building2 },
  { label: "Rent collected", value: "KES 4.8M", detail: "91% of August target", tone: "good", icon: WalletCards },
  { label: "Wi-Fi subscribers", value: "139", detail: "27 auto-renew today", tone: "info", icon: Wifi },
  { label: "Open issues", value: "18", detail: "6 need owner review", tone: "watch", icon: LifeBuoy }
];

const rooms: Room[] = [
  { id: "A-104", tenant: "M. Otieno", building: "Kilimani Annex", rent: "Paid", wifi: "Premium 20 Mbps", status: "Active", tone: "good" },
  { id: "B-217", tenant: "S. Kamau", building: "Ruiru Court", rent: "Due today", wifi: "Starter 8 Mbps", status: "Watch", tone: "watch" },
  { id: "C-009", tenant: "A. Mwangi", building: "Mombasa Road", rent: "Partial", wifi: "Paused", status: "Action", tone: "danger" },
  { id: "D-301", tenant: "N. Achieng", building: "Westlands House", rent: "Paid", wifi: "Premium 20 Mbps", status: "Active", tone: "good" }
];

const activities: ActivityItem[] = [
  { title: "Wi-Fi entitlement activated", meta: "Room A-104 - receipt WHF-2841", tone: "good" },
  { title: "Payment promise logged", meta: "Room B-217 - owner reminder queued", tone: "watch" },
  { title: "Router projection pending", meta: "Mombasa Road - RADIUS sync waiting", tone: "info" },
  { title: "Deposit refund approved", meta: "Room D-112 - payout review complete", tone: "good" }
];

const navItems = [
  { label: "Dashboard", icon: Home, active: true },
  { label: "Rooms", icon: KeyRound },
  { label: "Residents", icon: UserRoundCheck },
  { label: "Billing", icon: ReceiptText },
  { label: "Wi-Fi", icon: Router },
  { label: "Messages", icon: MessageSquareText },
  { label: "Settings", icon: Settings2 }
];

function Badge({ tone, children }: { tone: Tone; children: string }) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}

function IconButton({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button className="icon-button" type="button" aria-label={label} title={label}>
      {children}
    </button>
  );
}

function App() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-row">
          <div className="brand-mark" aria-hidden="true">
            <ShieldCheck size={22} />
          </div>
          <div>
            <p className="brand-name">CAPTYN</p>
            <p className="brand-subtitle">Housing OS</p>
          </div>
        </div>

        <nav className="nav-list" aria-label="Primary">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button className={item.active ? "nav-item nav-item--active" : "nav-item"} type="button" key={item.label}>
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-status">
          <div className="status-dot" />
          <div>
            <p>ISP link live</p>
            <span>RADIUS bridge ready</span>
          </div>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <button className="mobile-menu" type="button" aria-label="Open menu" title="Open menu">
            <Menu size={21} />
          </button>
          <div className="page-title">
            <p>Operations</p>
            <h1>Property Command Center</h1>
          </div>
          <label className="search-field">
            <Search size={18} />
            <input type="search" placeholder="Search room, resident, receipt" />
          </label>
          <div className="topbar-actions">
            <IconButton label="Notifications">
              <Bell size={19} />
            </IconButton>
            <button className="profile-button" type="button">
              <span>Admin</span>
              <ChevronDown size={16} />
            </button>
          </div>
        </header>

        <section className="signal-strip" aria-label="Live status">
          <div>
            <SignalHigh size={18} />
            <span>99.96% Wi-Fi uptime</span>
          </div>
          <div>
            <CreditCard size={18} />
            <span>KES 328K collected today</span>
          </div>
          <div>
            <LockKeyhole size={18} />
            <span>42 access changes synced</span>
          </div>
          <div>
            <Activity size={18} />
            <span>7 owner alerts pending</span>
          </div>
        </section>

        <section className="metric-grid" aria-label="Portfolio metrics">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <article className={`metric-card metric-card--${metric.tone}`} key={metric.label}>
                <div className="metric-icon">
                  <Icon size={20} />
                </div>
                <p>{metric.label}</p>
                <strong>{metric.value}</strong>
                <span>{metric.detail}</span>
              </article>
            );
          })}
        </section>

        <section className="content-grid">
          <article className="panel room-ledger">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Room ledger</p>
                <h2>Resident money and access</h2>
              </div>
              <button className="text-button" type="button">
                Export
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="table-shell">
              <table>
                <thead>
                  <tr>
                    <th>Room</th>
                    <th>Resident</th>
                    <th>Building</th>
                    <th>Rent</th>
                    <th>Wi-Fi</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((room) => (
                    <tr key={room.id}>
                      <td>{room.id}</td>
                      <td>{room.tenant}</td>
                      <td>{room.building}</td>
                      <td>{room.rent}</td>
                      <td>{room.wifi}</td>
                      <td>
                        <Badge tone={room.tone}>{room.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <aside className="side-stack">
            <article className="panel wifi-panel">
              <div className="panel-header panel-header--tight">
                <div>
                  <p className="eyebrow">ISP control</p>
                  <h2>Wi-Fi packages</h2>
                </div>
                <IconButton label="More actions">
                  <MoreHorizontal size={19} />
                </IconButton>
              </div>
              <div className="wifi-meter">
                <Gauge size={34} />
                <div>
                  <strong>20 Mbps</strong>
                  <span>Most purchased plan</span>
                </div>
              </div>
              <div className="package-list">
                <button className="package-row package-row--active" type="button">
                  <span>Premium</span>
                  <strong>KES 1,800</strong>
                </button>
                <button className="package-row" type="button">
                  <span>Starter</span>
                  <strong>KES 950</strong>
                </button>
                <button className="package-row" type="button">
                  <span>Daily pass</span>
                  <strong>KES 80</strong>
                </button>
              </div>
            </article>

            <article className="panel queue-panel">
              <div className="panel-header panel-header--tight">
                <div>
                  <p className="eyebrow">Queue</p>
                  <h2>Priority work</h2>
                </div>
                <Badge tone="watch">18 open</Badge>
              </div>
              <div className="queue-list">
                <div>
                  <AlertTriangle size={18} />
                  <span>6 rent exceptions</span>
                </div>
                <div>
                  <PlugZap size={18} />
                  <span>3 utility disputes</span>
                </div>
                <div>
                  <Smartphone size={18} />
                  <span>4 SMS delivery retries</span>
                </div>
                <div>
                  <CalendarClock size={18} />
                  <span>5 move-outs this week</span>
                </div>
              </div>
            </article>
          </aside>
        </section>

        <section className="lower-grid">
          <article className="panel activity-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Live feed</p>
                <h2>Automation activity</h2>
              </div>
              <Badge tone="info">Realtime</Badge>
            </div>
            <div className="activity-list">
              {activities.map((item) => (
                <div className="activity-item" key={item.title}>
                  <CheckCircle2 className={`activity-icon activity-icon--${item.tone}`} size={19} />
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.meta}</span>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="panel launch-panel">
            <Sparkles size={23} />
            <div>
              <p className="eyebrow">Next build</p>
              <h2>Resident Wi-Fi checkout</h2>
              <span>React screens can take over payment, entitlement, and room self-service flows once we map each legacy page.</span>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
