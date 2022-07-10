import { test, expect } from '@playwright/test'

test('filtering events', async ({ page, baseURL }) => {
  await page.goto(baseURL + '/eventos')
  await page.selectOption('select', { index: 1 })
  const html = await page.locator('main > span').innerHTML()
  await page.selectOption('select', { index: 3 })
  expect(await page.locator('main > span').innerHTML()).not.toBe(html)
})

test('clicking in + info', async ({ page, baseURL }) => {
  await page.goto(baseURL + '/eventos')
  await page.selectOption('select', { index: 3 })
  const html = await page.locator('[data-test=card]:has(button) >> p').first().innerHTML()
  expect(page.locator('data-test=card >> p').first()).toBeVisible()
  await page.locator('text="\n      Leer más\n    "').first().click()
  await page.waitForTimeout(7000)
  expect(page.locator('data-test=sidebar')).toBeVisible()
  const new_html = (await page.locator('[data-test=card]:has(button) >> p').first().innerHTML()).substring(0, html.length)
  expect(html).toBe(new_html)
})
