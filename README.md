```ascii
╔═══════════════════════════════════════════════════════════════════════╗
║                                                                       ║
║  WEB APP STARTER                                                      ║
║                                                                       ║
║  OPINIONATED TEMPLATE · REACT 18 · VITE · TAILWIND · TYPESCRIPT     ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝
```

A minimal, opinionated starter for rapidly prototyping web app ideas. Everything wired up — routing, state, forms, API layer, dark mode, UI components — so you can skip the setup and start building.

<br>

## ▓▓▓ STACK

<table>
<tr>
<td width="50%" valign="top">

**CORE**
```
React 18 + TypeScript
Vite 5
Tailwind CSS 3
React Router v6
```

</td>
<td width="50%" valign="top">

**DATA & FORMS**
```
TanStack Query v5
Zustand 4 (persisted)
React Hook Form + Zod
Axios (with interceptors)
```

</td>
</tr>
</table>

<br>

## ▓▓▓ WHAT'S INCLUDED

```
UI COMPONENTS    Button, Card, Input, Badge, Modal, Select, Spinner, Toast
HOOKS            useTheme, useLocalStorage, useDebounce, useDisclosure
API LAYER        Axios instance with auth + error interceptors
STATE            Zustand stores (UI + App) with persistence
ROUTING          React Router v6 with layout wrapper
UTILS            cn(), formatDate(), truncate(), groupBy()
TOOLING          ESLint, Prettier, TypeScript strict mode
```

<br>

## ▓▓▓ GET STARTED

```bash
git clone https://github.com/petermarciniak/starter my-app
cd my-app
npm install
cp .env.example .env
npm run dev       # http://localhost:3000
```

<br>

## ▓▓▓ STRUCTURE

```
src/
├── components/
│   ├── layout/      Layout, Header
│   └── ui/          All UI primitives
├── hooks/           Utility hooks
├── lib/             api.ts, utils.ts
├── pages/           Home, NotFound
├── store/           Zustand stores
└── types/           Shared TypeScript types
```

<br>

## ▓▓▓ ADD A PAGE

```tsx
// 1. Create src/pages/MyPage.tsx
// 2. Register in src/App.tsx
<Route path="/my-page" element={<MyPage />} />
// 3. Add nav link in src/components/layout/Header.tsx
```

<br>

## ▓▓▓ ENV VARS

```bash
VITE_APP_TITLE=My App
VITE_API_BASE_URL=http://localhost:8000/api
```

<br>

## ▓▓▓ SCRIPTS

```bash
npm run dev      # Dev server
npm run build    # Production build
npm run preview  # Preview build
npm run lint     # ESLint
npm run format   # Prettier
```

<br>

---

<div align="center">

```
Built and maintained by Peter Marc — product designer building with AI
```

**[← Back to profile](https://github.com/petermarciniak)**

</div>
