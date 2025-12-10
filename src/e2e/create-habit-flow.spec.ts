import { test, expect } from '@playwright/test'

test.describe('Create Habit Flow', () => {
  test('should create a new habit through the form', async ({ page }) => {
    // Navigate to the app
    await page.goto('/')

    // Verify the page title has updated
    await expect(page).toHaveTitle(/Mis Hábitos|Habit Tracker/)


    // Find and click the "Crear Hábito" button
    const createButton = page.getByRole('button', { name: /crear hábito/i })
    await createButton.click()

    // Wait for the dialog to appear
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible()

    // Fill in the habit name
    const nameInput = page.getByPlaceholder(/ej: ejercicio diario/i)
    await nameInput.fill('Test Habit for E2E')

    // Select the frequency (daily is default, but let's verify it's there)
    const dailyRadio = page.getByLabel(/diario/i)
    await expect(dailyRadio).toBeChecked()

    // Click submit button in dialog
    const submitButtons = page.getByRole('button', { name: /crear hábito/i })
    // Get the last button (should be the submit button in the dialog)
    const submitButton = submitButtons.last()
    await submitButton.click()

    // Wait for dialog to close
    await expect(dialog).not.toBeVisible({ timeout: 5000 })

    // Verify the habit appears in the list
    await expect(page.getByText('Test Habit for E2E').first()).toBeVisible({ timeout: 5000 })
    // Verify the frequency is shown next to the habit name (be more specific to avoid ambiguity)
    const habitCard = page.locator('text=Test Habit for E2E').first().locator('..').locator('text=Diario')
    await expect(habitCard).toBeVisible()
  })

  test('should show validation error for empty name', async ({ page }) => {
    await page.goto('/')

    // Click create button
    const createButton = page.getByRole('button', { name: /crear hábito/i })
    await createButton.click()

    // Wait for dialog
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible()

    // Try to submit without filling name
    const submitButtons = page.getByRole('button', { name: /crear hábito/i })
    const submitButton = submitButtons.last()
    await submitButton.click()

    // Should see validation error
    await expect(page.getByText(/name cannot be empty|nombre no puede estar vacío/i)).toBeVisible()

    // Dialog should still be visible
    await expect(dialog).toBeVisible()
  })
})
