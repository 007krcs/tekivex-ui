import { useState } from 'react';
import type { ThemeTokens } from '@tekivex/ui';
import { useBreakpoint } from '../hooks/useBreakpoint';
import {
  TkxButton, TkxCard, TkxCardHeader, TkxCardBody, TkxCardFooter,
  TkxBadge, TkxInput, TkxProgress, TkxToggle, TkxAlert, TkxTabs,
  TkxTabList, TkxTab, TkxTabPanels, TkxTabPanel, TkxAvatar, TkxTable,
  TkxDivider, TkxSkeleton, TkxTooltip, tkx, cx
} from '@tekivex/ui';

interface Props { theme: ThemeTokens }

const inventoryRows = [
  { sku: 'EL-4421', name: 'USB-C Hub 7-Port', category: 'Electronics', inStock: 842, reorderPt: 200, status: 'In Stock', warehouse: 'WH-01 Austin' },
  { sku: 'EL-4422', name: 'Mechanical Keyboard TKL', category: 'Electronics', inStock: 64, reorderPt: 150, status: 'Low Stock', warehouse: 'WH-02 Denver' },
  { sku: 'CL-2210', name: 'Merino Wool Crew Neck', category: 'Clothing', inStock: 1204, reorderPt: 300, status: 'In Stock', warehouse: 'WH-03 SF' },
  { sku: 'CL-2211', name: 'Running Shorts Pro', category: 'Clothing', inStock: 0, reorderPt: 200, status: 'Out of Stock', warehouse: 'WH-01 Austin' },
  { sku: 'FD-8801', name: 'Organic Cold Brew 12pk', category: 'Food & Bev', inStock: 380, reorderPt: 100, status: 'In Stock', warehouse: 'WH-04 Chicago' },
  { sku: 'FD-8802', name: 'Protein Bar Variety Box', category: 'Food & Bev', inStock: 95, reorderPt: 120, status: 'Low Stock', warehouse: 'WH-04 Chicago' },
  { sku: 'HW-3301', name: 'Cordless Drill 20V', category: 'Hardware', inStock: 210, reorderPt: 50, status: 'In Stock', warehouse: 'WH-02 Denver' },
  { sku: 'HW-3302', name: 'Safety Gloves XL', category: 'Hardware', inStock: 45, reorderPt: 80, status: 'On Order', warehouse: 'WH-03 SF' },
  { sku: 'EL-4430', name: 'Wireless Earbuds Pro', category: 'Electronics', inStock: 0, reorderPt: 100, status: 'Out of Stock', warehouse: 'WH-01 Austin' },
  { sku: 'CL-2215', name: 'Insulated Jacket L', category: 'Clothing', inStock: 527, reorderPt: 150, status: 'In Stock', warehouse: 'WH-02 Denver' },
];

const inTransitShipments = [
  { tracking: 'FX-9920481', origin: 'Austin, TX', dest: 'New York, NY', carrier: 'FedEx', eta: 'Apr 8', progress: 72, status: 'On Time' },
  { tracking: 'UPS-44821B', origin: 'Chicago, IL', dest: 'Seattle, WA', carrier: 'UPS', eta: 'Apr 9', progress: 45, status: 'On Time' },
  { tracking: 'DHL-771029', origin: 'Los Angeles, CA', dest: 'Miami, FL', carrier: 'DHL', eta: 'Apr 7', progress: 88, status: 'On Time' },
  { tracking: 'FX-9918844', origin: 'Denver, CO', dest: 'Boston, MA', carrier: 'FedEx', eta: 'Apr 11', progress: 30, status: 'Delayed' },
  { tracking: 'USP-220441', origin: 'SF, CA', dest: 'Houston, TX', carrier: 'USPS', eta: 'Apr 10', progress: 58, status: 'On Time' },
];

const deliveredShipments = [
  { tracking: 'FX-9918201', origin: 'Austin, TX', dest: 'Chicago, IL', carrier: 'FedEx', delivered: 'Apr 5', status: 'Delivered' },
  { tracking: 'UPS-44698C', origin: 'Denver, CO', dest: 'Miami, FL', carrier: 'UPS', delivered: 'Apr 4', status: 'Delivered' },
  { tracking: 'DHL-770811', origin: 'NY, NY', dest: 'LA, CA', carrier: 'DHL', delivered: 'Apr 3', status: 'Delivered' },
];

