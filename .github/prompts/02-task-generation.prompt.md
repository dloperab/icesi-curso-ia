---
agent: Plan
---

# Objetivo

Generar un **plan de desarrollo detallado** para el Sistema de Seguimiento de Hábitos y Metas, guardándolo en `docs/plan/planning.md`.

---

# Descripción del proyecto

Aplicación full-stack para **Sistema de Seguimiento de Hábitos y Metas**, dirigida a usuarios que desean monitorear su progreso en la formación de hábitos diarios y semanales.

**Componentes:**
- **Frontend**: Dashboard interactivo con visualización de progreso y estadísticas
- **Backend**: API integrada en Next.js para gestión de hábitos y logs
- **Base de datos**: SQLite embebida con Prisma ORM

**Funcionalidades principales:**
- Crear, listar y gestionar hábitos (nombre, descripción, frecuencia)
- Registrar check-ins diarios/semanales
- Calcular estadísticas: rachas actuales/máximas, tasa de cumplimiento
- Visualizar progreso con gráficos y dashboard interactivo

---

# Información técnica de referencia

## Stack tecnológico

### Frontend
- **Framework**: Next.js 16+ (App Router)
- **Lenguaje**: TypeScript
- **UI**: Tailwind CSS + shadcn/ui (componentes)
- **Gráficos**: Recharts
- **Ubicación**: `src/app/` (App Router structure)

### Backend
- **Framework**: Next.js API Routes (App Router)
- **Lenguaje**: TypeScript
- **ORM**: Prisma
- **Base de datos**: SQLite (local, embebida)
- **Ubicación**: `src/app/api/`

### Testing
- **Unit/Integration**: Vitest
- **E2E**: Playwright
- **Coverage**: c8 (integrado con Vitest)
- **Ubicación tests**: `src/__tests__/` y `*.test.ts` co-located

### Tooling
- **Linter**: ESLint
- **Formatter**: Prettier
- **Type checking**: TypeScript strict mode
- **Git hooks**: Husky (opcional)

### Base de datos
- **Motor**: SQLite (archivo local)
- **ORM**: Prisma
- **Script de creación**: `scripts/database/init-db.sql`
- **Ubicación**: `src/prisma/habits.db`
- **Estado**: Tablas creadas, sin datos iniciales

---

# Modelo de datos

## Entidades principales

### Habit (Hábito)
```prisma
model Habit {
  id          String   @id @default(cuid())
  name        String
  description String?
  frequency   String   // 'daily' | 'weekly'
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  logs        HabitLog[]
}
```

### HabitLog (Registro de cumplimiento)
```prisma
model HabitLog {
  id          String   @id @default(cuid())
  habitId     String
  habit       Habit    @relation(fields: [habitId], references: [id], onDelete: Cascade)
  completedAt DateTime @default(now())
  note        String?
  createdAt   DateTime @default(now())
  
  @@unique([habitId, completedAt]) // No duplicados mismo día
}
```

### HabitStats (Calculado, no persistido)
```typescript
interface HabitStats {
  habitId: string
  currentStreak: number
  maxStreak: number
  totalCompletions: number
  completionRate: number
  lastCompletedAt: Date | null
}
```

---

## Detalles de funcionalidades

### Backend (API Routes)
- Endpoints para crear, listar, obtener y eliminar hábitos
- Endpoints para registrar y listar logs de cumplimiento
- Cálculo de estadísticas: rachas (actual/máxima), total cumplimientos, tasa de cumplimiento

### Frontend
- **Página principal**: Lista de hábitos, check-in rápido, indicador de rachas
- **Formulario de creación**: Campos con validación en tiempo real
- **Dashboard de hábito**: Estadísticas detalladas, gráficos, historial, acciones (editar/eliminar)

---

# Atributos de calidad

## Factibilidad
- Arquitectura simple que se pueda implementar en un tiempo razonable
- Sin dependencias externas complejas (base de datos embebida)
- Features incrementales que se construyen una sobre otra

## Mantenibilidad
- Código bien estructurado siguiendo patrones de Next.js
- Separación clara de responsabilidades (components, lib, api)
- Tests que documenten comportamiento esperado
- Tipos TypeScript estrictos

## Testabilidad
- Funciones puras para lógica de negocio (cálculo de rachas)
- Componentes desacoplados de lógica
- Mocks simples para base de datos en tests

---

# Patrón de arquitectura

## Capas de arquitectura

### Capa de presentación (Frontend)
```
Next.js Pages/Components (UI)
    ↓
Custom Hooks (estado local, fetching)
    ↓
API Client functions (fetch wrappers)
    ↓
API Routes (Backend)
```

### Capa de API (Backend)
```
API Routes (Next.js handlers)
    ↓
Business Logic (lib/calculations, validations)
    ↓
Prisma Client (ORM)
    ↓
SQLite Database
```

---

# Entregables esperados

El archivo `docs/plan/planning.md` debe contener:

## 1. Resumen ejecutivo
- Descripción breve del proyecto y alcance
- Tecnologías principales utilizadas

## 2. Análisis de preguntas críticas
- Identifica las **3 preguntas más relevantes** técnicas/arquitectónicas
- Para cada pregunta:
  - Contexto de por qué es importante para el proyecto
  - **2 opciones** con pros/contras/impacto
  - Recomendación fundamentada (considerando contexto educativo)

## 3. Plan de desarrollo por fases
- Desglose de features en orden de implementación
- Dependencias entre features
- Priorización (MVP → Features adicionales)

## 4. Decisiones arquitectónicas
- Patrones elegidos y justificación
- Trade-offs considerados
- Alternativas descartadas y razones

## 5. Estrategia de testing
- Approach para tests unitarios, integración y E2E
- Coverage esperado y métricas de calidad

---

# Formato de salida

## Template para preguntas críticas

Para cada pregunta, sigue este formato:

**Pregunta N: [Título de la pregunta]**

**Contexto:** [Por qué es crítica esta pregunta para el proyecto del curso]

**Opciones:**

A) **[Opción 1]**
   - ✅ Pros: ...
   - ❌ Contras: ...
   - 📊 Impacto: ...

B) **[Opción 2]**
   - ✅ Pros: ...
   - ❌ Contras: ...
   - 📊 Impacto: ...

**Recomendación:** [Opción recomendada + justificación considerando contexto educativo]

---

# Proceso de ejecución

Sigue este flujo iterativo:

## Paso 1: Análisis inicial
- Lee y comprende toda la información técnica de referencia
- Identifica áreas de decisión críticas para el proyecto

## Paso 2: Preguntas críticas
- **Genera las 3 preguntas más relevantes** usando el template proporcionado
- Presenta cada pregunta con sus 2 opciones y análisis completo
- **Espera feedback del usuario** antes de continuar

## Paso 3: Plan completo
- Una vez confirmadas las decisiones, genera el plan de desarrollo completo
- Organiza por fases con dependencias claras
- Incluye todas las secciones de entregables esperados

## Paso 4: Guardar resultado
- Guarda el plan completo en `docs/plan/planning.md`
- Asegúrate de que esté bien estructurado para ser consumido por el prompt 02

---

## Comenzar ahora

Por favor, **comienza con el Paso 1 y 2**: analiza el contexto y genera las 3 preguntas críticas antes de proceder con el plan completo.
