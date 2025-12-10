# Plan de Tareas de Desarrollo
## Sistema de Seguimiento de Hábitos y Metas

**Fecha de creación**: 2 de diciembre de 2025  
**Proyecto**: Habit & Goals Tracking System (MVP)  
**Contexto**: Proyecto educativo full-stack con Next.js 16, React 19, Prisma, y Tailwind CSS 4

---

## Resumen Ejecutivo

Este plan descompone el desarrollo del MVP en **5 fases secuenciales** con **25 tareas** organizadas siguiendo el camino crítico: Backend → Hooks → UI → Integración → Testing Final. El proyecto implementa un sistema de seguimiento de hábitos con dashboard interactivo, cálculo de rachas y visualización de estadísticas.

**Estimación total**: 38-49 horas (1-2 semanas educativas)  
**Dependencia crítica**: Fase 1 desbloquea todo el resto del desarrollo

---

## Fase 0: Diseño y Documentación

### Arquitectura del Sistema
- [x] Crear diagrama de Contexto C4 (nivel 1):
    - [x] Diseñar diagrama con MermaidJS en `docs/architecture/c4-context.md`
    - [x] Documentar actores externos (Usuario, Base de Datos SQLite)
    - [x] Definir alcance del sistema MVP
- [x] Crear diagrama de Contenedores C4 (nivel 2):
    - [x] Diseñar diagrama con MermaidJS en `docs/architecture/c4-containers.md`
    - [x] Documentar componentes: Next.js App (Frontend + Backend), Prisma ORM, SQLite
    - [x] Describir flujo de datos entre contenedores

### Diseño de Base de Datos
- [x] Crear diagrama Entidad-Relación (ER):
    - [x] Diseñar diagrama con MermaidJS en `docs/database/er-diagram.md`
    - [x] Validar contra schema Prisma existente (`src/prisma/schema.prisma`)
    - [x] Documentar modelos `Habit` y `HabitLog`, relaciones, tipos de datos y constraints

---

## Fase 1: Backend Foundations

### Tipos y Validaciones
- [x] Definir tipos TypeScript y esquemas Zod:
    - [x] Crear interfaces TypeScript en `src/types/habits.ts` (Habit, HabitLog, HabitStats) con JSDoc
    - [x] Crear esquemas Zod en `src/lib/validations.ts` (crear hábito, crear log, query params)
    - [x] Configurar inferencia TypeScript desde Zod (`z.infer<typeof schema>`)
    - [x] Validar alineación con Prisma schema

### Lógica de Negocio
- [x] Implementar funciones de cálculo de estadísticas en `src/lib/calculations.ts`:
    - [x] `calculateCurrentStreak()` - racha actual basada en frecuencia (daily/weekly)
    - [x] `calculateMaxStreak()` - racha máxima histórica
    - [x] `calculateCompletionRate()` - tasa de completitud porcentual
    - [x] `getNextExpectedDate()` - próxima fecha esperada de check-in
    - [x] Crear suite de tests unitarios en `src/__tests__/lib/calculations.test.ts` (mínimo 3 tests por función: caso normal, caso límite, caso error)
    - [x] Documentar algoritmos con JSDoc y alcanzar 100% coverage

### API Routes - Hábitos
- [x] Crear endpoints CRUD para hábitos:
    - [x] Implementar GET `/api/habits` - listar hábitos ordenados por `createdAt`
    - [x] Implementar POST `/api/habits` - crear hábito con validación Zod (status 201)
    - [x] Implementar DELETE `/api/habits/[id]` - eliminar hábito con cascade delete (status 204)
    - [x] Agregar manejo de errores Prisma (404, 500) con respuestas JSON descriptivas
    - [x] Crear tests de integración en `src/__tests__/app/api/habits.test.ts` (happy path, validación, errores)

### API Routes - Check-ins
- [x] Crear endpoint para registrar check-ins:
    - [x] Implementar POST `/api/habits/[id]/logs` en `src/app/api/habits/[id]/logs/route.ts`
    - [x] Configurar timestamp automático con `DateTime @default(now())`
    - [x] Manejar constraint de unicidad `unique([habitId, completedAt])` (status 409 en duplicado)
    - [x] Validar existencia de hábito (404 si no existe)
    - [x] Crear tests de integración en `src/__tests__/app/api/logs.test.ts` (crear exitoso, duplicado, habit inexistente)

### API Routes - Estadísticas
- [x] Crear endpoint para estadísticas calculadas:
    - [x] Implementar GET `/api/habits/[id]/stats` en `src/app/api/habits/[id]/stats/route.ts`
    - [x] Integrar con funciones de `lib/calculations.ts` (compute-on-read)
    - [x] Agregar soporte para query params `from` y `to` (filtro temporal con Prisma)
    - [x] Retornar JSON con: `habitId, currentStreak, maxStreak, completionRate, nextExpectedDate, totalLogs`
    - [x] Crear tests de integración en `src/__tests__/app/api/stats.test.ts` (con logs, sin logs, con filtro temporal)

---

## Fase 2: Data Fetching Layer

