# 🎨 Nový Dizajn Layout Komponentov

## ✨ Čo je nové

Kompletný redesign **Header**, **Sidebar** a **Footer** s moderným "Tech Workshop" aesthetic.

### 🎯 Hlavné zmeny:

#### 1️⃣ **Header** (Nový komponent)
- ✅ **Floating design** s glassmorphism efektom
- ✅ **Sticky header** - zostáva hore pri scrolle
- ✅ **Search bar** (voliteľný) - rýchle hľadanie
- ✅ **Mobile menu toggle** - hamburger button pre mobile
- ✅ **Backdrop blur** pre moderný look
- ✅ **Responsive** - adaptívny title a search

**Props:**
```jsx
<Header
  title="Dashboard"              // Názov stránky
  subtitle="Prehľad firmy"       // Podnázov (voliteľné)
  showSearch={true}               // Zobrazť search bar (false = default)
  onMenuToggle={handleToggle}     // Callback pre mobile menu
  isMobileMenuOpen={false}        // Mobile menu state
/>
```

#### 2️⃣ **Sidebar** (Kompletne prerobený)
- ✅ **Grupované menu** - logické sekcie (Prehľad, Práca, Tím...)
- ✅ **Pulse indicator** na logu - zelený bod (systém aktívny)
- ✅ **Quick Actions** v spodnej časti
- ✅ **Animated hover states** - rotácia ikón, chevron right
- ✅ **Mobile overlay** - blur overlay na mobile
- ✅ **Gradient hover effects** - subtílne gradienty
- ✅ **Active indicator** - biely pruh na ľavej strane
- ✅ **Collapsible** (zatiaľ neimplementované)

**Features:**
- **Mobile-first** - overlay menu na mobile, fixed sidebar na desktop
- **Smooth animations** - všetky transitions sú 200-300ms
- **Group labels** - "Prehľad", "Práca", "Tím & Finance", "Systém"
- **Soon badges** - na disabled items
- **Quick actions section** - Rýchla akcia + Pomoc buttons

#### 3️⃣ **Footer** (Modernizovaný)
- ✅ **System Status** indicator - zelený badge "System OK"
- ✅ **Quick links** - Pomoc, Dokumentácia, Kontakt
- ✅ **Version badge** s Zap ikonou
- ✅ **Build number** badge (desktop only)
- ✅ **Kompaktnejší dizajn**
- ✅ **Backdrop blur** efekt
- ✅ **Hover effects** na všetkých prvkoch

**Features:**
- **Status monitoring** - zelený pulzujúci indicator
- **Version info** - pekné badges s ikonami
- **TSDigital branding** - subtílnejšie, v karte
- **Responsive** - mobilná verzia s copyright dole

---

## 🚀 Ako to použiť

### Option 1: Layout Wrapper (Odporúčané)

**Najjednoduchšie riešenie** - použiť nový `Layout` komponent:

```jsx
import Layout from '../components/Layout'

const MyPage = () => {
  return (
    <Layout
      title="Názov stránky"
      subtitle="Podnázov stránky"
      showSearch={false}  // true pre search bar
    >
      {/* Tvoj obsah stránky */}
      <div>
        <h1>Hello World</h1>
      </div>
    </Layout>
  )
}
```

**Výhody:**
- ✅ Automaticky includes Header + Sidebar + Footer
- ✅ Mobile menu handling zabudovaný
- ✅ Konzistentný layout naprieč stránkami
- ✅ Menej kódu

### Option 2: Manuálne (Starý spôsob)

Ak potrebuješ viac kontroly:

```jsx
import { useState } from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'

const MyPage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen bg-primary overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isMobileMenuOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title="Dashboard"
          subtitle="Prehľad"
          showSearch={true}
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMobileMenuOpen={isMobileMenuOpen}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8">
            {/* Tvoj obsah */}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  )
}
```

---

## 📁 Súbory

### Nové komponenty:
- ✅ `frontend/src/components/Header.jsx` - Nový komponent
- ✅ `frontend/src/components/Layout.jsx` - Nový wrapper
- ✅ `frontend/src/components/Sidebar.jsx` - Prerobený
- ✅ `frontend/src/components/Footer.jsx` - Prerobený

