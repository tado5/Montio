# MONTIO - Design System

## 🎨 Color Palette

### Primary Gradients
- **Purple-Pink:** `from-purple-500 to-pink-500` - Super Admin, Actions
- **Blue-Purple:** `from-blue-600 to-purple-600` - Primary buttons
- **Green-Emerald:** `from-green-500 to-emerald-500` - Company Admin, Success
- **Orange-Amber:** `from-orange-500 to-amber-500` - Employee, Warnings

### Status Colors
- **Active:** Green gradient (`from-green-400 to-emerald-500`)
- **Pending:** Yellow-Orange (`from-yellow-400 to-orange-500`)
- **Error:** Red gradient (`from-red-500 to-red-600`)

### Activity Log Actions
- `user.login` → Blue (`bg-blue-100 text-blue-800`)
- `user.logout` → Gray (`bg-gray-100 text-gray-800`)
- `company.create` → Green (`bg-green-100 text-green-800`)
- `company.update` → Yellow (`bg-yellow-100 text-yellow-800`)
- `order.*` → Purple (`bg-purple-100 text-purple-800`)
- `invoice.*` → Indigo (`bg-indigo-100 text-indigo-800`)

---

## 🎭 Components

### Buttons

#### Primary (Gradient)
```jsx
className="bg-gradient-to-r from-blue-600 to-purple-600
           hover:from-blue-700 hover:to-purple-700
           text-white px-6 py-3 rounded-xl font-semibold
           shadow-lg hover:shadow-xl
           transform hover:scale-105 active:scale-95
           transition-all duration-200"
```

#### Danger
```jsx
className="bg-gradient-to-r from-red-500 to-red-600
           hover:from-red-600 hover:to-red-700"
```

### Cards

#### Stats Card
```jsx
className="bg-gradient-to-br from-blue-500 to-blue-600
           rounded-2xl shadow-xl p-6
           transform hover:scale-105
           transition-all duration-200 hover:shadow-2xl"
```

#### Feature Card (Placeholder)
```jsx
<div className="relative group">
  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400
                  rounded-2xl blur opacity-25
                  group-hover:opacity-50
                  transition-opacity duration-200">
  </div>
  <div className="relative bg-white border-2 border-dashed border-blue-300
                  rounded-2xl p-6
                  transform hover:scale-105
                  transition-all duration-200 hover:shadow-xl">
    {/* content */}
  </div>
</div>
```

### Tables

#### Header
```jsx
className="bg-gradient-to-r from-gray-50 to-gray-100"
```

#### Row (Hover)
```jsx
className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50
           cursor-pointer transition-all duration-200
           transform hover:scale-[1.01] group"
```

### Badges

#### Status Badge
```jsx
className="px-3 py-1 inline-flex text-xs font-bold rounded-full shadow-sm
           bg-gradient-to-r from-green-400 to-emerald-500 text-white"
```

#### Phase Badge
```jsx
className="inline-block bg-gradient-to-r from-blue-500 to-cyan-500
           text-white text-xs font-bold px-3 py-1 rounded-full"
```

---

## ✨ Animations

### Custom CSS Animations

#### Gradient Background
```css
@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.animate-gradient {
  background-size: 200% 200%;
  animation: gradient 15s ease infinite;
}
```

#### Fade In
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

#### Loading Spinner
```jsx
<div className="inline-block animate-spin rounded-full h-12 w-12
                border-4 border-purple-200 border-t-purple-600">
</div>
```

### Hover Effects

#### Scale
```jsx
transform hover:scale-105 active:scale-95
```

#### Shadow
```jsx
shadow-md hover:shadow-xl
```

#### Glow
```jsx
group-hover:shadow-lg
```

---

## 🎯 Page Layouts

### Background Gradients

- **Super Admin:** `bg-gradient-to-br from-gray-50 to-gray-100`
- **Company Admin:** `bg-gradient-to-br from-green-50 to-emerald-100`
- **Employee:** `bg-gradient-to-br from-orange-50 to-amber-100`
- **Login:** `bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500`

### Header Structure
```jsx
<header className="bg-white shadow-lg border-b border-gray-200">
  <div className="max-w-7xl mx-auto px-4 py-5">
    <div className="flex items-center gap-3">
      {/* Logo Icon */}
      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500
                      rounded-lg flex items-center justify-center shadow-lg">
        <span className="text-white text-xl font-bold">M</span>
      </div>
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600
                       text-transparent bg-clip-text">
          MONTIO
        </h1>
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
          👑 Super Admin
        </p>
      </div>
    </div>
  </div>
</header>
```

---

## 📋 Timeline View (Activity Log)

```jsx
<div className="relative pl-8 pb-4 border-l-4 border-gray-200
                hover:border-purple-300 transition-all duration-200 group">
  {/* Timeline dot */}
  <div className="absolute left-[-10px] top-0 w-5 h-5 rounded-full
                  bg-gradient-to-r from-blue-400 to-cyan-400 shadow-lg
                  group-hover:scale-125 transition-transform duration-200">
    <div className="w-2 h-2 bg-white rounded-full m-auto mt-1.5"></div>
  </div>

  {/* Content */}
  <div className="bg-gradient-to-r from-gray-50 to-gray-100
                  group-hover:from-blue-50 group-hover:to-purple-50
                  rounded-xl p-4 transition-all duration-200">
    {/* ... */}
  </div>
</div>
```

---

## 🎨 Typography

### Headings
- **Hero:** `text-5xl font-black` with gradient
- **Page Title:** `text-3xl font-black text-gray-900`
- **Section:** `text-2xl font-bold text-gray-800`
- **Card Title:** `text-xl font-black text-gray-900`

### Body Text
- **Primary:** `text-sm font-medium text-gray-700`
- **Secondary:** `text-sm text-gray-600`
- **Muted:** `text-xs text-gray-500`

### Labels
- **Uppercase:** `text-xs font-bold uppercase tracking-wide`

---

## 🚀 Best Practices

### Do's ✅
- Use gradient backgrounds for important actions
- Add hover effects to interactive elements
- Use shadows for depth (shadow-md → shadow-xl)
- Animate transitions (duration-200)
- Color-code different roles/actions
- Use emojis for visual hierarchy
- Add subtle blur effects for glassmorphism

### Don'ts ❌
- Don't overuse animations (max 3 effects per component)
- Don't mix too many gradient colors
- Don't use solid colors for primary actions
- Don't forget accessibility (contrast ratios)
- Don't animate on every state change

---

## 📱 Responsive Design

### Breakpoints
- **Mobile:** Default (< 640px)
- **Tablet:** `md:` (≥ 768px)
- **Desktop:** `lg:` (≥ 1024px)

### Grid Layouts
```jsx
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
```

---

## 🎯 Future Enhancements

- [ ] Dark mode support
- [ ] Custom icon library (Heroicons)
- [ ] Loading skeletons
- [ ] Toast notifications
- [ ] Modal system
- [ ] Drag & drop UI components
- [ ] Chart/graph components (Recharts)
- [ ] File upload with progress
- [ ] Image lightbox/gallery

---

**Last Updated:** 2026-03-15
**Version:** 2.5
