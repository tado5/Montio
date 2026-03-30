# 🚀 MONTIO - Design Quick Reference

**Industrial Command Center Design System**
**Version:** 2.0 | **Updated:** 2026-03-30

---

## 🎨 Color Cheat Sheet

### 🟠 Super Admin
```jsx
className="bg-gradient-to-r from-orange-500 to-red-600"
className="border-orange-500/20 hover:border-orange-500/30"
className="text-orange-400"
className="bg-orange-500/10"
```

### 🔵 Company Admin
```jsx
className="bg-gradient-to-r from-blue-500 to-cyan-600"
className="border-blue-500/20 hover:border-blue-500/30"
className="text-blue-400"
className="bg-blue-500/10"
```

### 🟢 Employee
```jsx
className="bg-gradient-to-r from-emerald-500 to-green-600"
className="border-emerald-500/20 hover:border-emerald-500/30"
className="text-emerald-400"
className="bg-emerald-500/10"
```

---

## ✍️ Typography

```jsx
/* Headline */
<h1 className="text-2xl font-black text-white" style={{ fontFamily: "'Archivo Black', sans-serif" }}>
  TITLE
</h1>

/* Label */
<span className="text-xs font-mono text-slate-500 uppercase tracking-wider">
  Label
</span>

/* Data */
<div className="text-sm font-mono text-white">
  Value
</div>
```

---

## 🧩 Common Components

### Card
```jsx
<div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
  Content
</div>
```

### Button Primary
```jsx
<button className="px-4 py-2 bg-gradient-to-r from-{color}-500 to-{color}-600 text-white font-mono font-bold rounded-lg shadow-lg">
  Action
</button>
```

### Button Secondary
```jsx
<button className="px-4 py-2 bg-{color}-500/10 hover:bg-{color}-500/20 border border-{color}-500/30 rounded-lg text-{color}-400 font-mono font-bold">
  Action
</button>
```

### Input
```jsx
<input
  type="text"
  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 focus:border-{color}-500/60 rounded-lg text-white font-mono text-sm"
  placeholder="Enter value..."
/>
```

### Badge
```jsx
<span className="px-3 py-1 text-xs font-mono font-bold rounded-lg bg-{color}-500/10 border border-{color}-500/30 text-{color}-400">
  BADGE
</span>
```

---

## ✨ Animations

### Staggered Items
```jsx
{items.map((item, index) => (
  <div style={{ animation: `slideInRight 0.3s ease-out ${index * 0.05}s both` }}>
    {item}
  </div>
))}
```

### Staggered Cards
```jsx
<div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>Card 1</div>
<div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>Card 2</div>
<div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>Card 3</div>
```

### Status Pulse
```jsx
<div className="relative">
  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
  <div className="absolute inset-0 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
</div>
```

---

## 🎭 Patterns

### Dot Matrix Background
```jsx
<div style={{
  backgroundImage: `
    radial-gradient(circle at 2px 2px, rgba(251, 146, 60, 0.05) 1px, transparent 0),
    linear-gradient(to bottom, #020617, #0f172a)
  `,
  backgroundSize: '32px 32px, 100% 100%'
}}>
```

### Gradient Accent Line
```jsx
<div className="h-0.5 bg-gradient-to-r from-transparent via-{color}-500 to-transparent" />
```

### Gradient Overlay
```jsx
<div className="absolute inset-0 bg-gradient-to-br from-{color}-500/5 via-transparent to-{color}-500/5 pointer-events-none" />
```

---

## 📐 Spacing Scale

```
gap-2  = 8px
gap-3  = 12px
gap-4  = 16px
gap-6  = 24px

p-4    = 16px
p-6    = 24px
p-8    = 32px

mb-4   = 16px
mb-6   = 24px
mb-8   = 32px
```

---

## 🎯 Icon Sizes

```jsx
Menu (collapsed): w-6 h-6
Menu (expanded): w-5 h-5
Header: w-4 h-4
Card header: w-5 h-5
KPI: w-8 h-8
```

---

## 🔗 Layouts

### Super Admin
```jsx
import SuperAdminLayout from '../components/SuperAdminLayout'

<SuperAdminLayout title="SYSTEM CONTROL" subtitle="Managing operations">
  {children}
</SuperAdminLayout>
```

### Company Admin
```jsx
import CompanyAdminLayout from '../components/CompanyAdminLayout'

<CompanyAdminLayout title="OPERATIONS HUB" subtitle="Company overview">
  {children}
</CompanyAdminLayout>
```

### Employee
```jsx
import EmployeeLayout from '../components/EmployeeLayout'

<EmployeeLayout title="FIELD PORTAL" subtitle="Your tasks">
  {children}
</EmployeeLayout>
```

### Dynamic (Profile, Notifications)
```jsx
import DynamicLayout from '../components/DynamicLayout'

<DynamicLayout title="USER PROFILE" subtitle="Account settings">
  {children}
</DynamicLayout>
```

---

## ✅ Quick Checklist

Pri vytváraní novej stránky:

- [ ] Správny Layout pre user level
- [ ] Archivo Black pre headlines (UPPERCASE)
- [ ] IBM Plex Mono pre data/labels
- [ ] Staggered animations
- [ ] Hover states
- [ ] Role-specific colors
- [ ] Border opacity (/20, /30)
- [ ] Responsive (mobile/tablet/desktop)

---

## 🎨 RGB Values for Dot Matrix

```javascript
// Super Admin
rgba(251, 146, 60, 0.05)   // orange-500

// Company Admin
rgba(59, 130, 246, 0.05)   // blue-500

// Employee
rgba(16, 185, 129, 0.05)   // emerald-500
```

---

## 🚨 Common Mistakes to Avoid

❌ `font-family: Inter` → ✅ `font-family: 'IBM Plex Mono'`
❌ `bg-slate-900` → ✅ `bg-slate-900/50`
❌ `border-slate-700` → ✅ `border-slate-700/50`
❌ No animations → ✅ Always add stagger delays
❌ Solid backgrounds → ✅ Add dot matrix pattern
❌ No hover states → ✅ Always add hover effects

---

**For full documentation, see: `DESIGN_SYSTEM.md`**
