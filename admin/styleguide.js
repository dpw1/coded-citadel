/* Styleguide page behaviour only — demo interactions and nav highlighting.
   None of this is required by ccstyle.css. */

(function () {
  'use strict'

  // --- Sidebar demo: collapse toggle + group expand/collapse ---------------

  const sidebar = document.getElementById('sg-sidebar')

  document.querySelector('[data-sg-collapse]')?.addEventListener('click', () => {
    sidebar?.classList.toggle('CCSTYLE__sidebar--collapsed')
  })

  document.querySelectorAll('[data-sg-group] .CCSTYLE__sidebar__group-head').forEach((head) => {
    head.addEventListener('click', () => {
      const group = head.closest('[data-sg-group]')
      if (!group) return
      const open = group.classList.toggle('CCSTYLE__sidebar__group--open')
      head.setAttribute('aria-expanded', open ? 'true' : 'false')
    })
  })

  document.querySelectorAll('.CCSTYLE__sidebar__subitem').forEach((btn) => {
    btn.addEventListener('click', () => {
      const list = btn.closest('.CCSTYLE__sidebar__group-items')
      list
        ?.querySelectorAll('.CCSTYLE__sidebar__subitem--active')
        .forEach((el) => el.classList.remove('CCSTYLE__sidebar__subitem--active'))
      btn.classList.add('CCSTYLE__sidebar__subitem--active')
    })
  })

  // --- Chip + tab demos: make the examples feel alive ----------------------

  document.querySelectorAll('.CCSTYLE__chips').forEach((group) => {
    group.addEventListener('click', (event) => {
      const chip = event.target.closest('.CCSTYLE__chip')
      if (!chip || chip.disabled) return
      group
        .querySelectorAll('.CCSTYLE__chip--active')
        .forEach((el) => el.classList.remove('CCSTYLE__chip--active'))
      chip.classList.add('CCSTYLE__chip--active')
    })
  })

  document.querySelectorAll('.CCSTYLE__tabs').forEach((group) => {
    group.addEventListener('click', (event) => {
      const tab = event.target.closest('.CCSTYLE__tab')
      if (!tab) return
      group.querySelectorAll('.CCSTYLE__tab').forEach((el) => {
        el.classList.remove('CCSTYLE__tab--active')
        el.setAttribute('aria-selected', 'false')
      })
      tab.classList.add('CCSTYLE__tab--active')
      tab.setAttribute('aria-selected', 'true')
    })
  })

  // --- Modal demo ----------------------------------------------------------

  const modal = document.getElementById('sg-modal')

  function closeModal() {
    if (modal) modal.hidden = true
  }

  document.querySelector('[data-sg-modal-open]')?.addEventListener('click', () => {
    if (modal) modal.hidden = false
  })

  document.querySelectorAll('[data-sg-modal-close]').forEach((btn) => {
    btn.addEventListener('click', closeModal)
  })

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal()
  })

  // --- Highlight the nav link for the section in view ----------------------

  const links = Array.from(document.querySelectorAll('.SG__nav__links a'))
  const sections = links
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean)

  if ('IntersectionObserver' in window && sections.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          links.forEach((link) => {
            link.classList.toggle(
              'is-active',
              link.getAttribute('href') === `#${entry.target.id}`,
            )
          })
        })
      },
      { rootMargin: '-10% 0px -80% 0px' },
    )
    sections.forEach((section) => observer.observe(section))
  }
})()
