import { expect, test } from '@playwright/test'

test('Report Bug', async ({ baseURL, page }) => {
  await page.goto(baseURL + '/eventos')
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.locator('data-test=bug_report_btn').click()
  expect.soft(page.locator('data-test=sidebar')).toBeVisible()
  await page.locator('textarea').fill('Hello From E2E Testing')
  await page.locator('data-test=bug_submit_btn').click()
  page.on('request', async (request) => {
    // email endpoint responds with 200
    if (request.status() === 200) {
      expect(request.url()).toBe(baseURL + '/mail/send')
    }
    await page.waitForTimeout(7000)
    expect(page.locator('data-test=feedback_card')).toBeVisible()
  })
})
