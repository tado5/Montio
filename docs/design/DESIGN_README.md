# 🎨 MONTIO Industrial Command Center Design System

**Complete Design Documentation Package**
**Version 2.0 | Production Ready**

---

## 📚 Documentation Overview

Tento design system obsahuje **kompletnú dokumentáciu** pre pokračovanie vývoja MONTIO aplikácie s Industrial Command Center estetikou.

### 📁 Dokumentačné Súbory

| Súbor | Účel | Použitie |
|-------|------|----------|
| **DESIGN_SYSTEM.md** | Kompletná design bible | Hlavná referencia pre všetky design decisions |
| **DESIGN_QUICK_REFERENCE.md** | Rýchla referencia | Quick lookup pre farby, komponenty, patterns |
| **COMPONENTS_LIBRARY.md** | Ready-to-use komponenty | Copy-paste snippets pre bežné UI elements |
| **ANIMATION_GUIDE.md** | Animation system | Kompletný guide k animáciám a timingu |
| **FULL_REDESIGN_SUMMARY.md** | Implementation summary | Čo bolo implementované, ako to funguje |
| **SUPERADMIN_REDESIGN.md** | Super admin špecifiká | Detaily o Super Admin layoute |
| **DESIGN_PREVIEW.md** | ASCII visualizations | Vizuálne preview layoutov |

---

## 🚀 Quick Start

### Pre Nový Vývojár

1. **Prečítaj si** `DESIGN_SYSTEM.md` - pochopíš filozofiu
2. **Používaj** `DESIGN_QUICK_REFERENCE.md` - rýchle copy-paste
3. **Pozri** `COMPONENTS_LIBRARY.md` - ready komponenty
4. **Študuj** `ANIMATION_GUIDE.md` - smooth interactions

### Pre Existujúceho Vývojára

1. **Refresh** s `DESIGN_QUICK_REFERENCE.md`
2. **Copy-paste** z `COMPONENTS_LIBRARY.md`
3. **Check** farby pre user level v Quick Reference

---

## 🎨 Design System v Skratke

### Aesthetic Direction

**"Industrial Command Center"**
- Technický, precízny, premium
- Dark-only theme (slate-950 base)
- Role-specific color schemes
- Dot matrix patterns
- Monospace typography
- Gradient accents

### Color Schemes by User Level

```
🟠 Super Admin:   Orange (#f97316) → Red (#dc2626)
   Badge: ROOT | ADMIN PANEL | SYSTEM
   Icon: Terminal, Shield, Crown

🔵 Company Admin: Blue (#3b82f6) → Cyan (#06b6d4)
   Badge: OPS | OPERATIONS | COMPANY
   Icon: Briefcase, TrendingUp, Building2

🟢 Employee:      Emerald (#10b981) → Green (#16a34a)
   Badge: FIELD | FIELD OPS | TECHNICIAN
   Icon: Wrench, CheckSquare, Camera
```

### Typography

```
Headlines:  Archivo Black (UPPERCASE)
Data:       IBM Plex Mono (all weights)
Fallback:   Inter (being phased out)
```

### Layout Structure

```
{Role}Layout → Main wrapper (dot matrix bg)
{Role}Header → Top bar (gradient title, badges)
{Role}Sidebar → Navigation (staggered menu)
{Role}Footer → Bottom bar (metrics, status)
```

---

## 🧩 Component Quick Access

### Layouts

```jsx
// Super Admin (Orange)
import SuperAdminLayout from '../components/SuperAdminLayout'

// Company Admin (Blue)
import CompanyAdminLayout from '../components/CompanyAdminLayout'

// Employee (Green)
import EmployeeLayout from '../components/EmployeeLayout'

// Dynamic (Auto-select based on user role)
import DynamicLayout from '../components/DynamicLayout'
```

### Common Patterns

```jsx
// Card
<div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
  Content
</div>

// Primary Button
<button className="px-4 py-2 bg-gradient-to-r from-{color}-500 to-{color}-600 text-white font-mono font-bold rounded-lg shadow-lg">
  Action
</button>

// Badge
<span className="px-3 py-1 text-xs font-mono font-bold rounded-lg bg-{color}-500/10 border border-{color}-500/30 text-{color}-400">
  BADGE
</span>

// Input
<input className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 focus:border-{color}-500/60 rounded-lg text-white font-mono text-sm" />
```

---

## ✨ Animation Patterns

### Page Load

```jsx
{/* Header */}
<header className="animate-slide-down">

{/* Cards with stagger */}
<div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>Card 1</div>
<div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>Card 2</div>

{/* Menu items with stagger */}
{items.map((item, i) => (
  <div style={{ animation: `slideInRight 0.3s ease-out ${i * 0.05}s both` }}>
    {item}
  </div>
))}
```

### Status Indicators

