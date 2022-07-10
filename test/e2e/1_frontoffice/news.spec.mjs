import { test, expect } from '@playwright/test'

test('can see content', async ({ page, baseURL }) => {
  await page.goto(baseURL + '/noticias')
  let html = await page.locator('[data-test=card]:has(button) >> p').first().innerHTML()
  html = html.substring(0, html.length - 4)
  expect(page.locator('data-test=card >> p').first()).toBeVisible()
  await page.locator('text="\n      Leer más\n    "').first().click()
  // transition
  await page.waitForTimeout(7000)
  expect(page.locator('data-test=sidebar')).toBeVisible()
  const new_html = (await page.locator('[data-test=card]:has(button) >> p').first().innerHTML()).substring(0, html.length)
  expect(html).toBe(new_html)
})
