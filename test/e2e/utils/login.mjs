export default async (page, baseURL) => {
  await page.goto(baseURL + '/iniciar-sesion')
  // ONLY FOR DEVELOPMENT!!!!!!!!!!!!!!!!!!!!!!!
  await page.type('input[type="email"]', 'beniciocardozo@gmail.com')
  await page.type('input[type="password"]', 'Illia')
  await page.click('button[type="submit"]')
  await page.waitForTimeout(2000)
}
