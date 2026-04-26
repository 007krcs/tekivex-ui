import { useState } from 'react';
import type { CSSProperties } from 'react';
import type { ThemeTokens } from 'tekivex-ui';
import {
  TkxButton, TkxCard, TkxCardHeader, TkxCardBody, TkxCardFooter,
  TkxBadge, TkxInput, TkxToggle, TkxSelect, TkxCheckbox, TkxRadio, TkxRadioGroup,
  TkxSlider, TkxAvatar, TkxDivider, TkxAlert, TkxTabs, TkxTabList, TkxTab,
  TkxTabPanels, TkxTabPanel, TkxModal
} from 'tekivex-ui';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { DemoSection } from '../layout/DemoSection';

// ── Types ────────────────────────────────────────────────────────────────────

interface Props { theme: ThemeTokens }

// ── Data ─────────────────────────────────────────────────────────────────────

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'ja', label: 'Japanese' },
  { value: 'zh', label: 'Chinese (Simplified)' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ko', label: 'Korean' },
];

const accentColors = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Indigo', value: '#6366f1' },
];

const activeSessions = [
  { device: 'Chrome on Windows', location: 'San Francisco, CA', lastActive: 'Active now', current: true },
  { device: 'Safari on iPhone 15', location: 'San Francisco, CA', lastActive: '2 hours ago', current: false },
  { device: 'Firefox on MacBook Pro', location: 'New York, NY', lastActive: '3 days ago', current: false },
  { device: 'Chrome on Linux', location: 'Austin, TX', lastActive: '1 week ago', current: false },
];

// ── Component ────────────────────────────────────────────────────────────────

