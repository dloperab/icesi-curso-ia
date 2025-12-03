---
applyTo: "src/**"
---

# Next.js con TypeScript

Instrucciones específicas para desarrollo con Next.js App Router. Complementa las reglas generales en `copilot-instructions.md` y `coding-rules.instructions.md`.

## Estructura y componentes
- Usar **App Router** (`app/` directory) exclusivamente.
- Carpetas: `app/`, `components/`, `lib/`, `hooks/`, `types/`, `public/`.
- **Server Components por defecto**; `'use client'` solo para interactividad (hooks, eventos, browser APIs).
- Si un componente excede ~150 líneas, dividir en componentes más pequeños o extraer lógica a hooks.
- TypeScript estricto: `strict: true` en `tsconfig.json` (ya configurado).

## Routing y navegación
- Aprovechar file-based routing del App Router.
- Usar `layout.tsx` para layouts compartidos y `loading.tsx` para estados de carga.
- Implementar `error.tsx` para manejo de errores en segmentos de ruta.
- Usar `next/link` para navegación y `useRouter` de `next/navigation` cuando sea necesario.
- Rutas dinámicas: `[param]`, catch-all: `[...slug]`.

## API Routes
- Route Handlers en `app/api/` para endpoints REST.
- Exportar funciones nombradas (`GET`, `POST`, `PUT`, `DELETE`).
- Validar request body con **Zod** (ya instalado).
- Manejar errores con `NextResponse` y códigos HTTP apropiados.
- Nunca exponer secretos en código cliente; usar variables de entorno (`.env.local`).

## Autenticación y middleware
- Implementar `middleware.ts` para proteger rutas.
- Validar sesiones en Server Components y API Routes.
- Variables de entorno: `.env.local` (nunca commiteado), prefijo `NEXT_PUBLIC_` solo para cliente.

## Estilos y UI
- **Tailwind CSS** como framework principal (ya configurado).
- CSS Modules para estilos específicos cuando sea necesario.
- Diseño responsive mobile-first.
- `next/image` para optimización de imágenes.
- `next/font` para optimización de fuentes.

## Accesibilidad y SEO
- Atributos `aria-*` en componentes interactivos.
- Elementos semánticos HTML (`<header>`, `<nav>`, `<main>`, `<footer>`).
- Metadata con `generateMetadata` o export de `metadata`.
- Open Graph y Twitter Card meta tags.
- Contraste WCAG AA mínimo.

## State Management
- Preferir estado local (`useState`) y composición.
- Context API para estado compartido simple.
- Para estado global complejo: Zustand o Jotai (instalar según necesidad).
- Evitar prop drilling; usar composición o context.

## Tipos y validación
- Definir interfaces/types en archivos `.types.ts` o carpeta `types/`.
- **Zod** para validación runtime (forms, API responses).
- Evitar `any`; usar `unknown` + validación.
- Tipos reutilizables para entidades del dominio.

## Ejemplos de prompts
```typescript
// copilot: Crear Server Component ProductList que fetch productos desde /api/products y renderice ProductCard para cada uno.
// copilot: Crear Client Component UserCard con props UserDto (id, name, email) y callback onEdit. Usar Tailwind.
// copilot: Generar Route Handler en app/api/products/route.ts con GET (listar) y POST (crear). Validar body con Zod.
// copilot: Crear custom hook useProducts que use SWR para fetch /api/products con tipos TypeScript.
// copilot: Implementar middleware.ts para proteger rutas /dashboard/* verificando auth.
// copilot: Crear layout.tsx con navbar, footer y metadata SEO para sección /blog.
```

## Herramientas configuradas
- ✅ **Vitest** + React Testing Library (unit/component tests)
- ✅ **Zod** (validación de datos)
- ✅ **SWR** (data fetching en Client Components)
- ✅ **Prettier** (formateo de código)
- ✅ **Husky + lint-staged** (pre-commit hooks)
- ✅ Scripts npm disponibles:
  - `npm run dev` - servidor desarrollo
  - `npm run build` - build producción
  - `npm run lint` - ESLint
  - `npm run format` - formatear código
  - `npm run type-check` - verificar tipos
  - `npm test` - ejecutar tests
  - `npm run test:coverage` - coverage report