### Príklad použitia:
- ✅ `frontend/src/pages/CompanyAdminDashboard.EXAMPLE.jsx` - Príklad stránky

---

## 🎨 Dizajnové Prvky

### Farby & Shadows:
- **Backdrop blur:** `backdrop-blur-xl`
- **Glassmorphism:** `bg-elevated/80`
- **Shadows:** `shadow-lg`, `shadow-2xl`
- **Borders:** `border-primary/50` (subtílnejšie)

### Animácie:
- **Hover scale:** ikony `scale-110`, buttons `scale-[1.02]`
- **Transitions:** `transition-all duration-200`
- **Pulse:** zelený status dot `animate-pulse`
- **Chevron reveal:** opacity 0 → 100 on hover

### Typography:
- **Headers:** `font-display font-bold`
- **Subtitles:** `text-tertiary font-medium`
- **Menu items:** `font-semibold text-sm`

### Spacing:
- **Padding:** `px-4 md:px-6 lg:px-8` (responsive)
- **Gaps:** `gap-3`, `gap-4`, `space-y-2`

---

## 📱 Responsivita

### Breakpoints:
- **Mobile:** < 768px - Hamburger menu, overlay sidebar
- **Tablet:** 768px - 1024px - Collapsible sidebar
- **Desktop:** > 1024px - Full sidebar vždy viditeľný

### Mobile Features:
- ✅ Hamburger menu v headeri
- ✅ Overlay sidebar s blur pozadím
- ✅ Touch-friendly button sizes
- ✅ Mobilný search bar pod headerom
- ✅ Kompaktný footer

---

## 🔧 Customizácia

### Zmena farieb sidebar groups:
```jsx
// V Sidebar.jsx
const menuGroups = {
  companyadmin: [
    {
      label: 'Tvoja Sekcia',  // <-- Zmeň názov
      items: [...]
    }
  ]
}
```

### Pridanie quick links do footera:
```jsx
// V Footer.jsx
const quickLinks = [
  { label: 'Nový Link', path: '/path', external: false },
  // ...
]
```

### Zmena logo v sidebar:
```jsx
// V Sidebar.jsx
// Nahraď <Wrench /> ikonou za vlastné logo:
<img src="/logo.svg" alt="Logo" className="w-7 h-7" />
```

---

## ✅ Checklist Integrácie

Pre aplikáciu nového dizajnu na všetky stránky:

- [ ] Nahradiť `Sidebar` import za nový
- [ ] Nahradiť `Footer` import za nový
- [ ] Pridať `Header` import
- [ ] Alebo použiť `Layout` wrapper (jednoduchšie)
- [ ] Odstrániť staré header JSX z každej stránky
- [ ] Pridať mobile menu state handling
- [ ] Overiť responsivitu
- [ ] Testovať na mobile/tablet/desktop

---

## 🎯 Výhody Nového Dizajnu

1. **Modernejší vzhľad** - glassmorphism, backdrop blur
2. **Lepšia UX** - grupované menu, quick actions
3. **Mobile-first** - plne responsive s overlay menu
4. **Konzistentný** - Layout wrapper zabezpečuje jednotný vzhľad
5. **Animácie** - smooth transitions všade
6. **Status monitoring** - System OK indicator vo footer
7. **Search integration** - voliteľný search bar v headeri

---

## 📝 Poznámky

- **Glassmorphism** funguje najlepšie s backdrop-blur podporou
- **Mobile overlay** používa `fixed` positioning
- **Sidebar groups** sú logicky rozdelené podľa role
- **Quick actions** zatiaľ len placeholdery (môžeš prispôsobiť)
- **System status** je statický (môžeš pripojiť na real monitoring)

---

## 🚀 Next Steps

1. **Aplikuj Layout** na všetky stránky
2. **Otestuj responsivitu** na rôznych zariadeniach
3. **Pridaj search funkcionalitu** (ak chceš)
4. **Customize quick actions** v sidebari
5. **Connect system status** na monitoring API

---

**Enjoy the new design! 🎨✨**
