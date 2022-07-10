import { expect, test } from '@playwright/test'
import login from '../utils/login.mjs'

test.beforeEach(async ({ page, baseURL }) => {
  await login(page, baseURL)
})

test('add item', async ({ page }) => {
  await page.setViewportSize({ width: 1311, height: 828 })

  const news_length = (await page.$$('[data-test="profesores_ausentes_items"] > div')).length
  await page.locator('data-test=profesores_ausentes_add_button').click()
  await page.waitForTimeout(2000)
  await page.selectOption('select', { index: 1 })

  // auto generated
  await page.waitForSelector('.flex > .flex > .w-96 > span > .py-1\\.5')
  await page.click('.flex > .flex > .w-96 > span > .py-1\\.5')

  await page.waitForSelector('.vc-pane-layout > .vc-pane > .vc-weeks > .vc-day:nth-child(9) > .vc-day-content')
  await page.click('.vc-pane-layout > .vc-pane > .vc-weeks > .vc-day:nth-child(9) > .vc-day-content')

  await page.waitForSelector('.vc-pane-container > .vc-arrows-container > .is-right > .vc-svg-icon > path')
  await page.click('.vc-pane-container > .vc-arrows-container > .is-right > .vc-svg-icon > path')

  await page.waitForSelector('.vc-pane-container > .vc-arrows-container > .is-right > .vc-svg-icon > path')
  await page.click('.vc-pane-container > .vc-arrows-container > .is-right > .vc-svg-icon > path')

  await page.waitForSelector('.vc-pane-container > .vc-arrows-container > .is-right > .vc-svg-icon > path')
  await page.click('.vc-pane-container > .vc-arrows-container > .is-right > .vc-svg-icon > path')

  await page.waitForSelector('.vc-pane-container > .vc-arrows-container > .is-right > .vc-svg-icon > path')
  await page.click('.vc-pane-container > .vc-arrows-container > .is-right > .vc-svg-icon > path')

  await page.waitForSelector('.vc-pane-layout > .vc-pane > .vc-weeks > .vc-day:nth-child(27) > .vc-day-content')
  await page.click('.vc-pane-layout > .vc-pane > .vc-weeks > .vc-day:nth-child(27) > .vc-day-content')

  // up to here
  await page.click('button[data-test="add_btn"]')
  await page.waitForTimeout(2000)

  const new_news_length = (await page.$$('[data-test="profesores_ausentes_items"] > div')).length
  expect(new_news_length).toBe(news_length + 1)
})
test('edit item', async ({ page }) => {
  const title = await page.locator('data-test=profesores_ausentes_item_title').first().innerText()
  await page.locator('data-test=profesores_ausentes_edit_btn').first().click()
  await page.waitForTimeout(2000)
  await page.selectOption('select', { index: 3 })
  await page.click('button[data-test="add_btn"]')
  await page.waitForTimeout(2000)
  const new_title = await page.locator('data-test=profesores_ausentes_item_title').first().innerText()
  expect(new_title).not.toBe(title)
})
test('delete item', async ({ page }) => {
  const news_length = (await page.$$('[data-test="profesores_ausentes_items"] > div')).length
  await page.locator('data-test=profesores_ausentes_delete_btn').first().click()
  await page.waitForTimeout(2000)
  const new_news_length = (await page.$$('[data-test="profesores_ausentes_items"] > div')).length
  expect(new_news_length).toBe(news_length - 1)
})