### Custom Hooks - Hábitos
- [x] Crear hook `useHabits` para CRUD de hábitos:
    - [x] Implementar SWR con key `/api/habits` en `src/hooks/useHabits.ts`
    - [x] Agregar función `createHabit()` con optimistic update (agregar a UI inmediatamente)
    - [x] Agregar función `deleteHabit()` con optimistic update (remover de UI inmediatamente)
    - [x] Configurar rollback automático en caso de error
    - [x] Crear tests con mock de fetch en `src/__tests__/hooks/useHabits.test.tsx` (fetch exitoso, crear, eliminar, rollback)

### Custom Hooks - Check-ins
- [x] Crear hook `useHabitLogs` para registrar check-ins:
    - [x] Implementar función `createLog()` en `src/hooks/useHabitLogs.ts`
    - [x] Configurar POST a `/api/habits/[id]/logs` con indicador de loading
    - [x] Revalidar múltiples keys: `useHabits` y `useHabitStats` tras crear log
    - [x] Manejar error 409 (duplicado) con mensaje amigable
    - [x] Crear tests con mock en `src/__tests__/hooks/useHabitLogs.test.tsx` (crear exitoso, duplicado, revalidación)

### Custom Hooks - Estadísticas
- [x] Crear hook `useHabitStats` para obtener estadísticas:
    - [x] Implementar SWR con key dinámica `/api/habits/${id}/stats?from=...&to=...` en `src/hooks/useHabitStats.ts`
    - [x] Agregar parámetros opcionales `from` y `to` (Date) para filtrado temporal
    - [x] Configurar revalidación automática on focus
    - [x] Crear tests con mock en `src/__tests__/hooks/useHabitStats.test.tsx` (fetch exitoso, con filtro temporal, habit inexistente)

### Configuración Global
- [x] Configurar SWR global en `src/app/layout.tsx`:
    - [x] Agregar `SWRConfig` provider envolviendo `{children}`
    - [x] Configurar `revalidateOnFocus: true` y `revalidateOnReconnect: true`
    - [x] Configurar `shouldRetryOnError: false` (evitar retry en 404/409)
    - [x] Crear fetcher global con manejo de errores JSON (lanzar error para status ≥400)

---

## Fase 3: UI Components

### Formularios
- [x] Crear componente `HabitForm`:
    - [x] Implementar Client Component en `src/components/HabitForm.tsx` con `'use client'`
    - [x] Agregar inputs: nombre (required), descripción (optional), frecuencia (radio: daily/weekly)
    - [x] Integrar validación con Zod schema de `lib/validations.ts`
    - [x] Conectar con `useHabits().createHabit` y mostrar loading state en botón
    - [x] Implementar reset form tras éxito y cerrar Dialog automáticamente
    - [x] Usar componentes shadcn/ui: `Dialog`, `Input`, `Label`, `Textarea`, `Button`
    - [x] Crear tests con RTL en `src/__tests__/components/HabitForm.test.tsx` (submit exitoso, validación, error de API)

### Tarjetas de Hábito
- [x] Crear componente `HabitCard`:
    - [x] Implementar Client Component en `src/components/HabitCard.tsx`
    - [x] Mostrar: nombre, descripción truncada, frecuencia (Badge), racha actual
    - [x] Agregar botón check-in (Checkbox) llamando `useHabitLogs().createLog`
    - [x] Agregar botón "Ver detalles" con navegación a dashboard individual
    - [x] Agregar botón eliminar con Dialog de confirmación
    - [x] Implementar indicadores visuales: racha activa (🔥), sin racha (⚫)
    - [x] Usar componentes shadcn/ui: `Card`, `Badge`, `Checkbox`, `Button`
    - [x] Crear tests con RTL en `src/__tests__/components/HabitCard.test.tsx` (render, check-in, eliminar, navegación)

### Listas y Contenedores
- [x] Crear componente `HabitList`:
    - [x] Implementar Client Component en `src/components/HabitList.tsx`
    - [x] Consumir `useHabits()` y `useHabitStats()` para cada habit
    - [x] Implementar grid responsivo: 1 columna (mobile), 2 (tablet), 3 (desktop)
    - [x] Agregar estado vacío con mensaje y botón "Crear primer hábito"
    - [x] Agregar loading state con skeletons (Tailwind `animate-pulse`)
    - [x] Agregar error state con mensaje y botón "Reintentar"
    - [x] Crear tests con RTL en `src/__tests__/components/HabitList.test.tsx` (lista con hábitos, estado vacío, loading, error)

### Visualización de Datos
- [x] Crear componente `HabitChart` para gráficos con Recharts:
    - [x] Implementar Client Component en `src/components/HabitChart.tsx`
    - [x] Soportar tipos de gráfico: `line` y `bar` (prop `type`)
    - [x] Implementar responsive container con ajuste a viewport
    - [x] Integrar tema Tailwind en colores de gráfico
    - [x] Agregar tooltip con información detallada
    - [x] Crear utilidad `transformLogsToChartData()` en `src/lib/chartUtils.ts` (agrupar logs por día/semana)
    - [x] Crear tests en `src/__tests__/components/HabitChart.test.tsx` (render con datos, datos vacíos)
    - [x] Crear tests de transformación en `src/__tests__/lib/chartUtils.test.ts`

