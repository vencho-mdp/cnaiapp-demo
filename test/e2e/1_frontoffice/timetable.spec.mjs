import { test, expect } from '@playwright/test'

test('shows items correctly', async ({ page, baseURL }) => {
  await page.goto(baseURL + '/')
  await page.selectOption('select', { index: 1 })
  await page.locator('[data-el="item-0"]').click()
  await expect(page.locator('[data-test="slots-accordion-item"]').first()).toBeVisible()
})

test('change in course updates state', async ({ page, baseURL }) => {
  await page.goto(baseURL + '/')
  await page.selectOption('#class-selector', { value: '3ro 2da' })
  await page.waitForTimeout(2000)
  await page.locator('[data-el="item-0"]').click()
  await page.waitForTimeout(2000)
  const first_item = await page.locator('.c-accordion__body').first().innerHTML()
  await page.waitForTimeout(2000)
  await page.selectOption('#class-selector', { value: '3ro 4ta' })
  await page.waitForTimeout(2000)
  await page.locator('[data-el="item-0"]').click()
  await page.waitForTimeout(2000)
  const new_first_item = await page.locator('.c-accordion__body').first().innerHTML()
  await page.waitForTimeout(2000)
  expect(first_item).not.toBe(new_first_item)
})
