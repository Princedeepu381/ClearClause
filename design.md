# Design System & UI Architecture: CLEARCLAUSE

## 1. Visual Identity (ClearClause Aegis Dark-Space)
- **Design Philosophy:** High-density, technical, dashboard-driven interface optimized for dense legal text analysis. Prioritizes readability, data hierarchy, and professional credibility.
- **Background Architecture:** Solid Deep Charcoal (`#0a0a0a`) base with elevated Obsidian (`#171717`) surface panels, creating layered depth through contrast.
- **Component Outlines:** Crisp structural borders (`#333333`) forming a clear grid-based interface that separates functional regions.
- **Semantic Risk-Color System:**
  - **High Severity:** High-Contrast Red (`#ef4444`) — immediate danger, urgent attention required
  - **Medium Severity:** Warning Amber (`#f59e0b`) — notable concern, review recommended
  - **Low Severity:** Information Blue (`#3b82f6`) — advisory, low immediate impact
- **Typography:** `Inter` served via **Google Fonts** through the Next.js `next/font/google` optimization layer — zero local font files, automatic subsetting, and layout shift prevention.

## 2. Landing Page Architecture (Single-Page Scroll)

### Hero Section
- Full-width hero with ambient blue gradient glow effect (CSS `blur` filter, no image assets)
- Animated status pill ("AI That's Accountable By Design") with pulsing amber indicator
- Primary headline in bold white (`text-5xl md:text-7xl`) with call-to-action buttons
- "Launch Live Demo" button scrolls to the interactive dashboard section

### Problem Statement Section
- Three-column responsive card grid highlighting contract risk categories: **Employment**, **Privacy**, **Vendor Terms**
- Each card features a Lucide icon, bold category title, and concise risk description
- Background elevation shift to Obsidian (`#171717`) with top/bottom border separation

### Live Demo Dashboard (The Ingestion & War Room Matrix)
- **Split-Pane Layout:** Two-column grid on desktop (`lg:grid-cols-2`), stacking vertically on mobile
- **Left Panel (Contract Input Stream):**
  - Full-height `<textarea>` for pasting contract text
  - Header bar with panel title and structural separator
  - Bottom action bar with "Run Intelligence Matrix" button (blue accent, full-width)
  - Loading state with animated spinner and "Analyzing Contract..." text
- **Right Panel (Tactical Briefing Feed):**
  - Empty state: Brain icon with instructional text
  - Active state: Scrollable list of Risk Cards with "X Risks Detected" badge
  - Error state: Red-bordered alert panel with error message

### Tech Stack Section
- Visual showcase of **Google Gemini 2.5 Flash**, **Google Cloud Run**, and **Google Artifact Registry**
- Card-based layout with service descriptions emphasizing Google-native architecture

## 3. Specialized UI Components

### Telemetry Risk Cards
- Obsidian panel with rounded corners and subtle border
- Severity badge (colored pill: red/amber/blue) with icon indicator
- Plain-English explanation as primary heading (white, `text-lg font-semibold`)
- Consequence text in muted gray (`text-gray-400`) for secondary reading
- Interactive "View Original Clause" toggle button revealing:
  - Collapsible panel with monospace font rendering of the raw legal text
  - Black background with structural top border for visual separation
- Hover state: Border brightens to `gray-600` with smooth transition

### Navigation Bar
- Sticky top navigation with backdrop blur and semi-transparent background
- CLEARCLAUSE wordmark (Shield icon + tracking-widest text) on left
- Internal anchor links (Problem, Solution, Live Demo) on right
- Responsive: hidden on mobile, visible on `md:` breakpoint and above

## 4. Accessibility & Responsiveness
- Full keyboard navigation support for all interactive elements
- Semantic HTML5 structure (`<nav>`, `<section>`, `<main>`, `<footer>`)
- Single `<h1>` per page with proper heading hierarchy (`h1 > h2 > h3`)
- Responsive grid system: 3-column on desktop, single-column on mobile
- Sufficient color contrast ratios for all text on dark backgrounds
- Focus-visible outlines for keyboard users