// ─────────────────────────────────────────────────────────────────────────────
// /examples/mission-control — live-ops dashboard built with holographic UI.
//
// Demonstrates the holographic toolkit in a commercial context: a NOC /
// SRE-style operations dashboard with live KPI tiles, holographic gauges,
// a deploy pipeline, an alert feed terminal, regional capacity, and a
// commit stream. Every value updates on a timer so the dashboard feels
// alive without a real backend.
//
// Why this composition matters: SaaS observability tools, IoT monitoring,
// trading terminals, NOCs, and live event scoreboards all want the same
// shape — a wall of dense, glanceable, real-time tiles. This is the
// copy-paste starting point.
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useRef, useState } from 'react';
import {
  TkxHolographicSurface,
  TkxHolographicCard,
  TkxHolographicBadge,
  TkxHolographicPanel,
  TkxHolographicGauge,
  TkxHolographicProgress,
  TkxHolographicTerminal,
} from 'tekivex-ui';
import { ExampleShell } from './ExampleShell';
import { BusinessCTA } from './BusinessCTA';
import { usePageMeta } from '../../use-page-meta';

interface AlertItem { id: number; sev: 'info' | 'warn' | 'crit'; text: string; at: string; }
interface DeployStep { name: string; status: 'done' | 'running' | 'pending' | 'failed'; pct: number; }
interface RegionStat { code: string; flag: string; load: number; rps: number; latency: number; }
interface CommitItem { hash: string; author: string; msg: string; mins: number; }

const REGIONS_INITIAL: RegionStat[] = [
  { code: 'us-east-1',     flag: '🇺🇸', load: 38, rps: 4218, latency: 42 },
  { code: 'us-west-2',     flag: '🇺🇸', load: 51, rps: 3107, latency: 36 },
  { code: 'eu-west-1',     flag: '🇮🇪', load: 67, rps: 5823, latency: 28 },
  { code: 'eu-central-1',  flag: '🇩🇪', load: 44, rps: 2912, latency: 24 },
  { code: 'ap-south-1',    flag: '🇮🇳', load: 71, rps: 6402, latency: 31 },
  { code: 'ap-northeast-1',flag: '🇯🇵', load: 29, rps: 1830, latency: 38 },
  { code: 'ap-southeast-1',flag: '🇸🇬', load: 56, rps: 3404, latency: 22 },
  { code: 'sa-east-1',     flag: '🇧🇷', load: 33, rps: 1612, latency: 87 },
];

const COMMITS_INITIAL: CommitItem[] = [
  { hash: 'a3f2c1', author: 'mira',  msg: 'fix(billing): clamp invoice rounding to 2 dp',     mins: 2  },
  { hash: 'e9b71d', author: 'rohan', msg: 'feat(api): paginated /v2/sessions endpoint',         mins: 7  },
  { hash: '2c8f04', author: 'aanya', msg: 'chore(deps): bump three.js → 0.169 (+ types)',       mins: 18 },
  { hash: '1d7e9a', author: 'jin',   msg: 'fix(charts): correct y-axis flip on negative values', mins: 24 },
  { hash: '88ab53', author: 'lila',  msg: 'feat(panel): add Holographic Gauge auto-color tone',  mins: 41 },
];

