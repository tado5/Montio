# 🧩 MONTIO - Components Library

**Ready-to-use Industrial Command Center Components**
**Copy-paste ready code snippets**

---

## 📋 Table of Contents

1. [Cards](#cards)
2. [Buttons](#buttons)
3. [Inputs](#inputs)
4. [Badges & Tags](#badges--tags)
5. [Modals](#modals)
6. [Tables](#tables)
7. [Lists](#lists)
8. [Headers](#headers)
9. [Empty States](#empty-states)
10. [Loading States](#loading-states)

---

## 🃏 Cards

### Basic Card
```jsx
<div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
  <h3 className="text-lg font-black text-white mb-4" style={{ fontFamily: "'Archivo Black', sans-serif" }}>
    CARD TITLE
  </h3>
  <p className="text-sm font-mono text-slate-300">
    Card content goes here
  </p>
</div>
```

### Card with Header
```jsx
<div className="bg-slate-900/50 border border-slate-700/50 rounded-xl overflow-hidden backdrop-blur-sm">
  {/* Header */}
  <div className="px-6 py-4 bg-slate-900/80 border-b border-slate-700/50">
    <div className="flex items-center gap-2">
      <Icon className="w-5 h-5 text-orange-400" />
      <h3 className="text-lg font-black text-white" style={{ fontFamily: "'Archivo Black', sans-serif" }}>
        CARD HEADER
      </h3>
    </div>
  </div>

  {/* Body */}
  <div className="p-6">
    Content here
  </div>
</div>
```

### Hoverable Card
```jsx
<div className="bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/50 hover:border-orange-500/30 rounded-xl p-4 transition-all duration-200 cursor-pointer group">
  <div className="flex items-center justify-between">
    <span className="text-sm font-mono text-white group-hover:text-orange-400 transition-colors">
      Item Name
    </span>
    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-orange-400 transition-colors" />
  </div>
</div>
```

### KPI Card
```jsx
<div className="bg-slate-900/50 border border-orange-500/20 rounded-xl p-6 backdrop-blur-sm hover:shadow-lg hover:shadow-orange-500/10 transition-all">
  <div className="flex items-center justify-between mb-3">
    <TrendingUp className="w-8 h-8 text-orange-400" />
    <span className="text-3xl font-black text-white">142</span>
  </div>
  <div className="text-xs font-mono text-slate-500 uppercase tracking-wider">Total Orders</div>
  <div className="text-xs font-mono text-orange-400 mt-1">+12% this month</div>
</div>
```

### Info Card with Icon
```jsx
<div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg backdrop-blur-sm">
  <div className="flex items-start gap-3">
    <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
    <div>
      <div className="text-sm font-mono text-blue-400 font-bold mb-1">Info Title</div>
      <div className="text-xs font-mono text-slate-400">
        Important information or tip goes here.
      </div>
    </div>
  </div>
</div>
```

---

## 🔘 Buttons

### Primary Button
```jsx
<button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-mono font-bold rounded-lg shadow-lg shadow-orange-500/30 hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]">
  Primary Action
</button>
```

### Secondary Button
```jsx
<button className="px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 hover:border-orange-500/50 rounded-lg text-orange-400 hover:text-orange-300 font-mono font-bold transition-all">
  Secondary Action
</button>
```

### Ghost Button
```jsx
<button className="px-4 py-2 bg-slate-900/50 hover:bg-slate-800/50 border border-slate-700/50 hover:border-orange-500/30 rounded-lg text-slate-300 hover:text-white font-mono transition-all">
  Ghost Action
</button>
```

### Danger Button
```jsx
<button className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 rounded-lg text-red-400 font-mono font-bold transition-all flex items-center gap-2">
  <X className="w-4 h-4" />
  Delete
</button>
```

### Success Button
```jsx
<button className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/50 rounded-lg text-emerald-400 font-mono font-bold transition-all flex items-center gap-2">
  <CheckCircle2 className="w-4 h-4" />
  Confirm
</button>
```

### Icon Button
```jsx
<button className="w-10 h-10 flex items-center justify-center bg-slate-900/50 hover:bg-slate-800/50 border border-slate-700/50 hover:border-orange-500/30 rounded-lg transition-all">
  <Settings className="w-5 h-5 text-slate-400 hover:text-white" />
</button>
```

### Button with Badge
```jsx
<button className="px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-lg text-orange-400 font-mono font-bold transition-all flex items-center gap-2">
  Notifications
  <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">3</span>
</button>
```

---

## 📝 Inputs

### Text Input
```jsx
<div>
  <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">
    Label
  </label>
  <input
    type="text"
    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 focus:border-orange-500/60 rounded-lg text-white font-mono text-sm transition-all placeholder:text-slate-500"
    placeholder="Enter value..."
  />
</div>
```

### Input with Icon
```jsx
<div>
  <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">
    Search
  </label>
  <div className="relative">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
    <input
      type="text"
      className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 focus:border-orange-500/60 rounded-lg text-white font-mono text-sm"
      placeholder="Search..."
    />
  </div>
</div>
```

### Input with Glow Focus
```jsx
<div className="relative group">
  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition-all duration-300" />
  <input
    type="text"
    className="relative w-full px-4 py-3 bg-slate-800/50 border border-slate-700 focus:border-orange-500/60 rounded-lg text-white font-mono text-sm"
  />
</div>
```

### Password Input with Toggle
```jsx
const [showPassword, setShowPassword] = useState(false)

<div className="relative">
  <input
    type={showPassword ? 'text' : 'password'}
    className="w-full px-4 py-3 pr-12 bg-slate-800/50 border border-slate-700 focus:border-orange-500/60 rounded-lg text-white font-mono text-sm"
    placeholder="Enter password"
  />
  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
  >
    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
  </button>
</div>
```

### Select Dropdown
```jsx
<select className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 focus:border-orange-500/60 rounded-lg text-white font-mono text-sm appearance-none cursor-pointer">
  <option value="">Select option</option>
  <option value="1">Option 1</option>
  <option value="2">Option 2</option>
</select>
```

### Textarea
```jsx
<textarea
  rows="4"
  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 focus:border-orange-500/60 rounded-lg text-white font-mono text-sm resize-none"
  placeholder="Enter description..."
/>
```

---

## 🏷️ Badges & Tags

### Status Badge
```jsx
<span className="px-3 py-1 text-xs font-mono font-bold rounded-lg border bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
  ACTIVE
</span>
```

### Gradient Badge
```jsx
<span className="px-3 py-1 text-xs font-mono font-bold rounded-lg bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg">
  ADMIN
</span>
```

### Pill Badge
```jsx
<span className="px-2 py-1 text-[10px] font-mono font-bold rounded-full bg-slate-800/50 border border-slate-700/50 text-slate-400">
  SOON
</span>
```

### Count Badge
```jsx
<span className="px-2 py-1 text-xs font-mono font-bold rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400">
  24
</span>
```

### Role Badge with Icon
```jsx
<span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
  <Shield className="w-3 h-3" />
  ADMIN
</span>
```

---

## 🪟 Modals

### Basic Modal
```jsx
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-slate-900 border border-orange-500/20 rounded-xl shadow-2xl shadow-orange-500/10 max-w-2xl w-full animate-scale-in">

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
          <h3 className="text-xl font-black text-white" style={{ fontFamily: "'Archivo Black', sans-serif" }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-slate-800/50 rounded-lg transition-all"
          >
            <X className="w-5 h-5 text-slate-400 hover:text-white" />
          </button>
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
          <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-mono font-bold rounded-lg shadow-lg transition-all">
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}
```

### Confirmation Modal
```jsx
<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
  <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

  <div className="relative bg-slate-900 border border-red-500/20 rounded-xl shadow-2xl max-w-md w-full p-6">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-12 h-12 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-center">
        <AlertCircle className="w-6 h-6 text-red-400" />
      </div>
      <div>
        <h3 className="text-lg font-black text-white" style={{ fontFamily: "'Archivo Black', sans-serif" }}>
          CONFIRM ACTION
        </h3>
        <p className="text-xs font-mono text-slate-400">This action cannot be undone</p>
      </div>
    </div>

    <p className="text-sm font-mono text-slate-300 mb-6">
      Are you sure you want to proceed?
    </p>

    <div className="flex gap-2">
      <button
        onClick={onClose}
        className="flex-1 px-4 py-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white font-mono transition-all"
      >
        Cancel
      </button>
      <button
        onClick={onConfirm}
        className="flex-1 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 font-mono font-bold transition-all"
      >
        Confirm
      </button>
    </div>
  </div>
</div>
```

---

## 📊 Tables

### Data Table
```jsx
<div className="bg-slate-900/50 border border-slate-700/50 rounded-xl overflow-hidden">
  <table className="w-full">
    <thead className="bg-slate-900/80">
      <tr>
        <th className="px-6 py-4 text-left text-xs font-mono text-slate-500 uppercase tracking-wider">
          Name
        </th>
        <th className="px-6 py-4 text-left text-xs font-mono text-slate-500 uppercase tracking-wider">
          Status
        </th>
        <th className="px-6 py-4 text-left text-xs font-mono text-slate-500 uppercase tracking-wider">
          Actions
        </th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-t border-slate-700/50 hover:bg-slate-800/30 transition-colors">
        <td className="px-6 py-4 text-sm font-mono text-white">Item Name</td>
        <td className="px-6 py-4">
          <span className="px-2 py-1 text-xs font-mono font-bold rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            ACTIVE
          </span>
        </td>
        <td className="px-6 py-4">
          <button className="text-orange-400 hover:text-orange-300 font-mono text-sm">
            View
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## 📋 Lists

### Staggered List
```jsx
<ul className="space-y-3">
  {items.map((item, index) => (
    <li
      key={item.id}
      className="bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/50 hover:border-orange-500/30 rounded-lg p-4 transition-all duration-200"
      style={{ animation: `slideInRight 0.3s ease-out ${index * 0.05}s both` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-mono text-white">{item.name}</span>
        <ArrowRight className="w-4 h-4 text-slate-500" />
      </div>
    </li>
  ))}
</ul>
```

### List with Avatar
```jsx
<ul className="space-y-3">
  {users.map((user, index) => (
    <li
      key={user.id}
      className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4"
      style={{ animation: `slideInRight 0.3s ease-out ${index * 0.05}s both` }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg overflow-hidden">
          <img src={user.avatar} alt={user.name} className="w-full h-full" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-mono text-white font-bold">{user.name}</div>
          <div className="text-xs font-mono text-slate-400">{user.email}</div>
        </div>
        <span className="px-2 py-1 text-xs font-mono font-bold rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
          {user.role}
        </span>
      </div>
    </li>
  ))}
</ul>
```

---

## 🎯 Headers

### Page Header
```jsx
<div className="flex items-center justify-between mb-6">
  <div>
    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 mb-1" style={{ fontFamily: "'Archivo Black', sans-serif" }}>
      PAGE TITLE
    </h1>
    <p className="text-sm font-mono text-slate-400">Page description</p>
  </div>

  <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-mono font-bold rounded-lg shadow-lg">
    New Item
  </button>
</div>
```

### Section Header
```jsx
<div className="flex items-center gap-2 mb-4">
  <Shield className="w-5 h-5 text-orange-400" />
  <h2 className="text-lg font-black text-white" style={{ fontFamily: "'Archivo Black', sans-serif" }}>
    SECTION TITLE
  </h2>
</div>
```

---

## 🌫️ Empty States

### No Data
```jsx
<div className="text-center py-12">
  <div className="w-16 h-16 bg-slate-800/50 border border-slate-700/50 rounded-xl flex items-center justify-center mx-auto mb-4">
    <Inbox className="w-8 h-8 text-slate-600" />
  </div>
  <p className="text-slate-500 font-mono text-sm">No data available</p>
  <button className="mt-4 px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-lg text-orange-400 font-mono text-sm">
    Add New
  </button>
</div>
```

### Search No Results
```jsx
<div className="text-center py-12">
  <div className="w-16 h-16 bg-slate-800/50 border border-slate-700/50 rounded-xl flex items-center justify-center mx-auto mb-4">
    <Search className="w-8 h-8 text-slate-600" />
  </div>
  <p className="text-slate-500 font-mono text-sm mb-2">No results found</p>
  <p className="text-slate-600 font-mono text-xs">Try adjusting your search</p>
</div>
```

---

## ⏳ Loading States

### Spinner
```jsx
<div className="flex items-center justify-center py-12">
  <div className="w-16 h-16 border-4 border-slate-700 border-t-orange-500 rounded-full animate-spin" />
</div>
```

### Spinner with Text
```jsx
<div className="flex flex-col items-center justify-center py-12">
  <div className="w-16 h-16 border-4 border-slate-700 border-t-orange-500 rounded-full animate-spin mb-4" />
  <p className="text-slate-400 font-mono text-sm">Loading data...</p>
</div>
```

### Skeleton Card
```jsx
<div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6 animate-pulse">
  <div className="h-4 bg-slate-800 rounded w-1/4 mb-4" />
  <div className="space-y-2">
    <div className="h-3 bg-slate-800 rounded w-full" />
    <div className="h-3 bg-slate-800 rounded w-5/6" />
    <div className="h-3 bg-slate-800 rounded w-4/6" />
  </div>
</div>
```

### Progress Bar
```jsx
<div>
  <div className="flex justify-between text-xs font-mono text-slate-500 mb-2">
    <span>Progress</span>
    <span>75%</span>
  </div>
  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
    <div
      className="h-full bg-gradient-to-r from-orange-500 to-red-600 rounded-full transition-all duration-500"
      style={{ width: '75%' }}
    />
  </div>
</div>
```

---

## 📝 Usage Example

```jsx
import { Users, Plus } from 'lucide-react'

const ExamplePage = () => {
  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-600" style={{ fontFamily: "'Archivo Black', sans-serif" }}>
          TEAM MEMBERS
        </h1>
        <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-mono font-bold rounded-lg shadow-lg flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Member
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-900/50 border border-blue-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <Users className="w-8 h-8 text-blue-400" />
            <span className="text-3xl font-black text-white">12</span>
          </div>
          <div className="text-xs font-mono text-slate-500 uppercase">Total Members</div>
        </div>
        {/* More KPI cards... */}
      </div>

      {/* Data Card */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="px-6 py-4 bg-slate-900/80 border-b border-slate-700/50">
          <h2 className="text-lg font-black text-white" style={{ fontFamily: "'Archivo Black', sans-serif" }}>
            MEMBERS LIST
          </h2>
        </div>
        <div className="p-6">
          {/* Content */}
        </div>
      </div>
    </div>
  )
}
```

---

**For full design system, see: `DESIGN_SYSTEM.md`**
**For quick reference, see: `DESIGN_QUICK_REFERENCE.md`**