### Dashboard Individual
- [x] Crear componente `HabitDashboard`:
    - [x] Implementar Client Component en `src/components/HabitDashboard.tsx`
    - [x] Consumir `useHabitStats(habitId)` con filtro temporal (últimos 30 días por defecto)
    - [x] Mostrar métricas en grid de cards: racha actual, racha máxima, tasa completitud, total logs
    - [x] Integrar `HabitChart` para visualización de progreso temporal
    - [x] Agregar selector de rango temporal: 7 días, 30 días, 90 días
    - [x] Agregar botón volver a lista principal
    - [x] Implementar loading state con skeletons y error state con fallback
    - [x] Crear tests con RTL en `src/__tests__/components/HabitDashboard.test.tsx` (render con datos, cambio de rango, error)

---

## Fase 4: Integration & Polish

### Integración de Página Principal
- [x] Actualizar página principal en `src/app/page.tsx`:
    - [x] Reemplazar código starter de Next.js con aplicación completa
    - [x] Agregar header con título "Mis Hábitos" y botón "Crear Hábito" abriendo `HabitForm`
    - [x] Integrar `HabitList` como contenido principal
    - [x] Implementar layout responsivo con Tailwind container/padding
    - [ ] Crear test E2E en `src/e2e/` (abrir app, ver lista, crear hábito)

### Estados de Carga y Error
- [x] Crear archivos especiales de Next.js para UX:
    - [x] Crear `src/app/loading.tsx` con skeleton de página completa (mismo grid que HabitList, `animate-pulse`)
    - [x] Crear `src/app/error.tsx` como Client Component con error boundary
    - [x] Implementar en error.tsx: mensaje amigable, botón "Intentar de nuevo", log a consola
    - [x] Validar manualmente simulando error en API

### SEO y Metadata
- [x] Optimizar metadata y SEO en `src/app/layout.tsx`:
    - [x] Actualizar export `metadata` con título: "Sistema de Seguimiento de Hábitos"
    - [x] Agregar descripción concisa del propósito del app
    - [x] Configurar Open Graph metadata (título, descripción, imagen)
    - [x] Configurar Twitter Card metadata
    - [x] Agregar `viewport` y `themeColor` configuration
    - [x] Crear/agregar favicon en `public/`
    - [x] Validar con Open Graph Debugger y Twitter Card Validator

### Validación de Responsiveness
- [ ] Auditoría y ajustes mobile-first:
    - [ ] Probar en Chrome DevTools: iPhone SE (375px), iPad (768px), Desktop (1920px)
    - [ ] Verificar breakpoints Tailwind: `sm:640px`, `md:768px`, `lg:1024px`
    - [ ] Validar touch targets ≥44x44px en mobile (botones, checkboxes)
    - [ ] Verificar texto legible sin zoom (mínimo 16px base)
    - [ ] Validar gráficos con scroll horizontal si necesario
    - [ ] Ejecutar Lighthouse Mobile audit (target score ≥90)
    - [ ] Documentar breakpoints usados en README

---

## Fase 5: Testing & Quality Assurance

### Tests Unitarios
- [x] Completar cobertura de unit tests (target ≥60%):
    - [x] Validar coverage de `lib/calculations.ts` (target 100%)
    - [x] Crear tests de Zod schemas en `lib/validations.ts` (success, fail, edge cases)
    - [x] Validar coverage de `lib/chartUtils.ts`
    - [x] Ejecutar `npm run test:coverage` y validar threshold
    - [x] Asegurar suite completa corre en <10 segundos

### Tests de Componentes
- [x] Validar cobertura de component tests con RTL:
    - [x] Verificar tests de `HabitForm` (render, interacción, error)
    - [x] Verificar tests de `HabitCard` (render, check-in, eliminar)
    - [x] Verificar tests de `HabitList` (lista, vacío, loading, error)
    - [x] Verificar tests de `HabitChart` (render, datos vacíos)
    - [x] Verificar tests de `HabitDashboard` (render, cambio rango, error)
    - [x] Validar uso de queries de accesibilidad (`getByRole`, `getByLabelText`)

### Tests End-to-End
- [x] Crear tests E2E con Playwright para flujos críticos:
    - [x] Flujo 1 en `src/e2e/create-habit-flow.spec.ts`: Abrir app → Click "Crear Hábito" → Llenar form → Submit → Verificar en lista
    - [x] Flujo 2 en `src/e2e/checkin-flow.spec.ts`: Click checkbox check-in → Verificar racha actualizada → Refrescar página → Validar persistencia
    - [x] Flujo 3 en `src/e2e/dashboard-flow.spec.ts`: Click "Ver detalles" → Verificar métricas → Verificar gráfico → Cambiar rango temporal (7→30 días)
    - [x] Configurar setup (crear datos de test) y teardown (limpiar DB)
    - [x] Validar tests pasan en Chromium, Firefox, WebKit

### Validación de Calidad
- [x] Verificar thresholds y estándares del proyecto:
    - [x] Ejecutar `npm run lint` sin errores
    - [x] Ejecutar `npm run type-check` sin errores TypeScript
    - [x] Verificar ningún archivo >500 líneas (script o revisión manual)
    - [x] Verificar componentes <150 líneas
    - [x] Validar pre-commit hooks funcionando (Husky + lint-staged)
    - [x] Actualizar `src/README.md` con instrucciones de desarrollo
    - [x] Crear `.env.example` si se usan variables de entorno

