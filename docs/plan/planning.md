# Plan de Desarrollo: Sistema de Seguimiento de Hábitos y Metas

## 1. Resumen Ejecutivo

Aplicación full-stack para monitoreo de hábitos diarios y semanales con dashboard interactivo, cálculo de rachas y visualización de estadísticas.

**Alcance del MVP:**
- Crear y eliminar hábitos (nombre, descripción, frecuencia)
- Registrar check-ins diarios/semanales
- Calcular estadísticas: rachas actuales/máximas, tasa de cumplimiento
- Visualizar progreso con gráficos interactivos

**Stack Tecnológico:**
- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Recharts
- **Backend**: Next.js API Routes, Prisma ORM
- **Base de datos**: SQLite embebida
- **Testing**: Vitest (unit/integration), Playwright (E2E)

---

## 2. Decisiones Arquitectónicas

### 2.1 Cálculo de Estadísticas
**Decisión:** Cálculo en tiempo real (compute-on-read)
- Las estadísticas se calculan al consultar, no se precomputan
- Lógica de negocio en funciones puras (`lib/calculations.ts`)
- Más simple de entender y mantener para contexto educativo
- Suficiente rendimiento para escala personal (<100 hábitos, ~1000 logs)

### 2.2 Validación de Datos
**Decisión:** Schemas declarativos con Zod
- Validación unificada cliente-servidor
- Types TypeScript inferidos automáticamente (`z.infer<>`)
- Mensajes de error estructurados y customizables
- Industry-standard, valioso para experiencia educativa

### 2.3 Data Fetching en Frontend
**Decisión:** Client Components con SWR
- Optimistic updates para UX fluida (check-ins instantáneos)
- Revalidación automática en focus/reconnect
- Cache del lado del cliente con deduplicación
- Más familiar para estudiantes que modelo híbrido Server/Client

### 2.4 Gestión de Hábitos
**Decisión:** Solo crear y eliminar (no edición)
- Simplifica lógica de negocio
- Evita complejidad de validar impacto en logs existentes
- Suficiente para MVP educativo

### 2.5 Timestamps de Check-ins
**Decisión:** Automáticos con `DateTime @default(now())`
- Registros siempre reflejan momento actual
- Sin complejidad de backfill o ajustes manuales

---

## 3. Arquitectura del Sistema

### Capa de Presentación (Frontend)
```
UI Components (React 19) → Custom Hooks (SWR) → API Routes
```

### Capa de API (Backend)
```
API Routes (Next.js) → Business Logic (funciones puras) → Prisma Client → SQLite
```

### Flujo de Datos
1. Usuario interactúa con componente UI (ej: click en botón "Completar hábito")
2. Hook SWR ejecuta mutation optimista + POST request
3. API Route valida con Zod → persiste con Prisma
4. SWR revalida automáticamente → UI actualizada

---

## 4. Plan de Desarrollo por Fases

### Fase 1: Fundamentos (Backend)
**Objetivo:** API funcional con validación y lógica de negocio

**Tareas:**
- Crear types TypeScript y schemas Zod para Habit, HabitLog, HabitStats
- Implementar funciones puras de cálculo de rachas y estadísticas
- Desarrollar API Routes CRUD para hábitos y logs
- Endpoint dedicado para estadísticas calculadas

**Entregables:**
- `src/types/habits.ts`
- `src/lib/validations.ts`
- `src/lib/calculations.ts`
- `src/app/api/habits/**`
- Tests unitarios de cálculos y API routes

---

### Fase 2: Data Fetching (Hooks)
**Objetivo:** Custom hooks con SWR para consumo de API

**Tareas:**
- Hook para listar hábitos con revalidación
- Hook para estadísticas de un hábito
- Hook para logs con mutations optimistas
- Configuración global SWR (retry, revalidateOnFocus)

**Entregables:**
- `src/hooks/useHabits.ts`
- `src/hooks/useHabitStats.ts`
- `src/hooks/useHabitLogs.ts`
- Tests de hooks con mocking

---

### Fase 3: UI Components (Frontend)
**Objetivo:** Componentes interactivos para gestión de hábitos

**Tareas:**
- Lista de hábitos con indicadores visuales
- Formulario de creación en Dialog (shadcn/ui)
- Tarjeta de hábito con check-in rápido
- Dashboard individual con estadísticas detalladas

**Entregables:**
- `src/components/HabitList.tsx`
- `src/components/HabitForm.tsx`
- `src/components/HabitCard.tsx`
- `src/components/HabitDashboard.tsx`
- Tests de componentes con React Testing Library

---

### Fase 4: Visualización de Datos
**Objetivo:** Gráficos interactivos con Recharts

