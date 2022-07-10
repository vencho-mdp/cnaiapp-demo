import { expect, test } from '@playwright/test'
import login from '../utils/login.mjs'

test.beforeEach(async ({ page, baseURL }) => {
  await login(page, baseURL)
  await page.goto(baseURL + '/dashboard/asistencia-alumnos')
})

test('add absent student', async ({ page, baseURL }) => {
  const list = (await page.$$('[data-test="absent_student"]')).length

  await page.type('.vue-simple-suggest >> input', 'a')
  await page.waitForTimeout(1000)
  await page.locator('.suggestions li').first().click()

  await page.click('button[data-test="add_absent_student"]')

  const new_list = (await page.$$('[data-test="absent_student"]')).length
  expect(new_list).toBe(list + 1)
})
test('delete absent student', async ({ page, baseURL }) => {
  const list = (await page.$$('[data-test="absent_student"]')).length

  await page.locator('data-test=absent_student_delete_button').first().click()
  await page.waitForTimeout(1000)
  await page.click('button[data-test="add_absent_student"]')

  const new_list = (await page.$$('[data-test="absent_student"]')).length
  expect(new_list).toBe(list - 1)
})
test('when class changes, absent students also do', async ({ page }) => {
  // ideally you compare the ids, not the lengths
  const list = (await page.$$('[data-test="absent_student"]')).length

  await page.selectOption('select', { index: 0 })
  await page.waitForTimeout(2000)

  const new_list = (await page.$$('[data-test="absent_student"]')).length
  expect(new_list).not.toBe(list)
})
test('when date changes, absent students also do', async ({ page, baseURL }) => {
  // ideally you compare the ids, not the lengths
  const list = (await page.$$('[data-test="absent_student"]')).length

  await page.waitForSelector('.vc-pane-layout > .vc-pane > .vc-weeks > .vc-day:nth-child(33) > .vc-day-content')
  await page.click('.vc-pane-layout > .vc-pane > .vc-weeks > .vc-day:nth-child(33) > .vc-day-content')
  await page.waitForTimeout(2000)

  const new_list = (await page.$$('[data-test="absent_student"]')).length
  expect(new_list).not.toBe(list)
})