---

---

### Tarea 1.3: Crear API Routes para Gestión de Hábitos
**Descripción**: Implementar endpoints CRUD para hábitos: listar (GET), crear (POST), eliminar (DELETE).

**Archivos a crear**:
- `src/app/api/habits/route.ts` - GET y POST handlers
- `src/app/api/habits/[id]/route.ts` - DELETE handler
- `src/__tests__/app/api/habits.test.ts` - Tests de integración

**Especificación de endpoints**:

**GET `/api/habits`**
- Response: `{ habits: Habit[] }`
- Ordenar por `createdAt` descendente

**POST `/api/habits`**
- Body: `{ name: string, description?: string, frequency: 'daily' | 'weekly' }`
- Validar con Zod schema
- Response: `{ habit: Habit }`
- Status 201 on success

**DELETE `/api/habits/[id]`**
- Cascade delete logs (configurado en Prisma)
- Response: `{ success: true }`
- Status 204 on success

**Criterios de aceptación**:
- Validación Zod en POST con respuestas 400 descriptivas
- Manejo de errores Prisma (404, 500)
- Tests con Prisma mock: happy path, validación, errores
- JSON responses con status codes correctos

**Prioridad**: 1 (Crítica - base de APIs)  
**Dependencias**: Tarea 1.1  
**Estimación**: 2-3 horas

---

### Tarea 1.4: Crear API Route para Registro de Check-ins
**Descripción**: Implementar endpoint para registrar check-ins diarios/semanales.

**Archivos a crear**:
- `src/app/api/habits/[id]/logs/route.ts` - POST handler
- `src/__tests__/app/api/logs.test.ts` - Tests de integración

**Especificación de endpoint**:

**POST `/api/habits/[id]/logs`**
- Body: `{ note?: string }` (fecha automática)
- Validar unicidad con constraint de Prisma `unique([habitId, completedAt])`
- Response: `{ log: HabitLog }`
- Status 201 on success, 409 on duplicate

**Criterios de aceptación**:
- Usar `DateTime @default(now())` para timestamp automático
- Manejo de error de duplicado (409 Conflict)
- Verificar existencia de habit (404 si no existe)
- Tests: crear log exitoso, duplicado, habit inexistente

**Prioridad**: 2 (Alta - habilita check-ins)  
**Dependencias**: Tarea 1.3  
**Estimación**: 1-2 horas

---

### Tarea 1.5: Crear API Route para Estadísticas Calculadas
**Descripción**: Implementar endpoint que calcula y retorna estadísticas en tiempo real usando funciones de `lib/calculations.ts`.

**Archivos a crear**:
- `src/app/api/habits/[id]/stats/route.ts` - GET handler
- `src/__tests__/app/api/stats.test.ts` - Tests de integración

**Especificación de endpoint**:

**GET `/api/habits/[id]/stats`**
- Query params: `from?: ISO8601, to?: ISO8601` (filtro temporal)
- Fetch habit + logs en una query con `include`
- Response: `{ habitId, currentStreak, maxStreak, completionRate, nextExpectedDate, totalLogs }`
- Compute-on-read (sin cache)

**Criterios de aceptación**:
- Reutilizar funciones de `lib/calculations.ts`
- Filtrado temporal opcional con Prisma queries
- 404 si habit no existe
- Tests: con logs, sin logs, con filtro temporal

**Prioridad**: 2 (Alta - habilita dashboard)  
**Dependencias**: Tarea 1.2, Tarea 1.3  
**Estimación**: 2 horas

---

## Fase 2: Data Fetching Layer

**Objetivo**: Crear custom hooks con SWR para comunicación cliente-servidor con optimistic updates.

---

### Tarea 2.1: Crear Hook useHabits para CRUD de Hábitos
**Descripción**: Implementar hook SWR con mutaciones optimistas para listar, crear y eliminar hábitos.

**Archivos a crear**:
- `src/hooks/useHabits.ts` - Hook con SWR y mutaciones
- `src/__tests__/hooks/useHabits.test.ts` - Tests con mock de fetch

**API del hook**:
```typescript
const {
  habits: Habit[] | undefined,
  isLoading: boolean,
  error: Error | undefined,
  createHabit: (data: CreateHabitInput) => Promise<Habit>,
  deleteHabit: (id: string) => Promise<void>,
  mutate: () => void
} = useHabits()
```

**Criterios de aceptación**:
- SWR con key `'/api/habits'`
- Optimistic update en `createHabit`: agregar inmediatamente a UI
- Optimistic update en `deleteHabit`: remover inmediatamente de UI
- Rollback automático en caso de error
- Tests: fetch exitoso, crear, eliminar, rollback en error

**Prioridad**: 3 (Media - habilita UI)  
**Dependencias**: Tarea 1.3  
**Estimación**: 2 horas

---

### Tarea 2.2: Crear Hook useHabitLogs para Check-ins
**Descripción**: Implementar hook SWR para registrar check-ins con feedback optimista.

**Archivos a crear**:
- `src/hooks/useHabitLogs.ts` - Hook con mutación
- `src/__tests__/hooks/useHabitLogs.test.ts` - Tests con mock