**Tareas:**
- Componente de gráfico reutilizable
- Transformación de datos para visualización temporal
- Integración con theme de Tailwind (chart colors)
- Responsiveness móvil

**Entregables:**
- `src/components/HabitChart.tsx`
- Gráficos de línea/barras para progreso
- Tests de transformación de datos

---

### Fase 5: Integración y UX
**Objetivo:** Página principal completa con polish

**Tareas:**
- Página principal (`src/app/page.tsx`) con todas las features
- Loading states y skeletons
- Error boundaries
- Metadata SEO
- Validación responsiveness mobile-first

**Entregables:**
- `src/app/page.tsx` actualizado
- `src/app/loading.tsx`
- `src/app/error.tsx`
- Layout con metadata optimizada

---

### Fase 6: Testing Completo
**Objetivo:** Coverage 60%+ con tests en todos los niveles

**Tareas:**
- Tests unitarios de lógica de negocio
- Tests de integración de API routes
- Tests de componentes UI
- Tests E2E de flujos críticos (crear hábito, registrar check-in, ver estadísticas)

**Entregables:**
- Suite completa en `src/__tests__/`
- Tests E2E en `src/e2e/`
- Coverage report validado

---

## 5. Estrategia de Testing

### 5.1 Tests Unitarios (Vitest)
**Alcance:**
- Funciones puras de cálculo (`lib/calculations.ts`)
- Schemas Zod (`lib/validations.ts`)
- Helpers y utilidades

**Approach:**
- Happy path + edge cases + error cases
- Mínimo 3 tests por función crítica
- Fast execution (<100ms por suite)

### 5.2 Tests de Integración (Vitest)
**Alcance:**
- API Routes con Prisma
- Custom hooks con SWR
- Componentes con fetching

**Approach:**
- Mock de Prisma client para aislar DB
- Mock de fetch para hooks
- Validar contratos de API (request/response)

### 5.3 Tests de Componentes (React Testing Library)
**Alcance:**
- Componentes UI interactivos
- Forms con validación
- Estados de loading/error

**Approach:**
- Queries de accesibilidad (`getByRole`, `getByLabelText`)
- User events (click, type, submit)
- Assertions en DOM renderizado

### 5.4 Tests E2E (Playwright)
**Alcance:**
- Flujo completo: crear hábito → registrar check-in → ver estadísticas
- Validar persistencia en DB
- Multi-browser (Chromium, Firefox, WebKit)

**Approach:**
- Fixtures para setup de datos
- Page Object Model para reutilización
- Screenshots en failures

### 5.5 Métricas de Calidad
- **Coverage mínimo**: 60% (configurado en `vitest.config.ts`)
- **Lint**: ESLint debe pasar sin warnings
- **Type-check**: TypeScript strict mode sin errores
- **E2E pass rate**: 100% en happy paths

---

## 6. Dependencias entre Fases

```
Fase 1 (Backend) → Base para todas las demás
    ↓
Fase 2 (Hooks) → Requiere API Routes funcionando
    ↓
Fase 3 (UI) → Requiere hooks para fetching
    ↓
Fase 4 (Gráficos) → Requiere datos de hooks
    ↓
Fase 5 (Integración) → Ensambla todas las piezas
    ↓
Fase 6 (Testing) → Valida todo el sistema
```

**Orden de implementación:**
1. Fundamentos Backend (crítico)
2. Data Fetching (habilita frontend)
3. UI Components + Visualización (pueden paralelizarse parcialmente)
4. Integración UX
5. Testing completo (continuo desde Fase 1)

---

## 7. Criterios de Aceptación del MVP

### Funcionales
- ✅ Usuario puede crear hábitos con nombre, descripción opcional y frecuencia
- ✅ Usuario puede eliminar hábitos
- ✅ Usuario puede registrar check-ins de hábitos
- ✅ Sistema muestra racha actual de cada hábito
- ✅ Dashboard muestra estadísticas: racha máxima, total cumplimientos, tasa de cumplimiento
- ✅ Gráficos visualizan progreso temporal de cada hábito

### No Funcionales
- ✅ Interfaz responsive (mobile-first)
- ✅ Carga inicial < 2 segundos
- ✅ Check-ins se reflejan instantáneamente (optimistic updates)
- ✅ Coverage de tests ≥ 60%
- ✅ TypeScript strict sin errores
- ✅ ESLint pass sin warnings

### Técnicos
- ✅ Código modular con archivos < 500 líneas
- ✅ Componentes < 150 líneas
- ✅ Separación clara de responsabilidades (UI / hooks / logic / API)
- ✅ Documentación inline con JSDoc para funciones complejas
