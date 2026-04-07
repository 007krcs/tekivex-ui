import { useState, useEffect, useRef, useCallback, type CSSProperties } from 'react';
import type { ThemeTokens } from '@tekivex/ui';

// ── Quantum Particle System ───────────────────────────────────────────────────

interface Particle {
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
  radius: number; opacity: number; color: string; life: number;
}

function useQuantumCanvas(canvasRef: React.RefObject<HTMLCanvasElement | null>, theme: ThemeTokens) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particles: Particle[] = [];
    const COLORS = [theme.primary, '#00d4ff', '#7c3aed', '#06b6d4', '#10b981', '#f59e0b'];
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;

    // Spawn particles
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * W, y: Math.random() * H,
        z: Math.random() * 400 + 100,
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2.5 + 0.5,
        opacity: Math.random() * 0.7 + 0.1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        life: Math.random() * 200 + 100,
      });
    }

    // Entanglement lines (quantum connections)
    function drawEntanglement(p1: Particle, p2: Particle) {
      const dx = p1.x - p2.x, dy = p1.y - p2.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 140) return;
      const alpha = (1 - dist / 140) * 0.25;
      const grad = ctx!.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
      grad.addColorStop(0, p1.color + Math.round(alpha * 255).toString(16).padStart(2, '0'));
      grad.addColorStop(1, p2.color + Math.round(alpha * 255).toString(16).padStart(2, '0'));
      ctx!.beginPath();
      ctx!.strokeStyle = grad;
      ctx!.lineWidth = 0.6;
      ctx!.moveTo(p1.x, p1.y);
      ctx!.lineTo(p2.x, p2.y);
      ctx!.stroke();
    }

    function draw() {
      ctx!.clearRect(0, 0, W, H);

      // Draw entanglement lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j += 3) {
          drawEntanglement(particles[i], particles[j]);
        }
      }

      // Draw particles
      particles.forEach(p => {
        const scale = 400 / (400 + p.z);
        const px = (p.x - W / 2) * scale + W / 2;
        const py = (p.y - H / 2) * scale + H / 2;
        const r = p.radius * scale;
        const a = p.opacity * scale;

        // Glow effect
        const glow = ctx!.createRadialGradient(px, py, 0, px, py, r * 3);
        glow.addColorStop(0, p.color + 'cc');
        glow.addColorStop(1, p.color + '00');
        ctx!.beginPath();
        ctx!.fillStyle = glow;
        ctx!.arc(px, py, r * 3, 0, Math.PI * 2);
        ctx!.fill();

        // Core
        ctx!.beginPath();
        ctx!.fillStyle = p.color + Math.round(a * 255).toString(16).padStart(2, '0');
        ctx!.arc(px, py, r, 0, Math.PI * 2);
        ctx!.fill();

        // Update position
        p.x += p.vx; p.y += p.vy; p.z += p.vz;
        p.life--;

        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        if (p.z < 50 || p.z > 600) p.vz *= -1;
        if (p.life <= 0) {
          p.x = Math.random() * W; p.y = Math.random() * H;
          p.z = Math.random() * 400 + 100; p.life = Math.random() * 200 + 100;
        }
      });

      animId = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animId);
  }, [theme.primary, canvasRef]);
}

// ── 3D Rotating Quantum Sphere ────────────────────────────────────────────────