```jsx
{/* Pulse dot */}
<div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />

{/* Pulse + Ping */}
<div className="relative">
  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
  <div className="absolute inset-0 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
</div>
```

---

## 📐 Spacing & Sizing Reference

```
Spacing:    gap-2(8px) gap-3(12px) gap-4(16px) gap-6(24px)
Padding:    p-4(16px) p-6(24px) p-8(32px)
Margins:    mb-4(16px) mb-6(24px) mb-8(32px)

Icons:      Menu:w-5/h-5  Header:w-4/h-4  KPI:w-8/h-8
Borders:    Default:/50  Hover:/30  Focus:/60
Opacity:    Cards:/50  Headers:/80  Items:/30
```

---

## 🎯 Best Practices

### ✅ DO:

1. Use role-specific gradients (`from-{color}-500 to-{color}-600`)
2. Use IBM Plex Mono for all data/metrics/labels
3. Use Archivo Black for headlines (UPPERCASE)
4. Apply staggered animations (0.05s delays)
5. Add dot matrix backgrounds to layouts
6. Include gradient accent lines on headers/footers
7. Use backdrop-blur-sm on elevated cards
8. Implement hover states on interactive elements
9. Show loading states with spinners/pulses
10. Use monospace badges with uppercase text

### ❌ DON'T:

1. Don't use Inter/Roboto for new components
2. Don't use solid backgrounds without dot matrix
3. Don't skip animations
4. Don't use emojis in production UI
5. Don't mix color schemes
6. Don't use generic button styles
7. Don't skip border opacity (/20, /30, /50)
8. Don't use light theme
9. Don't center-align monospace text
10. Don't skip backdrop blur on overlays

---

## 🔧 Technical Implementation

### Font Integration

```css
/* In index.css or index.html */
@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
```

### Dot Matrix Pattern

