# Plan de Tareas de Desarrollo

## Fase 1: Diseño y Documentación

### Arquitectura
- [ ] **Diagrama de Contexto (C4)**:
    - [ ] Crear diagrama en `docs/architecture/context.mermaid` mostrando el sistema y el usuario.
    - [ ] Documentar actores y responsabilidades principales.
- [ ] **Diagrama de Contenedores (C4)**:
    - [ ] Crear diagrama en `docs/architecture/containers.mermaid` (Frontend, API, DB).
    - [ ] Detallar tecnologías (Next.js, Prisma, SQLite) y comunicación.

### Base de Datos
- [ ] **Diagrama Entidad-Relación (ER)**:
    - [ ] Crear diagrama en `docs/database/er-diagram.mermaid`.
    - [ ] Validar relaciones entre `Habit` y `HabitLog`.
    - [ ] Documentar decisión de usar `DateTime` normalizado para fechas lógicas.

## Fase 2: Fundamentos y API Backend


### API: Gestión de Hábitos
- [ ] **Endpoint: Listar Hábitos (GET /api/habits)**:
    - [ ] Implementar handler en `src/app/api/habits/route.ts`.
    - [ ] Integrar Prisma Client para fetch de datos.
    - [ ] Manejar errores básicos (500).
- [ ] **Endpoint: Crear Hábito (POST /api/habits)**:
    - [ ] Implementar validación de body con Zod (nombre, frecuencia).
    - [ ] Crear registro en DB usando Prisma.
    - [ ] Retornar 201 Created con el objeto creado.
- [ ] **Endpoint: Eliminar Hábito (DELETE /api/habits/[id])**:
    - [ ] Crear ruta dinámica `src/app/api/habits/[id]/route.ts`.
    - [ ] Validar existencia del ID.
    - [ ] Ejecutar borrado en cascada (logs asociados).
- [ ] **Pruebas de Integración (API)**:
    - [ ] Test para GET /api/habits (lista vacía y con datos).
    - [ ] Test para POST /api/habits (creación exitosa y error de validación).

## Fase 3: Frontend Core (Gestión de Hábitos)

### Componentes UI
- [ ] **Componente: HabitList**:
    - [ ] Crear `src/components/habits/HabitList.tsx`.
    - [ ] Implementar fetching de datos con SWR (`useSWR('/api/habits')`).
    - [ ] Renderizar lista de tarjetas o items.
    - [ ] Estado de carga (Skeleton) y error.
- [ ] **Componente: CreateHabitForm**:
    - [ ] Crear `src/components/habits/CreateHabitForm.tsx`.
    - [ ] Implementar formulario con React Hook Form + Zod.
    - [ ] Conectar con POST /api/habits.
    - [ ] Feedback visual (toast) al crear.
    - [ ] **Prueba Unitaria**: Verificar validación de campos requeridos.

### Páginas
- [ ] **Página: Dashboard Principal**:
    - [ ] Estructurar `src/app/page.tsx`.
    - [ ] Integrar `CreateHabitForm` (en modal o sección) y `HabitList`.
    - [ ] Layout responsivo básico con Tailwind.

## Fase 4: Lógica de Seguimiento y Estadísticas

### API: Seguimiento
- [ ] **Endpoint: Registrar Check-in (POST /api/habits/[id]/log)**:
    - [ ] Crear ruta `src/app/api/habits/[id]/log/route.ts`.
    - [ ] Recibir fecha en body (o usar "hoy" por defecto).
    - [ ] **Lógica Crítica**: Normalizar fecha a YYYY-MM-DD T00:00:00 para consistencia.
    - [ ] Manejar duplicados (idempotencia para el mismo día).
- [ ] **Lógica de Negocio: Cálculo de Rachas**:
    - [ ] Crear `src/lib/streaks.ts`.
    - [ ] Implementar función `calculateStreaks(logs: Date[])`.
    - [ ] Algoritmo para detectar días consecutivos (considerando frecuencia diaria).
    - [ ] **Prueba Unitaria**: Casos de prueba para racha 0, racha 1, racha larga, racha rota.

### API: Estadísticas
- [ ] **Endpoint: Obtener Estadísticas (GET /api/habits/[id]/stats)**:
    - [ ] Crear ruta `src/app/api/habits/[id]/stats/route.ts`.
    - [ ] Obtener logs del hábito.
    - [ ] Aplicar `calculateStreaks` y retornar JSON con `currentStreak`, `maxStreak`.

### Integración Frontend
- [ ] **Componente: HabitItem (Actualización)**:
    - [ ] Agregar botón de "Check-in" rápido.
    - [ ] Conectar con POST log.
    - [ ] Mostrar racha actual (fuego/icono).
    - [ ] Invalidar caché SWR al completar.

## Fase 5: Visualización y Calidad

### Visualización
- [ ] **Componente: HabitChart**:
    - [ ] Investigar librería Recharts (ya instalada).
    - [ ] Crear gráfico de barras/calendario de cumplimiento últimos 30 días.
    - [ ] Integrar en detalle del hábito o dashboard.

### Testing Final
- [ ] **Pruebas E2E (Playwright)**:
    - [ ] Escenario 1: Usuario crea hábito -> Aparece en lista.
    - [ ] Escenario 2: Usuario hace check-in -> Racha incrementa.
    - [ ] Configurar en `src/e2e/habits.spec.ts`.
- [ ] **Revisión de Calidad**:
    - [ ] Verificar coverage > 60% (`npm run test:coverage`).
    - [ ] Linting y Formatting final.