**API del hook**:
```typescript
const {
  createLog: (habitId: string, note?: string) => Promise<HabitLog>,
  isCreating: boolean
} = useHabitLogs()
```

**Criterios de aceptación**:
- POST a `/api/habits/[id]/logs`
- Revalidar `useHabits` y `useHabitStats` tras crear log (múltiples keys)
- Manejo de error 409 (duplicado) con mensaje amigable
- Indicador de loading durante creación
- Tests: crear exitoso, duplicado, revalidación

**Prioridad**: 3 (Media - habilita check-ins)  
**Dependencias**: Tarea 1.4, Tarea 2.1  
**Estimación**: 1.5 horas

---

### Tarea 2.3: Crear Hook useHabitStats para Estadísticas
**Descripción**: Implementar hook SWR para obtener estadísticas calculadas de un hábito.

**Archivos a crear**:
- `src/hooks/useHabitStats.ts` - Hook de lectura
- `src/__tests__/hooks/useHabitStats.test.ts` - Tests con mock

**API del hook**:
```typescript
const {
  stats: HabitStats | undefined,
  isLoading: boolean,
  error: Error | undefined
} = useHabitStats(habitId: string, from?: Date, to?: Date)
```

**Criterios de aceptación**:
- SWR con key dinámica: `/api/habits/${id}/stats?from=...&to=...`
- Parámetros de fecha opcionales para filtrado temporal
- Revalidación automática on focus
- Tests: fetch exitoso, con filtro temporal, habit inexistente

**Prioridad**: 3 (Media - habilita dashboard)  
**Dependencias**: Tarea 1.5  
**Estimación**: 1.5 horas

---

### Tarea 2.4: Configurar SWR Global
**Descripción**: Crear configuración global de SWR en layout raíz con políticas de retry, revalidación y error handling.

**Archivos a modificar**:
- `src/app/layout.tsx` - Agregar `SWRConfig` provider

**Configuración requerida**:
- `revalidateOnFocus: true` (refetch al volver a tab)
- `revalidateOnReconnect: true`
- `shouldRetryOnError: false` (evitar retry en 404/409)
- `dedupingInterval: 2000` (evitar requests duplicadas)
- Fetcher global con manejo de errores JSON

**Criterios de aceptación**:
- Provider envuelve `{children}` en layout
- Fetcher lanza errores tipados para status ≥400
- No afecta Server Components (solo Client)

**Prioridad**: 3 (Media - mejora UX)  
**Dependencias**: Tarea 2.1  
**Estimación**: 0.5 horas

---

## Fase 3: UI Components

**Objetivo**: Construir componentes React Client para interacción del usuario con hábitos.

---

### Tarea 3.1: Crear Componente HabitForm
**Descripción**: Formulario en Dialog (shadcn/ui) para crear nuevos hábitos con validación Zod.

**Archivos a crear**:
- `src/components/HabitForm.tsx` - Client Component con `'use client'`
- `src/__tests__/components/HabitForm.test.tsx` - Tests con RTL

**Características**:
- Inputs: nombre (required), descripción (optional), frecuencia (radio: daily/weekly)
- Validación con Zod schema de `lib/validations.ts`
- Integración con `useHabits().createHabit`
- Loading state en botón submit
- Reset form tras éxito
- Cerrar Dialog automáticamente tras crear

**Criterios de aceptación**:
- Usar componentes shadcn/ui: `Dialog`, `Input`, `Label`, `Textarea`, `Button`
- Mensajes de error Zod bajo inputs
- Accesibilidad: labels asociados, ARIA attributes
- Tests: submit exitoso, validación campos, error de API

**Prioridad**: 4 (Media - UI básica)  
**Dependencias**: Tarea 2.1  
**Estimación**: 2 horas

---

### Tarea 3.2: Crear Componente HabitCard
**Descripción**: Tarjeta individual de hábito con botón de check-in rápido y preview de racha actual.

**Archivos a crear**:
- `src/components/HabitCard.tsx` - Client Component
- `src/__tests__/components/HabitCard.test.tsx` - Tests con RTL

**Características**:
- Mostrar: nombre, descripción (truncada), frecuencia (Badge), racha actual
- Botón de check-in (Checkbox) llamando `useHabitLogs().createLog`
- Botón "Ver detalles" → navegar a dashboard individual
- Botón eliminar (con confirmación) → `useHabits().deleteHabit`
- Indicador visual: racha activa (🔥), sin racha (⚫)

**Props**:
```typescript
{ habit: Habit, stats: HabitStats }
```

**Criterios de aceptación**:
- Usar componentes shadcn/ui: `Card`, `Badge`, `Checkbox`, `Button`
- Confirmación de eliminación con `Dialog`
- Loading state en botón check-in
- Feedback visual tras check-in (optimistic update)
- Tests: render, check-in, eliminar, navegación

**Prioridad**: 4 (Media - UI principal)  
**Dependencias**: Tarea 2.1, Tarea 2.2, Tarea 2.3  
**Estimación**: 2.5 horas

---

### Tarea 3.3: Crear Componente HabitList
**Descripción**: Lista responsiva que renderiza múltiples `HabitCard` con manejo de estados vacío/loading/error.

