# Configuración de Prisma

Este directorio contiene la configuración de Prisma ORM para la base de datos SQLite.

## Archivos

- `schema.prisma`: Definición del esquema de base de datos
- `habits.db`: Base de datos SQLite (incluida en el repo para facilitar el setup inicial)
- `migrations/`: Historial de migraciones de la base de datos

## Comandos útiles

### Generar cliente de Prisma
```bash
npm run db:generate
```

### Aplicar migraciones
```bash
npm run db:migrate
```

### Abrir Prisma Studio (GUI para ver/editar datos)
```bash
npm run db:studio
```

### Sincronizar esquema sin crear migración
```bash
npm run db:push
```

### Reset completo de la base de datos
```bash
npm run db:reset
```

## Modelos

### Habit
Representa un hábito que el usuario desea seguir.

**Campos:**
- `id`: Identificador único (CUID)
- `name`: Nombre del hábito
- `description`: Descripción opcional
- `frequency`: Frecuencia ('daily' | 'weekly')
- `createdAt`: Fecha de creación
- `updatedAt`: Fecha de última actualización
- `logs`: Relación con registros de cumplimiento

### HabitLog
Registra cada vez que se completa un hábito.

**Campos:**
- `id`: Identificador único (CUID)
- `habitId`: ID del hábito relacionado
- `completedAt`: Fecha/hora de cumplimiento
- `note`: Nota opcional
- `createdAt`: Fecha de creación

**Constraints:**
- Unique index en `(habitId, completedAt)`: previene registros duplicados el mismo día

## Uso en el código

```typescript
import { prisma } from '@/lib/prisma'

// Crear hábito
const habit = await prisma.habit.create({
  data: {
    name: 'Ejercicio diario',
    frequency: 'daily'
  }
})

// Registrar cumplimiento
const log = await prisma.habitLog.create({
  data: {
    habitId: habit.id
  }
})

// Consultar hábitos con logs
const habits = await prisma.habit.findMany({
  include: {
    logs: true
  }
})
```

## Base de datos inicial

La base de datos `habits.db` está incluida en el repositorio con el esquema creado pero sin datos. Esto permite que los estudiantes clonen el proyecto y empiecen a trabajar inmediatamente sin necesidad de ejecutar migraciones manualmente.

Si necesitas recrear la base de datos desde cero:

```bash
# Eliminar la base de datos actual
rm prisma/habits.db

# Aplicar migraciones
npm run db:migrate
```
