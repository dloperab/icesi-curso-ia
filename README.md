# Curso IA en SDLC - ICESI

Proyecto educativo para el curso de Inteligencia Artificial en el Ciclo de Vida del Desarrollo de Software (SDLC) en la Universidad ICESI.

## 🚀 Stack Tecnológico

### Frontend
- **Next.js 16** (App Router)
- **React 19** con Server Components
- **TypeScript 5** (strict mode)
- **Tailwind CSS 4** (mobile-first)
- **shadcn/ui** (componentes UI)
- **Recharts** (gráficos y visualizaciones)
- **SWR** (data fetching)
- **Zod** (validación de datos)

### Backend & Database
- **Prisma** (ORM)
- **SQLite** (base de datos embebida)
- **Next.js API Routes** (endpoints)

### Testing & Quality
- **Vitest** + React Testing Library (unit tests)
- **Playwright** (E2E tests)
- **ESLint 9** + Prettier (linting/formatting)
- **Husky** + lint-staged (git hooks)

## 📁 Estructura del Proyecto

```
.
├── .github/
│   ├── copilot-instructions.md          # Instrucciones para AI agents
│   └── instructions/
│       ├── coding-rules.instructions.md  # Reglas de calidad de código
│       └── frontend.instructions.md      # Convenciones Next.js
├── docs/                                 # Documentación del proyecto
│   ├── architecture/
│   └── database/
└── src/                                  # Aplicación Next.js
    ├── app/                              # App Router (páginas, layouts, API routes)
    ├── components/                       # Componentes reutilizables
    │   └── ui/                           # Componentes shadcn/ui
    ├── lib/                              # Servicios, utils, API clients
    │   └── prisma.ts                     # Cliente Prisma
    ├── prisma/                           # Configuración base de datos
    │   ├── schema.prisma                 # Esquema de datos
    │   ├── migrations/                   # Migraciones
    │   └── habits.db                     # Base de datos SQLite
    ├── hooks/                            # Custom React hooks
    ├── types/                            # TypeScript types/interfaces
    ├── __tests__/                        # Tests unitarios (Vitest)
    ├── e2e/                              # Tests E2E (Playwright)
    └── public/                           # Assets estáticos
```

## 🛠️ Desarrollo

### Prerrequisitos

- Node.js 20+ 
- npm 10+

### Setup inicial

```bash
# Clonar el repositorio
git clone https://github.com/GreenSQA/icesi-curso-ia.git
cd icesi-curso-ia

# Instalar dependencias
cd src
npm install

# Generar cliente Prisma
npm run db:generate

# Ejecutar en desarrollo
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

### Comandos disponibles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo
npm run build            # Build de producción
npm start                # Ejecutar build de producción

# Calidad de código
npm run lint             # Verificar código con ESLint
npm run format           # Formatear código con Prettier
npm run format:check     # Verificar formato sin modificar
npm run type-check       # Verificar tipos TypeScript

# Testing
npm test                 # Tests unitarios (watch mode)
npm run test:ui          # Tests unitarios con UI
npm run test:coverage    # Reporte de coverage
npm run test:e2e         # Tests E2E con Playwright
npm run test:e2e:ui      # Tests E2E con UI interactiva
npm run test:e2e:report  # Ver reporte HTML de E2E

# Base de datos
npm run db:generate      # Generar cliente Prisma
npm run db:migrate       # Aplicar migraciones
npm run db:studio        # Abrir Prisma Studio (GUI)
npm run db:push          # Sincronizar esquema
npm run db:reset         # Reset completo de BD
```

## 📝 Convenciones de Código

- **Límite de 500 líneas por archivo** - refactorizar si se excede
- **Límite de ~150 líneas por componente** - extraer a subcomponentes o hooks
- **Coverage mínimo del 60%** en tests
- **TypeScript strict mode** habilitado
- **Path aliases**: usar `@/*` para imports (ej: `@/components/Button`)
- **Server Components por defecto** - usar `'use client'` solo cuando sea necesario

## 🧪 Testing

### Tests Unitarios (Vitest)
- Ubicación: `src/__tests__/` reflejando la estructura del código
- Cada feature debe incluir:
  - ✅ 1 prueba de happy path
  - ✅ 1 prueba de edge case
  - ✅ 1 prueba de error case
- Usar React Testing Library con queries de accesibilidad
- Coverage mínimo: 60%

### Tests E2E (Playwright)
- Ubicación: `src/e2e/`
- Navegadores soportados: Chromium, Firefox, WebKit
- Auto-inicia servidor de desarrollo
- HTML reports disponibles

## 🔧 Git Workflow

- Pre-commit hooks automáticos con Husky
- Ejecuta ESLint y Prettier en archivos modificados
- Configurado en `.lintstagedrc.mjs`

## 🗄️ Base de Datos

- Motor: **SQLite** (archivo local embebido)
- ORM: **Prisma**
- Ubicación: `src/prisma/habits.db`
- Estado inicial: Esquema creado, sin datos
- Script SQL disponible en: `scripts/database/init-db.sql`

### Modelos principales
- **Habit**: Hábitos a seguir
- **HabitLog**: Registros de cumplimiento

Ver documentación completa en `src/prisma/README.md`

## 📚 Recursos

### Documentación del Proyecto
- [Instrucciones para AI Agents](.github/copilot-instructions.md)
- [Reglas de Codificación](.github/instructions/coding-rules.instructions.md)
- [Convenciones Frontend](.github/instructions/frontend.instructions.md)
- [Documentación de Prisma](src/prisma/README.md)

### Documentación Externa
- [Next.js Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev)
- [Prisma Documentation](https://www.prisma.io/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Playwright Documentation](https://playwright.dev)
- [Recharts Documentation](https://recharts.org)

## 📄 Licencia

Este proyecto es parte del curso de IA en SDLC de la Universidad ICESI.
