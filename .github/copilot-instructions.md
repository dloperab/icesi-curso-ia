# GitHub Copilot Instructions

Este es un proyecto usando Next.js 16 (App Router) con TypeScript, React 19, y Tailwind CSS 4.

## Estructura del proyecto
```
src/                    # Aplicación Next.js
├── app/                # App Router (pages, layouts, routes)
├── components/         # Componentes reutilizables
├── lib/                # Servicios, utils, API clients
├── hooks/              # Custom React hooks
├── types/              # TypeScript types/interfaces
├── __tests__/          # Tests unitarios (Vitest + React Testing Library)
└── public/             # Assets estáticos
```

---

## Diseño del Sistema
- Diagramas de Arquitectura - Modelo C4: `docs/architecture/`
- Diseño de Base de Datos: `docs/database/`

---

## Stack tecnológico actual
- **Framework**: Next.js 16.0.6 (App Router exclusivamente)
- **React**: 19.2.0 (Server Components por defecto)
- **Styling**: Tailwind CSS 4 (utility-first, mobile-first)
- **Validación**: Zod 4.x (runtime validation)
- **Data Fetching**: SWR 2.x (solo en Client Components)
- **Testing**: Vitest 4.x con happy-dom + React Testing Library
- **Linting**: ESLint 9 con eslint-config-next + prettier
- **Git hooks**: Husky + lint-staged (auto-format en pre-commit)

## Comandos de desarrollo
```bash
cd src                      # Todos los comandos desde /src
npm run dev                 # Dev server → http://localhost:3000
npm run build               # Build de producción
npm run lint                # ESLint check
npm run format              # Prettier format (auto-fix)
npm run type-check          # TypeScript check sin emitir
npm test                    # Vitest (watch mode)
npm run test:coverage       # Coverage report (mínimo 60%)
```

## Convenciones específicas del proyecto

### TypeScript
- **Strict mode habilitado**: `strict: true` en tsconfig.json
- **Path aliases**: `@/*` apunta a `src/*` (ej: `import { Button } from '@/components/Button'`)
- **Evitar `any`**: usar `unknown` y validar con Zod cuando sea necesario
- **Tipos explícitos**: siempre tipar props, estados y retornos de función

### Next.js App Router
- **Server Components por defecto**: solo usar `'use client'` cuando necesites hooks/eventos/browser APIs
- **Layouts compartidos**: usar `layout.tsx` para UI persistente entre páginas
- **Error handling**: crear `error.tsx` en segmentos de ruta para error boundaries
- **Loading states**: usar `loading.tsx` para estados de carga con Suspense
- **Route Handlers**: APIs en `app/api/**/route.ts` con funciones nombradas (GET, POST, etc.)
- **Metadata**: usar `generateMetadata` export o objeto `metadata` para SEO

### Estilos con Tailwind
- **Mobile-first**: aplicar breakpoints progressivamente (`sm:`, `md:`, `lg:`)
- **Dark mode**: usar clases `dark:` (ejemplo: `dark:bg-black`)
- **Fuentes optimizadas**: Geist Sans y Geist Mono ya configuradas (ver `app/layout.tsx`)

### Testing
- **Ubicación**: `src/__tests__/` reflejando estructura (ej: `__tests__/components/Button.test.tsx`)
- **Mínimo por feature**: 1 happy path + 1 edge case + 1 error case
- **React Testing Library**: preferir queries por accesibilidad (`getByRole`, `getByLabelText`)
- **Happy-dom**: ambiente más rápido que jsdom (configurado en vitest.config.ts)

### Límites de código
- **Máximo 500 líneas por archivo**: refactorizar si se excede
- **Máximo ~150 líneas por componente**: extraer a subcomponentes o hooks
- **Separación de responsabilidades**: lógica de negocio fuera de componentes UI

## Pre-commit workflow
Husky ejecuta automáticamente en cada commit:
1. ESLint --fix en archivos modificados
2. Prettier --write en archivos modificados
3. Configuración en `.lintstagedrc.mjs`

## Archivos de instrucciones complementarios
- `.github/instructions/coding-rules.instructions.md` → límites de archivos, testing, calidad
- `.github/instructions/frontend.instructions.md` → detalles Next.js, ejemplos de prompts

## Notas importantes
- **Validación de datos**: usar Zod para forms y API responses (ya instalado)
- **Data fetching en Server Components**: async/await directo, usar opciones de `fetch` de Next.js
- **Data fetching en Client Components**: usar SWR con tipos TypeScript
- **Variables de entorno**: `.env.local` (no commiteado), prefijo `NEXT_PUBLIC_` solo para cliente
- **Imágenes**: siempre usar `next/image` para optimización automática
