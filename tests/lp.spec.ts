// アプリ側の UI/UX 基準（docs/UI_UX_STANDARDS.md）のうち、機械で確かめられる項目を LP にも適用する。
import { AxeBuilder } from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const banned = ['提案モック', 'オタク', '換金', '必ず当たる', '還元率100', '還元率 100', '大当たり', '中当たり', 'JTCC', 'トレカセンター']

test('LP: 見出し・アクセシビリティ・操作領域・320px・文字200%・動きを減らす設定', async ({ page }, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('response', (response) => { if (response.status() >= 400 && response.url().includes('127.0.0.1')) errors.push(`${response.status()} ${response.url()}`) })

  await page.goto('./')
  await expect(page).toHaveTitle(/ラストピース/)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByText('公式サービスではありません', { exact: false }).first()).toBeVisible()
  const text = await page.locator('body').innerText()
  const html = await page.content()
  for (const word of banned) expect(text.includes(word) || html.includes(word), `禁止語「${word}」`).toBe(false)

  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([])

  const controls = page.locator('a[href], button, summary')
  for (const control of await controls.all()) {
    if (!(await control.isVisible())) continue
    const box = await control.boundingBox()
    expect(box?.width, 'HIG-02: touch target width').toBeGreaterThanOrEqual(44)
    expect(box?.height, 'HIG-02: touch target height').toBeGreaterThanOrEqual(44)
  }

  const viewport = page.viewportSize()!
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width)
  await testInfo.attach(`lp-${testInfo.project.name}`, { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' })

  const lead = page.locator('.hero-lead')
  const originalFont = await lead.evaluate((element) => parseFloat(getComputedStyle(element).fontSize))
  await page.addStyleTag({ content: 'html { font-size: 200% !important; }' })
  const largeFont = await lead.evaluate((element) => parseFloat(getComputedStyle(element).fontSize))
  expect(largeFont, 'HIG-03: meaningful text really scales').toBeGreaterThanOrEqual(originalFont * 1.9)
  expect(await page.evaluate(() => document.documentElement.scrollWidth), 'HIG-03: no horizontal scroll at 200% text').toBeLessThanOrEqual(viewport.width)
  await testInfo.attach(`lp-large-text-${testInfo.project.name}`, { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' })

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  const moving = await page.evaluate(() => document.getAnimations().filter((animation) => animation.playState === 'running' && Number(animation.effect?.getTiming().duration) > 100).length)
  expect(moving, 'HIG-05: no continuous motion in reduced-motion mode').toBe(0)
  expect(await page.locator('audio[autoplay], video[autoplay]:not([muted])').count()).toBe(0)

  // デモへのリンクは本番アプリを指す
  const demoLinks = page.getByRole('link', { name: /デモを試す/ })
  expect(await demoLinks.count()).toBeGreaterThanOrEqual(2)
  for (const link of await demoLinks.all()) expect(await link.getAttribute('href')).toBe('https://doc-gif.github.io/jtcc-group-e/')
  expect(errors).toEqual([])
})
