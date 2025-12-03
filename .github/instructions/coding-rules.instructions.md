---
applyTo: "**/*"
---

# Reglas de codificación para este repositorio

Reglas transversales de calidad de código que complementan las instrucciones generales de Copilot. Este archivo se enfoca en límites, modularidad y disciplina de testing.

## Estructura y modularidad del código
- **Nunca crees un archivo con más de 500 líneas de código.** Si se acerca a este límite, refactoriza dividiéndolo en módulos, funciones auxiliares o archivos separados.
- **Organiza el código en módulos claramente separados**, agrupados por funcionalidad o responsabilidad:
  - **Frontend**: components, app/pages, lib, hooks, types
- **Aplica separación de responsabilidades**: la lógica de negocio no debe estar en routers/endpoints ni en componentes de UI.

## Pruebas y fiabilidad
- **Siempre crea pruebas unitarias para cada nueva funcionalidad** (funciones, clases, endpoints, componentes).
- **Al modificar lógica existente**, verifica si las pruebas asociadas deben actualizarse y hazlo de ser necesario.
- **Organización de pruebas:**
  - Ubicación: `src/__tests__/` reflejando la estructura del código (components/, lib/, hooks/)
  - Cada nueva pieza de lógica debe incluir al menos:
    - Una prueba de uso esperado (happy path)
    - Una prueba de caso límite
    - Una prueba de fallo o excepción
- **Frameworks de testing:**
  - **Vitest** para unit tests
  - **React Testing Library** para componentes
- **Coverage mínimo del 60%** en el proyecto.

## Calidad de código y formato
- **Siempre ejecuta linting antes de hacer commit:**
  - `npm run lint` (ESLint)
- **Asegúrate de que el linting pase localmente antes de abrir un PR.**
