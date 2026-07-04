import { appFilterLabel } from './apps'

const SUBTITLE = 'Here is a quick guide to use the extension.'

const DEFAULT_STEPS = [
  { html: 'Pin the extension icon in Chrome\u2019s toolbar for quick access.' },
  {
    html:
      'Click the extension icon in your toolbar to open it. <img src="/images/extension-toolbar-hint.jpg" alt="Click the extension icon in the Chrome toolbar" width="320" loading="lazy" />',
  },
  { html: 'Use it on the page you installed it for.' },
]

/** Fallback thank-you copy when quickStart is missing from the app record. */
export function getThankYouFallback(installedApp) {
  return {
    name: installedApp ? appFilterLabel(installedApp) : 'your extension',
    subtitle: SUBTITLE,
    steps: DEFAULT_STEPS,
  }
}

export { SUBTITLE as THANK_YOU_SUBTITLE }
