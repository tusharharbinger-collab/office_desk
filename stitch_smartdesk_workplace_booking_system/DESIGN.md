---
name: Workspace Booking Platform
colors:
  surface: '#0f131c'
  surface-dim: '#0f131c'
  surface-bright: '#353942'
  surface-container-lowest: '#0a0e16'
  surface-container-low: '#181c24'
  surface-container: '#1c2028'
  surface-container-high: '#262a33'
  surface-container-highest: '#31353e'
  on-surface: '#dfe2ee'
  on-surface-variant: '#bec8d2'
  inverse-surface: '#dfe2ee'
  inverse-on-surface: '#2c3039'
  outline: '#88929b'
  outline-variant: '#3e4850'
  surface-tint: '#89ceff'
  primary: '#89ceff'
  on-primary: '#00344d'
  primary-container: '#0ea5e9'
  on-primary-container: '#003751'
  inverse-primary: '#006591'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffb95f'
  on-tertiary: '#472a00'
  tertiary-container: '#d88a00'
  on-tertiary-container: '#4a2c00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c9e6ff'
  primary-fixed-dim: '#89ceff'
  on-primary-fixed: '#001e2f'
  on-primary-fixed-variant: '#004c6e'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#0f131c'
  on-background: '#dfe2ee'
  surface-variant: '#31353e'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 28px
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  margin: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes a hyper-modern, immersive dark-mode workspace booking experience tailored for high-performance enterprise environments. The aesthetic marries precise technical utilitarianism with futuristic glassmorphism, evoking a sense of frictionless efficiency, clarity, and architectural sophistication. 

### Brand Personality & Audience
- **Target Audience:** Hybrid enterprise teams, modern workplace experience managers, and tech-forward professionals who demand speed, visual clarity, and aesthetic distinction.
- **Emotional Response:** Calm control, futuristic precision, and absolute spatial awareness. The interface reduces cognitive load through luminous chromatic hierarchy, transforming complex floor plans and scheduling matrices into effortlessly readable interactions.

### Design Style
The design system relies heavily on **Glassmorphism** layered over a deep slate spatial canvas. Translucent frosted panels create contextual depth, separating information architecture cleanly without heavy borders. Glowing neon accents act as semantic beacons, guiding user actions and status interpretation with instant legibility.

## Colors

The color architecture is anchored by a profound deep slate foundation, elevated by translucent glass surfaces, and punctuated by high-vibrancy semantic neon indicators. Color serves an immediate functional purpose, dictating spatial availability and interactive states at a glance.

### Palette Strategy
- **Canvas & Neutral Foundation:** Deep slate (`#0B0F17`) forms the infinite immersive backdrop, paired with muted slate (`#334155`) for structural dividers, secondary borders, and inactive containers.
- **Primary Accent (Electric Sky Blue - `#0EA5E9`):** Commands user focus, denoting active selections, primary actions, and focused states.
- **Secondary Accent (Emerald Green - `#10B981`):** Represents positive states, confirming available seats, open resources, and successful transactions.
- **Semantic & Status Tones:** 
  - **Amber (`#F59E0B`):** Indicates temporary holds and pending reservation states.
  - **Crimson Red (`#EF4444`):** Denotes occupied spaces, booked seats, and destructive or error states.

## Typography

Typography in this design system is engineered for dense data displays, schedules, and floor-plan metrics. **Inter** is utilized across all weights and levels for its exceptional legibility at small sizes and crisp rendering on high-density displays.

### Numeric Integrity
All tabular data, timestamps, seat numbers, and pricing matrices must enforce **tabular numerals** (`font-variant-numeric: tabular-nums`) to ensure vertical alignment across schedules and reservation lists. Letter spacing on headlines is slightly tightened to project an engineered, modern architectural feel.

## Layout & Spacing

The layout model relies on a responsive **fluid grid system** that adapts dynamically to complex workplace floor plans, calendar timelines, and split-screen reservation dashboards. 

### Spacing Rhythm & Form Factors
- **Desktop:** Operates on a 12-column fluid grid with 24px gutters and generous outer margins (`2rem` to `3rem`) to let frosted glass panels breathe over the deep slate background.
- **Tablet:** Reflows into an 8-column layout, collapsing secondary sidebars into collapsible drawers while maintaining core seating matrices.
- **Mobile:** Drops to a single-column or 4-column micro-grid, prioritizing vertical scrolling for quick desk checks and mobile-optimized booking sheets.

## Elevation & Depth

Depth is articulated through **Glassmorphism** and ambient glow rather than traditional stark drop shadows. 

### Surface Stiering & Frosted Layers
- **Base Layer:** Deep slate background (`#0B0F17`).
- **Surface Panels:** Translucent dark slates with high backdrop-blur (16px–24px), subtle inner highlights, and faint border outlines (`1px solid rgba(255, 255, 255, 0.08)`) to catch imaginary ambient lighting.
- **Neon Halos:** Interactive or selected elements project a low-opacity, wide-radius colored glow (e.g., electric sky blue or emerald green) to signal active focus and state without visual clutter.

## Shapes

A balanced **Rounded** shape language (`roundedness: 2`) is applied across all UI elements, softening the cold precision of the dark interface while maintaining professional rigor.

### Corner Radii Guidelines
- **Micro Elements (Badges, tags, chips): Use fully rounded pill shapes to isolate status indicators clearly.**
- **Standard Components (Inputs, buttons, cards):** Apply standard radii (`0.5rem` for base elements, `1rem` for large container cards) to harmonize with the soft geometry of modern hardware and operating systems.
- **Modals & Overlays:** Feature generous radii (`1rem` to `1.5rem`) to frame frosted glass containers gracefully against the deep canvas.

## Components

Components are built to balance high-density data management with tactile, luminous interactivity.

### Buttons
- **Primary:** Electric sky blue (`#0EA5E9`) solid or luminous frosted background with crisp label typography and a subtle hover glow.
- **Secondary / Ghost:** Transparent frosted glass surface with light border outlines and subtle white-to-slate hover states.
- **Destructive:** Styled with crimson red (`#EF4444`) accents for cancelations or booking removals.

### Chips & Status Badges
- Utilize pill shapes with soft background tinting paired with neon text and indicator dots:
  - **Available:** Emerald green (`#10B981`) dot and text.
  - **Booked:** Crimson red (`#EF4444`).
  - **Hold:** Amber (`#F59E0B`).
  - **Selected:** Electric sky blue (`#0EA5E9`).

### Input Fields & Controls
- Rendered as frosted glass wells (`background: rgba(255, 255, 255, 0.03)`) with muted slate borders. Focus states trigger an immediate electric sky blue outline and subtle internal glow. Checkboxes and radios feature glowing neon accents when toggled.

### Cards & Seat Nodes
- **Workspace Cards:** Frosted glass containers displaying amenity icons, live occupancy meters, and quick-action booking triggers.
- **Seat Nodes (Floor Plan):** Compact interactive pins or blocks on the map. Their resting state reflects their live booking status via the core neon color tokens, scaling smoothly on hover to invite interaction.

### Additional Specialized Components
- **Interactive Floor Plan Matrix:** Zoomable, pan-enabled canvas overlaying seat nodes atop workplace blueprints.
- **Time-Grid Scheduler:** Horizontal timeline scrubber utilizing tabular numbers for rapid multi-hour desk reservations.