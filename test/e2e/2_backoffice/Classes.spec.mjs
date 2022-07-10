import { expect, test } from '@playwright/test'
import login from '../utils/login.mjs'

const add_slot = async (page, weekday) => {
  await page.click(`button[data-test="${weekday}_add_btn"]`)
  await page.waitForTimeout(1000)

  await page.locator(`data-test=${weekday}_acc_body >> .multiselect`).click()
  await page.locator(`data-test=${weekday}_acc_body >> .multiselect__element`).first().click()

  await page.locator(`data-test=${weekday}_acc_body >> .vc-select >> select`).first().selectOption({ index: 2 })
  await page.locator(`data-test=${weekday}_acc_body >> .vc-select >> select`).nth(2).selectOption({ index: 3 })

  await page.click(`data-test=${weekday}_acc_body >>` + 'button[data-test="slot_add"]')
}

test.beforeEach(async ({ page, baseURL }) => {
  await login(page, baseURL)
})

test('add item', async ({ page }) => {
  await page.setViewportSize({ width: 1098, height: 828 })

  const classes_length = (await page.$$('[data-test="cursos_items"] > div')).length
  await page.locator('data-test=cursos_add_button').click()
  await page.waitForTimeout(1000)
  await page.selectOption('select[data-test="grade"]', { index: 2 })
  await page.selectOption('select[date-test="grade_number"]', { index: 1 })

  // auto generated

  await add_slot(page, 'lunes')
  await page.waitForTimeout(1000)
  await add_slot(page, 'martes')
  await page.waitForTimeout(1000)
  await add_slot(page, 'miércoles')
  await page.waitForTimeout(1000)
  await add_slot(page, 'jueves')
  await page.waitForTimeout(1000)
  await add_slot(page, 'viernes')

  // up to here

  await page.click('button[data-test="add_btn"]')
  await page.waitForTimeout(1000)

  const new_classes_length = (await page.$$('[data-test="cursos_items"] > div')).length
  expect(new_classes_length).toBe(classes_length + 1)
})
test('edit item', async ({ page }) => {
  const title = await page.locator('data-test=cursos_item_title').first().innerText()
  await page.locator('data-test=cursos_edit_btn').first().click()
  await page.waitForTimeout(2000)
  await page.selectOption('select[data-test="grade"]', { index: 3 })
  await page.click('button[data-test="add_btn"]')
  await page.waitForTimeout(2000)
  const new_title = await page.locator('data-test=cursos_item_title').first().innerText()
  expect(new_title).not.toBe(title)
})
test('delete item', async ({ page }) => {
  const classes_length = (await page.$$('[data-test="cursos_items"] > div')).length
  await page.locator('data-test=cursos_delete_btn').first().click()
  await page.waitForTimeout(2000)
  const new_classes_length = (await page.$$('[data-test="cursos_items"] > div')).length
  expect(new_classes_length).toBe(classes_length - 1)
})
