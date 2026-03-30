# 🎨 MONTIO - Industrial Command Center Design System

**Version:** 2.0
**Updated:** 2026-03-30
**Status:** Production Ready

---

## 📚 Documentation Index

Všetky design dokumenty pre MONTIO aplikáciu s Industrial Command Center estetikou.

### 🚀 Quick Start

**Pre nového vývojára:**
1. Začni s [**DESIGN_README.md**](./DESIGN_README.md) → Kompletný prehľad systému
2. Používaj [**DESIGN_QUICK_REFERENCE.md**](./DESIGN_QUICK_REFERENCE.md) → Rýchle copy-paste

**Pre pokračovanie vývoja:**
1. [**COMPONENTS_LIBRARY.md**](./COMPONENTS_LIBRARY.md) → Ready-to-use komponenty
2. [**ANIMATION_GUIDE.md**](./ANIMATION_GUIDE.md) → Animation system

---

## 📖 Documentation Files

| Súbor | Účel | Kedy použiť |
|-------|------|-------------|
| [**DESIGN_README.md**](./DESIGN_README.md) | Hlavný prehľad systému | Prvé čítanie, onboarding |
| [**DESIGN_SYSTEM.md**](./DESIGN_SYSTEM.md) | Kompletná design bible | Pochopenie filozofie, rozhodnutí |
| [**DESIGN_QUICK_REFERENCE.md**](./DESIGN_QUICK_REFERENCE.md) | Rýchla referencia | Quick lookup, copy-paste |
| [**COMPONENTS_LIBRARY.md**](./COMPONENTS_LIBRARY.md) | Knižnica komponentov | Implementácia UI elementov |
| [**ANIMATION_GUIDE.md**](./ANIMATION_GUIDE.md) | Animation systém | Pridávanie animácií |
| [**FULL_REDESIGN_SUMMARY.md**](./FULL_REDESIGN_SUMMARY.md) | Implementation summary | Ako bol redesign implementovaný |
| [**SUPERADMIN_REDESIGN.md**](./SUPERADMIN_REDESIGN.md) | Super Admin špecifiká | Super Admin layout detaily |
| [**DESIGN_PREVIEW.md**](./DESIGN_PREVIEW.md) | ASCII visualizations | Vizuálne preview layoutov |
| [**DESIGN_NOTES.md**](./DESIGN_NOTES.md) | Staršie poznámky | Archív starších poznámok |
| [**NEW_LAYOUT_DESIGN.md**](./NEW_LAYOUT_DESIGN.md) | Layout design | Pôvodné layout návrhy |

---

## 🎨 Design System Overview

### Aesthetic Direction
**"Industrial Command Center"**
- Technický, precízny, premium
- Dark-only theme (slate-950 base)
- Role-specific color schemes
- Dot matrix patterns
- Monospace typography

### Role-Specific Colors

```
🟠 Super Admin:   Orange (#f97316) → Red (#dc2626)
🔵 Company Admin: Blue (#3b82f6) → Cyan (#06b6d4)
🟢 Employee:      Emerald (#10b981) → Green (#16a34a)
```

### Typography

```
Headlines:  Archivo Black (UPPERCASE)
Data:       IBM Plex Mono (all weights)
```

### Layout Structure

```
{Role}Layout → Main wrapper (dot matrix bg)
{Role}Header → Top bar (gradient title, badges)
{Role}Sidebar → Navigation (staggered menu)
{Role}Footer → Bottom bar (metrics, status)
```

---

## 🧩 Component Categories

### Layouts
- SuperAdminLayout, CompanyAdminLayout, EmployeeLayout
- DynamicLayout (auto-select based on user role)
- Headers, Sidebars, Footers per role

### UI Components
- Cards (Basic, KPI, Info, Hoverable)
- Buttons (Primary, Secondary, Ghost, Danger, Icon)
- Inputs (Text, Search, Password, Select, Textarea)
- Badges (Status, Gradient, Pill, Count, Role)
- Modals (Basic, Confirmation)
- Tables, Lists, Headers

### Patterns
- Dot matrix backgrounds
- Gradient accent lines
- Staggered animations
- Status indicators (pulse, ping)

---

## ✨ Animation System

### Entrance Animations
- `slideInRight` - Menu items (0.3s, stagger 0.05s)
- `slideUp` - Cards (0.4s, stagger 0.1s)
- `slideDown` - Headers (0.4s)
- `scaleIn` - Modals (0.3s)

### Status Animations
- `pulse` - Active status (2s infinite)
- `ping` - Notifications (1s infinite)
- `spin` - Loading (1s linear infinite)

### Timing
- Fast: 150-200ms (interactions)
- Medium: 300ms (transitions)
- Slow: 400ms (entrances)

---

## 🛠️ Tech Stack

- **Framework:** React 18
- **Styling:** Tailwind CSS 3+
- **Icons:** Lucide React
- **Fonts:** Archivo Black, IBM Plex Mono (Google Fonts)
- **Animations:** CSS Keyframes + Tailwind

---

## 📋 Quick Checklist

Pri vytváraní novej stránky/komponentu:

- [ ] Použiť správny Layout pre user level
- [ ] Archivo Black pre headlines (UPPERCASE)
- [ ] IBM Plex Mono pre data/labels
- [ ] Aplikovať staggered animations
- [ ] Pridať hover states
- [ ] Použiť role-specific colors
- [ ] Border opacity (/20, /30, /50)
- [ ] Responsive design (mobile/tablet/desktop)
- [ ] Backdrop blur na elevated elements

---

## 🎯 Best Practices

### ✅ DO:
1. Use role-specific gradients
2. Use IBM Plex Mono for data/metrics
3. Use Archivo Black for headlines (UPPERCASE)
4. Apply staggered animations
5. Add dot matrix backgrounds
6. Include gradient accent lines
7. Use backdrop-blur-sm on cards
8. Implement hover states

### ❌ DON'T:
1. Don't use Inter/Roboto for new components
2. Don't use solid backgrounds without dot matrix
3. Don't skip animations
4. Don't mix color schemes
5. Don't skip border opacity
6. Don't use light theme

---

## 🔗 Related Documentation

### Main Project Docs (Root)
- `README.md` - Project overview
- `SETUP.md` - Installation & setup
- `STATUS.md` - Current project status
- `PLAN.md` - Development roadmap
- `CHANGELOG.md` - Version history

### Other Docs
- `docs/archive/` - Outdated documentation

---

## 📞 Support

**Pre otázky ohľadom dizajnu:**
- Color schemes → [DESIGN_QUICK_REFERENCE.md](./DESIGN_QUICK_REFERENCE.md)
- Component code → [COMPONENTS_LIBRARY.md](./COMPONENTS_LIBRARY.md)
- Animations → [ANIMATION_GUIDE.md](./ANIMATION_GUIDE.md)
- Design philosophy → [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)

---

**Created with ❤️ by TSDigital**
**Industrial Command Center Design System v2.0**
**2026-03-30**
