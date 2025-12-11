import { test, expect } from '@playwright/test'

test.describe('Create Habit Flow', () => {
  test('should create a new habit successfully', async ({ page }) => {
    // 1. Open the app
    await page.goto('/')

    // Verify the page loaded with the header
    await expect(page.locator('h1')).toContainText('Mis Hábitos')

    // 2. Click "Crear Hábito" button
    const createButton = page.getByRole('button', { name: /crear hábito/i })
    await expect(createButton).toBeVisible()
    await createButton.click()

    // Verify the dialog opened
    const dialogTitle = page.locator('[role="dialog"]').locator('h2')
    await expect(dialogTitle).toContainText('Crear Nuevo Hábito')

    // 3. Fill the form
    const nameInput = page.locator('input#name')
    const descriptionInput = page.locator('textarea#description')
    const dailyRadio = page.locator('input[name="frequency"][value="daily"]')

    // Fill habit name
    await nameInput.fill('Ejercicio diario')
    await expect(nameInput).toHaveValue('Ejercicio diario')

    // Fill description (optional)
    await descriptionInput.fill('30 minutos de ejercicio cardiovascular')
    await expect(descriptionInput).toHaveValue('30 minutos de ejercicio cardiovascular')

    // Select daily frequency (already checked by default)
    await expect(dailyRadio).toBeChecked()

    // 4. Submit the form
    const submitButton = page.getByRole('button', { name: /crear hábito/i }).last()
    await submitButton.click()

    // Wait for the dialog to close
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 })

    // 5. Verify the habit appears in the list
    // Wait for the habit card to appear
    const habitCard = page.locator('h3').filter({ hasText: 'Ejercicio diario' })
    await expect(habitCard).toBeVisible({ timeout: 5000 })

    // Verify habit details are displayed
    await expect(page.locator('text=30 minutos de ejercicio cardiovascular')).toBeVisible()
    await expect(page.locator('text=Diario')).toBeVisible()
  })

  test('should show validation error for empty name', async ({ page }) => {
    // Open the app
    await page.goto('/')

    // Click "Crear Hábito" button
    await page.getByRole('button', { name: /crear hábito/i }).click()

    // Try to submit without filling the name
    const submitButton = page.getByRole('button', { name: /crear hábito/i }).last()
    await submitButton.click()

    // Verify validation error appears
    const errorMessage = page.locator('text=/String must contain at least 1 character|required/i')
    await expect(errorMessage).toBeVisible()

    // Dialog should still be open
    await expect(page.locator('[role="dialog"]')).toBeVisible()
  })

  test('should close dialog on cancel', async ({ page }) => {
    // Open the app
    await page.goto('/')

    // Click "Crear Hábito" button
    await page.getByRole('button', { name: /crear hábito/i }).click()

    // Verify dialog is open
    await expect(page.locator('[role="dialog"]')).toBeVisible()

    // Click Cancel button
    const cancelButton = page.getByRole('button', { name: /cancelar/i })
    await cancelButton.click()

    // Verify dialog closed
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })

  test('should create habit with weekly frequency', async ({ page }) => {
    // Open the app
    await page.goto('/')

    // Click "Crear Hábito" button
    await page.getByRole('button', { name: /crear hábito/i }).click()

    // Fill the form
    const nameInput = page.locator('input#name')
    const weeklyRadio = page.locator('input[name="frequency"][value="weekly"]')

    await nameInput.fill('Lectura semanal')
    await weeklyRadio.click()

    // Submit the form
    const submitButton = page.getByRole('button', { name: /crear hábito/i }).last()
    await submitButton.click()

    // Wait for dialog to close
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 })

    // Verify the habit appears in the list with weekly frequency
    const habitCard = page.locator('h3').filter({ hasText: 'Lectura semanal' })
    await expect(habitCard).toBeVisible({ timeout: 5000 })

    // Verify frequency badge shows "Semanal"
    const frequencyBadge = page.locator('text=Semanal')
    await expect(frequencyBadge).toBeVisible()
  })
})