export function MissionControl() {
  usePageMeta(
    'Mission control example — TekiVex UI',
    'A live-ops dashboard built with the tekivex-ui holographic surfaces — KPI tiles, gauges, a deploy pipeline, an alert feed terminal, regional capacity, and a commit stream that updates in real time.',
    { keywords: 'tekivex holographic example, ops dashboard, NOC ui, sre dashboard, live monitoring, holographic ui' },
  );

  const [now, setNow] = useState<string>(new Date().toLocaleTimeString('en-IN', { hour12: false }));
  const [cpu, setCpu] = useState(34);
  const [mem, setMem] = useState(61);
  const [traffic, setTraffic] = useState(72);
  const [errors, setErrors] = useState(0.18);
  const [revenue, setRevenue] = useState(124820);
  const [users, setUsers] = useState(2418);
  const [regions, setRegions] = useState<RegionStat[]>(REGIONS_INITIAL);
  const [deploy, setDeploy] = useState<DeployStep[]>([
    { name: 'Lint',     status: 'done',    pct: 100 },
    { name: 'Type-check', status: 'done',  pct: 100 },
    { name: 'Test',     status: 'done',    pct: 100 },
    { name: 'Build',    status: 'running', pct: 64  },
    { name: 'Deploy',   status: 'pending', pct: 0   },
    { name: 'Smoke',    status: 'pending', pct: 0   },
  ]);
  const [alerts, setAlerts] = useState<AlertItem[]>(() => [
    { id: 1, sev: 'info',  text: 'Deploy pipeline started — build #4218',  at: '−42s' },
    { id: 2, sev: 'warn',  text: 'eu-west-1 load 67% (threshold 70%)',     at: '−1m 12s' },
    { id: 3, sev: 'info',  text: 'Auto-scaler added 2 replicas in ap-south-1', at: '−2m 44s' },
    { id: 4, sev: 'crit',  text: 'sa-east-1 latency 87ms (P99 budget 80ms)', at: '−4m 21s' },
    { id: 5, sev: 'info',  text: 'New commit a3f2c1 by mira',               at: '−5m 02s' },
  ]);
  const [commits] = useState<CommitItem[]>(COMMITS_INITIAL);
  const tickRef = useRef(0);

  // Live-tick: cheap pseudo-random walk so the dashboard feels alive.
  useEffect(() => {
    const id = setInterval(() => {
      tickRef.current += 1;
      const jitter = (n: number, amp: number) => Math.max(0, Math.min(100, n + (Math.random() - 0.5) * amp));
      setCpu((x) => jitter(x, 8));
      setMem((x) => jitter(x, 4));
      setTraffic((x) => jitter(x, 12));
      setErrors((x) => Math.max(0, Math.min(2, x + (Math.random() - 0.5) * 0.08)));
      setRevenue((x) => x + Math.round(Math.random() * 180));
      setUsers((x) => Math.max(1000, x + Math.round((Math.random() - 0.4) * 18)));
      setRegions((rs) => rs.map((r) => ({
        ...r,
        load: jitter(r.load, 6),
        rps: Math.max(0, r.rps + Math.round((Math.random() - 0.4) * 80)),
        latency: Math.max(8, r.latency + Math.round((Math.random() - 0.5) * 4)),
      })));
      setNow(new Date().toLocaleTimeString('en-IN', { hour12: false }));

      // Advance the deploy pipeline
      setDeploy((d) => advanceDeploy(d));

      // Occasional new alert
      if (tickRef.current % 6 === 0) {
        setAlerts((a) => {
          const next: AlertItem = pickAlert(a.length + 1);
          return [next, ...a].slice(0, 12);
        });
      }
    }, 1500);
    return () => clearInterval(id);
  }, []);

  return (
    <ExampleShell
      title="Mission control"
      eyebrow="Use case · Live ops"
      description="A NOC / SRE-style live operations dashboard built entirely with the tekivex-ui holographic surfaces. Every tile updates in real time. Drop this layout in for SaaS analytics, observability, IoT monitoring, trading terminals, or live event scoreboards."
      sourceUrl="https://github.com/007krcs/getekivex-ui/blob/master/landing/src/pages/examples/MissionControl.tsx"
      surface="light"
    >
      <MCStyles />

      <div className="mc-stage">
        <div className="mc-grid">
          {/* Top header strip */}
          <header className="mc-header">
            <div>
              <div className="mc-status-dot" />
              <span className="mc-eyebrow">Operations · live</span>
              <h2 className="mc-title">Lumen Field — global ops</h2>
            </div>
            <div className="mc-clock">
              <span className="mc-eyebrow">UTC+05:30</span>
              <span className="mc-now">{now}</span>
            </div>
          </header>

          {/* Top KPI row */}
          <KPI accent="#06b6d4" label="Active users"   value={users.toLocaleString()}   delta="+18 / min" />
          <KPI accent="#22c55e" label="Revenue today"  value={`₹${revenue.toLocaleString('en-IN')}`} delta="+₹820 / min" />
          <KPI accent="#3a86ff" label="Requests / sec" value={Math.round(regions.reduce((s, r) => s + r.rps, 0) / 1000) + 'k'} delta="across 8 regions" />
          <KPI accent={errors > 1 ? '#ef4444' : errors > 0.5 ? '#f59e0b' : '#22c55e'} label="Error rate" value={`${errors.toFixed(2)}%`} delta="P99 = 42ms" />

          {/* CPU / Memory / Traffic gauges */}
          <TkxHolographicCard
            title="System pressure"
            subtitle="rolling 60s average"
            badge={<TkxHolographicBadge size="sm" tone={cpu > 80 ? 'danger' : cpu > 60 ? 'warning' : 'success'}>{Math.round(cpu)}% CPU</TkxHolographicBadge>}
          >
            <div className="mc-gauges">
              <GaugeCol value={cpu}     accent="#06b6d4" label="CPU" />
              <GaugeCol value={mem}     accent="#7c3aed" label="MEM" />
              <GaugeCol value={traffic} accent="#f59e0b" label="NET" />
            </div>
          </TkxHolographicCard>

          {/* Deploy pipeline */}
          <TkxHolographicPanel
            accent="#22c55e"
            header={
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <strong style={{ color: '#fff', fontSize: 14 }}>Deploy pipeline</strong>
                <span style={{ color: '#22c55e', fontSize: 12, fontWeight: 700 }}>build #4218</span>
              </div>
            }
            footer={
              <span style={{ color: '#94a3b8', fontSize: 12 }}>
                triggered by mira · master@a3f2c1
              </span>
            }
          >
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {deploy.map((s) => (
                <DeployRow key={s.name} step={s} />
              ))}
            </div>
          </TkxHolographicPanel>

          {/* Alerts terminal */}
          <TkxHolographicCard
            title="Alert feed"
            subtitle="live tail"
            badge={<TkxHolographicBadge size="sm" tone={alerts.some((a) => a.sev === 'crit') ? 'danger' : 'info'}>{alerts.length} active</TkxHolographicBadge>}
          >
            <TkxHolographicTerminal
              accent="#ef4444"
              prompt=""
              height={300}
              typeSpeed={0}
              maxLines={alerts.length + 2}
              lines={alerts.map((a) => `${sevTag(a.sev)} ${a.text}  ${a.at}`)}
            />
          </TkxHolographicCard>

          {/* Region map */}
          <TkxHolographicCard
            title="Regional capacity"
            subtitle="8 regions · auto-scaling"
            badge={<TkxHolographicBadge size="sm" tone="info">{regions.filter((r) => r.load > 70).length} hot</TkxHolographicBadge>}
          >
            <div className="mc-regions">
              {regions.map((r) => <RegionRow key={r.code} region={r} />)}
            </div>
          </TkxHolographicCard>

          {/* Commit stream */}
          <TkxHolographicCard
            title="Commit stream"
            subtitle="last 24 hours"
            badge={<TkxHolographicBadge size="sm" tone="success">5 today</TkxHolographicBadge>}
          >
            <div className="mc-commits">
              {commits.map((c) => (
                <div key={c.hash} className="mc-commit">
                  <span className="mc-commit-hash">{c.hash}</span>
                  <span className="mc-commit-msg">{c.msg}</span>
                  <span className="mc-commit-meta">{c.author} · {c.mins}m ago</span>
                </div>
              ))}
            </div>
          </TkxHolographicCard>

          {/* SLO dashboard */}
          <TkxHolographicSurface style={{ padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <strong style={{ color: '#fff', fontSize: 15 }}>SLO budget</strong>
              <TkxHolographicBadge size="sm" tone="success">healthy</TkxHolographicBadge>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <SLOBar label="Availability"    value={0.998 - errors * 0.001} target={0.995} accent="#22c55e" />
              <SLOBar label="Latency P95 < 80ms" value={0.92 + (Math.random() * 0.05)} target={0.9} accent="#06b6d4" />
              <SLOBar label="Error rate < 1%" value={1 - errors / 100} target={0.99} accent="#7c3aed" />
            </div>
          </TkxHolographicSurface>
        </div>

        <div className="mc-tip">
          <span style={{ fontSize: 22 }}>📊</span>
          <p style={{ margin: 0 }}>
            <strong>Why a holographic NOC?</strong> Tightly-packed glow + scan-line motifs map directly
            to the cognitive model operators already have for "live" data. Same vocabulary works for
            SaaS observability, trading floors, IoT monitoring, sports scoreboards, mission rooms.
          </p>
        </div>

        <BusinessCTA
          vertical="Mission control dashboard"
          pitch="SaaS observability, IoT monitoring, trading desks, sports scoreboards, and ops centers all want this dense, glanceable, real-time vocabulary. We pipe it to your real metrics — Datadog, Prometheus, custom feeds, anything that emits JSON."
          hue={['#7c3aed', '#ec4899']}
        />
      </div>
    </ExampleShell>
  );
}

// ─── pieces ──────────────────────────────────────────────────────────────

function KPI({ accent, label, value, delta }: { accent: string; label: string; value: string; delta: string }) {
  return (
    <div className="mc-kpi" style={{ borderColor: accent + '55' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span className="mc-eyebrow" style={{ color: accent }}>{label}</span>
        <span className="mc-pulse-dot" style={{ background: accent, boxShadow: `0 0 8px ${accent}` }} />
      </div>
      <div className="mc-kpi-value">{value}</div>
      <div className="mc-kpi-delta">{delta}</div>
    </div>
  );
}

function GaugeCol({ value, accent, label }: { value: number; accent: string; label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <TkxHolographicGauge value={Math.round(value)} size={120} accent={accent} />
      <span style={{ fontSize: 11, fontWeight: 700, color: accent, letterSpacing: '0.06em' }}>{label}</span>
    </div>
  );
}

function DeployRow({ step }: { step: DeployStep }) {
  const [accent, label] =
    step.status === 'done'    ? ['#22c55e', '✓'] :
    step.status === 'running' ? ['#06b6d4', '●'] :
    step.status === 'failed'  ? ['#ef4444', '✗'] :
                                ['#475569', '○'];
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: '#cbd5e1', marginBottom: 4 }}>
        <span><span style={{ color: accent, marginRight: 8, fontWeight: 800 }}>{label}</span>{step.name}</span>
        <span style={{ color: '#94a3b8' }}>{Math.round(step.pct)}%</span>
      </div>
      <TkxHolographicProgress
        value={step.pct / 100}
        accent={accent}
        height={6}
        shimmer={step.status === 'running'}
      />
    </div>
  );
}

function RegionRow({ region }: { region: RegionStat }) {
  const tone: 'success' | 'info' | 'warning' | 'danger' =
    region.load > 80 ? 'danger' : region.load > 65 ? 'warning' : region.load > 35 ? 'info' : 'success';
  const accent = tone === 'success' ? '#22c55e' : tone === 'info' ? '#3a86ff' : tone === 'warning' ? '#f59e0b' : '#ef4444';
  return (
    <div className="mc-region">
      <span style={{ fontSize: 18 }}>{region.flag}</span>
      <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, color: '#fff', minWidth: 110 }}>
        {region.code}
      </span>
      <div style={{ flex: 1 }}>
        <TkxHolographicProgress value={region.load / 100} accent={accent} height={5} shimmer={false} />
      </div>
      <span style={{ fontSize: 11, color: '#94a3b8', minWidth: 64, textAlign: 'right' }}>
        {region.rps.toLocaleString()} rps
      </span>
      <span style={{ fontSize: 11, color: accent, minWidth: 50, textAlign: 'right' }}>{region.latency}ms</span>
    </div>
  );
}

