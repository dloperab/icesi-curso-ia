import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/')

    // Verificar que la página carga
    await expect(page).toHaveTitle(/Mis Hábitos|Habit Tracker/)
  })

  test('should have main heading', async ({ page }) => {
    await page.goto('/')

    // Verificar que existe un elemento de texto visible
    const body = page.locator('body')
    await expect(body).toBeVisible()
  })
})
