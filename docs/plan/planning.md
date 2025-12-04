# Plan de Proyecto: Sistema de Seguimiento de Hábitos y Metas

## 1. Resumen Ejecutivo
- **Proyecto**: Sistema de Seguimiento de Hábitos y Metas.
- **Stack Tecnológico**: Next.js 16, Prisma, SQLite, Tailwind CSS.
- **Objetivo**: Aplicación educativa full-stack para el seguimiento de hábitos diarios.

## 2. Análisis de Preguntas Críticas
Durante la fase de diseño, se abordaron tres preguntas clave para definir la arquitectura y el comportamiento del sistema:

1.  **¿Cómo manejar la comunicación Cliente-Servidor?**
    -   *Opción A*: Server Actions (Nativo de Next.js).
    -   *Opción B*: API Routes (REST estándar).
    -   **Decisión**: **API Routes (REST)**.
    -   *Razón*: Para enseñar patrones asíncronos estándar y separación clara de responsabilidades, facilitando la comprensión del flujo de datos HTTP.

2.  **¿Cómo almacenar las fechas de los registros?**
    -   *Opción A*: Timestamp UTC (ISO 8601).
    -   *Opción B*: Fecha Lógica (YYYY-MM-DD).
    -   **Decisión**: **Fecha Lógica (YYYY-MM-DD)**.
    -   *Razón*: Para garantizar consistencia y evitar problemas de zonas horarias. Un hábito se completa en un "día calendario" específico, independientemente de la hora exacta.

3.  **¿Cómo calcular las rachas (streaks)?**
    -   *Opción A*: Pre-cálculo y almacenamiento en DB (campo `currentStreak`).
    -   *Opción B*: Cálculo bajo demanda (On-Demand).
    -   **Decisión**: **Cálculo bajo demanda**.
    -   *Razón*: Para mantener la simplicidad y tener una única fuente de verdad (los logs de hábitos). Evita problemas de sincronización de datos.

## 3. Plan de Desarrollo por Fases

### Fase 1: Fundamentos y API Backend
-   **Base de Datos**: Configuración de SQLite y Prisma. Definición del esquema asegurando soporte para fechas lógicas (ej. normalización de `completedAt` o uso de string `date`).
-   **API Endpoints**:
    -   `GET /api/habits`: Listar hábitos.
    -   `POST /api/habits`: Crear nuevo hábito.
    -   `DELETE /api/habits/[id]`: Eliminar hábito.

### Fase 2: Frontend Core (Gestión de Hábitos)
-   **Componentes**:
    -   `HabitList`: Listado de hábitos con fetching de datos usando SWR.
    -   `CreateHabitForm`: Formulario de creación con validación mediante Zod.
-   **Páginas**: Estructura principal del Dashboard.

### Fase 3: Lógica de Seguimiento y Estadísticas
-   **API Endpoints**:
    -   `POST /api/habits/[id]/log`: Registrar cumplimiento (Check-in).
    -   `GET /api/habits/[id]/stats`: Obtener estadísticas del hábito.
-   **Lógica de Negocio**:
    -   `calculateStreaks`: Función pura en `lib/` para calcular rachas actuales y mejores.
-   **UI**: Indicadores visuales de racha (fuego/iconos).

### Fase 4: Visualización y Calidad
-   **Visualización**: Componente `HabitChart` usando Recharts para ver el progreso histórico.
-   **Testing**: Tests E2E con Playwright para flujos críticos.
-   **UI Polish**: Soporte para Dark mode y estados vacíos (empty states).

## 4. Decisiones Arquitectónicas
-   **Patrón**: Arquitectura en Capas (UI -> API -> Lib -> DB).
-   **Gestión de Estado**:
    -   **Server State**: SWR (stale-while-revalidate) para datos remotos.
    -   **Local State**: React `useState`/`useReducer` para interacciones de UI.
-   **Estilos**: Tailwind CSS + Shadcn/ui para componentes accesibles y rápidos.

## 5. Estrategia de Testing
-   **Unit Testing**: Vitest para probar lógica pura como `calculateStreaks` y utilidades.
-   **Integration Testing**: Tests de rutas de API (mockeando Prisma).
-   **E2E Testing**: Playwright para el flujo principal "Crear Hábito -> Check-in -> Verificar Racha".
-   **Cobertura**: Objetivo de >60% de cobertura en lógica de negocio.