function SLOBar({ label, value, target, accent }: { label: string; value: number; target: number; accent: string }) {
  const pct = Math.max(0, Math.min(1, value));
  const ok = pct >= target;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#cbd5e1', marginBottom: 4 }}>
        <span>{label}</span>
        <span style={{ color: ok ? '#22c55e' : '#ef4444' }}>
          {(pct * 100).toFixed(2)}% {ok ? '✓' : '⚠'}
        </span>
      </div>
      <TkxHolographicProgress value={pct} accent={ok ? accent : '#ef4444'} height={6} />
    </div>
  );
}

function sevTag(sev: AlertItem['sev']): string {
  if (sev === 'crit') return '[CRIT]';
  if (sev === 'warn') return '[WARN]';
  return '[INFO]';
}

function pickAlert(seed: number): AlertItem {
  const SAMPLES: { sev: AlertItem['sev']; text: string }[] = [
    { sev: 'info', text: 'Cache warm: hit-ratio 96.4%' },
    { sev: 'info', text: 'Auto-scaler removed 1 replica in ap-northeast-1' },
    { sev: 'warn', text: 'us-west-2 P99 latency exceeded 60ms threshold' },
    { sev: 'info', text: 'New session count baseline updated' },
    { sev: 'warn', text: 'Queue depth 1.4k in eu-west-1, scaling up' },
    { sev: 'crit', text: 'Pager: ap-south-1 disk pressure 92%' },
    { sev: 'info', text: 'Deploy step Build complete (62.3s)' },
    { sev: 'info', text: 'Connection pool resized: 240 → 320' },
  ];
  const s = SAMPLES[seed % SAMPLES.length];
  return { id: seed, sev: s.sev, text: s.text, at: 'just now' };
}