```jsx
<div style={{
  backgroundImage: `
    radial-gradient(circle at 2px 2px, rgba({R}, {G}, {B}, 0.05) 1px, transparent 0),
    linear-gradient(to bottom, #020617, #0f172a)
  `,
  backgroundSize: '32px 32px, 100% 100%'
}}>

// RGB Values:
// Super Admin: 251, 146, 60 (orange)
// Company Admin: 59, 130, 246 (blue)
// Employee: 16, 185, 129 (emerald)
```

### Gradient Accent Line

```jsx
<div className="h-0.5 bg-gradient-to-r from-transparent via-{color}-500 to-transparent" />
```

---

## 📊 Implementation Status

### ✅ Completed Components

**Layouts (12 total):**
- SuperAdminLayout, Header, Sidebar, Footer
- CompanyAdminLayout, Header, Sidebar, Footer
- EmployeeLayout, Header, Sidebar, Footer
- DynamicLayout

**Pages (8 updated):**
- SuperAdminDashboard
- CompanyAdminDashboard
- CalendarPage
- OrderTypesPage
- EmployeesPage
- EmployeeDashboard
- ProfilePage (redesigned)
- NotificationsPage
- CompanyDetail (redesigned)

**Shared Components:**
- UserMenu (dark/light mode disabled)
- NotificationBell
- KPICard
- ReadOnlyBanner

---

## 🎓 Learning Resources

### Study Order (Recommended)

**Deň 1: Filozofia & Farby**
- Read: DESIGN_SYSTEM.md (sections 1-2)
- Understand: Design philosophy, color schemes
- Practice: Identify colors in existing components

**Deň 2: Typografia & Layout**
- Read: DESIGN_SYSTEM.md (sections 3-4)
- Understand: Font hierarchy, layout structure
- Practice: Create a simple page with correct fonts

**Deň 3: Komponenty**
- Read: COMPONENTS_LIBRARY.md
- Understand: Common patterns
- Practice: Copy-paste and customize components

**Deň 4: Animácie**
- Read: ANIMATION_GUIDE.md
- Understand: Timing, easing, stagger
- Practice: Add animations to existing components

**Deň 5: Integration**
- Read: FULL_REDESIGN_SUMMARY.md
- Understand: How everything fits together
- Practice: Build a complete page from scratch

---

## 🔄 Workflow for New Features

### Creating a New Page

1. **Choose Layout**
   ```jsx
   import {Role}Layout from '../components/{Role}Layout'
   ```

2. **Set Title & Subtitle**
   ```jsx
   <{Role}Layout
     title="FEATURE NAME"
     subtitle="Feature description"
   >
   ```

3. **Structure Content**
   ```jsx
   {/* Header with action */}
   {/* KPI Cards with stagger */}
   {/* Main content card */}
   {/* List with animations */}
   ```

4. **Apply Animations**
   ```jsx
   className="animate-slide-up"
   style={{ animationDelay: '0.1s' }}
   ```

5. **Test Responsive**
   - Mobile (< 768px)
   - Tablet (768px - 1024px)
   - Desktop (> 1024px)

---

## 🐛 Common Issues & Solutions

### Issue: Fonts not loading

**Solution:**
```jsx
// Check index.css has font import
@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');

// Use correct font-family
style={{ fontFamily: "'Archivo Black', sans-serif" }}
className="font-mono" // For IBM Plex Mono
```

---

### Issue: Animations not working

**Solution:**
```jsx
// Check Tailwind config has keyframes
// Use 'both' animation-fill-mode
animation: slideUp 0.4s ease-out both

// Check animationDelay is string
style={{ animationDelay: '0.1s' }} // ✅
style={{ animationDelay: 0.1 }}     // ❌
```

---

### Issue: Colors look different

**Solution:**
```jsx
// Use correct opacity values
border-slate-700/50  // ✅ (50% opacity)
border-slate-700     // ❌ (no opacity)

// Use role-specific colors
from-orange-500 to-red-600    // Super Admin ✅
from-blue-500 to-cyan-600     // Company Admin ✅
from-emerald-500 to-green-600 // Employee ✅
```

---

### Issue: Dot matrix not showing

**Solution:**
```jsx
// Check backgroundImage syntax
backgroundImage: `
  radial-gradient(circle at 2px 2px, rgba(251, 146, 60, 0.05) 1px, transparent 0),
  linear-gradient(to bottom, #020617, #0f172a)
`,
backgroundSize: '32px 32px, 100% 100%' // Must include both sizes!
```

---

## 📦 Dependencies

**Required:**
- React 18+
- Tailwind CSS 3+
- Lucide Icons
- Google Fonts (Archivo Black, IBM Plex Mono)

**Optional:**
- DiceBear Avatars (user avatars)
- Framer Motion (advanced animations)

---

## 🚀 Future Roadmap

### Planned Features

- [ ] Light mode support (optional toggle)
- [ ] Custom avatar uploads
- [ ] Command palette (⌘K)
- [ ] Real-time metrics
- [ ] Charts/graphs library
- [ ] Export design tokens to JSON
- [ ] Figma design file
- [ ] Storybook documentation

### Component Library Expansion

- [ ] Alert/Toast system
- [ ] Advanced modals
- [ ] Data tables with sorting
- [ ] Timeline components
- [ ] Empty state templates
- [ ] Skeleton loaders
- [ ] Progress indicators

---

## 🤝 Contributing

### When Adding New Components

1. Follow naming convention: `{Feature}Component.jsx`
2. Use correct layout for user level
3. Apply role-specific colors
4. Add staggered animations
5. Include hover states
6. Document in COMPONENTS_LIBRARY.md
7. Test responsive design
8. Check accessibility (keyboard navigation, screen readers)

### When Modifying Existing

1. Check DESIGN_SYSTEM.md for guidelines
2. Maintain consistent spacing/sizing
3. Don't remove animations
4. Test across all user levels
5. Update documentation if needed

---

## 📞 Support & Questions

### Where to Look

**Color questions:** → DESIGN_QUICK_REFERENCE.md
**Component code:** → COMPONENTS_LIBRARY.md
**Animation timing:** → ANIMATION_GUIDE.md
**Design philosophy:** → DESIGN_SYSTEM.md
**Implementation details:** → FULL_REDESIGN_SUMMARY.md

### Design Decisions

All design decisions are documented in `DESIGN_SYSTEM.md` with:
- Rationale (why this choice?)
- Implementation (how to use?)
- Examples (code snippets)
- Best practices (do's and don'ts)

---

## ✅ Final Checklist

Pred začatím nového feature:

- [ ] Prečítal som si DESIGN_SYSTEM.md
- [ ] Rozumiem role-specific colors
- [ ] Poznám font hierarchy (Archivo Black, IBM Plex Mono)
- [ ] Viem ako aplikovať dot matrix pattern
- [ ] Viem ako použiť staggered animations
- [ ] Mám bookmark na DESIGN_QUICK_REFERENCE.md
- [ ] Mám bookmark na COMPONENTS_LIBRARY.md

---

## 📄 Document Versions

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | 2026-03-30 | Complete redesign, all user levels |
| 1.0 | 2026-03-27 | Initial design system |

---

## 🎯 Summary

**MONTIO Industrial Command Center Design System** je kompletný, production-ready design system s:

- ✅ 12 layout komponentov (3 user levels)
- ✅ 8 redesigned pages
- ✅ Role-specific color schemes
- ✅ Custom typography (Archivo Black, IBM Plex Mono)
- ✅ Dot matrix backgrounds
- ✅ Staggered animation system
- ✅ Ready-to-use component library
- ✅ Comprehensive documentation

**Všetko čo potrebuješ pre pokračovanie vývoja je v týchto dokumentoch. Happy coding! 🚀**

---

**Created with ❤️ by TSDigital**
**Industrial Command Center Design System v2.0**
**2026-03-30**
