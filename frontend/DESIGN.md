# Design System — Linear-like (neutral surfaces + green accent)

This is the contract for the frontend redesign. Every page/component must follow it.
The goal: a calm, dense, professional UI in the spirit of Linear — neutral near-black/gray
surfaces, hairline borders, small radii, quiet rows, and a **single green accent** (`#2ecc71`).

## Non-negotiable principles

- **One accent only: green.** `bg-primary` / `text-primary` / `border-primary` = `#2ecc71`.
  Kill every decorative violet (`#8b5cf6`, `violet-*`), blue, fuchsia, indigo, and the second
  green (`#2cfc7d`, `emerald-*`). Replace all with `primary` (green) or neutral.
- **Semantic colors stay, for meaning only:** success = `primary` (green), warning = `amber-500`,
  danger/destructive = `destructive` (red). Never use these decoratively.
- **Neutral surfaces via tokens, never hardcoded hex.** Use `bg-background`, `bg-card`,
  `bg-muted`, `text-foreground`, `text-muted-foreground`, `border` / `border-border`.
  Delete hardcoded `#0c0c14`, `#0d0d14`, `#080808`, `#030307`, `bg-gray-50 dark:bg-[#...]`, etc.
- **Small radii.** Use `rounded-md` (6px), `rounded-lg` (8px), `rounded-xl` (12px, panels max).
  **Never** `rounded-[2rem]`/`[2.5rem]`/`[3rem]`/`[4rem]` or oversized `rounded-full` blocks.
- **Hairline borders, minimal elevation.** `border` (1px, token color). Avoid `shadow-2xl`,
  colored glows (`shadow-[0_0_..._rgba(...)]`, `shadow-purple-500/...`), `backdrop-blur` glass.
  A modest `shadow-sm` is the ceiling for raised surfaces; modals/popovers may use the
  shadcn default ring.
- **Quiet typography.** Body `text-sm`. Page title `text-xl font-semibold`. Section title
  `text-sm font-medium`. Labels/meta `text-xs text-muted-foreground`.
  **Never** `font-black`, **never** blanket `uppercase tracking-[0.2em|0.4em|widest]`,
  **never** `clamp()` jumbo headings. Weights: `font-normal` / `font-medium` / `font-semibold`.
- **Quiet interactions.** Hover = subtle `hover:bg-muted/50` or `hover:text-foreground`.
  **No** `hover:scale-*`, `hover:-translate-y-*`, full-card color inversion
  (`hover:bg-black dark:hover:bg-white`), tilt, or ambient blob backgrounds.
- **Density.** Rows/list items ~`py-2`/`py-2.5`, `gap-2`/`gap-3`. Cards `p-4`/`p-5`.

## Must preserve (behavior — change classes, not logic)

- **Data:** `import api from '@/services/api'` (admin + doctor), `studentApi` (student),
  `useDoctorAuth().doctorApi(...)`, and `useStudentData()` cache context. Do NOT add per-page
  fetches where a context value exists. Keep every endpoint/verb/payload.
- **Auth:** `useStudentAuth()`, `useAuth()`, `useDoctorAuth()` — keep token/login/logout flows,
  redirects, and route guards.
- **i18n + RTL:** keep `useTranslation()` `t(...)` (never hardcode strings that were translated),
  `const isAr = i18n.language === 'ar'`, `dir`, and **logical properties** (`ps-/pe-/ms-/me-/start-/end-/text-start/text-end`). Never reintroduce `ml-/mr-/left-/right-/text-left`.
- **Theme:** `.dark`/`.light` on `<html>`; use `dark:` variants + tokens (which already theme).
  Avoid `isDarkMode` ternaries for surface colors — tokens handle both themes. Keep `isDarkMode`
  only where logic needs it.
- **Toasts:** `react-hot-toast` `toast.success(t(...))` / `toast.error(err.response?.data?.message || t(...))`.
- **Motion:** keep `AnimatePresence` mount/unmount + `App.jsx` page-direction logic working, but
  tone transitions to subtle fades/short slides. Remove `whileHover` scale/lift.