**Archivos a crear**:
- `src/components/HabitList.tsx` - Client Component
- `src/__tests__/components/HabitList.test.tsx` - Tests con RTL

**Características**:
- Consumir `useHabits()` y `useHabitStats()` para cada habit
- Grid responsivo: 1 columna (mobile), 2 (tablet), 3 (desktop)
- Estado vacío: mensaje + botón "Crear primer hábito"
- Loading: skeletons con Tailwind animate-pulse
- Error: mensaje con botón "Reintentar"

**Criterios de aceptación**:
- Tailwind classes: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`
- Accesibilidad: lista semántica (`<ul>`, `<li>`)
- Tests: lista con hábitos, estado vacío, loading, error

**Prioridad**: 4 (Media - UI contenedora)  
**Dependencias**: Tarea 3.2  
**Estimación**: 1.5 horas

---

### Tarea 3.4: Crear Componente HabitChart
**Descripción**: Componente reutilizable de gráfico con Recharts para visualizar progreso temporal.

**Archivos a crear**:
- `src/components/HabitChart.tsx` - Client Component
- `src/lib/chartUtils.ts` - Transformación de datos para Recharts
- `src/__tests__/components/HabitChart.test.tsx` - Tests de render
- `src/__tests__/lib/chartUtils.test.ts` - Tests de transformación

**Características**:
- Tipos de gráfico soportados: line, bar (prop `type`)
- Recibir logs transformados en formato `{ date: string, value: number }[]`
- Responsive: ajustar dimensiones según viewport
- Tema Tailwind: colores primarios del theme
- Tooltip con información detallada

**Props**:
```typescript
{ data: ChartDataPoint[], type: 'line' | 'bar', title?: string }
```

**Funciones en `chartUtils.ts`**:
- `transformLogsToChartData(logs: HabitLog[], groupBy: 'day' | 'week'): ChartDataPoint[]`
- Agrupar logs por período, contar completados

**Criterios de aceptación**:
- Recharts: `<ResponsiveContainer>`, `<LineChart>`, `<BarChart>`
- Mobile-friendly: scroll horizontal si excede ancho
- Tests: render con datos, datos vacíos, transformación correcta

**Prioridad**: 4 (Media - visualización)  
**Dependencias**: Tarea 2.3  
**Estimación**: 2.5 horas

---

### Tarea 3.5: Crear Componente HabitDashboard
**Descripción**: Vista detallada de un hábito individual con estadísticas completas y gráfico temporal.

**Archivos a crear**:
- `src/components/HabitDashboard.tsx` - Client Component
- `src/__tests__/components/HabitDashboard.test.tsx` - Tests con RTL

**Características**:
- Recibir `habitId` como prop
- Consumir `useHabitStats(habitId)` con filtro temporal (últimos 30 días)
- Mostrar métricas: racha actual, racha máxima, tasa completitud, total logs
- Gráfico de progreso con `HabitChart` (últimos 30 días)
- Selector de rango temporal: 7 días, 30 días, 90 días
- Botón volver a lista principal

**Layout**:
- Header: nombre del hábito, botones acción
- Grid de métricas: 4 cards con estadísticas
- Gráfico full-width debajo

**Criterios de aceptación**:
- Loading state con skeletons
- Error state con fallback
- Actualización automática al cambiar rango temporal
- Tests: render con datos, cambio de rango, error

**Prioridad**: 5 (Media-Baja - feature avanzada)  
**Dependencias**: Tarea 3.2, Tarea 3.4  
**Estimación**: 2.5 horas

---

## Fase 4: Integration & Polish

**Objetivo**: Ensamblar componentes en página principal, agregar loading/error states, optimizar SEO y responsiveness.

---

### Tarea 4.1: Actualizar Página Principal (app/page.tsx)
**Descripción**: Reemplazar página de inicio por defecto con aplicación completa integrando todos los componentes.

**Archivos a modificar**:
- `src/app/page.tsx` - Reescribir completamente

**Estructura de página**:
- Header: título "Mis Hábitos", botón "Crear Hábito" abriendo `HabitForm`
- Main: `HabitList` ocupando contenido principal
- Footer opcional: créditos/links

**Criterios de aceptación**:
- Eliminar código de starter de Next.js
- Server Component wrapper con Client Components embebidos
- Layout responsivo con Tailwind container/padding
- Tests E2E: abrir app, ver lista, crear hábito (añadir a `e2e/`)

**Prioridad**: 6 (Media-Baja - integración)  
**Dependencias**: Tarea 3.1, Tarea 3.3  
**Estimación**: 1.5 horas

---

### Tarea 4.2: Agregar Loading y Error States
**Descripción**: Crear archivos especiales de Next.js para estados de carga y errores globales/por segmento.

**Archivos a crear**:
- `src/app/loading.tsx` - Skeleton de página completa
- `src/app/error.tsx` - Error boundary con botón reset

**Loading.tsx**:
- Skeleton simulando layout de `HabitList`
- Tailwind: `animate-pulse` en placeholders
- Mismo grid responsive que HabitList

**Error.tsx**:
- Client Component con `'use client'`
- Props: `error: Error, reset: () => void`
- Mensaje amigable, botón "Intentar de nuevo"
- Log error a consola (desarrollo) o servicio externo (producción)

**Criterios de aceptación**:
- Loading se muestra durante Suspense boundaries
- Error boundary captura errores de Server/Client Components
- Diseño consistente con UI principal
- Tests manuales: simular error en API

**Prioridad**: 6 (Media-Baja - UX)  
**Dependencias**: Tarea 4.1  
**Estimación**: 1.5 horas

---

### Tarea 4.3: Optimizar Metadata y SEO
**Descripción**: Actualizar metadata en `app/layout.tsx` para mejorar SEO y apariencia en redes sociales.

**Archivos a modificar**:
- `src/app/layout.tsx` - Actualizar export `metadata`

**Metadata requerida**:
- `title`: "Sistema de Seguimiento de Hábitos"
- `description`: Descripción concisa del propósito del app
- Open Graph: título, descripción, imagen (crear OG image simple)
- Twitter Card metadata
- `viewport`: configuración responsive
- `themeColor`: color primario del theme

**Criterios de aceptación**:
- Metadata tipo `Metadata` de Next.js
- Validar con herramientas: Open Graph Debugger, Twitter Card Validator
- Favicon presente en `public/`
- Tests manuales: compartir URL en Discord/Twitter

**Prioridad**: 7 (Baja - polish)  
**Dependencias**: Tarea 4.1  
**Estimación**: 1 hora

---

### Tarea 4.4: Validar Responsiveness Mobile-First
**Descripción**: Auditoría y ajustes finales de responsiveness en todos los componentes con enfoque mobile-first.

**Checklist de validación**:
- [ ] Probar en Chrome DevTools: iPhone SE, iPad, Desktop 1920px
- [ ] Verificar breakpoints Tailwind: `sm:640px`, `md:768px`, `lg:1024px`
- [ ] Touch targets ≥44x44px en mobile (botones, checkboxes)
- [ ] Texto legible sin zoom (mínimo 16px base)
- [ ] Gráficos con scroll horizontal si necesario
- [ ] Forms usables en mobile (inputs grandes, spacing adecuado)
- [ ] Navegación táctil sin overlaps

**Herramientas**:
- Chrome DevTools (Device Mode)
- Lighthouse Mobile audit
- Pruebas en dispositivo real (opcional)

**Criterios de aceptación**:
- Lighthouse Mobile score ≥90
- Sin scroll horizontal no intencional
- Todas las interacciones accesibles en touch
- Documentar breakpoints usados en README

**Prioridad**: 7 (Baja - QA)  
**Dependencias**: Tarea 4.1, Tarea 4.2  
**Estimación**: 2 horas

---

## Fase 5: Testing & Quality Assurance

**Objetivo**: Completar cobertura de tests, crear E2E flows críticos, validar umbrales de calidad.

---

### Tarea 5.1: Completar Cobertura de Unit Tests
**Descripción**: Revisar y completar tests unitarios para alcanzar ≥60% de coverage en módulos críticos.

**Áreas a cubrir**:
- `lib/calculations.ts` → target 100% (ya incluido en Tarea 1.2)
- `lib/validations.ts` → tests de Zod schemas (success, fail, edge cases)
- `lib/chartUtils.ts` → tests de transformación de datos
- `lib/utils.ts` → tests de utilidades (si aplica)

**Comando de validación**:
```bash
npm run test:coverage
```

**Criterios de aceptación**:
- Coverage report muestra ≥60% global
- Módulos críticos (calculations, validations) con 90-100%
- Tests descriptivos con naming: `describe > it('should ...')`
- Fast tests: suite completa <10 segundos

**Prioridad**: 8 (Baja - continuous)  
**Dependencias**: Tareas 1.2, 3.4  
**Estimación**: 2 horas

---

### Tarea 5.2: Completar Component Tests con RTL
**Descripción**: Asegurar que todos los componentes Client tengan tests de accesibilidad y user interactions.

**Componentes a testear** (ya incluidos en tareas anteriores):
- `HabitForm` → Tarea 3.1
- `HabitCard` → Tarea 3.2
- `HabitList` → Tarea 3.3
- `HabitChart` → Tarea 3.4
- `HabitDashboard` → Tarea 3.5

**Patrón de tests**:
- Renderizar con providers necesarios (SWRConfig mock)
- Queries por accesibilidad: `getByRole`, `getByLabelText`, `getByText`
- User events: `userEvent.click()`, `userEvent.type()`
- Assertions de DOM: `expect(...).toBeInTheDocument()`

**Criterios de aceptación**:
- Todos los componentes en `src/components/` tienen archivo `.test.tsx`
- Al menos 3 tests por componente: render, interacción, error
- Usar `@testing-library/user-event` para eventos
- Validar accesibilidad: roles, labels, ARIA

**Prioridad**: 8 (Baja - continuous)  
**Dependencias**: Tareas 3.1-3.5  
**Estimación**: Incluido en tareas de componentes

---

**Flujo 1: Crear Hábito**
1. Abrir app
2. Click botón "Crear Hábito"
3. Llenar formulario (nombre, frecuencia)
4. Submit
5. Verificar hábito aparece en lista

**Flujo 2: Registrar Check-in**
1. Partir de hábito existente
2. Click checkbox de check-in en HabitCard
3. Verificar indicador visual de racha actualizada
4. Verificar persistencia (refrescar página)

**Flujo 3: Ver Dashboard**
1. Click "Ver detalles" en HabitCard
2. Verificar métricas de estadísticas visibles
3. Verificar gráfico renderizado
4. Cambiar rango temporal (7 → 30 días)
5. Verificar actualización de gráfico

**Comandos**:
```bash
npx playwright test --ui  # Modo interactivo
npx playwright test        # Headless
```

**Criterios de aceptación**:
- Tests pasan en Chromium, Firefox, WebKit
- Usar `page.getByRole()` para queries de accesibilidad
- Setup: crear datos de test, teardown: limpiar DB
- Screenshots on failure para debugging
- Tests independientes (no dependen entre sí)

**Prioridad**: 8 (Baja - QA final)  
**Dependencias**: Tarea 4.1  
**Estimación**: 3 horas

---

### Tarea 5.4: Validar Thresholds y Linting
**Descripción**: Verificación final de límites de código, linting y estándares de proyecto.

**Checklist de validación**:
- [ ] Ejecutar `npm run lint` sin errores
- [ ] Ejecutar `npm run type-check` sin errores TypeScript
- [ ] Verificar ningún archivo >500 líneas (script o manual)
- [ ] Verificar componentes <150 líneas
- [ ] Coverage ≥60% (ya validado en Tarea 5.1)
- [ ] Pre-commit hooks funcionando (Husky + lint-staged)
- [ ] README.md actualizado con instrucciones de desarrollo

**Scripts útiles**:
```bash
npm run lint          # ESLint check
npm run format        # Prettier fix
npm run type-check    # TypeScript
npm run test:coverage # Coverage report
```

**Criterios de aceptación**:
- Todos los comandos de calidad pasan
- No warnings críticos en build (`npm run build`)
- Documentación actualizada en `src/README.md`
- `.env.example` con variables necesarias (si aplica)

**Prioridad**: 9 (Baja - final check)  
**Dependencias**: Todas las anteriores  
**Estimación**: 1 hora

---

## Resumen de Dependencias Críticas

```
Fase 0 (Diseño)
  ↓
