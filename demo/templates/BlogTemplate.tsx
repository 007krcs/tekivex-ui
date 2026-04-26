import { useState } from 'react';
import type { CSSProperties } from 'react';
import type { ThemeTokens } from 'tekivex-ui';
import {
  TkxButton, TkxCard, TkxCardHeader, TkxCardBody, TkxCardFooter,
  TkxBadge, TkxInput, TkxAvatar, TkxDivider, TkxPagination, TkxAlert,
} from 'tekivex-ui';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { DemoSection } from '../layout/DemoSection';

// ── Data ─────────────────────────────────────────────────────────────────────

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  authorInitials: string;
  date: string;
  category: string;
  readTime: string;
  gradient: string;
}

interface Comment {
  id: number;
  author: string;
  authorInitials: string;
  content: string;
  date: string;
  replies?: Comment[];
}

const POSTS: BlogPost[] = [
  {
    id: 1,
    title: 'Building Accessible Design Systems from Scratch',
    excerpt: 'Learn how to create a design system that works for everyone, from color contrast to keyboard navigation and screen reader support.',
    author: 'Elena Vasquez',
    authorInitials: 'EV',
    date: 'Apr 2, 2026',
    category: 'Design',
    readTime: '8 min',
    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
  },
  {
    id: 2,
    title: 'State Management in 2026: What Actually Works',
    excerpt: 'A practical comparison of modern state management approaches — signals, atoms, stores, and the old guard. Which one fits your next project?',
    author: 'Marcus Chen',
    authorInitials: 'MC',
    date: 'Mar 28, 2026',
    category: 'React',
    readTime: '12 min',
    gradient: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
  },
  {
    id: 3,
    title: 'CSS Container Queries: The Layout Revolution',
    excerpt: 'Container queries change how we think about responsive design. Explore practical patterns that replace most media queries.',
    author: 'Sofia Andersson',
    authorInitials: 'SA',
    date: 'Mar 21, 2026',
    category: 'CSS',
    readTime: '6 min',
    gradient: 'linear-gradient(135deg, #10b981, #34d399)',
  },
  {
    id: 4,
    title: 'Edge Computing for Frontend Developers',
    excerpt: 'Push your API logic to the edge for sub-50ms response times. A hands-on guide to deploying server functions worldwide.',
    author: 'James Okafor',
    authorInitials: 'JO',
    date: 'Mar 14, 2026',
    category: 'Infrastructure',
    readTime: '10 min',
    gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
  },
  {
    id: 5,
    title: 'TypeScript 6.0: The Features That Matter',
    excerpt: 'Pattern matching, pipe operators, and improved inference. A deep dive into the TypeScript features that will change your daily workflow.',
    author: 'Priya Kapoor',
    authorInitials: 'PK',
    date: 'Mar 7, 2026',
    category: 'TypeScript',
    readTime: '9 min',
    gradient: 'linear-gradient(135deg, #ef4444, #f97316)',
  },
];

const COMMENTS: Comment[] = [
  {
    id: 1,
    author: 'Alex Rivera',
    authorInitials: 'AR',
    content: 'Great article! The section on keyboard navigation patterns was exactly what I needed. We implemented a similar approach in our product last quarter.',
    date: 'Apr 3, 2026',
    replies: [
      {
        id: 4,
        author: 'Elena Vasquez',
        authorInitials: 'EV',
        content: 'Thanks Alex! Glad it helped. If you run into edge cases with focus trapping in modals, I have a follow-up post coming next week.',
        date: 'Apr 3, 2026',
      },
    ],
  },
  {
    id: 2,
    author: 'Jordan Lee',
    authorInitials: 'JL',
    content: 'I would love to see a companion piece on testing accessibility in CI pipelines. Automated axe-core checks have been a game changer for our team.',
    date: 'Apr 2, 2026',
  },
  {
    id: 3,
    author: 'Sam Nakamura',
    authorInitials: 'SN',
    content: 'The color contrast section is solid. One thing worth adding: contrast requirements differ for large text vs. normal text under WCAG 2.2.',
    date: 'Apr 2, 2026',
  },
];

