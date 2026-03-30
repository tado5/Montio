# ✨ MONTIO - Animation Guide

**Industrial Command Center Animation System**
**Smooth, purposeful, professional**

---

## 🎯 Animation Philosophy

### Core Principles:

1. **Purposeful** - Každá animácia má účel (feedback, guidance, delight)
2. **Smooth** - 60fps, hardware-accelerated transforms
3. **Staggered** - Sequential reveals vytvárajú flow
4. **Subtle** - Nenahlušujú, podporujú UX
5. **Consistent** - Rovnaké timing curves naprieč aplikáciou

### When to Animate:

✅ **DO Animate:**
- Page/component load (entrance)
- State changes (loading → loaded)
- User interactions (hover, click)
- Status updates (pulse, ping)
- List items (stagger)
- Modals/overlays (scale in)

❌ **DON'T Animate:**
- Text typing effects
- Rapid state changes
- Critical information
- During scroll (performance)

---

## 🎬 Animation Types

### 1. Entrance Animations

#### Slide In Right (Menu Items)
```css
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

/* Usage */
animation: slideInRight 0.3s ease-out both;
```

**Best For:**
- Sidebar menu items
- List items
- Timeline events

**Implementation:**
```jsx
{items.map((item, index) => (
  <div style={{ animation: `slideInRight 0.3s ease-out ${index * 0.05}s both` }}>
    {item}
  </div>
))}
```

---

#### Slide Up (Cards)
```css
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

/* Usage */
animation: slideUp 0.4s ease-out both;
```

**Best For:**
- Cards
- Panels
- Content sections

**Implementation:**
```jsx
<div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
  Card 1
</div>
<div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
  Card 2
</div>
<div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
  Card 3
</div>
```

---

#### Slide Down (Header)
```css
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

/* Usage */
animation: slideDown 0.4s ease-out both;
```

**Best For:**
- Page headers
- Top notifications
- Dropdowns

**Implementation:**
```jsx
<header className="animate-slide-down">
  Header content
</header>
```

---

#### Scale In (Modals)
```css
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Usage */
animation: scaleIn 0.3s ease-out both;
```

**Best For:**
- Modals
- Popups
- Tooltips

**Implementation:**
```jsx
<div className="animate-scale-in">
  Modal content
</div>
```

---

#### Fade In
```css
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Usage */
animation: fadeIn 0.4s ease-out both;
```

**Best For:**
- Background overlays
- Subtle content reveals
- Images loading

---

### 2. Status Animations

#### Pulse (Active Status)
```css
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

/* Usage */
animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
```

**Best For:**
- Status dots
- Active indicators
- Gradient text effects

**Implementation:**
```jsx
/* Status Dot */
<div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />

/* Gradient Title */
<h1 className="bg-clip-text bg-gradient-to-r from-orange-400 to-orange-300 animate-pulse">
  TITLE
</h1>
```

---

#### Ping (Notification)
```css
@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

/* Usage */
animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
```

**Best For:**
- Notification indicators
- Online status
- Active badges

**Implementation:**
```jsx
<div className="relative">
  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
  <div className="absolute inset-0 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
</div>
```

---

#### Spin (Loading)
```css
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Usage */
animation: spin 1s linear infinite;
```

**Best For:**
- Loading spinners
- Refresh icons
- Processing indicators

**Implementation:**
```jsx
<div className="w-16 h-16 border-4 border-slate-700 border-t-orange-500 rounded-full animate-spin" />
```

---

### 3. Interaction Animations

#### Hover Scale
```css
/* Small scale up */
.hover-scale-sm {
  transition: transform 0.2s ease-out;
}
.hover-scale-sm:hover {
  transform: scale(1.02);
}
.hover-scale-sm:active {
  transform: scale(0.98);
}

/* Medium scale up */
.hover-scale-md {
  transition: transform 0.2s ease-out;
}
.hover-scale-md:hover {
  transform: scale(1.05);
}
.hover-scale-md:active {
  transform: scale(0.95);
}
```

**Implementation:**
```jsx
<button className="hover:scale-[1.02] active:scale-[0.98] transition-transform">
  Button
</button>
```

---

#### Hover Glow
```css
.hover-glow {
  transition: box-shadow 0.3s ease-out;
}
.hover-glow:hover {
  box-shadow: 0 0 20px rgba(249, 115, 22, 0.2);
}
```

**Implementation:**
```jsx
<div className="hover:shadow-lg hover:shadow-orange-500/20 transition-shadow">
  Card
</div>
```

---

#### Border Glow
```css
.border-glow {
  transition: border-color 0.2s ease-out;
}
.border-glow:hover {
  border-color: rgba(249, 115, 22, 0.3);
}
```

**Implementation:**
```jsx
<div className="border border-slate-700/50 hover:border-orange-500/30 transition-colors">
  Card
</div>
```

---

#### Background Gradient Sweep
```jsx
<div className="relative group overflow-hidden">
  {/* Gradient that appears on hover */}
  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

  {/* Content */}
  <div className="relative">
    Content
  </div>
</div>
```

---

#### Icon Rotate
```jsx
<button className="group">
  <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
</button>

<button className="group">
  <Edit2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
</button>
```

---

## ⏱️ Timing Guidelines

### Duration Scale

```css
/* Very Fast - Micro interactions */
--duration-fast: 150ms;
/* button press, toggle */

/* Fast - Default interactions */
--duration-normal: 200ms;
/* hover, focus states */

/* Medium - Transitions */
--duration-medium: 300ms;
/* layout changes, collapse/expand */

/* Slow - Entrances */
--duration-slow: 400ms;
/* page load, modal open */

/* Very Slow - Special effects */
--duration-very-slow: 600ms;
/* complex transitions */
```

### Easing Curves

