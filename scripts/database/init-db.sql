-- =====================================================
-- Sistema de Seguimiento de Hábitos y Metas
-- Base de datos: SQLite
-- Generado: 2025-12-02
-- =====================================================

-- Tabla: habits
-- Descripción: Almacena los hábitos que el usuario desea seguir
CREATE TABLE IF NOT EXISTS "habits" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "frequency" TEXT NOT NULL, -- 'daily' | 'weekly'
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Tabla: habit_logs
-- Descripción: Registra cada vez que un hábito se completa
CREATE TABLE IF NOT EXISTS "habit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "habitId" TEXT NOT NULL,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "habit_logs_habitId_fkey" 
        FOREIGN KEY ("habitId") 
        REFERENCES "habits" ("id") 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);

-- Índice único: Evita duplicados de logs en el mismo día para el mismo hábito
CREATE UNIQUE INDEX IF NOT EXISTS "habit_logs_habitId_completedAt_key" 
    ON "habit_logs"("habitId", "completedAt");

-- =====================================================
-- Notas de uso:
-- 1. Ejecutar este script para crear la estructura inicial
-- 2. La base de datos debe llamarse 'habits.db'
-- 3. Ubicación recomendada: src/prisma/habits.db
-- =====================================================
