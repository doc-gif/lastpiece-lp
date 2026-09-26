// 計測タグ（site/analytics.js）の除外ロジックと読み込み内容を確かめる。外部（Google・Microsoft）へは実際には何も送らない。
import { expect, test, type Page } from '@playwright/test'

const trackerHost = /googletagmanager\.com|google-analytics\.com|clarity\.ms/

// 計測先へのリクエストを記録して止める。止めることで、公開ホストを装うテストでも実際には送信しない。
async function blockTrackers(page: Page) {
  const requests: string[] = []
  await page.route(trackerHost, (route) => { requests.push(route.request().url()); return route.abort() })
  return requests
}

function collectPageErrors(page: Page) {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  return errors
}

test('127.0.0.1（CI・ローカル）では計測タグを読み込まず、lpTrack を呼んでもエラーにならない', async ({ page }) => {
  const errors = collectPageErrors(page)
  const requests = await blockTrackers(page)

  await page.goto('./')
  await page.waitForLoadState('networkidle')
  expect(await page.evaluate(() => typeof (window as unknown as { lpTrack: unknown }).lpTrack)).toBe('function')
  await page.evaluate(() => (window as unknown as { lpTrack: (event: string, params?: object) => void }).lpTrack('cta_click', { cta_position: 'hero' }))
  expect(await page.evaluate(() => 'gtag' in window || 'clarity' in window || 'dataLayer' in window)).toBe(false)
  expect(requests).toEqual([])
  expect(errors).toEqual([])
})

test('?internal=1 で以後ずっと除外し、?internal=0 で解除する', async ({ page }) => {
  const errors = collectPageErrors(page)
  const requests = await blockTrackers(page)

  await page.goto('./?internal=1')
  expect(await page.evaluate(() => localStorage.getItem('lp_internal'))).toBe('1')
  await page.goto('./')
  expect(await page.evaluate(() => localStorage.getItem('lp_internal'))).toBe('1')
  await page.goto('./?internal=0')
  expect(await page.evaluate(() => localStorage.getItem('lp_internal'))).toBeNull()
  expect(requests).toEqual([])
  expect(errors).toEqual([])
})

// 公開 URL を装い、自動操作の目印（navigator.webdriver）を外したときだけタグが入ることを確かめる。
// HTML・CSS・JS はローカルのサーバーから返し、計測先へのリクエストは止める。
test.describe('公開ホストでの読み込み（送信は止めて確認）', () => {
  const publicUrl = 'https://doc-gif.github.io/lastpiece-lp/'

  test.beforeEach(async ({ page, baseURL }) => {
    await page.addInitScript(() => Object.defineProperty(Navigator.prototype, 'webdriver', { get: () => false }))
    await page.route(`${publicUrl}**`, async (route) => {
      const url = route.request().url().replace(publicUrl, baseURL!)
      return route.fulfill({ response: await route.fetch({ url }) })
    })
  })

  test('GA4 と Clarity を読み込み、広告向け機能を切った設定で page_view を送る', async ({ page }) => {
    const errors = collectPageErrors(page)
    const requests = await blockTrackers(page)

    await page.goto(`${publicUrl}?debug_mode=1`)
    await expect.poll(() => requests.length).toBeGreaterThanOrEqual(2)
    expect(requests.some((url) => url.startsWith('https://www.googletagmanager.com/gtag/js?id=G-3DDS1NJZXS'))).toBe(true)
    expect(requests.some((url) => url === 'https://www.clarity.ms/tag/yo6yjo7ath')).toBe(true)

    const config = await page.evaluate(() => {
      const layer = (window as unknown as { dataLayer: ArrayLike<unknown>[] }).dataLayer.map((entry) => Array.from(entry))
      return layer.find((entry) => entry[0] === 'config')
    })
    expect(config).toEqual(['config', 'G-3DDS1NJZXS', { send_page_view: true, allow_google_signals: false, allow_ad_personalization_signals: false, debug_mode: true }])

    // lpTrack は文字列・数値・真偽値だけを送り、それ以外（オブジェクトなど）は落とす
    const event = await page.evaluate(() => {
      const w = window as unknown as { lpTrack: (event: string, params?: object) => void, dataLayer: ArrayLike<unknown>[] }
      w.lpTrack('cta_click', { cta_position: 'hero', cta_label: 'x'.repeat(150), count: 1, ok: true, nested: { name: 'nickname' } })
      return Array.from(w.dataLayer[w.dataLayer.length - 1])
    })
    expect(event).toEqual(['event', 'cta_click', { cta_position: 'hero', cta_label: 'x'.repeat(100), count: 1, ok: true }])
    expect(errors).toEqual([])
  })

  test('debug_mode を付けないときは設定に debug_mode を含めない', async ({ page }) => {
    const requests = await blockTrackers(page)
    await page.goto(publicUrl)
    await expect.poll(() => requests.length).toBeGreaterThanOrEqual(2)
    const config = await page.evaluate(() => (window as unknown as { dataLayer: ArrayLike<unknown>[] }).dataLayer.map((entry) => Array.from(entry)).find((entry) => entry[0] === 'config'))
    expect(config?.[2]).not.toHaveProperty('debug_mode')
  })

  test('?internal=1 の端末では公開ホストでも読み込まない', async ({ page }) => {
    const errors = collectPageErrors(page)
    const requests = await blockTrackers(page)

    await page.goto(`${publicUrl}?internal=1`)
    await page.goto(publicUrl)
    await page.waitForLoadState('networkidle')
    expect(await page.evaluate(() => localStorage.getItem('lp_internal'))).toBe('1')
    expect(await page.evaluate(() => 'gtag' in window || 'clarity' in window)).toBe(false)
    expect(requests).toEqual([])
    expect(errors).toEqual([])
  })
})
