# Front-End UI/UX Style Guide & Design System
**AFC Direct Sales / PHS Baby Shop Order Portal**

This document details the front-end design system, typography, layout guidelines, colors, reusable UI classes, and animations used in this project. Use this guide to ensure visual consistency when creating new components, pages, or systems.

---

## 1. Technical Framework Stack

*   **Core Engine:** Nuxt 3 (configured with `ssr: false` for SPA behavior, ideal for Telegram Mini App embedding).
*   **Styling Engine:** Tailwind CSS combined with custom post-processed styles (via `@apply` inside [main.css](file:///d:/xammp/htdocs/PHS-Baby-Shop-Order---AFC-Direct-sales/frontend/app/assets/css/main.css)).
*   **Fonts:** `Inter` (sans-serif) as the primary font family for clean readability, fallback to system UI defaults.
*   **Icons:** Powered by `@nuxt/icon` (utilizing Heroicons).

---

## 2. Color Palette & Typography

The system operates on a responsive color scheme with a fallback light system and a dedicated dark system activated via the container class `.sales-portal`.

### Colors

| Name | Hex / Class | Use Case |
| :--- | :--- | :--- |
| **Brand Primary** | `#2563EB` (`bg-blue-600` / `brand-blue`) | Accent points, main buttons, focus rings |
| **Brand Secondary** | `#3B82F6` (`bg-blue-500`) | Secondary focus colors, status badges |
| **Portal Background (Dark)** | `#0A1628` | Main canvas background for the app portal |
| **Portal Containers (Dark)** | `#0D1B31` | Cards, sidebars, headers backdrops |
| **White Background (Light)** | `#FFFFFF` (`bg-white`) | Default light canvas background |
| **Surface Background (Light)** | `#F8FAFC` (`bg-slate-50`) | Form inputs, alternate cards background |
| **Text Main** | `#020617` (`text-slate-900`) | Body copy, primary labels, headers (light mode) |
| **Text Muted** | `#64748B` / `#94A3B8` | Subtitles, disabled states, helpers |
| **Success Accent** | `emerald-400` / `bg-emerald-400` | Delivery app theme active tags, success states |
| **Highlight Accent** | `amber-400` / `bg-amber-400` | Active navigation links, warnings |

### Typography Scale

*   **Page Title:**
    *   *Class:* `.page-title`
    *   *Attributes:* `text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight`
*   **Labels (Form labels):**
    *   *Class:* `.label`
    *   *Attributes:* `block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1`
*   **Secondary/Section Subheaders:**
    *   *Attributes:* `text-[11px] uppercase font-black tracking-[0.2em]`

---

## 3. Structural Layouts

### A. Desktop Navigation (Sidebar-based)
*   A fixed sidebar (`w-64`) on the left with a dark theme container: `bg-[#0D1B31]/80 backdrop-blur-xl border-r border-white/5`.
*   Active state styled with: `text-amber-400 bg-amber-400/10 shadow-lg ring-1 ring-amber-400/20`.

### B. Mobile/Tablet Navigation (Responsive Top & Bottom Bar)
*   **Top Bar:** Height `h-16` with sticky positioning: `sticky top-0 z-40 bg-[#0D1B31]/80 backdrop-blur-xl border-b border-white/5`.
*   **Bottom Navigation Bar:** Fixed to the bottom. Integrates a safe area utility (`pb-safe`) for iOS and modern notch-displays: `fixed bottom-0 bg-[#0D1B31]/95 backdrop-blur-xl border-t border-white/5`.

---

## 4. UI Components & Classes

Apply these standard CSS classes defined in `main.css` to build uniform UI pieces:

### Cards & Panels

#### 1. Standard Card (`.card`)
An adaptive container that wraps inputs, text lists, and actions.
*   **Light Mode:** White background, thin border, and card shadow.
*   **Dark Mode (within `.sales-portal`):** Semi-transparent white overlay with backdrop blur.
```html
<div class="card">
  <!-- Content -->
</div>
```

#### 2. Glass Card (`.glass-card` / `.minimal-card`)
A modern panel featuring hover scaling and border highlights.
```html
<!-- Style scoped / main.css style -->
<div class="glass-card">
  <!-- Content -->
</div>
```

---

### Buttons & Inputs

#### 1. Primary Action Button (`.btn-primary`)
*   Includes `min-h-[44px]` to satisfy touch target guidelines for mobile screens.
*   Contains hover translation and active scaling down transitions.
```html
<button class="btn-primary">
  Submit Order
</button>
```

#### 2. Secondary Action Button (`.btn-secondary`)
*   Ideal for cancels, back buttons, or secondary options.
```html
<button class="btn-secondary">
  Cancel
</button>
```

#### 3. Modern Text Field (`.input-field-modern`)
*   Designed with extra left-right padding, border transformations on focus, and a slight transition animation.
```html
<div class="space-y-2">
  <label class="label">Customer Name</label>
  <input class="input-field-modern w-full" placeholder="Enter name" />
</div>
```

---

## 5. Animations and Micro-interactions

Use the following classes to provide polish to page loaders and state changes:

*   **Fade-in:** `.animate-fade-in`
    *   Transition-duration: `0.4s`
    *   Slight Y-translation from 4px to 0 for a smooth rise.
*   **Slide-up:** `.animate-slide-up`
    *   Used on toggle sections (e.g. "New Store Profile Details") to drop/slide into view from Y-translation of `20px`.
*   **Scale-in:** `.animate-scale-in`
    *   Fades and zooms component scales from 90% to 100% on entry.
*   **Border Pulse (Attention):** `.animate-pulse-border`
    *   Pulsates borders in red shade to prompt input errors or missing values.
*   **Active Scale State:** `active:scale-[0.98]`
    *   Applied to input elements and buttons to give a physical "pressing" effect.

---

## 6. How to Replicate This in a New Component

Here is a blueprint template of a styled page using the above visual system in a Vue page component:

```vue
<template>
  <div class="max-w-xl mx-auto space-y-6 px-4 py-8 animate-fade-in">
    <!-- Header -->
    <div class="flex items-center gap-4">
      <div class="w-12 h-12 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-600">
        <Icon name="heroicons:sparkles" class="w-6 h-6" />
      </div>
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">New Feature</h1>
        <p class="text-slate-500 text-[10px] font-black uppercase tracking-widest">Subtitle Description</p>
      </div>
    </div>

    <!-- Form Section inside Standard Card -->
    <div class="card space-y-6">
      <div class="flex items-center gap-2">
        <div class="w-1.5 h-4 bg-blue-600 rounded-full"></div>
        <h3 class="text-[11px] text-blue-600 uppercase font-black tracking-widest">Section Heading</h3>
      </div>

      <div class="space-y-4">
        <!-- Text Input -->
        <div class="space-y-2">
          <label class="label">Input Label</label>
          <input class="input-field-modern w-full" placeholder="Type here..." />
        </div>

        <!-- Custom Select dropdown with Chevron -->
        <div class="space-y-2">
          <label class="label">Select Option</label>
          <div class="relative">
            <select class="input-field-modern w-full appearance-none !pl-5 !pr-8 text-ellipsis">
              <option value="" disabled selected>Choose option</option>
              <option value="1">Option A</option>
              <option value="2">Option B</option>
            </select>
            <Icon name="heroicons:chevron-down" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>

    <!-- Action Bar -->
    <div class="flex justify-end gap-3 pt-2">
      <button class="btn-secondary flex-1 sm:flex-initial">Cancel</button>
      <button class="btn-primary flex-1 sm:flex-initial">Save Details</button>
    </div>
  </div>
</template>

<script setup lang="ts">
// Page logic
</script>

<style scoped>
/* Scoped overrides if required, but prefer using main.css utilities first */
</style>
```
