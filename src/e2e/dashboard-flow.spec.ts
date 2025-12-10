import { test, expect } from '@playwright/test'

test.describe('Dashboard Flow', () => {
  test('should navigate to dashboard and view metrics', async ({ page }) => {
    await page.goto('/')

    // Create a habit
    const createButton = page.getByRole('button', { name: /crear hábito/i })
    await createButton.click()

    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible()

    const nameInput = page.getByPlaceholder(/ej: ejercicio diario/i)
    const dashboardTestName = `Dashboard Test ${Date.now()}`
    await nameInput.fill(dashboardTestName)

    const submitButtons = page.getByRole('button', { name: /crear hábito/i })
    const submitButton = submitButtons.last()
    await submitButton.click()

    await expect(dialog).not.toBeVisible({ timeout: 5000 })
    await expect(page.getByText(dashboardTestName)).toBeVisible({ timeout: 5000 })

    // Click "Ver detalles" button to navigate to dashboard
    const detailsButton = page.getByRole('button', { name: /ver detalles/i }).first()
    await detailsButton.click()

    // Wait for navigation and dashboard to load
    await page.waitForURL(/\/habits\/[a-z0-9-]+/, { timeout: 5000 })
    await page.waitForTimeout(1500)

    // Verify we're on the details page
    await expect(page).toHaveURL(/\/habits\/[a-z0-9-]+/)

    // Verify habit name is still visible on the dashboard
    await expect(page.getByText(dashboardTestName).first()).toBeVisible({ timeout: 5000 })
  })

  test('should display chart on dashboard', async ({ page }) => {
    await page.goto('/')

    // Create and check-in a habit to have data for the chart
    const createButton = page.getByRole('button', { name: /crear hábito/i })
    await createButton.click()

    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible()

    const nameInput = page.getByPlaceholder(/ej: ejercicio diario/i)
    const chartTestName = `Chart Test ${Date.now()}`
    await nameInput.fill(chartTestName)

    const submitButtons = page.getByRole('button', { name: /crear hábito/i })
    const submitButton = submitButtons.last()
    await submitButton.click()

    await expect(dialog).not.toBeVisible({ timeout: 5000 })
    await expect(page.getByText(chartTestName)).toBeVisible({ timeout: 5000 })

    // Register a check-in to have data
    const checkInButton = page.getByRole('button', { name: /completado/i }).first()
    await checkInButton.click()

    await page.waitForTimeout(1500)

    // Navigate to dashboard
    const detailsButton = page.getByRole('button', { name: /ver detalles/i }).first()
    await detailsButton.click()

    await page.waitForURL(/\/habits\/[a-z0-9-]+/, { timeout: 5000 })
    await page.waitForTimeout(1500)

    // Verify we're on the dashboard page (check for the header)
    await expect(page.getByText(/detalles del hábito/i)).toBeVisible({ timeout: 5000 })
  })

  test('should change time range on dashboard', async ({ page }) => {
    await page.goto('/')

    // Create a habit
    const createButton = page.getByRole('button', { name: /crear hábito/i })
    await createButton.click()

    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible()

    const nameInput = page.getByPlaceholder(/ej: ejercicio diario/i)
    const rangeTestName = `Range Test ${Date.now()}`
    await nameInput.fill(rangeTestName)

    const submitButtons = page.getByRole('button', { name: /crear hábito/i })
    const submitButton = submitButtons.last()
    await submitButton.click()

    await expect(dialog).not.toBeVisible({ timeout: 5000 })
    await expect(page.getByText(rangeTestName)).toBeVisible({ timeout: 5000 })

    // Navigate to dashboard
    const detailsButton = page.getByRole('button', { name: /ver detalles/i }).first()
    await detailsButton.click()

    await page.waitForURL(/\/habits\/[a-z0-9-]+/, { timeout: 5000 })
    await page.waitForTimeout(1000)

    // Find the time range buttons
    const button7days = page.getByRole('button', { name: /7 días/i })
    const button30days = page.getByRole('button', { name: /30 días/i })
    const button90days = page.getByRole('button', { name: /90 días/i })

    // Verify 30 days is selected by default (should be visible)
    await expect(button30days).toBeVisible()

    // Click on 7 days
    await button7days.click()
    await page.waitForTimeout(1000)

    // Verify page is still on dashboard (URL hasn't changed)
    await expect(page).toHaveURL(/\/habits\/[a-z0-9-]+/)

    // Click on 90 days
    await button90days.click()
    await page.waitForTimeout(1000)

    // Verify page is still on dashboard
    await expect(page).toHaveURL(/\/habits\/[a-z0-9-]+/)
  })

  test('should navigate back to home from dashboard', async ({ page }) => {
    await page.goto('/')

    // Create a habit
    const createButton = page.getByRole('button', { name: /crear hábito/i })
    await createButton.click()

    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible()

    const nameInput = page.getByPlaceholder(/ej: ejercicio diario/i)
    const backTestName = `Back Test ${Date.now()}`
    await nameInput.fill(backTestName)

    const submitButtons = page.getByRole('button', { name: /crear hábito/i })
    const submitButton = submitButtons.last()
    await submitButton.click()

    await expect(dialog).not.toBeVisible({ timeout: 5000 })
    await expect(page.getByText(backTestName)).toBeVisible({ timeout: 5000 })

    // Navigate to dashboard
    const detailsButton = page.getByRole('button', { name: /ver detalles/i }).first()
    await detailsButton.click()

    await page.waitForURL(/\/habits\/[a-z0-9-]+/, { timeout: 5000 })

    // Click "Volver" button
    const backButton = page.getByRole('button', { name: /volver/i })
    await backButton.click()

    // Should navigate back to home
    await page.waitForURL('/', { timeout: 5000 })

    // Verify we're back on the home page with the habit list
    await expect(page.getByText(backTestName)).toBeVisible()
  })
})