function QuantumSphere({ theme }: { theme: ThemeTokens }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60);
    return () => clearInterval(id);
  }, []);

  const RINGS = 6;
  const pts = 24;
  const r = 80;
  const angleX = tick * 0.018;
  const angleY = tick * 0.012;

  function rotate3D(x: number, y: number, z: number) {
    const cosX = Math.cos(angleX), sinX = Math.sin(angleX);
    const cosY = Math.cos(angleY), sinY = Math.sin(angleY);
    const y1 = y * cosX - z * sinX;
    const z1 = y * sinX + z * cosX;
    const x2 = x * cosY + z1 * sinY;
    const z2 = -x * sinY + z1 * cosY;
    return { x: x2, y: y1, z: z2 };
  }

  const paths: { d: string; op: number; color: string }[] = [];

  // Latitude rings
  for (let ring = 0; ring <= RINGS; ring++) {
    const phi = (ring / RINGS) * Math.PI;
    const points3D = Array.from({ length: pts + 1 }, (_, i) => {
      const theta = (i / pts) * Math.PI * 2;
      return rotate3D(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta),
      );
    });
    const d = points3D.map((p, i) => `${i === 0 ? 'M' : 'L'} ${120 + p.x} ${120 + p.y}`).join(' ') + ' Z';
    const avgZ = points3D.reduce((s, p) => s + p.z, 0) / points3D.length;
    paths.push({ d, op: 0.15 + (avgZ + r) / (2 * r) * 0.4, color: theme.primary });
  }

  // Longitude rings
  for (let seg = 0; seg < 8; seg++) {
    const theta0 = (seg / 8) * Math.PI * 2;
    const points3D = Array.from({ length: pts + 1 }, (_, i) => {
      const phi = (i / pts) * Math.PI;
      return rotate3D(
        r * Math.sin(phi) * Math.cos(theta0),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta0),
      );
    });
    const d = points3D.map((p, i) => `${i === 0 ? 'M' : 'L'} ${120 + p.x} ${120 + p.y}`).join(' ');
    paths.push({ d, op: 0.12, color: '#00d4ff' });
  }

  // Data nodes on surface
  const nodes = [0, 1, 2, 3, 4, 5, 6, 7].map(i => {
    const phi = Math.acos(-1 + (2 * i) / 7);
    const theta = Math.sqrt(7 * Math.PI) * phi;
    return rotate3D(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta),
    );
  });

  return (
    <svg width={240} height={240} style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id="sphereGlow" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor={theme.primary} stopOpacity="0.15" />
          <stop offset="100%" stopColor={theme.primary} stopOpacity="0" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <circle cx={120} cy={120} r={r + 10} fill="url(#sphereGlow)" />
      {paths.map((p, i) => (
        <path key={i} d={p.d} fill="none" stroke={p.color} strokeWidth={0.8} opacity={p.op} />
      ))}
      {nodes.map((n, i) => (
        <g key={i} filter="url(#glow)">
          <circle cx={120 + n.x} cy={120 + n.y} r={3.5} fill={theme.primary}
            opacity={0.4 + (n.z + r) / (2 * r) * 0.5} />
          <circle cx={120 + n.x} cy={120 + n.y} r={1.5} fill="#fff" opacity={0.9} />
        </g>
      ))}
    </svg>
  );
}

// ── Neural Network Visualizer ─────────────────────────────────────────────────

function NeuralNet({ theme }: { theme: ThemeTokens }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => (t + 1) % 120), 30);
    return () => clearInterval(id);
  }, []);

  const layers = [[4], [6], [8], [6], [4], [2]];
  const W = 280, H = 160;
  const cols = layers.length;

  interface NodePos { x: number; y: number; layer: number; idx: number }
  const nodes: NodePos[] = [];
  layers.forEach((_, li) => {
    const cnt = layers[li][0];
    for (let ni = 0; ni < cnt; ni++) {
      nodes.push({
        x: 20 + (li / (cols - 1)) * (W - 40),
        y: H / 2 + (ni - (cnt - 1) / 2) * (H / (cnt + 1)),
        layer: li, idx: ni,
      });
    }
  });

  const edges: { x1: number; y1: number; x2: number; y2: number; active: boolean }[] = [];
  for (let li = 0; li < cols - 1; li++) {
    const from = nodes.filter(n => n.layer === li);
    const to = nodes.filter(n => n.layer === li + 1);
    from.forEach(f => {
      to.forEach(t => {
        const active = (tick % 30) > li * 5 && (tick % 30) < li * 5 + 15;
        edges.push({ x1: f.x, y1: f.y, x2: t.x, y2: t.y, active });
      });
    });
  }

  return (
    <svg width={W} height={H} style={{ overflow: 'visible' }}>
      <defs>
        <filter id="nn-glow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {edges.map((e, i) => (
        <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
          stroke={e.active ? theme.primary : theme.border}
          strokeWidth={e.active ? 1.2 : 0.4}
          opacity={e.active ? 0.7 : 0.25} />
      ))}
      {nodes.map((n, i) => {
        const active = (tick % 30) > n.layer * 5 && (tick % 30) < n.layer * 5 + 15;
        return (
          <g key={i} filter={active ? 'url(#nn-glow)' : undefined}>
            <circle cx={n.x} cy={n.y} r={active ? 5 : 3.5}
              fill={active ? theme.primary : theme.surface}
              stroke={theme.primary} strokeWidth={1}
              opacity={active ? 1 : 0.5} />
          </g>
        );
      })}
    </svg>
  );
}

// ── 3D Feature Card ───────────────────────────────────────────────────────────