- **Icons:** `lucide-react` only (thin strokes fit Linear). Size `size-4` inline, `size-5` feature.

## Use these primitives (don't re-roll them)

shadcn/ui in `@/components/ui/*`: `Button` (variants: default=green primary, `outline`, `ghost`,
`secondary`, `destructive`, `link`; sizes `sm`/`default`/`lg`/`icon`/`icon-sm`), `Input`,
`Textarea`, `Select`, `Switch`, `Tabs`, `Badge`, `Avatar`, `Tooltip`, `DropdownMenu`, `Dialog`,
`Sheet`, `Card`, `Table`, `ScrollArea`, `Separator`, `Skeleton`, `Command`.

Composed helpers in `@/components/common`:
- `PageContainer` — centered max-width content frame with vertical rhythm. Wrap page content.
- `PageHeader` — `{ title, description?, actions?, icon? }`. Replaces the giant clamp/uppercase heroes.
- `SectionCard` — `{ title?, description?, actions?, children, bodyClassName? }`. A bordered panel.
- `StatCard` — `{ label, value, icon?, hint?, accent? }`. Compact metric tile.
- `StatusBadge` — `{ variant: neutral|success|warning|danger|accent }`. Status pill.
- `EmptyState` — `{ icon?, title, description?, action? }`.
- `LoadingState` — centered spinner for full-area loading. `Spinner` — inline spinner.
- `SearchInput` — input with leading search icon (RTL-aware). Pass standard input props.
- `Toolbar` — responsive row (search left, actions right) above tables/lists.
- `FormField` — `{ label, htmlFor?, required?, error?, hint?, children }`. Label + control + error.
- `Modal` — `{ open, onOpenChange, title?, description?, footer?, size: sm|md|lg|xl, children }`.
  Wraps shadcn `Dialog`. Use instead of hand-rolled `fixed inset-0` backdrops.
- `SegmentedTabs` — `{ value, onChange, options: [{value,label,icon?,count?}] }`. The pill toggle.
- `DataTable` — `{ columns: [{key,header,render?,headClassName?,cellClassName?}], rows, getRowKey?,
  loading?, empty?, onRowClick? }`. Dense table with built-in loading/empty.

Import: `import { PageHeader, SectionCard, DataTable } from '@/components/common'`.

## Old → new quick map

| Old | New |
|---|---|
| `bg-gray-50 dark:bg-[#0c0c14]` page bg | `bg-background` |
| `bg-white dark:bg-[#0d0d14]` card | `bg-card` + `border` (or `SectionCard`) |
| `border-gray-100 dark:border-white/5` | `border` (token) |
| giant `clamp()` uppercase `font-black` title | `<PageHeader title=... />` |
| violet `#8b5cf6` / `violet-*` / `bg-[#8b5cf6]` | `primary` (green) |
| `#2cfc7d` / `emerald-*` accent | `primary` (green) |
| `text-[10px] font-black uppercase tracking-[0.4em]` eyebrow | `text-xs text-muted-foreground` |
| `.admin-btn-primary` / hand-rolled buttons | `<Button>` |
| `.admin-input` / hand-rolled inputs | `<Input>` + `<FormField>` |
| `.admin-modal-backdrop/panel`, `fixed inset-0` modal | `<Modal>` |
| hand-rolled `<select>` + chevron | shadcn `<Select>` |
| `hover:-translate-y-2 hover:shadow-2xl`, tilt, blobs | remove |
| big stat/insight blocks (`bg-[#2cfc7d]` filled) | `<StatCard>` |
| dashed/opacity empty blocks | `<EmptyState>` |

Reference implementations: the redesigned shells (`Sidebar`, `AdminSidebar`, `DoctorSidebar`,
`Header`, `DoctorHeader`) and any already-migrated page show the exact target look — match them.