Fase 1 (Backend) ← BLOQUEA TODO
  ↓
Fase 2 (Hooks)
  ↓
Fase 3 (UI Components) + Fase 3.4 (Charts) [paralelas]
  ↓
Fase 4 (Integración)
  ↓
Fase 5 (Testing Final)
```

**Camino crítico secuencial**:
1. Tarea 1.1 → 1.2 → 1.3 → 1.4 → 1.5 (Backend completo)
2. Tarea 2.1 → 2.2 → 2.3 → 2.4 (Hooks completos)
3. Tarea 3.1 → 3.2 → 3.3 (UI lista)
4. Tarea 4.1 → 4.2 (Integración)
5. Tarea 5.3 (E2E final)

**Trabajo paralelizable**:
- Tarea 3.4 (Charts) puede hacerse junto a Tareas 3.1-3.3
- Tarea 0.1-0.3 (Diagramas) pueden hacerse antes o durante Fase 1
- Testing (5.1, 5.2) es continuo desde Fase 1

---

## Estimaciones Totales por Fase

| Fase | Tareas | Estimación |
|------|--------|------------|
| Fase 0: Diseño | 3 | 3-4 horas |
| Fase 1: Backend | 5 | 8-11 horas |
| Fase 2: Hooks | 4 | 5-6 horas |
| Fase 3: UI | 5 | 10-12 horas |
| Fase 4: Integración | 4 | 6-8 horas |
| Fase 5: Testing | 4 | 6-8 horas |
| **TOTAL** | **25** | **38-49 horas** |

**Recomendación para contexto educativo**: Distribuir en 2 semanas (20-25 horas/semana) con sesiones de 3-4 horas por día.

---

## Notas Finales

### Consideraciones de Implementación
- **Commits frecuentes**: Commit tras completar cada tarea (no esperar a fase completa)
- **Branches**: Considerar feature branches para fases grandes (opcional)
- **Code review**: Si es proyecto grupal, peer review antes de merge
- **Testing continuo**: No dejar tests para el final (TDD recomendado)

### Herramientas Recomendadas
- **Prisma Studio**: `npx prisma studio` para inspeccionar DB durante desarrollo
- **Thunder Client / Postman**: Testear APIs antes de crear hooks
- **React DevTools**: Debuggear componentes y performance
- **VS Code Extensions**: Prisma, ESLint, Tailwind CSS IntelliSense

### Recursos de Aprendizaje
- [Next.js 15 Docs](https://nextjs.org/docs) - App Router, Server Components
- [Prisma Docs](https://www.prisma.io/docs) - Queries, relations
- [SWR Docs](https://swr.vercel.app) - Data fetching, mutations
- [Recharts Docs](https://recharts.org) - Ejemplos de gráficos
- [Testing Library](https://testing-library.com/react) - Mejores prácticas

---

**Última actualización**: 2 de diciembre de 2025  
**Autor**: Sistema de Planificación Automatizada  
**Proyecto**: icesi-curso-ia-prep (Branch: 01-planning-design)