function Card3D({ theme, icon, title, desc, color, delay = 0 }: {
  theme: ThemeTokens; icon: string; title: string; desc: string; color: string; delay?: number;
}) {
  const [hovered, setHovered] = useState(false);
  const [rotX, setRotX] = useState(0);
  const [rotY, setRotY] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const onMove = useCallback((e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setRotX(-(e.clientY - cy) / 10);
    setRotY((e.clientX - cx) / 10);
  }, []);

  const cardStyle: CSSProperties = {
    position: 'relative',
    padding: '32px 28px',
    borderRadius: 20,
    background: `linear-gradient(135deg, ${theme.surface}ee, ${theme.surfaceAlt}cc)`,
    border: `1px solid ${hovered ? color + '66' : theme.border}`,
    backdropFilter: 'blur(20px)',
    transform: hovered
      ? `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(20px) scale(1.02)`
      : 'perspective(600px) rotateX(0deg) rotateY(0deg) translateZ(0px)',
    transition: hovered ? 'transform 0.05s ease, box-shadow 0.2s, border 0.2s' : 'transform 0.4s ease, box-shadow 0.3s, border 0.3s',
    boxShadow: hovered
      ? `0 30px 60px -10px ${color}33, 0 0 0 1px ${color}22, inset 0 1px 0 ${color}22`
      : `0 8px 24px -8px rgba(0,0,0,0.4)`,
    cursor: 'default',
    animationDelay: `${delay}ms`,
    overflow: 'hidden',
  };

  const glowStyle: CSSProperties = {
    position: 'absolute',
    top: hovered ? '-20%' : '-50%',
    left: hovered ? '-10%' : '-30%',
    width: '160%',
    height: '160%',
    background: `radial-gradient(ellipse at center, ${color}18 0%, transparent 70%)`,
    transition: 'all 0.4s ease',
    pointerEvents: 'none',
    borderRadius: '50%',
  };

  return (
    <div ref={ref} style={cardStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setRotX(0); setRotY(0); }}
      onMouseMove={onMove}>
      <div style={glowStyle} />
      <div style={{ fontSize: 36, marginBottom: 16, filter: `drop-shadow(0 0 12px ${color}88)` }}>{icon}</div>
      <h3 style={{ margin: '0 0 10px', fontSize: 18, fontWeight: 700, color: theme.text,
        background: hovered ? `linear-gradient(135deg, ${color}, #fff)` : 'none',
        WebkitBackgroundClip: hovered ? 'text' : 'unset',
        WebkitTextFillColor: hovered ? 'transparent' : theme.text,
        transition: 'all 0.3s', }}>{title}</h3>
      <p style={{ margin: 0, fontSize: 14, color: theme.textMuted, lineHeight: 1.7 }}>{desc}</p>
    </div>
  );
}

// ── Animated Counter ──────────────────────────────────────────────────────────

function AnimCounter({ target, suffix = '', duration = 2000 }: { target: number; suffix?: string; duration?: number }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      observer.disconnect();
      const start = Date.now();
      const tick = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(ease * target));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.2 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);
  return <span ref={ref}>{value.toLocaleString()}{suffix}</span>;
}

// ── Holographic Text ──────────────────────────────────────────────────────────

function HoloText({ children, theme }: { children: string; theme: ThemeTokens }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 50);
    return () => clearInterval(id);
  }, []);
  const hue = (tick * 2) % 360;
  return (
    <span style={{
      background: `linear-gradient(${90 + Math.sin(tick * 0.03) * 30}deg, ${theme.primary}, hsl(${hue},100%,65%), #00d4ff, ${theme.primary})`,
      backgroundSize: '300% 100%',
      backgroundPosition: `${(tick * 2) % 300}% 0`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      transition: 'background-position 0.05s',
    }}>
      {children}
    </span>
  );
}

// ── Floating Code Block ───────────────────────────────────────────────────────

const QUICK_START = `import { ThemeProvider, TkxButton,
  TkxQuantumForm, quantumDark } from 'tekivex-ui';

export function App() {
  return (
    <ThemeProvider theme={quantumDark}>
      <TkxQuantumForm
        fields={['email', 'password']}
        onSubmit={console.log}
        showConfidence
      />
    </ThemeProvider>
  );
}`;

// ── Main HomePage ─────────────────────────────────────────────────────────────

