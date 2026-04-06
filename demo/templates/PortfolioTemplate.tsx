import { useState } from 'react';
import type { ThemeTokens } from '@tekivex/ui';
import {
  TkxButton, TkxCard, TkxCardHeader, TkxCardBody, TkxCardFooter,
  TkxBadge, TkxInput, TkxProgress, TkxToggle, TkxAlert, TkxTabs,
  TkxTabList, TkxTab, TkxTabPanels, TkxTabPanel, TkxAvatar, TkxTable,
  TkxDivider, TkxSkeleton, TkxTooltip, TkxModal, tkx, cx
} from '@tekivex/ui';

interface Props { theme: ThemeTokens }

const PROJECTS = {
  all: [
    {
      id: 1, name: 'E-commerce Platform', category: 'Frontend', color: 'primary',
      description: 'Full-featured online store with cart, payments, and inventory management. Handles 10k+ daily active users.',
      tech: ['React', 'TypeScript', 'Stripe', 'PostgreSQL'],
      completion: 98, stars: 412, forks: 87,
    },
    {
      id: 2, name: 'Real-time Analytics Dashboard', category: 'Frontend', color: 'success',
      description: 'Live data visualization platform with WebSocket feeds, chart rendering, and multi-tenant support.',
      tech: ['Next.js', 'D3.js', 'WebSockets', 'Redis'],
      completion: 95, stars: 289, forks: 54,
    },
    {
      id: 3, name: 'Mobile Banking App', category: 'Mobile', color: 'warning',
      description: 'Cross-platform banking application with biometric auth, real-time notifications, and P2P transfers.',
      tech: ['React Native', 'Expo', 'Node.js', 'Plaid'],
      completion: 91, stars: 178, forks: 32,
    },
    {
      id: 4, name: 'API Gateway Service', category: 'Backend', color: 'danger',
      description: 'High-throughput API gateway with rate limiting, auth middleware, and request proxying for microservices.',
      tech: ['Node.js', 'Express', 'Docker', 'Nginx'],
      completion: 100, stars: 634, forks: 143,
    },
    {
      id: 5, name: 'Headless CMS Platform', category: 'Backend', color: 'info',
      description: 'Developer-first content management with GraphQL API, rich editor, and multi-channel publishing.',
      tech: ['GraphQL', 'MongoDB', 'AWS S3', 'TypeScript'],
      completion: 88, stars: 521, forks: 96,
    },
    {
      id: 6, name: 'Fitness Tracker App', category: 'Mobile', color: 'success',
      description: 'AI-powered workout and nutrition tracker with wearable sync, progress analytics, and social challenges.',
      tech: ['Flutter', 'Firebase', 'TensorFlow Lite', 'HealthKit'],
      completion: 83, stars: 203, forks: 41,
    },
  ],
  frontend: [] as typeof PROJECTS['all'],
  backend: [] as typeof PROJECTS['all'],
  mobile: [] as typeof PROJECTS['all'],
};
PROJECTS.frontend = PROJECTS.all.filter(p => p.category === 'Frontend');
PROJECTS.backend = PROJECTS.all.filter(p => p.category === 'Backend');
PROJECTS.mobile = PROJECTS.all.filter(p => p.category === 'Mobile');

const SKILLS = {
  frontend: [
    { label: 'React', value: 95 },
    { label: 'TypeScript', value: 90 },
    { label: 'CSS / Tailwind', value: 85 },
    { label: 'Next.js', value: 88 },
    { label: 'Vue.js', value: 70 },
  ],
  backend: [
    { label: 'Node.js', value: 88 },
    { label: 'Python', value: 80 },
    { label: 'PostgreSQL', value: 85 },
    { label: 'MongoDB', value: 75 },
    { label: 'Redis', value: 70 },
  ],
  devops: [
    { label: 'Docker', value: 82 },
    { label: 'Kubernetes', value: 75 },
    { label: 'AWS', value: 78 },
    { label: 'CI/CD Pipelines', value: 85 },
    { label: 'Terraform', value: 65 },
  ],
  design: [
    { label: 'Figma', value: 80 },
    { label: 'UX Research', value: 72 },
    { label: 'Accessibility', value: 90 },
  ],
};

