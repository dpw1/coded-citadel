/**
 * Marquee3k — adapted from samples/scrolling-text.liquid (EZFY Text Scroller).
 * requestAnimationFrame-based horizontal scroll; clones content to fill the viewport.
 */

let animationId = 0
let MARQUEES = []

function isMobile() {
  return window.matchMedia('(max-width: 749px)').matches
}

class Marquee3k {
  constructor(element, options) {
    if (element.children.length === 0) {
      throw new Error('Marquee element needs a content child wrapper')
    }

    this.element = element
    this.selector = options.selector
    this.speed = element.dataset.speed || 0.25
    this.speedDesktop = parseFloat(element.dataset.speedDesktop)
    this.speedMobile = parseFloat(element.dataset.speedMobile)
    this.pausable = element.dataset.pausable?.toLowerCase() === 'true'
    this.reverse = element.dataset.reverse?.toLowerCase() === 'true'
    this.gapDesktop = parseInt(element.dataset.gapDesktop, 10) || 0
    this.gapMobile = parseInt(element.dataset.gapMobile, 10) || 0
    this.paused = false
    this.parent = element.parentElement
    this.parentProps = this.parent.getBoundingClientRect()
    this.content = element.children[0]
    this.offset = 0

    this._setupWrapper()
    this._setupEvents()

    this.wrapper.appendChild(this.content)
    this.element.appendChild(this.wrapper)

    this._setupContent()
  }

  _setupWrapper() {
    this.wrapper = document.createElement('div')
    this.wrapper.classList.add(`${this.selector}__wrapper`)
    this.wrapper.style.whiteSpace = 'nowrap'
  }

  _setupContent() {
    this.content.classList.add(`${this.selector}__copy`)
    this.content.style.display = 'inline-block'

    const gap = isMobile() ? this.gapMobile : this.gapDesktop
    this.contentWidth = this.content.offsetWidth + gap

    this.requiredReps =
      this.contentWidth > this.parentProps.width
        ? 2
        : Math.ceil((this.parentProps.width - this.contentWidth) / this.contentWidth) + 1

    for (let i = 0; i < this.requiredReps; i++) {
      this._createClone()
    }

    if (this.reverse) {
      this.offset = this.contentWidth * -1
    }

    this.element.classList.add('is-init')
  }

  _setupEvents() {
    this.element.addEventListener('mouseenter', () => {
      if (this.pausable) this.paused = true
    })

    this.element.addEventListener('mouseleave', () => {
      if (this.pausable) this.paused = false
    })
  }

  _createClone() {
    const clone = this.content.cloneNode(true)
    clone.style.display = 'inline-block'
    clone.classList.add(`${this.selector}__copy`)
    clone.setAttribute('aria-hidden', 'true')
    this.wrapper.appendChild(clone)
  }

  animate() {
    if (!this.paused) {
      const isScrolled = this.reverse ? this.offset < 0 : this.offset > this.contentWidth * -1
      const direction = this.reverse ? -1 : 1
      const reset = this.reverse ? this.contentWidth * -1 : 0

      if (isScrolled) {
        const speed = isMobile() ? this.speedMobile : this.speedDesktop
        this.offset -= speed * direction
      } else {
        this.offset = reset
      }

      this.wrapper.style.willChange = 'transform'
      this.wrapper.style.whiteSpace = 'nowrap'
      this.wrapper.style.transform = `translate(${this.offset}px, 0) translateZ(0)`
    }
  }

  _refresh() {
    this.contentWidth = this.content.offsetWidth
  }

  repopulate(difference, isLarger) {
    const gap = isMobile() ? this.gapMobile : this.gapDesktop
    this.contentWidth = this.content.offsetWidth + gap

    if (isLarger) {
      const amount = Math.ceil(difference / this.contentWidth) + 1
      for (let i = 0; i < amount; i++) {
        this._createClone()
      }
    }
  }

  static init(options = { selector: 'ccAnnouncementMarquee' }) {
    if (animationId) {
      window.cancelAnimationFrame(animationId)
    }

    MARQUEES = []
    const marquees = options.elements
      ? Array.from(options.elements)
      : Array.from(document.querySelectorAll(options.rootSelector || '[data-cc-marquee]'))

    let previousWidth = window.innerWidth
    let resizeTimer

    for (let i = 0; i < marquees.length; i++) {
      MARQUEES.push(new Marquee3k(marquees[i], options))
    }

    function tick() {
      for (let i = 0; i < MARQUEES.length; i++) {
        MARQUEES[i].animate()
      }
      animationId = window.requestAnimationFrame(tick)
    }

    tick()

    window.addEventListener('resize', onResize)

    function onResize() {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        const isLarger = previousWidth < window.innerWidth
        const difference = window.innerWidth - previousWidth
        for (let i = 0; i < MARQUEES.length; i++) {
          MARQUEES[i].repopulate(difference, isLarger)
        }
        previousWidth = window.innerWidth
      }, 250)
    }

    return () => {
      window.removeEventListener('resize', onResize)
      clearTimeout(resizeTimer)
    }
  }
}

let teardownResize = null

const ANNOUNCEMENT_ROOT = '[data-cc-announcement-marquee]'
const SELECTOR = 'ccAnnouncementMarquee'

/** Start announcement bar marquee (call after window load, mobile only). */
export function initAnnouncementMarquee() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null
  if (!isMobile()) return null

  const root = document.querySelector(ANNOUNCEMENT_ROOT)
  if (!root || root.querySelector(`.${SELECTOR}__copy`)) return null

  teardownResize = Marquee3k.init({
    selector: SELECTOR,
    elements: [root],
  })

  return teardownResize
}

/** Stop rAF loop, restore DOM (for React strict mode / remount). */
export function destroyAnnouncementMarquee() {
  if (animationId) {
    window.cancelAnimationFrame(animationId)
    animationId = 0
  }
  MARQUEES = []
  if (typeof teardownResize === 'function') {
    teardownResize()
    teardownResize = null
  }

  const root = document.querySelector(ANNOUNCEMENT_ROOT)
  if (!root) return

  const wrapper = root.querySelector(`.${SELECTOR}__wrapper`)
  const content = root.querySelector('.CC__announcement-bar__marquee-content')
  if (wrapper && content) {
    root.insertBefore(content, wrapper)
    wrapper.remove()
    content.classList.remove(`${SELECTOR}__copy`)
    content.style.display = ''
  }
  root.classList.remove('is-init')
}

export default Marquee3k