export function HomePage({ theme }: { theme: ThemeTokens }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useQuantumCanvas(canvasRef, theme);

  const [activeTab, setActiveTab] = useState(0);
  const [codeVisible, setCodeVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setCodeVisible(true), 800);
    return () => clearTimeout(timer);
  }, []);

  // Inject CSS keyframes once
  useEffect(() => {
    if (document.getElementById('tkx-home-keyframes')) return;
    const style = document.createElement('style');
    style.id = 'tkx-home-keyframes';
    style.textContent = `
      @keyframes tkxFloat { 0%,100%{transform:translateY(0px) rotate(0deg)} 50%{transform:translateY(-14px) rotate(2deg)} }
      @keyframes tkxPulseRing { 0%{transform:scale(0.8);opacity:0.9} 100%{transform:scale(2.2);opacity:0} }
      @keyframes tkxSlideUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
      @keyframes tkxGlow { 0%,100%{text-shadow:0 0 20px currentColor,0 0 40px currentColor} 50%{text-shadow:0 0 40px currentColor,0 0 80px currentColor,0 0 120px currentColor} }
      @keyframes tkxScan { 0%{top:-2px} 100%{top:100%} }
      @keyframes tkxBlink { 0%,50%,100%{opacity:1} 25%,75%{opacity:0} }
      @keyframes tkxOrbit { from{transform:rotate(0deg) translateX(80px) rotate(0deg)} to{transform:rotate(360deg) translateX(80px) rotate(-360deg)} }
      @keyframes tkxMorphBg { 0%,100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%} 50%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%} }
      @keyframes tkxDataFlow { 0%{stroke-dashoffset:1000} 100%{stroke-dashoffset:0} }
      @keyframes tkxCardReveal { from{opacity:0;transform:perspective(800px) rotateY(-30deg) translateX(-40px)} to{opacity:1;transform:perspective(800px) rotateY(0deg) translateX(0)} }
    `;
    document.head.appendChild(style);
  }, []);

  const features = [
    { icon: '⚛', title: 'Quantum AI Forms', desc: 'Fields auto-infer type, validation rules, and placeholders using Boltzmann Machine inference and Amplitude Amplification', color: theme.primary, delay: 0 },
    { icon: '🌡', title: 'Quantum Annealing Themes', desc: 'Color palettes optimized via simulated quantum tunneling — escapes local optima for globally WCAG-compliant palettes', color: '#06b6d4', delay: 80 },
    { icon: '🔭', title: 'Live Playground', desc: 'In-browser component editor with Grover-inspired O(√N) search, real-time JSX evaluation, and performance metrics', color: '#7c3aed', delay: 160 },
    { icon: '🛡', title: 'WCAG 2.1 AAA + XSS Shield', desc: 'Every prop sanitized through multi-layer XSS prevention. Automatic contrast enforcement. WAI-ARIA 1.2 built in', color: '#10b981', delay: 240 },
    { icon: '🧬', title: 'Zero-Runtime CSS Engine', desc: 'TKX Atomic: true conflict resolution, single merged class per element. No PostCSS, no Tailwind, no build plugin', color: '#f59e0b', delay: 320 },
    { icon: '📊', title: '7 Chart Types Built-In', desc: 'Area, Bar, Line, Pie, Donut, Scatter, Radar. Recharts-powered with full accessibility and theme integration', color: '#ef4444', delay: 400 },
  ];

  const stats = [
    { value: 70, suffix: '+', label: 'Components' },
    { value: 436, suffix: '', label: 'Tests Passing' },
    { value: 27, suffix: '', label: 'i18n Locales' },
    { value: 100, suffix: '%', label: 'TypeScript' },
  ];

  const tabs = ['Overview', 'Architecture', 'Quantum Engine', 'Benchmarks'];

  return (
    <div style={{ position: 'relative', backgroundColor: theme.bg, color: theme.text, minHeight: '100vh', overflow: 'hidden' }}>

      {/* ── Particle Canvas Background ───────────────────────────────── */}
      <canvas ref={canvasRef} style={{
        position: 'fixed', inset: 0, width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 0, opacity: 0.35,
      }} />

      {/* ── Hero Section ─────────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 32px 60px', textAlign: 'center' }}>

        {/* Morphing background blob */}
        <div style={{
          position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 600, borderRadius: '60% 40% 30% 70%/60% 30% 70% 40%',
          background: `radial-gradient(ellipse, ${theme.primary}18, #7c3aed12, #06b6d408)`,
          animation: 'tkxMorphBg 8s ease-in-out infinite',
          pointerEvents: 'none',
        }} />

        {/* Orbiting rings */}
        {[100, 140, 180].map((r, i) => (
          <div key={r} style={{
            position: 'absolute', top: '50%', left: '50%',
            width: r * 2, height: r * 2,
            marginTop: -r, marginLeft: -r,
            borderRadius: '50%',
            border: `1px solid ${theme.primary}${['22', '18', '0e'][i]}`,
            animation: `tkxPulseRing ${3 + i}s ease-out infinite`,
            animationDelay: `${i * 1}s`,
            pointerEvents: 'none',
          }} />
        ))}

        {/* Quantum sphere + Neural Net row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40, marginBottom: 32, animation: 'tkxFloat 6s ease-in-out infinite' }}>
          <div style={{ opacity: 0.8 }}><NeuralNet theme={theme} /></div>
          <QuantumSphere theme={theme} />
          <div style={{ opacity: 0.8, transform: 'scaleX(-1)' }}><NeuralNet theme={theme} /></div>
        </div>

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px 6px 10px',
          borderRadius: 999, border: `1px solid ${theme.primary}44`,
          background: `${theme.primary}12`, marginBottom: 24, fontSize: 13,
          color: theme.primary, fontWeight: 600, backdropFilter: 'blur(10px)',
          animation: 'tkxSlideUp 0.6s ease both',
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: theme.primary, display: 'inline-block', animation: 'tkxPulseRing 1.5s ease-out infinite' }} />
          v2.5.2 · Quantum AI Edition
        </div>

        {/* Main headline */}
        <h1 style={{ fontSize: 'clamp(2.4rem, 7vw, 5.5rem)', fontWeight: 900, lineHeight: 1.05, margin: '0 0 24px', letterSpacing: '-0.03em', animation: 'tkxSlideUp 0.7s 0.1s ease both', opacity: 0, animationFillMode: 'both' }}>
          The <HoloText theme={theme}>Quantum-Class</HoloText>
          <br />React UI Framework
        </h1>

        <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', color: theme.textMuted, maxWidth: 640, margin: '0 auto 40px', lineHeight: 1.7, animation: 'tkxSlideUp 0.7s 0.2s ease both', opacity: 0, animationFillMode: 'both' }}>
          70+ production-grade components powered by genuine quantum-inspired AI —<br />
          Boltzmann Machine inference, Quantum Annealing optimization, Amplitude Amplification search.
          <br />WCAG 2.1 AAA · WAI-ARIA 1.2 · TypeScript · Zero-runtime CSS.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', animation: 'tkxSlideUp 0.7s 0.35s ease both', opacity: 0, animationFillMode: 'both' }}>
          <button
            onClick={() => { window.location.hash = '/getting-started'; }}
            style={{
              padding: '14px 32px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: `linear-gradient(135deg, ${theme.primary}, #7c3aed)`,
              color: '#fff', fontWeight: 700, fontSize: 16,
              boxShadow: `0 8px 32px -4px ${theme.primary}66`,
              transition: 'all 0.2s', letterSpacing: '-0.01em',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px) scale(1.02)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 16px 48px -4px ${theme.primary}88`; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ''; (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 8px 32px -4px ${theme.primary}66`; }}
          >
            🚀 Get Started
          </button>
          <button
            onClick={() => { window.location.hash = '/components/button'; }}
            style={{
              padding: '14px 32px', borderRadius: 12, border: `1px solid ${theme.border}`,
              cursor: 'pointer', background: `${theme.surface}cc`, color: theme.text,
              fontWeight: 600, fontSize: 16, backdropFilter: 'blur(10px)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = theme.primary + '66'; (e.currentTarget as HTMLButtonElement).style.background = theme.surfaceAlt; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = theme.border; (e.currentTarget as HTMLButtonElement).style.background = `${theme.surface}cc`; }}
          >
            📖 Components
          </button>
          <button
            onClick={() => { window.location.hash = '/quantum-form'; }}
            style={{
              padding: '14px 32px', borderRadius: 12, border: `1px solid ${theme.primary}44`,
              cursor: 'pointer', background: `${theme.primary}12`, color: theme.primary,
              fontWeight: 600, fontSize: 16, backdropFilter: 'blur(10px)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = `${theme.primary}22`; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = `${theme.primary}12`; }}
          >
            ⚛ Quantum AI
          </button>
        </div>

        {/* Install command */}
        <div style={{ marginTop: 32, display: 'inline-flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderRadius: 10, background: `${theme.surface}cc`, border: `1px solid ${theme.border}`, backdropFilter: 'blur(10px)', fontFamily: 'monospace', fontSize: 14, animation: 'tkxSlideUp 0.7s 0.5s ease both', opacity: 0, animationFillMode: 'both' }}>
          <span style={{ color: theme.textMuted }}>$</span>
          <span style={{ color: theme.text }}>npm install <span style={{ color: theme.primary }}>tekivex-ui</span></span>
          <button
            style={{ background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', fontSize: 13, padding: '2px 6px', borderRadius: 4, transition: 'color 0.2s' }}
            onClick={() => navigator.clipboard?.writeText('npm install tekivex-ui')}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = theme.primary; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = theme.textMuted; }}
            title="Copy"
          >⎘</button>
        </div>
      </section>

      {/* ── Stats Section ─────────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 32px 80px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {stats.map(({ value, suffix, label }) => (
            <div key={label} style={{
              padding: '32px 24px', textAlign: 'center', borderRadius: 20,
              background: `${theme.surface}cc`, border: `1px solid ${theme.border}`,
              backdropFilter: 'blur(20px)',
            }}>
              <div style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, color: theme.primary, lineHeight: 1, marginBottom: 8, animation: 'tkxGlow 3s ease-in-out infinite' }}>
                <AnimCounter target={value} suffix={suffix} />
              </div>
              <div style={{ fontSize: 14, color: theme.textMuted, fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Quantum Code Showcase ─────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 32px 100px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 999, background: `${theme.primary}18`, border: `1px solid ${theme.primary}33`, color: theme.primary, fontSize: 12, fontWeight: 700, marginBottom: 16, letterSpacing: '0.05em' }}>
              ⚛ QUANTUM AI ENGINE
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 800, lineHeight: 1.15, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
              Forms that <HoloText theme={theme}>think</HoloText> before you type
            </h2>
            <p style={{ color: theme.textMuted, fontSize: 15, lineHeight: 1.8, marginBottom: 24 }}>
              Define fields by name. The Quantum Boltzmann Machine infers type, validation rules, placeholder text, and labels — all from the field name alone. Amplitude Amplification ranks candidates in O(√N) time.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { rule: 'email', result: 'type=email · /regex/ · "you@example.com"', color: '#06b6d4' },
                { rule: 'password', result: 'type=password · min:8 · strength check', color: theme.primary },
                { rule: 'confirm_password', result: 'entangled → must match password', color: '#7c3aed' },
                { rule: 'phone', result: 'type=tel · international format', color: '#10b981' },
              ].map(({ rule, result, color }) => (
                <div key={rule} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 16px', borderRadius: 10, background: `${theme.surface}cc`, border: `1px solid ${theme.border}`, fontFamily: 'monospace', fontSize: 13 }}>
                  <span style={{ color, fontWeight: 700, flexShrink: 0 }}>{rule}</span>
                  <span style={{ color: theme.textMuted }}>→</span>
                  <span style={{ color: theme.text }}>{result}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Floating code card */}
          <div style={{
            position: 'relative', opacity: codeVisible ? 1 : 0,
            transform: codeVisible ? 'none' : 'translateY(20px)',
            transition: 'all 0.8s ease',
          }}>
            {/* Scan line effect */}
            <div style={{ position: 'absolute', inset: 0, borderRadius: 20, overflow: 'hidden', pointerEvents: 'none', zIndex: 10 }}>
              <div style={{ position: 'absolute', left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${theme.primary}88, transparent)`, animation: 'tkxScan 4s linear infinite', opacity: 0.5 }} />
            </div>

            <div style={{
              borderRadius: 20, overflow: 'hidden', border: `1px solid ${theme.border}`,
              background: `${theme.surface}ee`, backdropFilter: 'blur(20px)',
              boxShadow: `0 40px 80px -20px rgba(0,0,0,0.6), 0 0 0 1px ${theme.primary}22`,
              animation: 'tkxFloat 7s ease-in-out infinite',
            }}>
              {/* Title bar */}
              <div style={{ padding: '12px 20px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981' }} />
                <span style={{ marginLeft: 12, fontSize: 12, color: theme.textMuted, fontFamily: 'monospace' }}>app.tsx</span>
                <span style={{ marginLeft: 'auto', fontSize: 11, color: theme.primary, background: `${theme.primary}18`, padding: '2px 8px', borderRadius: 999 }}>⚛ Quantum AI</span>
              </div>
              {/* Code */}
              <pre style={{ margin: 0, padding: '24px', fontFamily: 'monospace', fontSize: 13, lineHeight: 1.7, color: theme.text, overflowX: 'auto' }}>
                {QUICK_START.split('\n').map((line, i) => {
                  const colored = line
                    .replace(/(import|from|export|function|return|const)/g, `<span style="color:${theme.primary};font-weight:600">$1</span>`)
                    .replace(/('[^']*'|"[^"]*")/g, `<span style="color:#10b981">$1</span>`)
                    .replace(/(&lt;[A-Z][^&]*?&gt;|&lt;\/[A-Z][^&]*?&gt;|&lt;[A-Z][^&]*/g, `<span style="color:#06b6d4">$&</span>`)
                    .replace(/(TkxQuantumForm|ThemeProvider|TkxButton|quantumDark)/g, `<span style="color:#f59e0b">$1</span>`);
                  return (
                    <div key={i} dangerouslySetInnerHTML={{ __html: `<span style="color:${theme.border};user-select:none;margin-right:16px;font-size:11px">${String(i + 1).padStart(2, ' ')}</span>${colored}` }} />
                  );
                })}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Cards 3D Grid ─────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 32px 100px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 999, background: `${theme.primary}18`, border: `1px solid ${theme.primary}33`, color: theme.primary, fontSize: 12, fontWeight: 700, marginBottom: 16, letterSpacing: '0.05em' }}>
              ✦ MONOPOLY FEATURES
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
              What no other library offers
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {features.map(f => (
              <Card3D key={f.title} theme={theme} icon={f.icon} title={f.title} desc={f.desc} color={f.color} delay={f.delay} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Architecture Tabs ─────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 32px 100px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
              Built on a <HoloText theme={theme}>quantum foundation</HoloText>
            </h2>
          </div>

          {/* Tab selector */}
          <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 14, background: `${theme.surface}cc`, border: `1px solid ${theme.border}`, marginBottom: 32, backdropFilter: 'blur(20px)' }}>
            {tabs.map((tab, i) => (
              <button key={tab}
                onClick={() => setActiveTab(i)}
                style={{
                  flex: 1, padding: '10px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: activeTab === i ? `linear-gradient(135deg, ${theme.primary}cc, #7c3aed99)` : 'transparent',
                  color: activeTab === i ? '#fff' : theme.textMuted,
                  fontWeight: activeTab === i ? 700 : 500, fontSize: 14,
                  transition: 'all 0.2s', boxShadow: activeTab === i ? `0 4px 16px -4px ${theme.primary}88` : 'none',
                }}>
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ padding: '40px', borderRadius: 20, background: `${theme.surface}cc`, border: `1px solid ${theme.border}`, backdropFilter: 'blur(20px)', minHeight: 280 }}>
            {activeTab === 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                <div>
                  <h3 style={{ margin: '0 0 16px', color: theme.text, fontWeight: 700 }}>70+ Production Components</h3>
                  <p style={{ color: theme.textMuted, lineHeight: 1.8, margin: 0 }}>From primitives (Button, Input, Badge) to advanced (DataGrid with virtual scrolling, Quantum AI Form, Visual Theme Builder, Live Playground). Every component is TypeScript-first, accessible, and security-hardened.</p>
                </div>
                <div>
                  <h3 style={{ margin: '0 0 16px', color: theme.text, fontWeight: 700 }}>27 Locales · RTL Support</h3>
                  <p style={{ color: theme.textMuted, lineHeight: 1.8, margin: 0 }}>i18n built into the core — not bolted on. Arabic, Hebrew, Persian render RTL automatically. All 27 locale strings can be overridden per component or globally via I18nProvider.</p>
                </div>
              </div>
            )}
            {activeTab === 1 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                {[
                  { label: 'Layer 1: Security Shield', desc: 'All props sanitized. XSS patterns blocked. CSP-compatible. Immutable audit trail.' },
                  { label: 'Layer 2: Quantum Engine', desc: 'LRU cache, priority render queue, microtask batching, FNV-1a hashing.' },
                  { label: 'Layer 3: TKX CSS', desc: 'Zero-runtime, conflict-resolving, theme-aware utility classes. No PostCSS.' },
                  { label: 'Layer 4: WCAG Engine', desc: 'Contrast ratio enforcement, focus management, live regions, roving tabIndex.' },
                  { label: 'Layer 5: i18n System', desc: '27 locales, RTL detection, per-instance override, zero overhead when unused.' },
                  { label: 'Layer 6: AI Engine', desc: 'Boltzmann Machine, Quantum Annealing, Grover Amplification — all pure TS.' },
                ].map(({ label, desc }) => (
                  <div key={label} style={{ padding: '20px', borderRadius: 12, border: `1px solid ${theme.border}`, background: theme.surfaceAlt }}>
                    <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: 13, color: theme.primary }}>{label}</p>
                    <p style={{ margin: 0, fontSize: 13, color: theme.textMuted, lineHeight: 1.6 }}>{desc}</p>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 2 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 60, marginBottom: 32 }}>
                  <QuantumSphere theme={theme} />
                  <div style={{ flex: 1, maxWidth: 400 }}>
                    {[
                      { algo: 'Quantum Boltzmann Machine', use: 'Field type inference from names' },
                      { algo: 'Quantum Annealing (QAOA-inspired)', use: 'WCAG-compliant color optimization' },
                      { algo: 'Amplitude Amplification (Grover)', use: 'O(√N) component search' },
                      { algo: 'QuantumRegister + CNOT Gates', use: 'Field entanglement (password pairs)' },
                      { algo: 'Boltzmann Acceptance', use: 'Escape local optima in theme generation' },
                    ].map(({ algo, use }) => (
                      <div key={algo} style={{ display: 'flex', gap: 16, marginBottom: 16, alignItems: 'flex-start' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: theme.primary, flexShrink: 0, marginTop: 6 }} />
                        <div>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: theme.text }}>{algo}</p>
                          <p style={{ margin: 0, fontSize: 12, color: theme.textMuted }}>{use}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {activeTab === 3 && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
                  {[
                    { metric: '< 2ms', desc: 'Avg render time (LRU cache)' },
                    { metric: '94%', desc: 'Cache hit rate (FNV-1a hash)' },
                    { metric: 'O(√N)', desc: 'Component search time' },
                    { metric: '563 kB', desc: 'Full bundle (gzip: 119 kB)' },
                  ].map(({ metric, desc }) => (
                    <div key={metric} style={{ textAlign: 'center', padding: 24, borderRadius: 12, border: `1px solid ${theme.border}`, background: theme.surfaceAlt }}>
                      <p style={{ margin: '0 0 6px', fontSize: 28, fontWeight: 900, color: theme.primary }}>{metric}</p>
                      <p style={{ margin: 0, fontSize: 12, color: theme.textMuted }}>{desc}</p>
                    </div>
                  ))}
                </div>
                <NeuralNet theme={theme} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Competitive Comparison ────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 32px 100px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
              vs. the competition
            </h2>
          </div>
          <div style={{ borderRadius: 20, border: `1px solid ${theme.border}`, overflow: 'hidden', backdropFilter: 'blur(20px)' }}>
            {[
              ['Feature', 'tekivex-ui', 'MUI', 'Shadcn', 'Ant Design'],
              ['Quantum AI Form Inference', '✅', '❌', '❌', '❌'],
              ['Quantum Annealing Theme Builder', '✅', '❌', '❌', '❌'],
              ['Live Playground (built-in)', '✅', '❌', '❌', '❌'],
              ['WCAG 2.1 AAA', '✅', '🟡 AA', '🟡 partial', '🟡 AA'],
              ['Zero-runtime CSS engine', '✅', '❌ emotion', '❌ tailwind', '❌ css-in-js'],
              ['Built-in XSS shield', '✅', '❌', '❌', '❌'],
              ['27-locale i18n (built-in)', '✅', '🟡 pkg', '❌', '✅'],
              ['Headless primitives', '✅', '🟡 partial', '✅', '❌'],
              ['Bundle gzip', '119 kB', '180 kB+', '30 kB*', '460 kB'],
            ].map((row, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                borderBottom: i < 9 ? `1px solid ${theme.border}` : 'none',
                background: i === 0 ? `${theme.surface}` : i % 2 === 0 ? `${theme.surfaceAlt}66` : 'transparent',
              }}>
                {row.map((cell, j) => (
                  <div key={j} style={{
                    padding: '14px 20px', fontSize: j === 0 ? 14 : 15,
                    fontWeight: i === 0 ? 700 : j === 1 ? 600 : 400,
                    color: i === 0 ? theme.textMuted : j === 1 ? theme.primary : theme.text,
                    textAlign: j === 0 ? 'left' : 'center',
                  }}>
                    {cell}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 32px 120px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', padding: '80px 40px', borderRadius: 24, background: `linear-gradient(135deg, ${theme.primary}22, #7c3aed18, #06b6d412)`, border: `1px solid ${theme.primary}33`, backdropFilter: 'blur(20px)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 30% 50%, ${theme.primary}18, transparent 60%), radial-gradient(ellipse at 70% 50%, #7c3aed18, transparent 60%)`, pointerEvents: 'none' }} />
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
            Ready to build with <HoloText theme={theme}>quantum intelligence</HoloText>?
          </h2>
          <p style={{ color: theme.textMuted, fontSize: 16, marginBottom: 40, maxWidth: 500, margin: '0 auto 40px', lineHeight: 1.7 }}>
            Ship faster. Build smarter. No other library comes close.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => { window.location.hash = '/getting-started'; }}
              style={{ padding: '16px 40px', borderRadius: 12, border: 'none', cursor: 'pointer', background: `linear-gradient(135deg, ${theme.primary}, #7c3aed)`, color: '#fff', fontWeight: 700, fontSize: 16, boxShadow: `0 12px 40px -8px ${theme.primary}88`, transition: 'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ''; }}
            >
              Start Building Free →
            </button>
            <button
              onClick={() => window.open('https://github.com/007krcs/tekivex-ui', '_blank')}
              style={{ padding: '16px 32px', borderRadius: 12, border: `1px solid ${theme.border}`, cursor: 'pointer', background: `${theme.surface}cc`, color: theme.text, fontWeight: 600, fontSize: 16, backdropFilter: 'blur(10px)', transition: 'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = theme.primary + '66'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = theme.border; }}
            >
              ⭐ Star on GitHub
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer style={{ position: 'relative', zIndex: 1, padding: '40px 32px', borderTop: `1px solid ${theme.border}`, textAlign: 'center', color: theme.textMuted, fontSize: 13 }}>
        <p style={{ margin: '0 0 8px' }}>
          <span style={{ color: theme.primary, fontWeight: 700 }}>tekivex-ui</span> v2.5.2 · Built with ⚛ Quantum AI · MIT License
        </p>
        <p style={{ margin: 0 }}>
          © 2024 <a href="https://github.com/007krcs" target="_blank" rel="noreferrer" style={{ color: theme.primary, textDecoration: 'none' }}>007krcs</a> ·
          {' '}<a href="https://github.com/007krcs/tekivex-ui" target="_blank" rel="noreferrer" style={{ color: theme.textMuted, textDecoration: 'none' }}>GitHub</a> ·
          {' '}<a href="https://npmjs.com/package/tekivex-ui" target="_blank" rel="noreferrer" style={{ color: theme.textMuted, textDecoration: 'none' }}>npm</a>
        </p>
      </footer>
    </div>
  );
}