const CATEGORIES = ['All', 'React', 'Design', 'CSS', 'TypeScript', 'Infrastructure'];

// ── Component ────────────────────────────────────────────────────────────────

export function BlogTemplate({ theme }: { theme: ThemeTokens }) {
  const bp = useBreakpoint();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [commentText, setCommentText] = useState('');

  const filteredPosts = selectedCategory === 'All'
    ? POSTS
    : POSTS.filter(p => p.category === selectedCategory);

  const featured = POSTS[0];

  // ── Styles ───────────────────────────────────────────────────────────────

  const wrapper: CSSProperties = {
    padding: bp.isMobile ? '20px 12px' : '40px 24px',
    maxWidth: 1200,
    margin: '0 auto',
  };

  const headerStyle: CSSProperties = {
    textAlign: 'center',
    marginBottom: bp.isMobile ? 28 : 48,
  };

  const titleStyle: CSSProperties = {
    fontSize: bp.isMobile ? 28 : 42,
    fontWeight: 800,
    color: theme.text,
    margin: 0,
    letterSpacing: '-0.02em',
    lineHeight: 1.15,
  };

  const subtitleStyle: CSSProperties = {
    fontSize: bp.isMobile ? 14 : 17,
    color: theme.textMuted,
    marginTop: 10,
    lineHeight: 1.6,
  };

  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: bp.isMobile ? '1fr' : '2fr 1fr',
    gap: bp.isMobile ? 24 : 32,
    alignItems: 'start',
  };

  const sectionTitle = (text: string): CSSProperties => ({
    fontSize: bp.isMobile ? 18 : 22,
    fontWeight: 700,
    color: theme.text,
    margin: '0 0 16px',
  });

  // ── Helpers ──────────────────────────────────────────────────────────────

  function renderArticleCard(post: BlogPost, isFeatured = false) {
    return (
      <TkxCard key={post.id} style={{ marginBottom: isFeatured ? (bp.isMobile ? 24 : 36) : 20 }}>
        {/* Image placeholder */}
        <div
          style={{
            background: post.gradient,
            height: isFeatured ? (bp.isMobile ? 160 : 220) : (bp.isMobile ? 120 : 160),
            borderRadius: '8px 8px 0 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: isFeatured ? 48 : 32, opacity: 0.25, color: '#fff', fontWeight: 700 }}>
            {post.category.toUpperCase()}
          </span>
        </div>

        <TkxCardBody>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <TkxBadge variant="primary">{post.category}</TkxBadge>
            <TkxBadge variant="default">{post.readTime} read</TkxBadge>
            {isFeatured && <TkxBadge variant="warning">Featured</TkxBadge>}
          </div>

          <h3 style={{
            fontSize: isFeatured ? (bp.isMobile ? 20 : 26) : (bp.isMobile ? 16 : 20),
            fontWeight: 700,
            color: theme.text,
            margin: '0 0 8px',
            lineHeight: 1.3,
          }}>
            {post.title}
          </h3>

          <p style={{
            fontSize: bp.isMobile ? 13 : 15,
            color: theme.textMuted,
            margin: '0 0 16px',
            lineHeight: 1.6,
          }}>
            {post.excerpt}
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <TkxAvatar name={post.author} size="sm" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>{post.author}</div>
                <div style={{ fontSize: 12, color: theme.textMuted }}>{post.date}</div>
              </div>
            </div>

            <TkxButton variant="outline" size="sm">
              Read More
            </TkxButton>
          </div>
        </TkxCardBody>
      </TkxCard>
    );
  }

  function renderComment(comment: Comment, isReply = false) {
    return (
      <div key={comment.id} style={{ marginLeft: isReply ? (bp.isMobile ? 20 : 40) : 0, marginBottom: 16 }}>
        <TkxCard style={{ borderLeft: isReply ? `3px solid ${theme.primary}` : undefined }}>
          <TkxCardBody>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <TkxAvatar name={comment.author} size="sm" />
              <div>
                <span style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>{comment.author}</span>
                <span style={{ fontSize: 12, color: theme.textMuted, marginLeft: 8 }}>{comment.date}</span>
              </div>
            </div>
            <p style={{ fontSize: 14, color: theme.text, margin: 0, lineHeight: 1.6 }}>
              {comment.content}
            </p>
            <div style={{ marginTop: 10 }}>
              <TkxButton variant="ghost" size="sm">Reply</TkxButton>
            </div>
          </TkxCardBody>
        </TkxCard>
        {comment.replies?.map(reply => renderComment(reply, true))}
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={wrapper}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: theme.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
        </div>
        <h1 style={titleStyle}>TekiVex Engineering Blog</h1>
        <p style={subtitleStyle}>
          Insights on frontend architecture, design systems, and modern web development.
        </p>
      </header>

      {/* ── Featured Article ───────────────────────────────────────────────── */}
      {renderArticleCard(featured, true)}

      {/* ── Main Grid ──────────────────────────────────────────────────────── */}
      <div style={gridStyle}>
        {/* ── Left: Article List ────────────────────────────────────────────── */}
        <div>
          <h2 style={sectionTitle('Latest Articles')}>Latest Articles</h2>

          {/* Category filter */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
            {CATEGORIES.map(cat => (
              <TkxButton
                key={cat}
                variant={selectedCategory === cat ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </TkxButton>
            ))}
          </div>

          {/* Posts */}
          {filteredPosts.slice(1).map(post => renderArticleCard(post))}

          {filteredPosts.length === 0 && (
            <TkxAlert variant="info">No articles found in this category.</TkxAlert>
          )}

          {/* Pagination */}
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
            <TkxPagination
              currentPage={currentPage}
              totalPages={3}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>

        {/* ── Right: Sidebar ───────────────────────────────────────────────── */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* About card */}
          <TkxCard>
            <TkxCardBody>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: theme.text, margin: '0 0 8px' }}>
                About This Blog
              </h3>
              <p style={{ fontSize: 13, color: theme.textMuted, margin: 0, lineHeight: 1.6 }}>
                We write about building production-grade UI components, design tokens,
                accessibility, and the tools that make frontend development better.
              </p>
            </TkxCardBody>
          </TkxCard>

          {/* Categories */}
          <TkxCard>
            <TkxCardBody>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: theme.text, margin: '0 0 12px' }}>
                Categories
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {CATEGORIES.filter(c => c !== 'All').map(cat => (
                  <TkxBadge
                    key={cat}
                    variant={selectedCategory === cat ? 'primary' : 'default'}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </TkxBadge>
                ))}
              </div>
            </TkxCardBody>
          </TkxCard>

          {/* Newsletter signup */}
          <TkxCard style={{ background: theme.surfaceAlt }}>
            <TkxCardBody>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: theme.text, margin: '0 0 4px' }}>
                Newsletter
              </h3>
              <p style={{ fontSize: 13, color: theme.textMuted, margin: '0 0 14px', lineHeight: 1.5 }}>
                Get the latest articles delivered to your inbox every week.
              </p>
              {subscribed ? (
                <TkxAlert variant="success">You're subscribed!</TkxAlert>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <TkxInput
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                  <TkxButton
                    variant="primary"
                    size="sm"
                    onClick={() => { if (email.includes('@')) setSubscribed(true); }}
                    style={{ width: '100%' }}
                  >
                    Subscribe
                  </TkxButton>
                </div>
              )}
            </TkxCardBody>
          </TkxCard>

          {/* Popular tags */}
          <TkxCard>
            <TkxCardBody>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: theme.text, margin: '0 0 12px' }}>
                Popular Tags
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {['react', 'typescript', 'a11y', 'css', 'performance', 'testing', 'design-tokens', 'ssr'].map(tag => (
                  <TkxBadge key={tag} variant="default" style={{ fontSize: 11 }}>#{tag}</TkxBadge>
                ))}
              </div>
            </TkxCardBody>
          </TkxCard>
        </aside>
      </div>

      {/* ── Divider ────────────────────────────────────────────────────────── */}
      <TkxDivider style={{ margin: bp.isMobile ? '32px 0' : '48px 0' }} />

      {/* ── Comments Section ───────────────────────────────────────────────── */}
      <section>
        <h2 style={sectionTitle('Comments')}>Comments ({COMMENTS.length})</h2>

        {/* New comment form */}
        <TkxCard style={{ marginBottom: 24 }}>
          <TkxCardBody>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <TkxAvatar name="You" size="sm" />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <TkxInput
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <TkxButton variant="primary" size="sm" onClick={() => setCommentText('')}>
                    Post Comment
                  </TkxButton>
                </div>
              </div>
            </div>
          </TkxCardBody>
        </TkxCard>

        {/* Comment list */}
        {COMMENTS.map(comment => renderComment(comment))}
      </section>

      {/* ── Divider ────────────────────────────────────────────────────────── */}
      <TkxDivider style={{ margin: bp.isMobile ? '32px 0' : '48px 0' }} />

      {/* ── Build Your Own ─────────────────────────────────────────────────── */}
      <section>
        <h2 style={{ ...sectionTitle('Build Your Own'), marginBottom: 8 }}>Build Your Own</h2>
        <p style={{ fontSize: bp.isMobile ? 13 : 15, color: theme.textMuted, marginTop: 0, marginBottom: 28, lineHeight: 1.6 }}>
          Recreate the key patterns from this template using TekiVex UI primitives.
        </p>

        {/* 1 ── Article Card */}
        <DemoSection
          title="Article Card"
          description="Compose a blog post card with TkxCard, TkxAvatar, and TkxBadge."
          code={`<TkxCard>
  <TkxCardBody>
    <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
      <TkxBadge variant="primary">React</TkxBadge>
      <TkxBadge variant="default">8 min read</TkxBadge>
    </div>
    <h3 style={{ margin: '0 0 8px', fontWeight: 700 }}>
      Article Title Here
    </h3>
    <p style={{ color: theme.textMuted, margin: '0 0 14px' }}>
      Short excerpt describing the article content...
    </p>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <TkxAvatar name="Jane Doe" size="sm" />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Jane Doe</span>
      <span style={{ fontSize: 12, color: theme.textMuted }}>Apr 1, 2026</span>
    </div>
  </TkxCardBody>
  <TkxCardFooter>
    <TkxButton variant="outline" size="sm">Read More</TkxButton>
  </TkxCardFooter>
</TkxCard>`}
          theme={theme}
        >
          <TkxCard>
            <TkxCardBody>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <TkxBadge variant="primary">React</TkxBadge>
                <TkxBadge variant="default">8 min read</TkxBadge>
              </div>
              <h3 style={{ margin: '0 0 8px', fontWeight: 700, color: theme.text }}>
                Article Title Here
              </h3>
              <p style={{ color: theme.textMuted, margin: '0 0 14px', fontSize: 14, lineHeight: 1.6 }}>
                Short excerpt describing the article content...
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <TkxAvatar name="Jane Doe" size="sm" />
                <span style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>Jane Doe</span>
                <span style={{ fontSize: 12, color: theme.textMuted }}>Apr 1, 2026</span>
              </div>
            </TkxCardBody>
            <TkxCardFooter>
              <TkxButton variant="outline" size="sm">Read More</TkxButton>
            </TkxCardFooter>
          </TkxCard>
        </DemoSection>

        {/* 2 ── Comment Thread */}
        <DemoSection
          title="Comment Thread"
          description="Nest TkxCard components to create threaded comment replies."
          code={`<div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
  {/* Parent comment */}
  <TkxCard>
    <TkxCardBody>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <TkxAvatar name="Alex Rivera" size="sm" />
        <span style={{ fontWeight: 600, fontSize: 14 }}>Alex Rivera</span>
        <span style={{ fontSize: 12, color: theme.textMuted }}>2h ago</span>
      </div>
      <p style={{ margin: 0, fontSize: 14 }}>
        Great article! Really helpful breakdown.
      </p>
    </TkxCardBody>
  </TkxCard>

  {/* Nested reply */}
  <div style={{ marginLeft: 40 }}>
    <TkxCard style={{ borderLeft: \`3px solid \${theme.primary}\` }}>
      <TkxCardBody>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <TkxAvatar name="Elena Vasquez" size="sm" />
          <span style={{ fontWeight: 600, fontSize: 14 }}>Elena Vasquez</span>
          <span style={{ fontSize: 12, color: theme.textMuted }}>1h ago</span>
        </div>
        <p style={{ margin: 0, fontSize: 14 }}>Thanks Alex! Glad it helped.</p>
      </TkxCardBody>
    </TkxCard>
  </div>
</div>`}
          theme={theme}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <TkxCard>
              <TkxCardBody>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <TkxAvatar name="Alex Rivera" size="sm" />
                  <span style={{ fontWeight: 600, fontSize: 14, color: theme.text }}>Alex Rivera</span>
                  <span style={{ fontSize: 12, color: theme.textMuted }}>2h ago</span>
                </div>
                <p style={{ margin: 0, fontSize: 14, color: theme.text, lineHeight: 1.6 }}>
                  Great article! Really helpful breakdown.
                </p>
              </TkxCardBody>
            </TkxCard>
            <div style={{ marginLeft: 40 }}>
              <TkxCard style={{ borderLeft: `3px solid ${theme.primary}` }}>
                <TkxCardBody>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <TkxAvatar name="Elena Vasquez" size="sm" />
                    <span style={{ fontWeight: 600, fontSize: 14, color: theme.text }}>Elena Vasquez</span>
                    <span style={{ fontSize: 12, color: theme.textMuted }}>1h ago</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 14, color: theme.text, lineHeight: 1.6 }}>
                    Thanks Alex! Glad it helped.
                  </p>
                </TkxCardBody>
              </TkxCard>
            </div>
          </div>
        </DemoSection>

        {/* 3 ── Newsletter Signup */}
        <DemoSection
          title="Newsletter Signup"
          description="Combine TkxInput, TkxButton, and TkxAlert for a subscription form with feedback."
          code={`const [email, setEmail] = useState('');
const [done, setDone] = useState(false);

<TkxCard style={{ background: theme.surfaceAlt }}>
  <TkxCardBody>
    <h3 style={{ margin: '0 0 8px', fontWeight: 700, fontSize: 16 }}>
      Subscribe to our newsletter
    </h3>
    <p style={{ color: theme.textMuted, fontSize: 13, margin: '0 0 14px' }}>
      Weekly insights, no spam.
    </p>
    {done ? (
      <TkxAlert variant="success">You're subscribed!</TkxAlert>
    ) : (
      <div style={{ display: 'flex', gap: 8 }}>
        <TkxInput
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ flex: 1 }}
        />
        <TkxButton
          variant="primary"
          size="sm"
          onClick={() => setDone(true)}
        >
          Subscribe
        </TkxButton>
      </div>
    )}
  </TkxCardBody>
</TkxCard>`}
          theme={theme}
        >
          <NewsletterDemo theme={theme} />
        </DemoSection>
      </section>
    </div>
  );
}

// ── Newsletter Demo (isolated state) ─────────────────────────────────────────

function NewsletterDemo({ theme }: { theme: ThemeTokens }) {
  const [demoEmail, setDemoEmail] = useState('');
  const [demoDone, setDemoDone] = useState(false);

  return (
    <TkxCard style={{ background: theme.surfaceAlt }}>
      <TkxCardBody>
        <h3 style={{ margin: '0 0 8px', fontWeight: 700, fontSize: 16, color: theme.text }}>
          Subscribe to our newsletter
        </h3>
        <p style={{ color: theme.textMuted, fontSize: 13, margin: '0 0 14px', lineHeight: 1.5 }}>
          Weekly insights, no spam.
        </p>
        {demoDone ? (
          <TkxAlert variant="success">You're subscribed!</TkxAlert>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <TkxInput
              placeholder="you@example.com"
              value={demoEmail}
              onChange={e => setDemoEmail(e.target.value)}
              style={{ flex: 1 }}
            />
            <TkxButton
              variant="primary"
              size="sm"
              onClick={() => { if (demoEmail.includes('@')) setDemoDone(true); }}
            >
              Subscribe
            </TkxButton>
          </div>
        )}
      </TkxCardBody>
    </TkxCard>
  );
}