const EXPERIENCE = [
  {
    role: 'Senior Full Stack Engineer',
    company: 'TechCorp',
    period: '2022 — Present',
    color: 'primary' as const,
    bullets: [
      'Led architecture of a microservices platform serving 2M+ monthly users, reducing latency by 40%.',
      'Mentored a team of 6 engineers, establishing code review standards and CI/CD best practices.',
      'Shipped 14 major product features in collaboration with design and product, hitting every sprint goal.',
    ],
    skills: ['React', 'TypeScript', 'Kubernetes', 'AWS', 'PostgreSQL'],
  },
  {
    role: 'Full Stack Developer',
    company: 'StartupXYZ',
    period: '2020 — 2022',
    color: 'success' as const,
    bullets: [
      'Built the core SaaS product from 0 to $1M ARR, owning frontend and backend end-to-end.',
      'Integrated third-party APIs (Stripe, Twilio, SendGrid) cutting onboarding time by 60%.',
      'Optimized database queries and caching layer, improving p99 response times from 2s to 180ms.',
    ],
    skills: ['Next.js', 'Node.js', 'MongoDB', 'Docker', 'Redis'],
  },
  {
    role: 'Junior Web Developer',
    company: 'WebAgency',
    period: '2019 — 2020',
    color: 'warning' as const,
    bullets: [
      'Delivered 20+ client websites using modern HTML/CSS/JS, consistently meeting deadlines.',
      'Introduced component-based React architecture that reduced development time by 35%.',
    ],
    skills: ['React', 'JavaScript', 'PHP', 'WordPress', 'MySQL'],
  },
];

const TESTIMONIALS = [
  {
    name: 'Sarah Mitchell',
    role: 'CTO',
    company: 'NovaTech',
    avatar: 'SM',
    color: 'primary' as const,
    quote: 'Alex is one of the most talented engineers I\'ve worked with. Delivered a complex distributed system on time and under budget. Their attention to code quality and system design is exceptional.',
  },
  {
    name: 'David Park',
    role: 'Product Manager',
    company: 'StartupXYZ',
    avatar: 'DP',
    color: 'success' as const,
    quote: 'Beyond technical excellence, Alex understands the product side deeply. They proactively identify edge cases, ask the right questions, and ship features that users actually love.',
  },
  {
    name: 'Emily Torres',
    role: 'Lead Designer',
    company: 'CreativeStudio',
    avatar: 'ET',
    color: 'warning' as const,
    quote: 'Collaborating with Alex is a dream. They respect design intent, raise accessibility concerns early, and always find elegant solutions that work for both users and the codebase.',
  },
];

const POSTS = [
  {
    title: 'Building Scalable React Apps with Feature Flags',
    excerpt: 'A deep dive into progressive feature rollouts using LaunchDarkly and custom React hooks—keeping your codebase clean while shipping faster.',
    tags: ['React', 'Architecture'],
    readTime: '8 min read',
    date: 'Mar 18, 2026',
  },
  {
    title: 'PostgreSQL Query Optimization: From 4s to 40ms',
    excerpt: 'Real-world walkthrough of diagnosing slow queries with EXPLAIN ANALYZE, adding strategic indexes, and restructuring joins in a production database.',
    tags: ['PostgreSQL', 'Performance'],
    readTime: '12 min read',
    date: 'Feb 27, 2026',
  },
  {
    title: 'TypeScript Discriminated Unions in Practice',
    excerpt: 'How I use discriminated unions to model complex domain state in a fintech app—eliminating entire classes of runtime errors at the type level.',
    tags: ['TypeScript', 'Patterns'],
    readTime: '6 min read',
    date: 'Jan 14, 2026',
  },
];

function StarRating({ count = 5 }: { count?: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < count ? '#f59e0b' : '#d1d5db'}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </span>
  );
}

function ProjectCard({ project, theme }: { project: typeof PROJECTS.all[0]; theme: ThemeTokens }) {
  return (
    <TkxCard isHoverable style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <TkxCardHeader>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <TkxBadge variant={project.color as any}>{project.category}</TkxBadge>
          <span style={{ fontSize: 12, color: theme.textMuted, display: 'flex', gap: 12 }}>
            <span>★ {project.stars}</span>
            <span>⑂ {project.forks}</span>
          </span>
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, color: theme.text, marginBottom: 6 }}>{project.name}</div>
      </TkxCardHeader>
      <TkxCardBody style={{ flex: 1 }}>
        <p style={{ fontSize: 13.5, color: theme.textMuted, lineHeight: 1.65, marginBottom: 14 }}>{project.description}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          {project.tech.map(t => (
            <TkxBadge key={t} outlined size="sm">{t}</TkxBadge>
          ))}
        </div>
        <div style={{ marginBottom: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: theme.textMuted, marginBottom: 6 }}>
            <span>Test Coverage</span>
            <span style={{ fontWeight: 600, color: theme.text }}>{project.completion}%</span>
          </div>
          <TkxProgress value={project.completion} color={project.color as any} size="sm" />
        </div>
      </TkxCardBody>
      <TkxCardFooter>
        <div style={{ display: 'flex', gap: 8 }}>
          <TkxButton variant="outline" size="sm" style={{ flex: 1 }}>View Project</TkxButton>
          <TkxButton variant="ghost" size="sm" style={{ flex: 1 }}>Live Demo</TkxButton>
        </div>
      </TkxCardFooter>
    </TkxCard>
  );
}