function advanceDeploy(d: DeployStep[]): DeployStep[] {
  const idx = d.findIndex((s) => s.status === 'running');
  if (idx === -1) return d;
  const next = d.slice();
  const step = { ...next[idx] };
  step.pct = Math.min(100, step.pct + Math.random() * 6);
  if (step.pct >= 100) {
    step.status = 'done';
    next[idx] = step;
    if (idx + 1 < next.length) {
      const nxt = { ...next[idx + 1], status: 'running' as const, pct: 1 };
      next[idx + 1] = nxt;
    }
  } else {
    next[idx] = step;
  }
  return next;
}

// ─── styles ──────────────────────────────────────────────────────────────

function MCStyles() {
  return (
    <style>{`
      .mc-stage {
        max-width: 1280px; margin: 24px auto 0; padding: 0 24px 64px;
      }
      .mc-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 16px;
        background: radial-gradient(ellipse at top, #1a1633 0%, #060716 80%);
        padding: 24px; border-radius: 18px;
        border: 1px solid rgba(196, 168, 255, 0.18);
        box-shadow: 0 12px 50px rgba(124, 58, 237, 0.18);
      }
      .mc-header {
        grid-column: 1 / -1;
        display: flex; justify-content: space-between; align-items: center;
        flex-wrap: wrap; gap: 12px;
      }
      .mc-status-dot {
        display: inline-block; width: 10px; height: 10px; border-radius: 50%;
        background: #22c55e; box-shadow: 0 0 8px #22c55e;
        animation: mc-pulse 1.6s ease-in-out infinite; margin-right: 8px;
        vertical-align: middle;
      }
      @keyframes mc-pulse {
        0%, 100% { opacity: 1; }
        50%      { opacity: 0.4; }
      }
      .mc-eyebrow {
        font-size: 10.5px; color: #94a3b8;
        text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700;
      }
      .mc-title { margin: 4px 0 0; color: #fff; font-size: 22px; font-weight: 800; letter-spacing: -0.02em; }
      .mc-clock { text-align: right; font-family: ui-monospace, monospace; }
      .mc-now { display: block; color: #06b6d4; font-size: 22px; font-weight: 700; }

      .mc-kpi {
        background: rgba(8, 10, 25, 0.6); border: 1px solid;
        border-radius: 12px; padding: 14px;
      }
      .mc-kpi-value { color: #fff; font-size: 26px; font-weight: 800; letter-spacing: -0.02em; line-height: 1.1; }
      .mc-kpi-delta { color: #94a3b8; font-size: 12px; margin-top: 2px; }
      .mc-pulse-dot {
        width: 8px; height: 8px; border-radius: 50%;
        animation: mc-pulse 1.6s ease-in-out infinite;
      }

      .mc-gauges {
        display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
      }

      .mc-regions {
        display: flex; flex-direction: column; gap: 8px;
      }
      .mc-region {
        display: flex; align-items: center; gap: 10px;
        padding: 6px 0;
        border-bottom: 1px solid rgba(255,255,255,0.04);
      }

      .mc-commits {
        display: flex; flex-direction: column; gap: 8px;
      }
      .mc-commit {
        display: grid; grid-template-columns: 60px 1fr auto; gap: 10px; align-items: baseline;
        padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.04);
      }
      .mc-commit-hash {
        font-family: ui-monospace, monospace; font-size: 11px;
        color: #c4a8ff; letter-spacing: 0.04em;
      }
      .mc-commit-msg { font-size: 13px; color: #e2e8f0; }
      .mc-commit-meta { font-size: 11px; color: #94a3b8; white-space: nowrap; }

      .mc-tip {
        margin-top: 18px; padding: 14px 18px;
        background: #fff; border: 1px solid #e6e8ef; border-radius: 12px;
        display: flex; gap: 12px; align-items: flex-start;
        color: #475569; font-size: 13.5px; line-height: 1.6;
      }
      .mc-tip strong { color: #0f172a; }

      /* Make tiles span the right widths */
      .mc-grid > *:nth-child(2),
      .mc-grid > *:nth-child(3),
      .mc-grid > *:nth-child(4),
      .mc-grid > *:nth-child(5) { grid-column: span 1; }
      .mc-grid > *:nth-child(6) { grid-column: span 2; }   /* System pressure */
      .mc-grid > *:nth-child(7) { grid-column: span 2; }   /* Deploy pipeline */
      .mc-grid > *:nth-child(8) { grid-column: span 2; }   /* Alerts */
      .mc-grid > *:nth-child(9) { grid-column: span 2; }   /* Regions */
      .mc-grid > *:nth-child(10) { grid-column: span 2; }  /* Commits */
      .mc-grid > *:nth-child(11) { grid-column: span 2; }  /* SLO */

      @media (max-width: 1080px) {
        .mc-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .mc-grid > * { grid-column: span 1 !important; }
        .mc-grid > *:nth-child(6),
        .mc-grid > *:nth-child(7),
        .mc-grid > *:nth-child(8),
        .mc-grid > *:nth-child(9),
        .mc-grid > *:nth-child(10),
        .mc-grid > *:nth-child(11) { grid-column: span 2 !important; }
      }
      @media (max-width: 720px) {
        .mc-grid { grid-template-columns: 1fr; }
        .mc-grid > * { grid-column: span 1 !important; }
        .mc-gauges { grid-template-columns: 1fr; }
      }
    `}</style>
  );
}