const pendingShipments = [
  { id: 'PO-3310', supplier: 'NovaTech Supply', items: 12, value: '$8,400', readyDate: 'Apr 9' },
  { id: 'PO-3311', supplier: 'CoreMaterials Co', items: 5, value: '$2,200', readyDate: 'Apr 10' },
  { id: 'PO-3312', supplier: 'Apex Logistics', items: 28, value: '$14,750', readyDate: 'Apr 12' },
];

const exceptions = [
  { tracking: 'FX-9918103', issue: 'Address undeliverable — returned to sender', carrier: 'FedEx', date: 'Apr 4' },
  { tracking: 'UPS-44501A', issue: 'Customs hold — documentation required', carrier: 'UPS', date: 'Apr 3' },
  { tracking: 'DHL-770500', issue: 'Damaged in transit — claim filed', carrier: 'DHL', date: 'Apr 2' },
];

const suppliers = [
  { name: 'NovaTech Supply', rating: 5, onTime: '97%', lastOrder: 'Apr 3, 2026', spend: '$124k' },
  { name: 'CoreMaterials Co', rating: 4, onTime: '91%', lastOrder: 'Mar 28, 2026', spend: '$88k' },
  { name: 'Apex Logistics', rating: 4, onTime: '94%', lastOrder: 'Apr 1, 2026', spend: '$210k' },
  { name: 'BlueStar Parts', rating: 3, onTime: '83%', lastOrder: 'Mar 20, 2026', spend: '$56k' },
  { name: 'GreenRoute Inc', rating: 5, onTime: '98%', lastOrder: 'Apr 5, 2026', spend: '$176k' },
];

const orderQueue = [
  { id: 'PO-3310', supplier: 'NovaTech Supply', items: 'USB-C Hubs ×200, Earbuds ×150', value: '$8,400', urgency: 'High' },
  { id: 'PO-3311', supplier: 'CoreMaterials Co', items: 'Safety Gloves ×500', value: '$2,200', urgency: 'Medium' },
  { id: 'PO-3312', supplier: 'Apex Logistics', items: 'Running Shorts ×400, Jackets ×120', value: '$14,750', urgency: 'High' },
  { id: 'PO-3313', supplier: 'BlueStar Parts', items: 'Drill Bits ×1000', value: '$3,100', urgency: 'Low' },
  { id: 'PO-3314', supplier: 'GreenRoute Inc', items: 'Protein Bars ×2400', value: '$6,600', urgency: 'Medium' },
];

const warehouses = [
  { id: 'WH-01', location: 'Austin, TX', capacity: 78, activeOrders: 84, staff: 12, lastAudit: 'Mar 28, 2026' },
  { id: 'WH-02', location: 'Denver, CO', capacity: 52, activeOrders: 61, staff: 9, lastAudit: 'Apr 1, 2026' },
  { id: 'WH-03', location: 'San Francisco, CA', capacity: 91, activeOrders: 103, staff: 14, lastAudit: 'Mar 15, 2026' },
  { id: 'WH-04', location: 'Chicago, IL', capacity: 44, activeOrders: 49, staff: 11, lastAudit: 'Apr 3, 2026' },
];

const statusVariant = (s: string) => {
  if (s === 'In Stock') return 'success';
  if (s === 'Low Stock') return 'warning';
  if (s === 'Out of Stock') return 'danger';
  if (s === 'On Order') return 'info';
  return 'default';
};

const urgencyVariant = (u: string) => {
  if (u === 'High') return 'danger';
  if (u === 'Medium') return 'warning';
  return 'default';
};

const shipStatusVariant = (s: string) => {
  if (s === 'On Time' || s === 'Delivered') return 'success';
  if (s === 'Delayed') return 'warning';
  return 'default';
};

function StarRating({ count }: { count: number }) {
  return (
    <span style={{ color: '#f59e0b', fontSize: '13px', letterSpacing: '1px' }}>
      {'★'.repeat(count)}{'☆'.repeat(5 - count)}
    </span>
  );
}