```css
/* Ease Out - Entrances, interactions */
cubic-bezier(0, 0, 0.2, 1)
/* Use for: slide-in, fade-in, scale-in */

/* Ease In Out - Smooth transitions */
cubic-bezier(0.4, 0, 0.6, 1)
/* Use for: modal open/close, layout shifts */

/* Linear - Continuous motion */
linear
/* Use for: spinners, progress bars */

/* Custom - Bounce */
cubic-bezier(0.68, -0.55, 0.265, 1.55)
/* Use sparingly for playful effects */
```

### Delay Patterns

```css
/* Stagger Pattern */
--stagger-base: 0.05s;

Item 1: 0s
Item 2: 0.05s
Item 3: 0.10s
Item 4: 0.15s
...

/* Card Stagger Pattern */
--card-stagger: 0.1s;

Card 1: 0.1s
Card 2: 0.2s
Card 3: 0.3s
Card 4: 0.4s
```

---

## 🎨 Complete Animation Examples

### Page Load Sequence

```jsx
const PageComponent = () => {
  return (
    <div>
      {/* Header - Immediate */}
      <header className="animate-slide-down">
        Page Title
      </header>

      {/* KPI Cards - Stagger 0.1s */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>KPI 1</div>
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>KPI 2</div>
        <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>KPI 3</div>
        <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>KPI 4</div>
      </div>

      {/* Main Content - After KPIs */}
      <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
        Main content
      </div>
    </div>
  )
}
```

---

### Menu Items Stagger

```jsx
const SidebarMenu = ({ items }) => {
  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li
          key={item.id}
          style={{
            animation: `slideInRight 0.3s ease-out ${index * 0.05}s both`
          }}
        >
          <button className="w-full flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-slate-800/50 transition-all duration-200">
            <item.Icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}
```

---

### Interactive Button

```jsx
<button className="
  px-4 py-2
  bg-gradient-to-r from-orange-500 to-red-600
  text-white font-mono font-bold rounded-lg
  shadow-lg shadow-orange-500/30
  hover:shadow-xl hover:shadow-orange-500/40
  hover:scale-[1.02]
  active:scale-[0.98]
  transition-all duration-200
">
  Click Me
</button>
```

---

### Status Indicator (Pulse + Ping)

```jsx
const StatusIndicator = ({ online }) => {
  if (!online) return (
    <div className="w-2 h-2 bg-slate-600 rounded-full" />
  )

  return (
    <div className="relative flex items-center justify-center">
      {/* Base dot with pulse */}
      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />

      {/* Ping effect */}
      <div className="absolute inset-0 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
    </div>
  )
}
```

---

### Modal with Backdrop

```jsx
const Modal = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop - Fade In */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal - Scale In */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-orange-500/20 rounded-xl shadow-2xl max-w-2xl w-full animate-scale-in">
          Modal Content
        </div>
      </div>
    </>
  )
}
```

---

### Loading State Transition

```jsx
const DataCard = () => {
  const [loading, setLoading] = useState(true)

  if (loading) {
    return (
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6">
        {/* Skeleton with pulse */}
        <div className="animate-pulse">
          <div className="h-4 bg-slate-800 rounded w-1/4 mb-4" />
          <div className="space-y-2">
            <div className="h-3 bg-slate-800 rounded w-full" />
            <div className="h-3 bg-slate-800 rounded w-5/6" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6 animate-fade-in">
      {/* Loaded content */}
    </div>
  )
}
```

---

### Progress Bar Animation

```jsx
const ProgressBar = ({ progress }) => {
  return (
    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-orange-500 to-red-600 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
```

---

## 🎭 Tailwind Config

### Add to `tailwind.config.js`:

```js
module.exports = {
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'spin-slow': 'spin 2s linear infinite',
        'ping': 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        ping: {
          '75%, 100%': { transform: 'scale(2)', opacity: '0' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
}
```

---

## ⚡ Performance Tips

### DO:

1. **Use transform/opacity** - Hardware accelerated
   ```css
   transform: translateX(), scale(), rotate()
   opacity: 0 to 1
   ```

2. **Use will-change** for complex animations
   ```css
   will-change: transform, opacity;
   ```

3. **Batch animations** together
   ```css
   transition: transform 0.2s, opacity 0.2s, box-shadow 0.3s;
   ```

### DON'T:

1. **Avoid animating** these properties:
   ```css
   width, height, top, left, margin, padding
   /* Use transform instead */
   ```

2. **Don't animate during scroll**
   ```jsx
   /* Bad */
   onScroll={() => setAnimating(true)}

   /* Good */
   Use CSS :hover states
   ```

3. **Don't use too many simultaneous animations**
   ```jsx
   /* Bad - 50 items animating at once */
   {items.map((item, i) => <Animated key={i} />)}

   /* Good - Stagger with delays */
   {items.map((item, i) => (
     <Animated key={i} delay={i * 0.05} />
   ))}
   ```

---

## 📋 Animation Checklist

Keď vytváraš novú stránku/komponent:

- [ ] Page load animations (header, cards)?
- [ ] Staggered delays na list items?
- [ ] Hover states na interactive elements?
- [ ] Loading states (spinner/skeleton)?
- [ ] Status indicators (pulse/ping)?
- [ ] Transition duration appropriate?
- [ ] Using transform/opacity (not width/height)?
- [ ] Animations smooth (60fps)?
- [ ] Works on mobile?
- [ ] Accessible (respects prefers-reduced-motion)?

---

## ♿ Accessibility

### Respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### In React:

```jsx
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const animationDelay = prefersReducedMotion ? '0s' : `${index * 0.05}s`
```

---

**For full design system, see: `DESIGN_SYSTEM.md`**
**For components, see: `COMPONENTS_LIBRARY.md`**