export function AdminSettingsTemplate({ theme }: Props) {
  const bp = useBreakpoint();

  // Profile state
  const [fullName, setFullName] = useState('Alex Morrison');
  const [email, setEmail] = useState('alex.morrison@tekivex.io');
  const [username, setUsername] = useState('amorrison');
  const [phone, setPhone] = useState('+1 (415) 555-0192');
  const [bio, setBio] = useState('Senior Platform Engineer with 8+ years of experience building distributed systems. Passionate about developer tooling and observability.');

  // Notification state
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [securityAlerts, setSecurityAlerts] = useState(true);

  // Security state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactor, setTwoFactor] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Appearance state
  const [themeMode, setThemeMode] = useState('system');
  const [fontSize, setFontSize] = useState(16);
  const [language, setLanguage] = useState('en');
  const [accentColor, setAccentColor] = useState('#3b82f6');

  // Tabs
  const [activeTab, setActiveTab] = useState(0);

  // ── Styles ───────────────────────────────────────────────────────────────

  const s: Record<string, CSSProperties> = {
    page: {
      maxWidth: 960,
      margin: '0 auto',
      padding: bp.isMobile ? '20px 12px 48px' : '32px 24px 64px',
    },
    header: {
      marginBottom: bp.isMobile ? 20 : 32,
    },
    breadcrumb: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 13,
      color: theme.textMuted,
      marginBottom: 8,
    },
    breadcrumbSep: {
      color: theme.border,
    },
    title: {
      fontSize: bp.isMobile ? 24 : 32,
      fontWeight: 700,
      color: theme.text,
      margin: 0,
      letterSpacing: '-0.02em',
    },
    subtitle: {
      fontSize: 14,
      color: theme.textMuted,
      marginTop: 4,
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: bp.isMobile ? '1fr' : '1fr 1fr',
      gap: 16,
    },
    fullWidth: {
      gridColumn: bp.isMobile ? undefined : '1 / -1',
    },
    sectionLabel: {
      fontSize: 15,
      fontWeight: 600,
      color: theme.text,
      margin: '0 0 4px 0',
    },
    sectionSub: {
      fontSize: 12,
      color: theme.textMuted,
      margin: 0,
    },
    toggleRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: bp.isMobile ? '14px 12px' : '16px 20px',
      background: theme.surface,
      border: `1px solid ${theme.border}`,
      borderRadius: 10,
    },
    toggleLabel: {
      fontSize: 14,
      fontWeight: 600,
      color: theme.text,
    },
    toggleDesc: {
      fontSize: 12,
      color: theme.textMuted,
      marginTop: 2,
    },
    sessionRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '14px 0',
    },
    sessionDevice: {
      fontSize: 14,
      fontWeight: 600,
      color: theme.text,
    },
    sessionMeta: {
      fontSize: 12,
      color: theme.textMuted,
      marginTop: 2,
    },
    colorCircle: {
      width: 32,
      height: 32,
      borderRadius: '50%',
      cursor: 'pointer',
      transition: 'transform 0.15s, box-shadow 0.15s',
      border: '2px solid transparent',
      flexShrink: 0,
    },
    colorCircleActive: {
      transform: 'scale(1.15)',
      boxShadow: '0 0 0 3px ' + theme.primary + '40',
    },
    buttonRow: {
      display: 'flex',
      gap: 12,
      justifyContent: 'flex-end',
      paddingTop: 8,
    },
    dangerZone: {
      border: `1px solid ${theme.danger ?? '#ef4444'}40`,
      borderRadius: 12,
      padding: bp.isMobile ? 16 : 24,
      background: (theme.danger ?? '#ef4444') + '08',
    },
    dangerTitle: {
      fontSize: 16,
      fontWeight: 700,
      color: theme.danger ?? '#ef4444',
      margin: '0 0 4px',
    },
    dangerDesc: {
      fontSize: 13,
      color: theme.textMuted,
      margin: '0 0 16px',
    },
    demoArea: {
      marginTop: 48,
    },
    demoHeading: {
      fontSize: bp.isMobile ? 20 : 24,
      fontWeight: 700,
      color: theme.text,
      marginBottom: 8,
    },
    demoSub: {
      fontSize: 14,
      color: theme.textMuted,
      marginBottom: 24,
    },
  };

  // ── Notification toggles data ───────────────────────────────────────────

  const notificationToggles = [
    { label: 'Email Notifications', desc: 'Receive emails for important updates and activity', checked: emailNotifs, onChange: setEmailNotifs },
    { label: 'Push Notifications', desc: 'Get push alerts on your browser and mobile devices', checked: pushNotifs, onChange: setPushNotifs },
    { label: 'SMS Alerts', desc: 'Receive text messages for critical events', checked: smsAlerts, onChange: setSmsAlerts },
    { label: 'Weekly Digest', desc: 'Summary of activity delivered every Monday', checked: weeklyDigest, onChange: setWeeklyDigest },
    { label: 'Marketing Emails', desc: 'Product updates, tips, and promotional content', checked: marketingEmails, onChange: setMarketingEmails },
    { label: 'Security Alerts', desc: 'Notifications for login attempts and password changes', checked: securityAlerts, onChange: setSecurityAlerts },
  ];

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={s.page}>

      {/* ── Header ── */}
      <div style={s.header}>
        <div style={s.breadcrumb}>
          <span>Admin</span>
          <span style={s.breadcrumbSep}>/</span>
          <span>Account</span>
          <span style={s.breadcrumbSep}>/</span>
          <span style={{ color: theme.text, fontWeight: 500 }}>Settings</span>
        </div>
        <h1 style={s.title}>Settings</h1>
        <p style={s.subtitle}>Manage your account preferences, security, and appearance</p>
      </div>

      {/* ── Tabs ── */}
      <TkxCard style={{ marginBottom: 24 }}>
        <TkxCardBody>
          <TkxTabs activeIndex={activeTab} onChange={setActiveTab}>
            <TkxTabList>
              <TkxTab>Profile</TkxTab>
              <TkxTab>Notifications</TkxTab>
              <TkxTab>Security</TkxTab>
              <TkxTab>Appearance</TkxTab>
            </TkxTabList>
            <TkxTabPanels>

              {/* ── Profile Tab ── */}
              <TkxTabPanel>
                <div style={{ paddingTop: 16 }}>

                  {/* Avatar area */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
                    <TkxAvatar
                      size="xl"
                      alt="Alex Morrison"
                      initials="AM"
                      style={{
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: theme.text }}>Alex Morrison</div>
                      <div style={{ fontSize: 13, color: theme.textMuted, marginTop: 2 }}>Senior Platform Engineer</div>
                      <TkxButton variant="outline" size="sm" style={{ marginTop: 10 }}>
                        Change Avatar
                      </TkxButton>
                    </div>
                  </div>

                  <TkxDivider />

                  {/* Form fields */}
                  <div style={{ ...s.formGrid, marginTop: 20 }}>
                    <TkxInput
                      label="Full Name"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                    />
                    <TkxInput
                      label="Email Address"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      type="email"
                      placeholder="you@example.com"
                    />
                    <TkxInput
                      label="Username"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      placeholder="username"
                    />
                    <TkxInput
                      label="Phone Number"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <div style={{ marginTop: 16 }}>
                    <TkxInput
                      label="Bio"
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div style={s.buttonRow}>
                    <TkxButton variant="outline" size="sm">Cancel</TkxButton>
                    <TkxButton variant="primary" size="sm">Save Changes</TkxButton>
                  </div>

                </div>
              </TkxTabPanel>

              {/* ── Notifications Tab ── */}
              <TkxTabPanel>
                <div style={{ paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>

                  <TkxAlert variant="info" title="Notification Preferences">
                    These settings control how and when you receive notifications. Security alerts cannot be fully disabled for admin accounts.
                  </TkxAlert>

                  {notificationToggles.map((item, i) => (
                    <div key={i} style={s.toggleRow}>
                      <div>
                        <div style={s.toggleLabel}>{item.label}</div>
                        <div style={s.toggleDesc}>{item.desc}</div>
                      </div>
                      <TkxToggle
                        checked={item.checked}
                        onChange={item.onChange}
                      />
                    </div>
                  ))}

                  <div style={s.buttonRow}>
                    <TkxButton variant="primary" size="sm">Save Preferences</TkxButton>
                  </div>

                </div>
              </TkxTabPanel>

              {/* ── Security Tab ── */}
              <TkxTabPanel>
                <div style={{ paddingTop: 16 }}>

                  {/* Password section */}
                  <div style={{ marginBottom: 28 }}>
                    <p style={s.sectionLabel}>Change Password</p>
                    <p style={s.sectionSub}>Ensure your new password is at least 12 characters with mixed case, numbers, and symbols</p>
                    <div style={{ ...s.formGrid, marginTop: 16 }}>
                      <TkxInput
                        label="Current Password"
                        type="password"
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                      />
                      <div />
                      <TkxInput
                        label="New Password"
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                      />
                      <TkxInput
                        label="Confirm New Password"
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        error={confirmPassword && confirmPassword !== newPassword ? 'Passwords do not match' : undefined}
                      />
                    </div>
                    <div style={s.buttonRow}>
                      <TkxButton variant="primary" size="sm">Update Password</TkxButton>
                    </div>
                  </div>

                  <TkxDivider />

                  {/* Two-factor */}
                  <div style={{ margin: '24px 0' }}>
                    <div style={s.toggleRow}>
                      <div>
                        <div style={s.toggleLabel}>Two-Factor Authentication</div>
                        <div style={s.toggleDesc}>Add an extra layer of security to your account with TOTP or hardware keys</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {twoFactor && <TkxBadge variant="success">Enabled</TkxBadge>}
                        <TkxToggle checked={twoFactor} onChange={setTwoFactor} />
                      </div>
                    </div>
                  </div>

                  <TkxDivider />

                  {/* Active sessions */}
                  <div style={{ margin: '24px 0' }}>
                    <p style={s.sectionLabel}>Active Sessions</p>
                    <p style={{ ...s.sectionSub, marginBottom: 12 }}>Manage devices where your account is currently signed in</p>
                    {activeSessions.map((session, i) => (
                      <div key={i}>
                        <div style={s.sessionRow}>
                          <div>
                            <div style={s.sessionDevice}>
                              {session.device}
                              {session.current && (
                                <TkxBadge variant="primary" style={{ marginLeft: 8, fontSize: 10 }}>This device</TkxBadge>
                              )}
                            </div>
                            <div style={s.sessionMeta}>{session.location} &middot; {session.lastActive}</div>
                          </div>
                          {!session.current && (
                            <TkxButton variant="outline" size="sm">Revoke</TkxButton>
                          )}
                        </div>
                        {i < activeSessions.length - 1 && <TkxDivider />}
                      </div>
                    ))}
                  </div>

                  <TkxDivider />

                  {/* Danger zone */}
                  <div style={{ marginTop: 24 }}>
                    <div style={s.dangerZone}>
                      <p style={s.dangerTitle}>Danger Zone</p>
                      <p style={s.dangerDesc}>
                        Permanently delete your account and all associated data. This action is irreversible and cannot be undone.
                      </p>
                      <TkxButton variant="danger" size="sm" onClick={() => setDeleteModalOpen(true)}>
                        Delete Account
                      </TkxButton>
                    </div>
                  </div>

                  {/* Delete confirmation modal */}
                  <TkxModal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
                    <div style={{ padding: 24 }}>
                      <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: theme.danger ?? '#ef4444' }}>
                        Confirm Account Deletion
                      </h3>
                      <p style={{ fontSize: 14, color: theme.textMuted, marginBottom: 20 }}>
                        This will permanently delete your account, including all projects, data, and settings. You will not be able to recover your account.
                      </p>
                      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                        <TkxButton variant="outline" size="sm" onClick={() => setDeleteModalOpen(false)}>
                          Cancel
                        </TkxButton>
                        <TkxButton variant="danger" size="sm" onClick={() => setDeleteModalOpen(false)}>
                          Yes, Delete My Account
                        </TkxButton>
                      </div>
                    </div>
                  </TkxModal>

                </div>
              </TkxTabPanel>

              {/* ── Appearance Tab ── */}
              <TkxTabPanel>
                <div style={{ paddingTop: 16 }}>

                  {/* Theme selection */}
                  <div style={{ marginBottom: 28 }}>
                    <p style={s.sectionLabel}>Theme</p>
                    <p style={{ ...s.sectionSub, marginBottom: 16 }}>Choose how the interface looks to you</p>
                    <TkxRadioGroup
                      label="Theme Mode"
                      value={themeMode}
                      onChange={setThemeMode}
                    >
                      <TkxRadio value="light">Light</TkxRadio>
                      <TkxRadio value="dark">Dark</TkxRadio>
                      <TkxRadio value="system">System</TkxRadio>
                    </TkxRadioGroup>
                  </div>

                  <TkxDivider />

                  {/* Font size */}
                  <div style={{ margin: '24px 0' }}>
                    <p style={s.sectionLabel}>Font Size</p>
                    <p style={{ ...s.sectionSub, marginBottom: 16 }}>Adjust the base font size across the application</p>
                    <TkxSlider
                      label={`${fontSize}px`}
                      value={fontSize}
                      onChange={v => setFontSize(v as number)}
                      min={12}
                      max={24}
                      showValue
                    />
                  </div>

                  <TkxDivider />

                  {/* Language */}
                  <div style={{ margin: '24px 0', maxWidth: bp.isMobile ? '100%' : 360 }}>
                    <p style={s.sectionLabel}>Language</p>
                    <p style={{ ...s.sectionSub, marginBottom: 16 }}>Select your preferred display language</p>
                    <TkxSelect
                      label="Display Language"
                      options={languageOptions}
                      value={language}
                      onChange={v => setLanguage(v as string)}
                    />
                  </div>

                  <TkxDivider />

                  {/* Accent color */}
                  <div style={{ margin: '24px 0' }}>
                    <p style={s.sectionLabel}>Accent Color</p>
                    <p style={{ ...s.sectionSub, marginBottom: 16 }}>Choose a primary accent color for buttons and interactive elements</p>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      {accentColors.map(c => (
                        <div
                          key={c.value}
                          title={c.name}
                          onClick={() => setAccentColor(c.value)}
                          style={{
                            ...s.colorCircle,
                            background: c.value,
                            borderColor: accentColor === c.value ? c.value : 'transparent',
                            ...(accentColor === c.value ? s.colorCircleActive : {}),
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div style={s.buttonRow}>
                    <TkxButton variant="outline" size="sm">Reset to Defaults</TkxButton>
                    <TkxButton variant="primary" size="sm">Save Appearance</TkxButton>
                  </div>

                </div>
              </TkxTabPanel>

            </TkxTabPanels>
          </TkxTabs>
        </TkxCardBody>
      </TkxCard>

      {/* ── Build Your Own ── */}
      <div style={s.demoArea}>
        <h2 style={s.demoHeading}>Build Your Own</h2>
        <p style={s.demoSub}>Copy these patterns to create settings interfaces in your own applications.</p>

        {/* Demo 1: Settings Toggle Row */}
        <DemoSection
          title="Settings Toggle Row"
          description="Create a settings option with label, description, and toggle. This pattern works well for boolean preferences like notification settings."
          code={`<div style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 20px',
  border: '1px solid var(--border)',
  borderRadius: 10,
  background: 'var(--surface)',
}}>
  <div>
    <div style={{ fontWeight: 600, fontSize: 14 }}>Email Notifications</div>
    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
      Receive emails for important updates
    </div>
  </div>
  <TkxToggle checked={enabled} onChange={setEnabled} />
</div>`}
          theme={theme}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            border: `1px solid ${theme.border}`,
            borderRadius: 10,
            background: theme.surface,
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: theme.text }}>Email Notifications</div>
              <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 2 }}>
                Receive emails for important updates
              </div>
            </div>
            <TkxToggle checked={emailNotifs} onChange={setEmailNotifs} />
          </div>
        </DemoSection>

        {/* Demo 2: Form Group */}
        <DemoSection
          title="Form Group"
          description="Compose TkxInput and TkxSelect in a responsive grid to build settings forms. Use a 2-column layout on desktop that collapses to a single column on mobile."
          code={`<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: 16,
}}>
  <TkxInput
    label="Display Name"
    value={name}
    onChange={e => setName(e.target.value)}
    placeholder="Enter your name"
  />
  <TkxSelect
    label="Timezone"
    options={[
      { value: 'utc', label: 'UTC' },
      { value: 'est', label: 'Eastern (EST)' },
      { value: 'pst', label: 'Pacific (PST)' },
      { value: 'cet', label: 'Central European (CET)' },
    ]}
    value={timezone}
    onChange={setTimezone}
  />
  <TkxInput
    label="Email"
    type="email"
    value={email}
    onChange={e => setEmail(e.target.value)}
    placeholder="you@example.com"
  />
  <TkxSelect
    label="Role"
    options={[
      { value: 'admin', label: 'Administrator' },
      { value: 'editor', label: 'Editor' },
      { value: 'viewer', label: 'Viewer' },
    ]}
    value={role}
    onChange={setRole}
  />
</div>`}
          theme={theme}
        >
          <div style={{
            display: 'grid',
            gridTemplateColumns: bp.isMobile ? '1fr' : '1fr 1fr',
            gap: 16,
          }}>
            <TkxInput
              label="Display Name"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Enter your name"
            />
            <TkxSelect
              label="Timezone"
              options={[
                { value: 'utc', label: 'UTC' },
                { value: 'est', label: 'Eastern (EST)' },
                { value: 'pst', label: 'Pacific (PST)' },
                { value: 'cet', label: 'Central European (CET)' },
              ]}
              value="utc"
              onChange={() => {}}
            />
            <TkxInput
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <TkxSelect
              label="Role"
              options={[
                { value: 'admin', label: 'Administrator' },
                { value: 'editor', label: 'Editor' },
                { value: 'viewer', label: 'Viewer' },
              ]}
              value="admin"
              onChange={() => {}}
            />
          </div>
        </DemoSection>

        {/* Demo 3: Danger Zone */}
        <DemoSection
          title="Danger Zone"
          description="Use a visually distinct danger area with confirmation modal for destructive actions. The red-tinted border and background signal irreversibility to the user."
          code={`const [open, setOpen] = useState(false);

<TkxCard>
  <TkxCardBody>
    <div style={{
      border: '1px solid rgba(239, 68, 68, 0.25)',
      borderRadius: 12,
      padding: 24,
      background: 'rgba(239, 68, 68, 0.03)',
    }}>
      <p style={{ fontSize: 16, fontWeight: 700, color: '#ef4444' }}>
        Danger Zone
      </p>
      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
        This action is permanent and cannot be reversed.
      </p>
      <TkxButton variant="danger" size="sm" onClick={() => setOpen(true)}>
        Delete Account
      </TkxButton>
    </div>
  </TkxCardBody>
</TkxCard>

<TkxModal isOpen={open} onClose={() => setOpen(false)}>
  <div style={{ padding: 24 }}>
    <h3>Confirm Deletion</h3>
    <p>Are you sure? This cannot be undone.</p>
    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
      <TkxButton variant="outline" onClick={() => setOpen(false)}>
        Cancel
      </TkxButton>
      <TkxButton variant="danger" onClick={() => setOpen(false)}>
        Confirm Delete
      </TkxButton>
    </div>
  </div>
</TkxModal>`}
          theme={theme}
        >
          <TkxCard>
            <TkxCardBody>
              <div style={{
                border: `1px solid ${theme.danger ?? '#ef4444'}40`,
                borderRadius: 12,
                padding: bp.isMobile ? 16 : 24,
                background: (theme.danger ?? '#ef4444') + '08',
              }}>
                <p style={{ fontSize: 16, fontWeight: 700, color: theme.danger ?? '#ef4444', margin: '0 0 4px' }}>
                  Danger Zone
                </p>
                <p style={{ fontSize: 13, color: theme.textMuted, margin: '0 0 16px' }}>
                  This action is permanent and cannot be reversed.
                </p>
                <TkxButton variant="danger" size="sm" onClick={() => setDeleteModalOpen(true)}>
                  Delete Account
                </TkxButton>
              </div>
            </TkxCardBody>
          </TkxCard>
        </DemoSection>

      </div>

    </div>
  );
}
