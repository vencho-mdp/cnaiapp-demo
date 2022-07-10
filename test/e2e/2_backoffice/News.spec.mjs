import { expect, test } from '@playwright/test'
import login from '../utils/login.mjs'

test.beforeEach(async ({ page, baseURL }) => {
  await login(page, baseURL)
})

test('add item', async ({ page }) => {
  const news_length = (await page.$$('[data-test="noticias_items"] > div')).length
  await page.locator('data-test=noticias_add_button').click()
  await page.waitForTimeout(2000)
  await page.type('input[data-test="title"]', 'Test title')
  await page.type('div.ql-editor', 'Test description')
  await page.click('button[data-test="add_btn"]')
  await page.waitForTimeout(2000)
  const new_news_length = (await page.$$('[data-test="noticias_items"] > div')).length
  expect(new_news_length).toBe(news_length + 1)
})
test('edit item', async ({ page }) => {
  await page.locator('data-test=noticias_edit_btn').first().click()
  await page.waitForTimeout(2000)
  await page.fill('input[data-test="title"]', 'Test title edit')
  await page.click('button[data-test="add_btn"]')
  await page.waitForTimeout(2000)
  const new_title = await page.locator('data-test=noticias_item_title').first().innerText()
  expect(new_title).toBe('Test title edit')
})
test('delete item', async ({ page }) => {
  const news_length = (await page.$$('[data-test="noticias_items"] > div')).length
  await page.locator('data-test=noticias_delete_btn').first().click()
  await page.waitForTimeout(2000)
  const new_news_length = (await page.$$('[data-test="noticias_items"] > div')).length
  expect(new_news_length).toBe(news_length - 1)
})