export function SupplyChainTemplate({ theme }: Props) {
  const [activeTab, setActiveTab] = useState(0);
  const [autoReorder, setAutoReorder] = useState(true);
  const [alertNotifs, setAlertNotifs] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [shipTracking, setShipTracking] = useState(false);
  const bp = useBreakpoint();

  const s = {
    page: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: bp.isMobile ? '20px 12px 48px' : '32px 24px 64px',
    } as React.CSSProperties,

    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap' as const,
      gap: '16px',
      marginBottom: '20px',
    } as React.CSSProperties,

    headerLeft: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px',
    } as React.CSSProperties,

    title: {
      fontSize: bp.isMobile ? '1.35rem' : '1.625rem',
      fontWeight: 800,
      color: theme.text,
      margin: 0,
      letterSpacing: '-0.025em',
    } as React.CSSProperties,

    badgeRow: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap' as const,
      alignItems: 'center',
    } as React.CSSProperties,

    headerRight: {
      display: 'flex',
      gap: '10px',
      alignItems: 'center',
      flexWrap: 'wrap' as const,
    } as React.CSSProperties,

    kpiGrid: {
      display: 'grid',
      gridTemplateColumns: bp.isMobile ? 'repeat(2, 1fr)' : bp.isTablet ? 'repeat(3, 1fr)' : 'repeat(5, 1fr)',
      gap: bp.isMobile ? '10px' : '14px',
      marginBottom: '24px',
    } as React.CSSProperties,

    kpiLabel: {
      fontSize: '11px',
      fontWeight: 700,
      color: theme.textMuted,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.06em',
      marginBottom: '8px',
    } as React.CSSProperties,

    kpiValue: {
      fontSize: bp.isMobile ? '1.3rem' : '1.6rem',
      fontWeight: 800,
      color: theme.text,
      letterSpacing: '-0.03em',
      lineHeight: 1.1,
      marginBottom: '6px',
    } as React.CSSProperties,

    kpiSub: {
      fontSize: '12px',
      color: theme.textMuted,
      marginTop: '4px',
    } as React.CSSProperties,

    tableHeader: {
      fontSize: '11px',
      fontWeight: 700,
      color: theme.textMuted,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.06em',
      padding: '8px 12px',
      borderBottom: `1px solid ${theme.border}`,
      textAlign: 'left' as const,
    } as React.CSSProperties,

    tableCell: {
      fontSize: '13px',
      color: theme.text,
      padding: '10px 12px',
      verticalAlign: 'middle' as const,
    } as React.CSSProperties,

    sectionLabel: {
      fontSize: '14px',
      fontWeight: 700,
      color: theme.text,
      margin: 0,
    } as React.CSSProperties,

    sectionSub: {
      fontSize: '12px',
      color: theme.textMuted,
      margin: 0,
    } as React.CSSProperties,

    supplierGrid: {
      display: 'grid',
      gridTemplateColumns: bp.isMobile ? '1fr' : '1fr 1fr',
      gap: bp.isMobile ? '16px' : '20px',
      marginBottom: '24px',
    } as React.CSSProperties,

    warehouseGrid: {
      display: 'grid',
      gridTemplateColumns: bp.isMobile ? '1fr' : bp.isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
      gap: bp.isMobile ? '12px' : '16px',
      marginBottom: '24px',
    } as React.CSSProperties,

    whStat: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '12px',
      color: theme.textMuted,
      marginTop: '4px',
    } as React.CSSProperties,

    footerToggles: {
      display: 'grid',
      gridTemplateColumns: bp.isMobile ? '1fr' : 'repeat(2, 1fr)',
      gap: bp.isMobile ? '12px' : '16px',
    } as React.CSSProperties,

    toggleRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      background: theme.surface,
      border: `1px solid ${theme.border}`,
      borderRadius: '8px',
    } as React.CSSProperties,

    toggleLabel: {
      fontSize: '13px',
      fontWeight: 600,
      color: theme.text,
    } as React.CSSProperties,
  };

  return (
    <div style={s.page}>

      {/* ── Header ── */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <h1 style={s.title}>Supply Chain Control</h1>
          <div style={s.badgeRow}>
            <TkxBadge variant="success">12 Warehouses Active</TkxBadge>
            <TkxBadge variant="info">247 Orders In Transit</TkxBadge>
            <TkxBadge variant="warning">3 Alerts</TkxBadge>
          </div>
        </div>
        <div style={s.headerRight}>
          <TkxButton variant="outline" size="sm">
            ↓ Generate Report
          </TkxButton>
          <TkxButton variant="primary" size="sm">
            + Add Shipment
          </TkxButton>
        </div>
      </div>

      {/* ── Alert Banner ── */}
      <div style={{ marginBottom: '24px' }}>
        <TkxAlert variant="warning" title="Low stock warning — action required">
          Warehouse SF-03 is reporting low stock on 12 SKUs. Reorder recommended to avoid fulfillment delays.
        </TkxAlert>
      </div>

      {/* ── KPI Cards ── */}
      <div style={s.kpiGrid}>

        <TkxCard>
          <TkxCardBody>
            <div style={s.kpiLabel}>On-Time Delivery</div>
            <div style={s.kpiValue}>94.2%</div>
            <TkxProgress value={94} variant="warning" />
            <div style={s.kpiSub}>Target: 95%</div>
          </TkxCardBody>
        </TkxCard>

        <TkxCard>
          <TkxCardBody>
            <div style={s.kpiLabel}>Inventory Turnover</div>
            <div style={s.kpiValue}>8.4x</div>
            <TkxBadge variant="success">↑ +0.6 vs Q1</TkxBadge>
            <div style={s.kpiSub}>vs last quarter</div>
          </TkxCardBody>
        </TkxCard>

        <TkxCard>
          <TkxCardBody>
            <div style={s.kpiLabel}>Order Fulfillment</div>
            <div style={s.kpiValue}>98.7%</div>
            <TkxBadge variant="success">Excellent</TkxBadge>
            <div style={s.kpiSub}>All regions combined</div>
          </TkxCardBody>
        </TkxCard>

        <TkxCard>
          <TkxCardBody>
            <div style={s.kpiLabel}>Avg Lead Time</div>
            <div style={s.kpiValue}>3.2d</div>
            <TkxBadge variant="success">↓ -0.4 days</TkxBadge>
            <div style={s.kpiSub}>vs last quarter</div>
          </TkxCardBody>
        </TkxCard>

        <TkxCard>
          <TkxCardBody>
            <div style={s.kpiLabel}>Supplier Score</div>
            <div style={s.kpiValue}>87/100</div>
            <TkxProgress value={87} variant="primary" />
            <div style={s.kpiSub}>Weighted average</div>
          </TkxCardBody>
        </TkxCard>

      </div>

      {/* ── Inventory Table ── */}
      <TkxCard style={{ marginBottom: '24px' }}>
        <TkxCardHeader>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: bp.isMobile ? 'flex-start' : 'center', flexWrap: 'wrap', gap: '12px', flexDirection: bp.isMobile ? 'column' : 'row' }}>
            <div>
              <p style={s.sectionLabel}>Inventory Status</p>
              <p style={s.sectionSub}>All SKUs across active warehouses</p>
            </div>
            <div style={{ display: 'flex', gap: '8px', width: bp.isMobile ? '100%' : 'auto' }}>
              <TkxInput label="Search" placeholder="Search SKU or product..." size="sm" style={{ width: bp.isMobile ? '100%' : '220px' }} />
              <TkxButton variant="outline" size="sm">Filter</TkxButton>
            </div>
          </div>
        </TkxCardHeader>
        <TkxCardBody style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: bp.isMobile ? '700px' : undefined }}>
            <thead>
              <tr>
                <th style={s.tableHeader}>SKU</th>
                <th style={s.tableHeader}>Product Name</th>
                <th style={s.tableHeader}>Category</th>
                <th style={{ ...s.tableHeader, textAlign: 'right' }}>In Stock</th>
                <th style={{ ...s.tableHeader, textAlign: 'right' }}>Reorder Pt</th>
                <th style={s.tableHeader}>Status</th>
                <th style={s.tableHeader}>Warehouse</th>
                <th style={s.tableHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventoryRows.map((row, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${theme.border}` }}>
                  <td style={{ ...s.tableCell, fontFamily: 'monospace', fontSize: '12px', fontWeight: 700, color: theme.textMuted }}>{row.sku}</td>
                  <td style={{ ...s.tableCell, fontWeight: 600 }}>{row.name}</td>
                  <td style={{ ...s.tableCell, color: theme.textMuted }}>{row.category}</td>
                  <td style={{ ...s.tableCell, textAlign: 'right', fontWeight: 700 }}>{row.inStock.toLocaleString()}</td>
                  <td style={{ ...s.tableCell, textAlign: 'right', color: theme.textMuted }}>{row.reorderPt}</td>
                  <td style={s.tableCell}>
                    <TkxBadge variant={statusVariant(row.status) as any}>{row.status}</TkxBadge>
                  </td>
                  <td style={{ ...s.tableCell, color: theme.textMuted, fontSize: '12px' }}>{row.warehouse}</td>
                  <td style={s.tableCell}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <TkxButton variant="ghost" size="xs">View</TkxButton>
                      <TkxButton
                        variant={row.status === 'Out of Stock' || row.status === 'Low Stock' ? 'primary' : 'ghost'}
                        size="xs"
                      >
                        Reorder
                      </TkxButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </TkxCardBody>
      </TkxCard>

      {/* ── Shipment Tracker ── */}
      <TkxCard style={{ marginBottom: '24px' }}>
        <TkxCardHeader>
          <p style={s.sectionLabel}>Shipment Tracker</p>
          <p style={s.sectionSub}>Real-time logistics status</p>
        </TkxCardHeader>
        <TkxCardBody>
          <TkxTabs value={activeTab} onChange={setActiveTab}>
            <TkxTabList>
              <TkxTab>In Transit</TkxTab>
              <TkxTab>Delivered</TkxTab>
              <TkxTab>Pending</TkxTab>
              <TkxTab>Exceptions</TkxTab>
            </TkxTabList>
            <TkxTabPanels>

              {/* In Transit */}
              <TkxTabPanel>
                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px', minWidth: bp.isMobile ? '650px' : undefined }}>
                  <thead>
                    <tr>
                      <th style={s.tableHeader}>Tracking #</th>
                      <th style={s.tableHeader}>Origin</th>
                      <th style={s.tableHeader}>Destination</th>
                      <th style={s.tableHeader}>Carrier</th>
                      <th style={s.tableHeader}>ETA</th>
                      <th style={{ ...s.tableHeader, minWidth: '140px' }}>Progress</th>
                      <th style={s.tableHeader}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inTransitShipments.map((sh, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${theme.border}` }}>
                        <td style={{ ...s.tableCell, fontFamily: 'monospace', fontSize: '12px', fontWeight: 700 }}>{sh.tracking}</td>
                        <td style={{ ...s.tableCell, color: theme.textMuted, fontSize: '12px' }}>{sh.origin}</td>
                        <td style={{ ...s.tableCell, color: theme.textMuted, fontSize: '12px' }}>{sh.dest}</td>
                        <td style={s.tableCell}>{sh.carrier}</td>
                        <td style={{ ...s.tableCell, fontWeight: 600 }}>{sh.eta}</td>
                        <td style={s.tableCell}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ flex: 1 }}>
                              <TkxProgress value={sh.progress} variant={sh.status === 'Delayed' ? 'warning' : 'success'} />
                            </div>
                            <span style={{ fontSize: '11px', color: theme.textMuted, minWidth: '30px' }}>{sh.progress}%</span>
                          </div>
                        </td>
                        <td style={s.tableCell}>
                          <TkxBadge variant={shipStatusVariant(sh.status) as any}>{sh.status}</TkxBadge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </TkxTabPanel>

              {/* Delivered */}
              <TkxTabPanel>
                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px', minWidth: bp.isMobile ? '550px' : undefined }}>
                  <thead>
                    <tr>
                      <th style={s.tableHeader}>Tracking #</th>
                      <th style={s.tableHeader}>Origin</th>
                      <th style={s.tableHeader}>Destination</th>
                      <th style={s.tableHeader}>Carrier</th>
                      <th style={s.tableHeader}>Delivered</th>
                      <th style={s.tableHeader}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveredShipments.map((sh, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${theme.border}` }}>
                        <td style={{ ...s.tableCell, fontFamily: 'monospace', fontSize: '12px', fontWeight: 700 }}>{sh.tracking}</td>
                        <td style={{ ...s.tableCell, color: theme.textMuted, fontSize: '12px' }}>{sh.origin}</td>
                        <td style={{ ...s.tableCell, color: theme.textMuted, fontSize: '12px' }}>{sh.dest}</td>
                        <td style={s.tableCell}>{sh.carrier}</td>
                        <td style={{ ...s.tableCell, fontWeight: 600 }}>{sh.delivered}</td>
                        <td style={s.tableCell}>
                          <TkxBadge variant="success">{sh.status}</TkxBadge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </TkxTabPanel>

              {/* Pending */}
              <TkxTabPanel>
                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px', minWidth: bp.isMobile ? '500px' : undefined }}>
                  <thead>
                    <tr>
                      <th style={s.tableHeader}>PO #</th>
                      <th style={s.tableHeader}>Supplier</th>
                      <th style={{ ...s.tableHeader, textAlign: 'right' }}>Items</th>
                      <th style={{ ...s.tableHeader, textAlign: 'right' }}>Value</th>
                      <th style={s.tableHeader}>Ready Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingShipments.map((sh, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${theme.border}` }}>
                        <td style={{ ...s.tableCell, fontFamily: 'monospace', fontSize: '12px', fontWeight: 700 }}>{sh.id}</td>
                        <td style={s.tableCell}>{sh.supplier}</td>
                        <td style={{ ...s.tableCell, textAlign: 'right' }}>{sh.items}</td>
                        <td style={{ ...s.tableCell, textAlign: 'right', fontWeight: 700 }}>{sh.value}</td>
                        <td style={{ ...s.tableCell, fontWeight: 600 }}>{sh.readyDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </TkxTabPanel>

              {/* Exceptions */}
              <TkxTabPanel>
                <div style={{ paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {exceptions.map((ex, i) => (
                    <TkxAlert key={i} variant="danger" title={`${ex.tracking} — ${ex.carrier}`}>
                      {ex.issue} &mdash; <span style={{ fontWeight: 600 }}>{ex.date}</span>
                    </TkxAlert>
                  ))}
                </div>
              </TkxTabPanel>

            </TkxTabPanels>
          </TkxTabs>
        </TkxCardBody>
      </TkxCard>

      {/* ── Supplier Panel ── */}
      <div style={s.supplierGrid}>

        {/* Top Suppliers */}
        <TkxCard>
          <TkxCardHeader>
            <p style={s.sectionLabel}>Top Suppliers</p>
            <p style={s.sectionSub}>Ranked by performance score</p>
          </TkxCardHeader>
          <TkxCardBody style={{ padding: 0 }}>
            {suppliers.map((sup, i) => (
              <div key={i}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <TkxAvatar size="sm" style={{ background: theme.primary + '20', color: theme.primary, fontWeight: 700 }}>
                      {sup.name.slice(0, 2).toUpperCase()}
                    </TkxAvatar>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: theme.text }}>{sup.name}</div>
                      <StarRating count={sup.rating} />
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' as const }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: theme.text }}>{sup.onTime} on-time</div>
                    <div style={{ fontSize: '11px', color: theme.textMuted }}>Last order: {sup.lastOrder}</div>
                  </div>
                </div>
                {i < suppliers.length - 1 && <TkxDivider />}
              </div>
            ))}
          </TkxCardBody>
        </TkxCard>

        {/* Order Queue */}
        <TkxCard>
          <TkxCardHeader>
            <p style={s.sectionLabel}>Order Queue</p>
            <p style={s.sectionSub}>Pending purchase orders</p>
          </TkxCardHeader>
          <TkxCardBody style={{ padding: 0 }}>
            {orderQueue.map((ord, i) => (
              <div key={i}>
                <div style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: 700, color: theme.textMuted }}>{ord.id}</span>
                      <TkxBadge variant={urgencyVariant(ord.urgency) as any} size="xs">{ord.urgency}</TkxBadge>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: theme.text }}>{ord.value}</span>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: theme.text, marginBottom: '2px' }}>{ord.supplier}</div>
                  <div style={{ fontSize: '12px', color: theme.textMuted }}>{ord.items}</div>
                </div>
                {i < orderQueue.length - 1 && <TkxDivider />}
              </div>
            ))}
          </TkxCardBody>
          <TkxCardFooter>
            <TkxButton variant="primary" size="sm" style={{ width: '100%', justifyContent: 'center' }}>
              Approve All Pending
            </TkxButton>
          </TkxCardFooter>
        </TkxCard>

      </div>

      {/* ── Warehouse Status ── */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: theme.text, marginBottom: '14px' }}>Warehouse Status</h3>
        <div style={s.warehouseGrid}>
          {warehouses.map((wh, i) => {
            const capColor = wh.capacity > 85 ? (theme.danger ?? '#ef4444') : wh.capacity > 70 ? (theme.warning ?? '#f59e0b') : (theme.success ?? '#10b981');
            const capVariant = wh.capacity > 85 ? 'danger' : wh.capacity > 70 ? 'warning' : 'success';
            return (
              <TkxCard key={i}>
                <TkxCardHeader>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: theme.text }}>{wh.id}</span>
                    <TkxBadge variant={capVariant as any}>{wh.capacity}% full</TkxBadge>
                  </div>
                  <div style={{ fontSize: '12px', color: theme.textMuted, marginTop: '2px' }}>{wh.location}</div>
                </TkxCardHeader>
                <TkxCardBody>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: theme.textMuted, marginBottom: '4px' }}>
                      <span>Capacity</span>
                      <span>{wh.capacity}%</span>
                    </div>
                    <TkxProgress value={wh.capacity} variant={capVariant as any} />
                  </div>
                  <div style={s.whStat}>
                    <span>Active Orders</span>
                    <span style={{ fontWeight: 700, color: theme.text }}>{wh.activeOrders}</span>
                  </div>
                  <div style={s.whStat}>
                    <span>Staff On Shift</span>
                    <span style={{ fontWeight: 700, color: theme.text }}>{wh.staff}</span>
                  </div>
                  <div style={s.whStat}>
                    <span>Last Audit</span>
                    <span style={{ fontWeight: 600, color: theme.text }}>{wh.lastAudit}</span>
                  </div>
                </TkxCardBody>
              </TkxCard>
            );
          })}
        </div>
      </div>

      {/* ── Footer Toggles ── */}
      <TkxCard>
        <TkxCardHeader>
          <p style={s.sectionLabel}>Automation Settings</p>
          <p style={s.sectionSub}>Configure real-time alerts and automated workflows</p>
        </TkxCardHeader>
        <TkxCardBody>
          <div style={s.footerToggles}>

            <div style={s.toggleRow}>
              <div>
                <div style={s.toggleLabel}>Auto-reorder enabled</div>
                <div style={{ fontSize: '12px', color: theme.textMuted, marginTop: '2px' }}>Trigger POs when stock hits reorder point</div>
              </div>
              <TkxToggle checked={autoReorder} onChange={setAutoReorder} />
            </div>

            <div style={s.toggleRow}>
              <div>
                <div style={s.toggleLabel}>Alert notifications</div>
                <div style={{ fontSize: '12px', color: theme.textMuted, marginTop: '2px' }}>Send critical alerts to ops team email</div>
              </div>
              <TkxToggle checked={alertNotifs} onChange={setAlertNotifs} />
            </div>

            <div style={s.toggleRow}>
              <div>
                <div style={s.toggleLabel}>Low stock alerts</div>
                <div style={{ fontSize: '12px', color: theme.textMuted, marginTop: '2px' }}>Notify when any SKU falls below reorder point</div>
              </div>
              <TkxToggle checked={lowStockAlerts} onChange={setLowStockAlerts} />
            </div>

            <div style={s.toggleRow}>
              <div>
                <div style={s.toggleLabel}>Shipment tracking updates</div>
                <div style={{ fontSize: '12px', color: theme.textMuted, marginTop: '2px' }}>Push status updates to warehouse dashboard</div>
              </div>
              <TkxToggle checked={shipTracking} onChange={setShipTracking} />
            </div>

          </div>
        </TkxCardBody>
      </TkxCard>

    </div>
  );
}
