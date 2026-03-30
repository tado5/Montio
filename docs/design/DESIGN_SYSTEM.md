# 🎨 MONTIO APP - Industrial Command Center Design System

**Version:** 2.0
**Date:** 2026-03-30
**Status:** ✅ Production Ready
**Aesthetic:** Industrial Command Center

---

## 📋 Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Layout Structure](#layout-structure)
5. [Components](#components)
6. [Animations](#animations)
7. [Patterns & Textures](#patterns--textures)
8. [Code Examples](#code-examples)
9. [Best Practices](#best-practices)
10. [Do's and Don'ts](#dos-and-donts)

---

## 🎯 Design Philosophy

### Core Concept: **"Industrial Command Center"**

Moderná, technická estetika inšpirovaná system administration panelmi, command-line interfaces a industrial control rooms.

### Key Principles:

1. **Technical Precision** - Monospace fonts, dot matrix patterns, command-line elements
2. **Role-Based Identity** - Každá user level má svoju farebnú schému
3. **Functional Beauty** - Každý vizuálny element má účel
4. **Premium Interactions** - Smooth animations, gradient glows, hover states
5. **Dark Foundation** - Tmavé pozadie (slate-950) s farebnými akcentmi

### Design Values:

- **Bold over Timid** - Výrazné, nezameniteľné rozhranie
- **Functional over Decorative** - Metriky a data sú prioritou
- **Technical over Generic** - Command-line štýl namiesto generic UI
- **Consistent over Scattered** - Jednotná estetika naprieč celou aplikáciou

---

## 🎨 Color System

### Base Colors (Všetky User Levels)

```css
/* Background Layers */
--bg-base: #020617;        /* slate-950 - Main background */
--bg-elevated: #0f172a;    /* slate-900 - Cards, panels */
--bg-secondary: #1e293b;   /* slate-800 - Input fields */

/* Text Colors */
--text-primary: #ffffff;   /* White - Headlines, important text */
--text-secondary: #e2e8f0; /* slate-200 - Body text */
--text-tertiary: #94a3b8;  /* slate-400 - Labels, hints */
--text-disabled: #64748b;  /* slate-500 - Disabled elements */

/* Border Colors */
--border-primary: #334155; /* slate-700 - Default borders */
--border-hover: #475569;   /* slate-600 - Hover state */
```

### Role-Specific Color Schemes

#### 🟠 Super Admin (Orange/Red)
**Theme:** System Control
**Use Case:** System-wide management, company oversight

```css
/* Primary Gradient */
--gradient-primary: linear-gradient(135deg, #f97316, #dc2626);
/* from-orange-500 to-red-600 */

/* Accent Colors */
--accent-base: #f97316;      /* orange-500 */
--accent-light: #fb923c;     /* orange-400 */
--accent-dark: #ea580c;      /* orange-600 */

/* Border & Glow */
--border-accent: rgba(249, 115, 22, 0.2);   /* orange-500/20 */
--border-accent-hover: rgba(249, 115, 22, 0.3); /* orange-500/30 */
--glow-accent: rgba(249, 115, 22, 0.1);     /* orange-500/10 */

/* Badge Text */
--badge-text: "ROOT" | "ADMIN PANEL" | "SYSTEM"
```

**Použitie:**
- Layouts: SuperAdminLayout, SuperAdminHeader, SuperAdminSidebar, SuperAdminFooter
- Pages: SuperAdminDashboard, CompanyDetail
- Icons: Terminal, Shield, Crown

---

#### 🔵 Company Admin (Blue/Cyan)
**Theme:** Operations Control
**Use Case:** Business management, team coordination

```css
/* Primary Gradient */
--gradient-primary: linear-gradient(135deg, #3b82f6, #06b6d4);
/* from-blue-500 to-cyan-600 */

/* Accent Colors */
--accent-base: #3b82f6;      /* blue-500 */
--accent-light: #60a5fa;     /* blue-400 */
--accent-dark: #2563eb;      /* blue-600 */

/* Border & Glow */
--border-accent: rgba(59, 130, 246, 0.2);   /* blue-500/20 */
--border-accent-hover: rgba(59, 130, 246, 0.3); /* blue-500/30 */
--glow-accent: rgba(59, 130, 246, 0.1);     /* blue-500/10 */

/* Badge Text */
--badge-text: "OPS" | "OPERATIONS" | "COMPANY"
```

**Použitie:**
- Layouts: CompanyAdminLayout, CompanyAdminHeader, CompanyAdminSidebar, CompanyAdminFooter
- Pages: CompanyAdminDashboard, CalendarPage, OrderTypesPage, EmployeesPage
- Icons: Briefcase, TrendingUp, Building2

---

#### 🟢 Employee (Green/Emerald)
**Theme:** Field Operations
**Use Case:** Task execution, daily operations

```css
/* Primary Gradient */
--gradient-primary: linear-gradient(135deg, #10b981, #16a34a);
/* from-emerald-500 to-green-600 */

/* Accent Colors */
--accent-base: #10b981;      /* emerald-500 */
--accent-light: #34d399;     /* emerald-400 */
--accent-dark: #059669;      /* emerald-600 */

/* Border & Glow */
--border-accent: rgba(16, 185, 129, 0.2);   /* emerald-500/20 */
--border-accent-hover: rgba(16, 185, 129, 0.3); /* emerald-500/30 */
--glow-accent: rgba(16, 185, 129, 0.1);     /* emerald-500/10 */

/* Badge Text */
--badge-text: "FIELD" | "FIELD OPS" | "TECHNICIAN"
```

**Použitie:**
- Layouts: EmployeeLayout, EmployeeHeader, EmployeeSidebar, EmployeeFooter
- Pages: EmployeeDashboard
- Icons: Wrench, CheckSquare, Camera

---

### Status Colors (Universal)

```css
/* Success */
--status-success: #10b981;      /* emerald-500 */
--status-success-bg: rgba(16, 185, 129, 0.1);
--status-success-border: rgba(16, 185, 129, 0.3);

/* Warning */
--status-warning: #f59e0b;      /* amber-500 */
--status-warning-bg: rgba(245, 158, 11, 0.1);
--status-warning-border: rgba(245, 158, 11, 0.3);

/* Error */
--status-error: #ef4444;        /* red-500 */
--status-error-bg: rgba(239, 68, 68, 0.1);
--status-error-border: rgba(239, 68, 68, 0.3);

/* Info */
--status-info: #3b82f6;         /* blue-500 */
--status-info-bg: rgba(59, 130, 246, 0.1);
--status-info-border: rgba(59, 130, 246, 0.3);
```

---

## ✍️ Typography

### Font Stack

```css
/* Display Font - Headlines */
font-family: 'Archivo Black', sans-serif;
/* Usage: Page titles, section headers, emphasis */
/* Weight: 400 (black) */
/* Character: Bold, commanding, industrial */

/* Monospace Font - Technical Text */
font-family: 'IBM Plex Mono', monospace;
/* Usage: Data, metrics, labels, badges, code */
/* Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold) */
/* Character: Technical, precise, professional */

/* Body Font - Fallback */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
/* Usage: Older components not yet updated */
/* Will be phased out */
```

### Font Loading

```html
<!-- In index.html or index.css -->
<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Typography Scale

```css
/* Headlines */
.heading-xl {
  font-family: 'Archivo Black', sans-serif;
  font-size: 2rem;        /* 32px */
  line-height: 1.2;
  letter-spacing: -0.02em;
  text-transform: uppercase;
}

.heading-lg {
  font-family: 'Archivo Black', sans-serif;
  font-size: 1.5rem;      /* 24px */
  line-height: 1.3;
  letter-spacing: -0.01em;
  text-transform: uppercase;
}

.heading-md {
  font-family: 'Archivo Black', sans-serif;
  font-size: 1.25rem;     /* 20px */
  line-height: 1.4;
  letter-spacing: 0;
}

/* Body Text */
.body-lg {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 1rem;        /* 16px */
  line-height: 1.6;
  font-weight: 400;
}

.body-md {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.875rem;    /* 14px */
  line-height: 1.5;
  font-weight: 400;
}

.body-sm {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.75rem;     /* 12px */
  line-height: 1.4;
  font-weight: 400;
}

/* Labels & Badges */
.label {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.625rem;    /* 10px */
  line-height: 1.2;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
```

### Gradient Text Effect

```css
/* Animated Gradient Title */
.gradient-title {
  font-family: 'Archivo Black', sans-serif;
  font-size: 1.5rem;
  font-weight: 900;
  letter-spacing: -0.025em;
  background: linear-gradient(to right, var(--accent-light), var(--accent-base), var(--accent-light));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

---

## 🏗️ Layout Structure

### Main Layout Components

Každá user level má 4 komponenty:

```
{Role}Layout.jsx       → Main wrapper
{Role}Header.jsx       → Top bar s title a metrics
{Role}Sidebar.jsx      → Navigation s menu items
{Role}Footer.jsx       → Bottom bar s status
```

### Layout Template Structure

```jsx
<div className="flex h-screen bg-slate-950 overflow-hidden" style={{
  backgroundImage: `
    radial-gradient(circle at 2px 2px, rgba({R}, {G}, {B}, 0.05) 1px, transparent 0),
    linear-gradient(to bottom, #020617, #0f172a)
  `,
  backgroundSize: '32px 32px, 100% 100%'
}}>

  {/* Sidebar */}
  <{Role}Sidebar />

  {/* Main Content */}
  <div className="flex-1 flex flex-col">

    {/* Header */}
    <{Role}Header />

    {/* Page Content */}
    <main className="flex-1 overflow-y-auto relative">
      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-{color}-500/5 via-transparent to-{color}-500/5 pointer-events-none" />

      <div className="relative px-4 md:px-6 lg:px-8 py-6 md:py-8">
        {children}
      </div>
    </main>

    {/* Footer */}
    <{Role}Footer />
  </div>
</div>
```

### Header Structure

```jsx
<header className="sticky top-0 z-40 backdrop-blur-xl bg-gradient-to-r from-slate-950/95 via-slate-900/95 to-slate-950/95 border-b border-{color}-500/20 shadow-lg shadow-{color}-500/5">

  {/* Top Accent Line */}
  <div className="h-0.5 bg-gradient-to-r from-transparent via-{color}-500 to-transparent" />

  <div className="px-4 md:px-6 lg:px-8 py-3">
    <div className="flex items-center justify-between gap-4">

      {/* Left: Badge + Title */}
      <div className="flex items-center gap-3">
        <div className="px-3 py-1.5 bg-{color}-500/10 border border-{color}-500/30 rounded-lg">
          <Icon className="w-4 h-4 text-{color}-400" />
          <span className="font-mono text-xs text-{color}-300">BADGE</span>
        </div>

        <div>
          <h1 className="text-2xl font-black bg-clip-text bg-gradient-to-r from-{color}-400 to-{color}-300 animate-pulse">
            TITLE
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            {'> '}subtitle
          </p>
        </div>
      </div>

      {/* Right: Metrics + User */}
      <div className="flex items-center gap-3">
        {/* Metric Indicator */}
        <NotificationBell />
        <UserMenu />
      </div>
    </div>
  </div>
</header>
```

### Sidebar Structure

```jsx
<aside className={`
  fixed lg:relative h-screen z-40
  ${isCollapsed ? 'w-20' : 'w-72'}
  bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950
  border-r border-{color}-500/20
  transition-all duration-300
`} style={{
  backgroundImage: `
    radial-gradient(circle at 2px 2px, rgba({R}, {G}, {B}, 0.1) 1px, transparent 0),
    linear-gradient(to bottom, #020617, #0f172a, #020617)
  `,
  backgroundSize: '24px 24px, 100% 100%'
}}>

  {/* Logo Section */}
  <div className="px-4 py-4 border-b border-{color}-500/20">
    <div className="bg-gradient-to-br from-{color}-500 to-{color}-600 rounded-xl p-3">
      <Icon className="w-5 h-5 text-white" />
      <span className="font-black text-white">MONTIO</span>
    </div>
  </div>

  {/* Navigation */}
  <nav className="flex-1 overflow-y-auto p-4">
    <ul className="space-y-2">
      {menuItems.map((item, index) => (
        <li style={{ animation: `slideInRight 0.3s ease-out ${index * 0.05}s both` }}>
          <button className={`
            w-full flex items-center gap-3 rounded-xl px-4 py-3.5
            ${active
              ? 'bg-gradient-to-r from-{color}-500 to-{color}-600 text-white shadow-lg'
              : 'text-slate-300 hover:bg-slate-800/50'
            }
          `}>
            <Icon />
            <span>{item.label}</span>
          </button>
        </li>
      ))}
    </ul>
  </nav>

  {/* Bottom Actions */}
  <div className="p-4 border-t border-{color}-500/20">
    <button className="w-full bg-{color}-500/10 border border-{color}-500/30 rounded-lg">
      Collapse
    </button>
  </div>
</aside>
```

### Footer Structure

```jsx
<footer className="mt-auto border-t border-{color}-500/20 bg-gradient-to-r from-slate-950/95 via-slate-900/95 to-slate-950/95">

  {/* Top Accent */}
  <div className="h-0.5 bg-gradient-to-r from-transparent via-{color}-500/50 to-transparent" />

  <div className="px-4 md:px-6 lg:px-8 py-3">
    <div className="flex items-center justify-between">

      {/* Left: Branding */}
      <div className="flex items-center gap-2">
        <Shield className="w-3.5 h-3.5 text-{color}-400" />
        <span className="text-xs font-mono text-slate-400">BADGE</span>
      </div>

      {/* Center: Metrics Cards */}
      <div className="hidden xl:flex items-center gap-2">
        {metrics.map(metric => (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-{color}-500/10 border border-{color}-500/30 rounded-lg">
            <Icon className="w-3.5 h-3.5 text-{color}-400" />
            <span className="text-xs font-mono font-bold">{metric.value}</span>
          </div>
        ))}
      </div>

      {/* Right: Version + Status */}
      <div className="flex items-center gap-2">
        <div className="px-3 py-1.5 bg-{color}-500/10 border border-{color}-500/30 rounded-lg">
          <span className="text-xs font-mono text-{color}-300">v1.5.1</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs font-mono text-emerald-400">ONLINE</span>
        </div>
      </div>
    </div>
  </div>

  {/* Bottom Accent */}
  <div className="h-0.5 bg-gradient-to-r from-transparent via-{color}-500/30 to-transparent" />
</footer>
```

---

## 🧩 Components

### Cards

```jsx
/* Basic Card */
<div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
  {content}
</div>

/* Elevated Card with Glow */
<div className="bg-slate-900/50 border border-{color}-500/20 rounded-xl p-6 backdrop-blur-sm shadow-lg shadow-{color}-500/5">
  {content}
</div>

/* Hoverable Card */
<div className="bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/50 hover:border-{color}-500/30 rounded-xl p-4 transition-all duration-200 cursor-pointer">
  {content}
</div>
```

### Buttons

```jsx
/* Primary Button */
<button className="px-4 py-2 bg-gradient-to-r from-{color}-500 to-{color}-600 text-white font-mono font-bold rounded-lg shadow-lg shadow-{color}-500/30 hover:shadow-xl transition-all">
  Action
</button>

/* Secondary Button */
<button className="px-4 py-2 bg-{color}-500/10 hover:bg-{color}-500/20 border border-{color}-500/30 hover:border-{color}-500/50 rounded-lg text-{color}-400 font-mono font-bold transition-all">
  Action
</button>

/* Ghost Button */
<button className="px-4 py-2 bg-slate-900/50 hover:bg-slate-800/50 border border-slate-700/50 hover:border-{color}-500/30 rounded-lg text-slate-300 hover:text-white font-mono transition-all">
  Action
</button>

/* Danger Button */
<button className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 rounded-lg text-red-400 font-mono font-bold transition-all">
  Delete
</button>
```

### Inputs

```jsx
/* Text Input */
<input
  type="text"
  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 focus:border-{color}-500/60 rounded-lg text-white font-mono text-sm transition-all placeholder:text-slate-500"
  placeholder="Enter value..."
/>

/* Input with Icon */
<div className="relative">
  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
  <input
    className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 focus:border-{color}-500/60 rounded-lg text-white font-mono text-sm"
  />
</div>

/* Input with Glow Focus */
<div className="relative group">
  <div className="absolute inset-0 bg-gradient-to-r from-{color}-500/20 to-{color}-600/20 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition-all" />
  <input className="relative w-full px-4 py-3 bg-slate-800/50 border border-slate-700 focus:border-{color}-500/60 rounded-lg" />
</div>
```

### Badges

```jsx
/* Status Badge */
<span className="px-3 py-1 text-xs font-mono font-bold rounded-lg border bg-{color}-500/10 border-{color}-500/30 text-{color}-400">
  ACTIVE
</span>

/* Gradient Badge */
<span className="px-3 py-1 text-xs font-mono font-bold rounded-lg bg-gradient-to-r from-{color}-500 to-{color}-600 text-white shadow-lg">
  ADMIN
</span>

/* Pill Badge */
<span className="px-2 py-1 text-[10px] font-mono font-bold rounded-full bg-slate-800/50 border border-slate-700/50 text-slate-400">
  SOON
</span>
```

### KPI Cards

```jsx
<div className="bg-slate-900/50 border border-{color}-500/20 rounded-xl p-6 backdrop-blur-sm hover:shadow-lg hover:shadow-{color}-500/10 transition-all">
  <div className="flex items-center justify-between mb-3">
    <Icon className="w-8 h-8 text-{color}-400" />
    <span className="text-3xl font-black text-white">{value}</span>
  </div>
  <div className="text-xs font-mono text-slate-500 uppercase tracking-wider">{label}</div>
  <div className="text-xs font-mono text-{color}-400 mt-1">{subtitle}</div>
</div>
```

### Loading States

```jsx
/* Spinner */
<div className="w-16 h-16 border-4 border-slate-700 border-t-{color}-500 rounded-full animate-spin" />

/* Pulse */
<div className="w-2 h-2 bg-{color}-500 rounded-full animate-pulse" />

/* Ping */
<div className="relative">
  <div className="w-2 h-2 bg-{color}-500 rounded-full animate-pulse" />
  <div className="absolute inset-0 w-2 h-2 bg-{color}-500 rounded-full animate-ping" />
</div>
```

---

## ✨ Animations

### Keyframe Definitions

```css
/* Slide In Right - Menu Items */
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Slide Up - Cards */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Slide Down - Header */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Pulse - Gradient Text */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

/* Ping - Status Dot */
@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}
```

### Animation Usage

```jsx
/* Staggered Menu Items */
{menuItems.map((item, index) => (
  <li style={{ animation: `slideInRight 0.3s ease-out ${index * 0.05}s both` }}>
    {item}
  </li>
))}

/* Staggered Cards */
<div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>Card 1</div>
<div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>Card 2</div>
<div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>Card 3</div>

/* Gradient Title Pulse */
<h1 className="bg-clip-text bg-gradient-to-r from-{color}-400 to-{color}-300 animate-pulse">
  TITLE
</h1>

/* Status Indicator */
<div className="relative">
  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
  <div className="absolute inset-0 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
</div>
```

### Hover Effects

```jsx
/* Scale on Hover */
className="hover:scale-[1.02] active:scale-[0.98] transition-transform"

/* Glow on Hover */
className="hover:shadow-lg hover:shadow-{color}-500/20 transition-shadow"

/* Border Glow on Hover */
className="border border-slate-700/50 hover:border-{color}-500/30 transition-colors"

/* Background Gradient on Hover */
className="relative group overflow-hidden"
<div className="absolute inset-0 bg-gradient-to-r from-{color}-500/0 via-{color}-500/5 to-{color}-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
```

---

## 🎭 Patterns & Textures

### Dot Matrix Background

```jsx
/* Main Content - 32px Grid */
<div style={{
  backgroundImage: `
    radial-gradient(circle at 2px 2px, rgba({R}, {G}, {B}, 0.05) 1px, transparent 0),
    linear-gradient(to bottom, #020617, #0f172a)
  `,
  backgroundSize: '32px 32px, 100% 100%'
}}>

/* Sidebar - 24px Grid */
<aside style={{
  backgroundImage: `
    radial-gradient(circle at 2px 2px, rgba({R}, {G}, {B}, 0.1) 1px, transparent 0),
    linear-gradient(to bottom, #020617, #0f172a, #020617)
  `,
  backgroundSize: '24px 24px, 100% 100%'
}}>
```

**RGB Values by Role:**
- Super Admin: `251, 146, 60` (orange-500)
- Company Admin: `59, 130, 246` (blue-500)
- Employee: `16, 185, 129` (emerald-500)

### Gradient Overlays

```jsx
/* Depth Gradient */
<div className="absolute inset-0 bg-gradient-to-br from-{color}-500/5 via-transparent to-{color}-500/5 pointer-events-none" />

/* Top Fade */
<div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-slate-950/50 to-transparent pointer-events-none" />

/* Card Background Gradient */
<div className="relative">
  <div className="absolute inset-0 bg-gradient-to-r from-{color}-500 to-{color}-600 opacity-5" />
  <div className="relative">{content}</div>
</div>
```

### Gradient Accent Lines

```jsx
/* Top Border */
<div className="h-0.5 bg-gradient-to-r from-transparent via-{color}-500 to-transparent" />

/* Bottom Border */
<div className="h-0.5 bg-gradient-to-r from-transparent via-{color}-500/50 to-transparent" />

/* Vertical Divider */
<div className="w-px h-8 bg-gradient-to-b from-transparent via-{color}-500/30 to-transparent" />
```

---

## 💻 Code Examples

### Complete Page Example

```jsx
import { useState } from 'react'
import { Users, TrendingUp } from 'lucide-react'
import CompanyAdminLayout from '../components/CompanyAdminLayout'
import KPICard from '../components/KPICard'

const ExamplePage = () => {
  const [loading, setLoading] = useState(false)

  return (
    <CompanyAdminLayout
      title="OPERATIONS HUB"
      subtitle="Company performance overview"
      showSearch={false}
    >
      {/* Page content with staggered animations */}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <KPICard
          title="Active Orders"
          value={8}
          subtitle="In progress"
          icon={TrendingUp}
          color="info"
        />
        {/* More cards... */}
      </div>

      {/* Data Card */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl overflow-hidden backdrop-blur-sm animate-slide-up" style={{ animationDelay: '0.2s' }}>

        {/* Card Header */}
        <div className="px-6 py-4 bg-slate-900/80 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-black text-white" style={{ fontFamily: "'Archivo Black', sans-serif" }}>
              TEAM MEMBERS
            </h2>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6">
          {/* Content with monospace font */}
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/30 rounded-lg p-4 transition-all duration-200"
                style={{ animation: `slideInRight 0.3s ease-out ${index * 0.05}s both` }}
              >
                <div className="flex items-center gap-3">
                  <div className="text-sm font-mono text-white">{item.name}</div>
                  <span className="px-2 py-1 text-xs font-mono font-bold rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
                    {item.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CompanyAdminLayout>
  )
}

export default ExamplePage
```

### Modal Example

```jsx
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-slate-900 border border-{color}-500/20 rounded-xl shadow-2xl shadow-{color}-500/10 max-w-2xl w-full mx-4 animate-scale-in">

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-700/50">
          <h3 className="text-xl font-black text-white" style={{ fontFamily: "'Archivo Black', sans-serif" }}>
            {title}
          </h3>
        </div>

        {/* Body */}
        <div className="p-6">
          {children}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700/50 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white font-mono transition-all"
          >
            Cancel
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-{color}-500 to-{color}-600 text-white font-mono font-bold rounded-lg shadow-lg transition-all">
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}
```

---

## ✅ Best Practices

### 1. **Consistent Spacing**

```jsx
/* Use Tailwind spacing scale */
padding: p-4 (16px), p-6 (24px), p-8 (32px)
gap: gap-2 (8px), gap-3 (12px), gap-4 (16px), gap-6 (24px)
margin: mb-4, mb-6, mb-8

/* Card padding hierarchy */
- Small cards: p-4
- Medium cards: p-6
- Large sections: p-8
```

### 2. **Border Hierarchy**

```jsx
/* Default state */
border border-slate-700/50

/* Hover state */
hover:border-{color}-500/30

/* Focus state */
focus:border-{color}-500/60

/* Active/Selected state */
border border-{color}-500/50
```

### 3. **Background Layers**

```jsx
/* Use opacity for depth */
bg-slate-900/50  /* Cards */
bg-slate-900/80  /* Headers */
bg-slate-800/30  /* List items */
bg-slate-800/50  /* Hover state */
```

### 4. **Animation Timing**

```jsx
/* Stagger delays */
Menu items: 0.05s increment
Cards: 0.1s, 0.2s, 0.3s
Page load: Start after 0.1s

/* Durations */
Hover effects: duration-200 (200ms)
Layout changes: duration-300 (300ms)
Page transitions: 0.4s
```

### 5. **Icon Sizing**

```jsx
/* Context-based sizes */
Menu icons: w-4 h-4 (16px) when collapsed, w-5 h-5 (20px) when expanded
Header icons: w-4 h-4 (16px)
Card headers: w-5 h-5 (20px)
Large KPIs: w-8 h-8 (32px)
Avatar overlay: w-8 h-8 (32px)
```

### 6. **Text Contrast**

```jsx
/* Always ensure readability */
Primary text on dark: text-white
Secondary text: text-slate-200
Tertiary/labels: text-slate-400
Disabled: text-slate-500

/* Colored text on dark */
Success: text-emerald-400
Warning: text-orange-400
Error: text-red-400
Info: text-blue-400
```

### 7. **Component File Structure**

```
components/
├── {Role}Layout.jsx
├── {Role}Header.jsx
├── {Role}Sidebar.jsx
├── {Role}Footer.jsx
├── DynamicLayout.jsx
├── KPICard.jsx
├── UserMenu.jsx
└── NotificationBell.jsx

pages/
├── {Role}Dashboard.jsx
├── ProfilePage.jsx
└── ...
```

---

## ❌ Do's and Don'ts

### ✅ DO:

1. **Use role-specific gradients** - `from-{color}-500 to-{color}-600`
2. **Use IBM Plex Mono** for all data, metrics, labels
3. **Use Archivo Black** for headlines and titles (UPPERCASE)
4. **Apply staggered animations** with 0.05s-0.1s delays
5. **Add dot matrix backgrounds** to all layouts
6. **Include gradient accent lines** on headers/footers
7. **Use backdrop-blur-sm** on elevated cards
8. **Implement hover states** on interactive elements
9. **Show loading states** with spinners/pulses
10. **Use monospace badges** with uppercase text

### ❌ DON'T:

1. **Don't use Inter or Roboto** for new components
2. **Don't use solid backgrounds** without dot matrix
3. **Don't skip animations** - they define the experience
4. **Don't use emojis** in production UI (use icons)
5. **Don't mix color schemes** - stick to role colors
6. **Don't use generic button styles** - always styled
7. **Don't skip border opacity** - use /20, /30, /50, /60
8. **Don't use light theme** - Industrial is dark-only
9. **Don't center-align monospace text** - left-align data
10. **Don't skip backdrop blur** on overlays/modals

---

## 📝 Implementation Checklist

Keď vytváraš novú stránku/komponent:

- [ ] Používaš správny Layout pre user level?
- [ ] Headline je Archivo Black + UPPERCASE?
- [ ] Data/labels sú IBM Plex Mono?
- [ ] Má dot matrix background?
- [ ] Má gradient accent lines?
- [ ] Má staggered animations?
- [ ] Hover states sú implementované?
- [ ] Borders používajú opacity (/20, /30)?
- [ ] Farby zodpovedajú user level?
- [ ] Loading/error states sú styled?
- [ ] Responsive design (mobile/tablet/desktop)?
- [ ] Icons majú správnu veľkosť?

---

## 🎓 Design Tokens Reference

### Quick Copy-Paste

```jsx
/* Super Admin Orange */
from-orange-500 to-red-600
border-orange-500/20
text-orange-400
bg-orange-500/10

/* Company Admin Blue */
from-blue-500 to-cyan-600
border-blue-500/20
text-blue-400
bg-blue-500/10

/* Employee Green */
from-emerald-500 to-green-600
border-emerald-500/20
text-emerald-400
bg-emerald-500/10

/* Universal Backgrounds */
bg-slate-950        /* Base */
bg-slate-900/50     /* Cards */
bg-slate-900/80     /* Headers */
bg-slate-800/30     /* List items */
bg-slate-800/50     /* Inputs */

/* Universal Borders */
border-slate-700/50 /* Default */
border-slate-600    /* Hover */

/* Universal Text */
text-white          /* Primary */
text-slate-200      /* Secondary */
text-slate-400      /* Tertiary */
text-slate-500      /* Disabled */
```

---

## 🚀 Future Enhancements

### Planned Features:
1. Light mode support (optional)
2. Custom avatar uploads
3. Command palette (⌘K search)
4. Real-time metrics updates
5. Animated data visualizations
6. Reduce motion support (accessibility)
7. Custom color theme picker (per company)
8. Export design tokens to JSON

### Component Library:
- [ ] Alert/Toast components
- [ ] Dropdown menus
- [ ] Data tables
- [ ] Charts/graphs
- [ ] Timeline components
- [ ] Empty states
- [ ] Skeleton loaders

---

## 📚 Resources

### Design Inspiration:
- Terminal/CLI interfaces
- Industrial control panels
- System monitoring dashboards
- Command centers
- Technical documentation

### Tools Used:
- Tailwind CSS (utility classes)
- Lucide Icons (consistent icon set)
- Google Fonts (Archivo Black, IBM Plex Mono)
- DiceBear Avatars (user avatars)

### Color Contrast:
All text meets WCAG AAA standards on dark backgrounds.

---

**Vytvoril:** TSDigital
**Dátum:** 2026-03-30
**Verzia:** 2.0
**Status:** ✅ Production Ready

*Industrial Command Center Design System*
*"Technical precision meets premium aesthetics"*
