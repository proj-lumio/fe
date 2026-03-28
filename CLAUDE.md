# Lumio Frontend

## Project

Frontend for Lumio — AI-powered document intelligence dashboard with GraphRAG. Connects to a FastAPI backend at `/api/v1`.

## Commands

- `npm run dev` — start dev server on port 3000
- `npm run build` — typecheck + production build
- `npx tsc -b --noEmit` — typecheck only

## Stack

- React 19 + TypeScript + Vite 8
- Tailwind CSS v4 (dark-only design)
- Zustand (state) + React Query (server state)
- Axios (API client with typed wrappers)
- Lucide React (icons)
- Recharts (charts)
- No Firebase, no OAuth — auth is simulated for now

## Design System

### Palette

- Background: `#0c0c0c`
- Card: `#1f1f1f` (via liquid containers)
- Primary: `#7966ff` (viola)
- Secondary: `#22cfff` (celeste)
- Foreground/onBackground: `#ffffff`
- Muted text: `#a9a9a9`
- Destructive: `#ff4b44`

### Liquid Containers

All cards and containers use the Flutter-inspired `LiquidContainerPainter` pattern:
- Fill: `rgba(255, 255, 255, 0.063)` (inverseSurface `0x10FFFFFF`)
- Border: gradient stroke (white 12% → 5% → 0% → 5% → 12%, 160deg)
- Corner radius: 24px for cards, 14px for inputs, 12px for buttons

CSS classes:
- `.liquid-card` — standard container (cards, wrappers)
- `.liquid-card-strong` — stronger fill (0.12) and border (0.25) for hero sections
- `.liquid-card-btn` — button variant with 12px radius
- `.liquid-input` — input field with focus border color change to primary

### Buttons

- All buttons have `border-radius: 12px` (iPad style)
- Bouncing press animation: `scale(0.98)` with `200ms ease-out` (Flutter AppButton pattern)
- Implemented in `Button` component with `onPointerDown/Up` state
- Inline buttons in pages use `active:scale-[0.98]` + `style={{ borderRadius: 12 }}`

### Font

- **Unbounded** everywhere (headings + body), loaded from Google Fonts
- Only Unbounded is loaded — no Inter, no SF Pro

### Custom Cursor

- Orange dot (`#7966ff`) that follows the mouse, hidden until first mousemove
- Grows to 24px on interactive elements (hover state)
- Native cursor hidden via transparent SVG fallback
- Hides on mouseleave, shows on mouseenter

## Naming Conventions

### Assets

- Images: `name_img.extension` (e.g., `bg_img.webp`)
- Icons: `name_ic.extension` (e.g., `lumio_ic.png`, `lumio_ic.ico`)
- Banners: `name_banner.extension` (e.g., `lumio_banner.png`)
- Fonts: `name_font.extension`

All assets go in `public/`.

### Code

- Pages: PascalCase in `src/pages/` (e.g., `Landing.tsx`, `CompanyDetail.tsx`)
- Components: PascalCase in `src/components/` (e.g., `LiquidInput.tsx`, `OpenSourceBanner.tsx`)
- UI primitives: lowercase in `src/components/ui/` (e.g., `button.tsx`, `card.tsx`)
- Stores: lowercase in `src/store/` (e.g., `auth.ts`, `locale.ts`)
- Hooks: camelCase with `use` prefix in `src/hooks/` (e.g., `useTranslations.ts`)

## Internationalization (i18n)

- Strings in `src/lib/i18n/en.ts` and `src/lib/i18n/it.ts`
- Default locale: `it` (Italian)
- Access via `useTranslations()` hook which returns the full translations object
- Locale stored in Zustand with persistence (`lumio-locale`)
- Language switch component: `LanguageSwitch` with fade transition on switch
- **All user-facing strings must go through i18n** — no hardcoded text in components
- When adding a string, add it to BOTH `en.ts` and `it.ts`
- Titles must stay on 2 lines max in both languages

## Validation

- Global validators in `src/lib/validators.ts`
- `validateEmail(email, t)` — format check
- `validatePassword(password, t)` — min 8 chars, at least 1 number, at least 1 special character
- Error messages come from i18n translations (passed as param)
- Errors display below each field, clear on input change

## API

- Base URL: `/api/v1` (proxied to backend at `localhost:8000`)
- Typed API wrappers in `src/lib/api.ts`: `companiesApi`, `documentsApi`, `chatApi`, `rankingsApi`, `analyticsApi`, `settingsApi`, `circlebackApi`, `healthApi`
- Types in `src/types/index.ts` — match the BE schemas exactly
- No invented features — only what the BE supports

## Pages

### Public
- `/` — Landing (bg blur, hero, email field, arc, open source banner)
- `/login` — Login/Register with animated switch, same visual language as landing

### Protected (behind `ProtectedRoute`)
- `/dashboard` — Stats overview
- `/companies` — Company list with CRUD
- `/companies/:id` — Company detail with tabs (Overview, Documents, Chat)
- `/chat` — Chat sessions with GraphRAG
- `/ranking` — Company rankings
- `/analytics` — Token usage analytics
- `/meetings` — CircleBack meetings integration
- `/settings` — Theme, language, notifications

## Visual Patterns

- Background: blurred image (`bg_img.webp`) + `bg-black/55` + `backdrop-blur-md`
- Side fades: wide black gradient from both sides (0.95 → transparent → 0.95)
- Header: top fade gradient (black 0.8 → transparent)
- SVG arcs: gradient stroke with faded ends, fill below follows the curve shape
- SVG wavy lines: organic vertical/diagonal strokes for visual interest
- Page transitions: `scale(0.95) + opacity(0) + blur(12px)` on exit, `translateY + scale + opacity` on enter
- Staggered entrance animations with delay (150ms increments)
- Autofill fix: `-webkit-box-shadow` hack to prevent white background on autofill

## Reusable Components

- `OpenSourceBanner` — standalone banner with icon, text, and GitHub link (used in landing + login)
- `LanguageSwitch` — IT/EN toggle with liquid style and fade transition
- `LiquidInput` — text input with liquid border, password variant has animated Eye/EyeOff toggle
- `CustomCursor` — global custom cursor, add once in App.tsx

## Important Rules

- Never add features not supported by the BE — check `be/README.md`
- Every component that shows text must use `useTranslations()`
- All containers are liquid — never use plain `border` or `bg-card` directly
- Buttons always have `borderRadius: 12` and press bounce
- No Firebase dependencies — was fully removed
- Restart dev server after CSS changes for best results