export function PortfolioTemplate({ theme }: Props) {
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  const section = (style?: React.CSSProperties): React.CSSProperties => ({
    maxWidth: 1080,
    margin: '0 auto',
    padding: '0 24px',
    ...style,
  });

  const sectionHeading = (): React.CSSProperties => ({
    fontSize: 28,
    fontWeight: 800,
    color: theme.text,
    letterSpacing: '-0.03em',
    marginBottom: 6,
  });

  const sectionSub = (): React.CSSProperties => ({
    fontSize: 15,
    color: theme.textMuted,
    marginBottom: 40,
    lineHeight: 1.6,
  });

  return (
    <div style={{ background: theme.bg, color: theme.text, fontFamily: 'inherit', minHeight: '100vh' }}>

      {/* ─── NAV ─── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: theme.surface + 'f2',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${theme.border}`,
        padding: '0 24px',
      }}>
        <div style={{
          maxWidth: 1080, margin: '0 auto',
          display: 'flex', alignItems: 'center', height: 60,
          gap: 8,
        }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: theme.text, letterSpacing: '-0.02em', marginRight: 'auto' }}>
            Alex Chen
            <span style={{ fontWeight: 400, color: theme.textMuted }}> — Full Stack Developer</span>
          </div>
          {(['About', 'Work', 'Skills', 'Blog'] as const).map(link => (
            <TkxButton key={link} variant="ghost" size="sm">{link}</TkxButton>
          ))}
          <TkxButton variant="ghost" size="sm">Contact</TkxButton>
          <TkxBadge variant="success" style={{ marginLeft: 8 }}>● Available for work</TkxBadge>
          <TkxButton color="primary" size="sm" style={{ marginLeft: 8 }}>Hire Me</TkxButton>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section style={{ padding: '88px 0 72px', background: `linear-gradient(160deg, ${theme.primary}0a 0%, transparent 60%)` }}>
        <div style={section()}>
          <TkxBadge variant="success" style={{ marginBottom: 20 }}>
            ● Open to full-time &amp; freelance opportunities
          </TkxBadge>
          <h1 style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
            fontWeight: 900,
            letterSpacing: '-0.04em',
            lineHeight: 1.1,
            color: theme.text,
            maxWidth: 720,
            marginBottom: 24,
          }}>
            Building Digital Experiences<br />
            <span style={{ color: theme.primary }}>That Matter</span>
          </h1>
          <p style={{ fontSize: 17, color: theme.textMuted, maxWidth: 580, lineHeight: 1.75, marginBottom: 36 }}>
            Full-stack developer specializing in React, TypeScript, and cloud architecture.
            5+ years crafting scalable, accessible applications that users love.
          </p>
          <div style={{ display: 'flex', gap: 12, marginBottom: 36, flexWrap: 'wrap' }}>
            <TkxButton color="primary" size="lg">View My Work</TkxButton>
            <TkxButton variant="outline" size="lg">Download CV</TkxButton>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 48 }}>
            {['React', 'TypeScript', 'Node.js', 'AWS', 'PostgreSQL', 'Docker'].map(tag => (
              <TkxBadge key={tag} outlined>{tag}</TkxBadge>
            ))}
          </div>
          <div style={{
            display: 'flex', gap: 0, flexWrap: 'wrap',
            borderTop: `1px solid ${theme.border}`, paddingTop: 32,
          }}>
            {[
              { value: '50+', label: 'Projects Shipped' },
              { value: '30+', label: 'Happy Clients' },
              { value: '5 yrs', label: 'Experience' },
              { value: '12', label: 'Awards' },
            ].map((stat, i) => (
              <div key={i} style={{
                flex: '1 1 120px',
                paddingRight: 32,
                marginRight: 32,
                borderRight: i < 3 ? `1px solid ${theme.border}` : 'none',
              }}>
                <div style={{ fontSize: 30, fontWeight: 900, color: theme.primary, letterSpacing: '-0.04em' }}>{stat.value}</div>
                <div style={{ fontSize: 13, color: theme.textMuted, marginTop: 2 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PROJECTS ─── */}
      <section style={{ padding: '72px 0' }}>
        <div style={section()}>
          <div style={{ marginBottom: 40 }}>
            <h2 style={sectionHeading()}>Featured Projects</h2>
            <p style={sectionSub()}>A selection of work across frontend, backend, and mobile platforms.</p>
          </div>
          <TkxTabs defaultValue="all">
            <TkxTabList style={{ marginBottom: 32 }}>
              <TkxTab value="all">All Projects</TkxTab>
              <TkxTab value="frontend">Frontend</TkxTab>
              <TkxTab value="backend">Backend</TkxTab>
              <TkxTab value="mobile">Mobile</TkxTab>
            </TkxTabList>
            <TkxTabPanels>
              {(['all', 'frontend', 'backend', 'mobile'] as const).map(tab => (
                <TkxTabPanel key={tab} value={tab}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                    {PROJECTS[tab].map(p => <ProjectCard key={p.id} project={p} theme={theme} />)}
                  </div>
                </TkxTabPanel>
              ))}
            </TkxTabPanels>
          </TkxTabs>
        </div>
      </section>

      <TkxDivider />

      {/* ─── SKILLS ─── */}
      <section style={{ padding: '72px 0', background: theme.surface }}>
        <div style={section()}>
          <h2 style={sectionHeading()}>Skills &amp; Expertise</h2>
          <p style={sectionSub()}>Years of hands-on work across the full stack.</p>
          <TkxTabs defaultValue="frontend">
            <TkxTabList style={{ marginBottom: 32 }}>
              <TkxTab value="frontend">Frontend</TkxTab>
              <TkxTab value="backend">Backend</TkxTab>
              <TkxTab value="devops">DevOps</TkxTab>
              <TkxTab value="design">Design</TkxTab>
            </TkxTabList>
            <TkxTabPanels>
              {(['frontend', 'backend', 'devops', 'design'] as const).map(tab => (
                <TkxTabPanel key={tab} value={tab}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px 40px' }}>
                    {SKILLS[tab].map(skill => (
                      <div key={skill.label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>{skill.label}</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: theme.primary }}>{skill.value}%</span>
                        </div>
                        <TkxProgress value={skill.value} color="primary" size="md" />
                      </div>
                    ))}
                  </div>
                </TkxTabPanel>
              ))}
            </TkxTabPanels>
          </TkxTabs>
        </div>
      </section>

      <TkxDivider />

      {/* ─── EXPERIENCE ─── */}
      <section style={{ padding: '72px 0' }}>
        <div style={section()}>
          <h2 style={sectionHeading()}>Experience</h2>
          <p style={sectionSub()}>Where I've worked and what I've built.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {EXPERIENCE.map((exp, i) => (
              <TkxCard key={i} style={{ borderLeft: `3px solid var(--tkx-color-${exp.color})` }}>
                <TkxCardHeader>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 700, color: theme.text }}>{exp.role}</div>
                      <div style={{ fontSize: 14, color: theme.textMuted, marginTop: 2 }}>
                        <TkxBadge variant={exp.color} size="sm" style={{ marginRight: 8 }}>{exp.company}</TkxBadge>
                        {exp.period}
                      </div>
                    </div>
                  </div>
                </TkxCardHeader>
                <TkxCardBody>
                  <ul style={{ margin: '0 0 16px', padding: '0 0 0 18px' }}>
                    {exp.bullets.map((b, j) => (
                      <li key={j} style={{ fontSize: 14, color: theme.textMuted, lineHeight: 1.7, marginBottom: 4 }}>{b}</li>
                    ))}
                  </ul>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {exp.skills.map(s => <TkxBadge key={s} outlined size="sm">{s}</TkxBadge>)}
                  </div>
                </TkxCardBody>
              </TkxCard>
            ))}
          </div>
        </div>
      </section>

      <TkxDivider />

      {/* ─── TESTIMONIALS ─── */}
      <section style={{ padding: '72px 0', background: theme.surface }}>
        <div style={section()}>
          <h2 style={sectionHeading()}>What People Say</h2>
          <p style={sectionSub()}>Kind words from colleagues and clients.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {TESTIMONIALS.map((t, i) => (
              <TkxCard key={i} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                <TkxCardBody>
                  <StarRating count={5} />
                  <p style={{ fontSize: 14, color: theme.textMuted, lineHeight: 1.75, margin: '16px 0 20px', fontStyle: 'italic' }}>
                    "{t.quote}"
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 'auto' }}>
                    <TkxAvatar name={t.name} color={t.color} size="md" />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: theme.text }}>{t.name}</div>
                      <div style={{ fontSize: 12, color: theme.textMuted }}>{t.role} · {t.company}</div>
                    </div>
                  </div>
                </TkxCardBody>
              </TkxCard>
            ))}
          </div>
        </div>
      </section>

      <TkxDivider />

      {/* ─── BLOG ─── */}
      <section style={{ padding: '72px 0' }}>
        <div style={section()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h2 style={{ ...sectionHeading(), marginBottom: 4 }}>Latest Writing</h2>
              <p style={{ ...sectionSub(), marginBottom: 0 }}>Thoughts on engineering, architecture, and craft.</p>
            </div>
            <TkxButton variant="outline" size="sm">View All Posts →</TkxButton>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {POSTS.map((post, i) => (
              <TkxCard key={i} isHoverable style={{ display: 'flex', flexDirection: 'column' }}>
                <TkxCardBody style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
                    {post.tags.map(tag => (
                      <TkxBadge key={tag} variant="primary" size="sm">{tag}</TkxBadge>
                    ))}
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: theme.text, lineHeight: 1.4, marginBottom: 10 }}>
                    {post.title}
                  </h3>
                  <p style={{ fontSize: 13.5, color: theme.textMuted, lineHeight: 1.65, marginBottom: 20 }}>
                    {post.excerpt}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: theme.textMuted }}>
                    <span>{post.date}</span>
                    <span>{post.readTime}</span>
                  </div>
                </TkxCardBody>
                <TkxCardFooter>
                  <TkxButton variant="ghost" size="sm" style={{ width: '100%' }}>Read More →</TkxButton>
                </TkxCardFooter>
              </TkxCard>
            ))}
          </div>
        </div>
      </section>

      <TkxDivider />

      {/* ─── CONTACT ─── */}
      <section style={{ padding: '72px 0 96px', background: `linear-gradient(160deg, ${theme.primary}08 0%, transparent 60%)` }}>
        <div style={section()}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'start' }}>
            <div>
              <h2 style={sectionHeading()}>Let's Work Together</h2>
              <p style={{ fontSize: 15, color: theme.textMuted, lineHeight: 1.75, marginBottom: 32 }}>
                I'm currently open to new opportunities — whether it's a full-time role, a freelance project, or just a conversation about an interesting problem. My inbox is always open.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { icon: '✉️', label: 'Email', value: 'alex.chen@dev.io' },
                  { icon: '🐙', label: 'GitHub', value: 'github.com/alexchen' },
                  { icon: '💼', label: 'LinkedIn', value: 'linkedin.com/in/alexchen' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 20 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 1 }}>{item.label}</div>
                      <div style={{ fontSize: 14, color: theme.primary, fontWeight: 600 }}>{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <TkxCard>
              <TkxCardBody>
                {contactSubmitted ? (
                  <TkxAlert color="success" title="Message sent!" style={{ marginBottom: 0 }}>
                    Thanks for reaching out — I'll get back to you within 24 hours.
                  </TkxAlert>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <TkxInput
                        label="Name"
                        placeholder="Jane Doe"
                        value={contactName}
                        onChange={e => setContactName(e.target.value)}
                      />
                      <TkxInput
                        label="Email"
                        type="email"
                        placeholder="jane@example.com"
                        value={contactEmail}
                        onChange={e => setContactEmail(e.target.value)}
                      />
                    </div>
                    <TkxInput
                      label="Subject"
                      placeholder="Project inquiry, job opportunity…"
                      value={contactSubject}
                      onChange={e => setContactSubject(e.target.value)}
                    />
                    <TkxInput
                      label="Message"
                      placeholder="Tell me about your project or what you're looking for…"
                      value={contactMessage}
                      onChange={e => setContactMessage(e.target.value)}
                      multiline
                      rows={5}
                    />
                    <TkxButton
                      color="primary"
                      size="lg"
                      style={{ width: '100%' }}
                      onClick={() => setContactSubmitted(true)}
                      disabled={!contactName || !contactEmail || !contactMessage}
                    >
                      Send Message →
                    </TkxButton>
                  </div>
                )}
              </TkxCardBody>
            </TkxCard>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <div style={{ borderTop: `1px solid ${theme.border}`, padding: '20px 24px', textAlign: 'center' }}>
        <span style={{ fontSize: 13, color: theme.textMuted }}>
          © 2026 Alex Chen · Built with React &amp; TypeScript · Designed for humans
        </span>
      </div>
    </div>
  );
}
