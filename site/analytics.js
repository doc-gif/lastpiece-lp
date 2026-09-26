// LP の計測タグ（GA4 + Microsoft Clarity）。依存なしの素の JS。
// 共有の設定値はこのファイルの先頭の定数だけに置く（親 Issue #1 のコメントが正）。測定 ID・プロジェクト ID は公開値で、秘密ではない。
// 127.0.0.1／localhost／自動操作のブラウザ（Playwright・CI）／?internal=1 の端末では何も読み込まず、何も送らない。
;(function () {
  'use strict'

  var GA_MEASUREMENT_ID = 'G-3DDS1NJZXS'
  var CLARITY_PROJECT_ID = 'yo6yjo7ath'
  var INTERNAL_KEY = 'lp_internal'

  var params = new URLSearchParams(location.search)

  // ?internal=1 で以後ずっと除外、?internal=0 で解除。localStorage が使えない環境でも止まらない。
  var internal = false
  try {
    if (params.get('internal') === '1') localStorage.setItem(INTERNAL_KEY, '1')
    else if (params.get('internal') === '0') localStorage.removeItem(INTERNAL_KEY)
    internal = localStorage.getItem(INTERNAL_KEY) === '1'
  } catch (error) {
    internal = params.get('internal') === '1'
  }

  var host = location.hostname
  var excluded = internal || host === '' || host === 'localhost' || host === '127.0.0.1' || navigator.webdriver === true

  var loaded = false

  // 他のスクリプト（events.js など）から呼ぶ入口。除外中・未読み込みのときは何もしない。
  // 送るのは文字列・数値・真偽値だけ。文字列は GA4 の上限に合わせて 100 文字で切る。ニックネームや自由入力は呼び出し側で渡さない。
  window.lpTrack = function (event, eventParams) {
    if (!loaded || typeof event !== 'string' || event === '') return
    var safe = {}
    if (eventParams && typeof eventParams === 'object') {
      Object.keys(eventParams).forEach(function (key) {
        var value = eventParams[key]
        if (typeof value === 'string') safe[key] = value.slice(0, 100)
        else if (typeof value === 'number' || typeof value === 'boolean') safe[key] = value
      })
    }
    window.gtag('event', event, safe)
  }

  if (excluded) return

  // GA4（gtag.js）。Google シグナルと広告向け機能はオフ。
  window.dataLayer = window.dataLayer || []
  window.gtag = function () { window.dataLayer.push(arguments) }
  var gtagScript = document.createElement('script')
  gtagScript.async = true
  gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_MEASUREMENT_ID)
  document.head.appendChild(gtagScript)

  var config = { send_page_view: true, allow_google_signals: false, allow_ad_personalization_signals: false }
  // DebugView での確認用。debug_mode は値に関係なく付けるだけで有効になるので、?debug_mode=1 のときだけ付ける。
  if (params.get('debug_mode') === '1') config.debug_mode = true
  window.gtag('js', new Date())
  window.gtag('config', GA_MEASUREMENT_ID, config)
  loaded = true

  // Microsoft Clarity の公式スニペット（マスキングはダッシュボード既定の Balanced のまま）。
  ;(function (c, l, a, r, i, t, y) {
    c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments) }
    t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i
    y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y)
  })(window, document, 'clarity', 'script', CLARITY_PROJECT_ID)
})()
