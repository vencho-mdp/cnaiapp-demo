import { expect, test } from '@playwright/test'
import login from '../utils/login.mjs'

test.beforeEach(async ({ page, baseURL }) => {
  await login(page, baseURL)
})

test('add item', async ({ page }) => {
  await page.setViewportSize({ width: 1311, height: 828 })
  const events_length = (await page.$$('[data-test="eventos_items"] > div')).length
  await page.locator('data-test=eventos_add_button').click()
  await page.waitForTimeout(2000)
  await page.type('input[data-test="name"]', 'Test name')
  await page.type('div.ql-editor', 'Test description')
  // ADD TIME TO CALENDAR - AUTO GENERATED CODE
  await page.waitForSelector('.flex > .flex > .w-96 > span > .py-1\\.5')
  await page.click('.flex > .flex > .w-96 > span > .py-1\\.5')

  await page.waitForSelector('.vc-pane-layout > .vc-pane > .vc-weeks > .vc-day:nth-child(16) > .vc-day-content')
  await page.click('.vc-pane-layout > .vc-pane > .vc-weeks > .vc-day:nth-child(16) > .vc-day-content')

  await page.waitForSelector('.vc-container > .vc-pane-container > .vc-arrows-container > .is-right > .vc-svg-icon')
  await page.click('.vc-container > .vc-pane-container > .vc-arrows-container > .is-right > .vc-svg-icon')

  await page.waitForSelector('.vc-container > .vc-pane-container > .vc-arrows-container > .is-right > .vc-svg-icon')
  await page.click('.vc-container > .vc-pane-container > .vc-arrows-container > .is-right > .vc-svg-icon')

  await page.waitForSelector('.vc-pane-layout > .vc-pane > .vc-weeks > .vc-day:nth-child(12) > .vc-day-content')
  await page.click('.vc-pane-layout > .vc-pane > .vc-weeks > .vc-day:nth-child(12) > .vc-day-content')

  await page.click('button[data-test="add_btn"]')
  await page.waitForTimeout(5000)
  const new_events_length = (await page.$$('[data-test="eventos_items"] > div')).length
  expect(new_events_length).toBe(events_length + 1)
})
test('edit item', async ({ page }) => {
  await page.locator('data-test=eventos_edit_btn').first().click()
  await page.waitForTimeout(2000)
  await page.fill('input[data-test="name"]', 'Test title edit2')
  await page.click('button[data-test="add_btn"]')
  await page.waitForTimeout(2000)
  const new_title = await page.locator('data-test=eventos_item_title').first().innerText()
  expect(new_title).toBe('Test title edit2')
})
test('delete item', async ({ page }) => {
  // ITEMS SHOULD NOT BE MORE THAN 3 BECAUSE IT WOULD NOT WORK
  // BECAUSE OF THE "READ MORE" BTN
  const events_length = (await page.$$('[data-test="eventos_items"] > div')).length
  await page.locator('data-test=eventos_delete_btn').first().click()
  await page.waitForTimeout(2000)
  const new_events_length = (await page.$$('[data-test="eventos_items"] > div')).length
  expect(new_events_length).toBe(events_length - 1)
})
