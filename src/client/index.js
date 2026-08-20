/**
 * 爱弥斯 (Aemeath) skin — presentation-only client plugin for the dsh web GUI.
 *
 * The DOM-decoration architecture adapts the maid-atelier skin (see NOTICE):
 * a body attribute scopes the stylesheet, body-level custom properties carry
 * the artwork, and every skin-owned write is restored by the Cordis effect
 * disposer before it can leak into another activation or another skin.
 *
 * This file is a bundle-scope module: scripts/build.mjs concatenates
 * background-art.generated.js and this file inside the single
 * __ModuleLoader__ factory scope, so there are deliberately no import/export
 * statements here except the trailing `apply` hand-off appended by the
 * assembler. Symbols in scope: CHAT_BACKDROP / RASTER_HEART_MARK /
 * SIDEBAR_MARK / CHAT_MARK (background-art.generated.js).
 */

const SKIN_OWNER = 'aemeath'
const SKIN_TITLE = '爱弥斯 · DeepSeek Harness'
const SKIN_SYSTEM_CHROME_COLOR = '#1e1430'
const SIDEBAR_COLUMN_SELECTOR = ":is([data-pane='sidebar'], [class*='sidebarCol'])"
const ACTIVE_CHAT_SELECTOR = "[data-phase='active'] [data-chat-flow]"
const COMPOSER_CARD_SELECTOR = "[data-phase='hero'] [data-composer-card], [data-phase='active'] [data-composer-card]"
const AGENT_RUNNING_SELECTOR = "[data-chat-flow] [class*='_turnStatus'], [data-composer-card] button[class*='_primary'] svg rect"
const AGENT_STATUS_TEXT = {
  online: 'Aemeath online',
  accessing: 'Accessing terminal...',
  running: 'Aemeath active...',
}
const ART_SLOT_PROPERTIES = [
  '--aemeath-chat-art',
  '--aemeath-raster-heart-art',
  '--aemeath-sidebar-mark-art',
  '--aemeath-chat-mark-art',
  '--aemeath-companion-art',
]

/** Four mecha HUD corner brackets, absolutely positioned by the stylesheet. */
function createHudCorners() {
  const corners = document.createElement('div')
  corners.dataset.skinChrome = 'sidebar-corners'
  corners.dataset.skinOwner = SKIN_OWNER
  corners.setAttribute('aria-hidden', 'true')
  for (const position of ['top-left', 'top-right', 'bottom-right', 'bottom-left']) {
    const corner = document.createElement('span')
    corner.dataset.skinCorner = position
    corners.append(corner)
  }
  return corners
}

/** Small brand signature that complements the host-owned wordmark. */
function createSidebarSignature() {
  const signature = document.createElement('span')
  signature.dataset.skinChrome = 'sidebar-signature'
  signature.dataset.skinOwner = SKIN_OWNER
  signature.setAttribute('aria-hidden', 'true')
  signature.textContent = 'AEMEATH'
  return signature
}

/** Live region displayed below the sidebar character. */
function createAgentStatus() {
  const status = document.createElement('div')
  status.dataset.skinChrome = 'agent-status'
  status.dataset.skinOwner = SKIN_OWNER
  status.setAttribute('role', 'status')
  status.setAttribute('aria-live', 'polite')
  status.textContent = AGENT_STATUS_TEXT.online
  return status
}

/** Toggle used by the assistant theme panel. */
function createAssistantToggle(label, pressed) {
  const button = document.createElement('button')
  button.type = 'button'
  button.dataset.assistantToggle = ''
  button.setAttribute('aria-pressed', String(pressed))
  button.textContent = label
  return button
}

/** Theme controls opened from the companion character. */
function createAssistantPanel() {
  const panel = document.createElement('section')
  panel.dataset.skinChrome = 'assistant-panel'
  panel.dataset.skinOwner = SKIN_OWNER
  panel.setAttribute('aria-label', 'Aemeath theme controls')
  panel.hidden = true

  const title = document.createElement('div')
  title.dataset.assistantPanelTitle = ''
  title.textContent = 'AEMEATH'

  const intensityControl = document.createElement('label')
  intensityControl.dataset.assistantControl = ''
  intensityControl.textContent = 'Theme intensity'
  const intensity = document.createElement('input')
  intensity.type = 'range'
  intensity.min = '0.55'
  intensity.max = '1'
  intensity.step = '0.05'
  intensity.value = '0.9'
  intensity.setAttribute('aria-label', 'Theme intensity')
  intensityControl.append(intensity)

  const dim = createAssistantToggle('Background dim', true)
  const particles = createAssistantToggle('Particle effects', true)
  panel.append(title, intensityControl, dim, particles)
  return { panel, intensity, dim, particles }
}

/**
 * Apply the pink mecha skin: wallpapers with a legibility scrim, the heart
 * tacet marks (composer + sidebar), HUD chrome and state projection. Every
 * DOM and CSS write is retracted by the disposer registered through
 * `ctx.effect`.
 */
function apply(ctx) {
  const body = document.body
  const originalTitle = document.title

  const previousProperties = new Map()
  for (const property of [
    '--aemeath-sidebar-width',
    '--aemeath-theme-intensity',
    ...ART_SLOT_PROPERTIES,
  ]) {
    previousProperties.set(property, body.style.getPropertyValue(property))
  }

  const ownedNodes = new Set()
  const decoratedElements = new Set()
  let observer = undefined
  let resizeObserver = undefined
  let observedSidebar = undefined
  let themeColorMeta = null
  let previousThemeColor = undefined
  let themeColorObserver = undefined
  let agentStatus = undefined
  let currentAgentState = undefined
  let completionTimer = undefined
  let conversationMark = undefined
  let assistantPanel = undefined
  let onDocumentPointerDown = undefined
  let onDocumentKeyDown = undefined

  ctx.effect(() => () => {
    delete body.dataset.dshAemeath
    delete body.dataset.aemeathChatActive
    delete body.dataset.aemeathSidebarSize
    delete body.dataset.aemeathAgentState
    delete body.dataset.aemeathCompleted
    delete body.dataset.aemeathAssistantOpen
    delete body.dataset.aemeathDim
    delete body.dataset.aemeathParticlesOff
    observer?.disconnect()
    themeColorObserver?.disconnect()
    resizeObserver?.disconnect()
    if (completionTimer !== undefined) window.clearTimeout(completionTimer)
    if (onDocumentPointerDown !== undefined) document.removeEventListener('pointerdown', onDocumentPointerDown)
    if (onDocumentKeyDown !== undefined) document.removeEventListener('keydown', onDocumentKeyDown)
    for (const [property, value] of previousProperties) {
      body.style.setProperty(property, value)
    }
    ownedNodes.forEach(element => element.remove())
    decoratedElements.forEach((element) => {
      delete element.dataset.aemeathSidebarFooter
    })
    if (themeColorMeta?.isConnected && themeColorMeta.content === SKIN_SYSTEM_CHROME_COLOR) {
      themeColorMeta.content = previousThemeColor ?? ''
    }
    if (document.title === SKIN_TITLE) document.title = originalTitle
  }, 'ui-skin-aemeath: pink mecha skin')

  body.dataset.dshAemeath = ''
  body.dataset.aemeathDim = ''

  // Artwork slots consumed by the stylesheet. The stylesheet owns every
  // background layer (scrim + wallpaper) so light/dark switching re-tints the
  // scrim without touching the artwork URL.
  body.style.setProperty('--aemeath-chat-art', `url(${CHAT_BACKDROP})`)
  body.style.setProperty('--aemeath-raster-heart-art', `url(${RASTER_HEART_MARK})`)
  body.style.setProperty('--aemeath-sidebar-mark-art', `url(${SIDEBAR_MARK})`)
  body.style.setProperty('--aemeath-chat-mark-art', `url(${CHAT_MARK})`)
  body.style.setProperty('--aemeath-companion-art', `url(${CHAT_COMPANION})`)

  // Browser chrome color follows the plum shell.
  const syncSystemChrome = () => {
    const meta = document.head.querySelector('meta[name="theme-color"]')
    if (meta === null) return
    if (meta !== themeColorMeta) {
      themeColorMeta = meta
      previousThemeColor = meta.content
    }
    if (meta.content !== SKIN_SYSTEM_CHROME_COLOR) meta.content = SKIN_SYSTEM_CHROME_COLOR
  }
  themeColorObserver = new MutationObserver(syncSystemChrome)
  themeColorObserver.observe(document.head, {
    attributes: true,
    attributeFilter: ['content'],
    childList: true,
    subtree: true,
  })
  syncSystemChrome()

  // Sidebar decoration: footer mark (heart slot above the Plan/settings
  // button) and the HUD corner brackets.
  const decorateSidebar = () => {
    const sidebar = document.querySelector(SIDEBAR_COLUMN_SELECTOR)
    if (!sidebar) return

    sidebar.querySelectorAll('[data-aemeath-sidebar-footer]').forEach((element) => {
      delete element.dataset.aemeathSidebarFooter
    })
    const settingsSlot = sidebar.querySelector("[data-slot='sidebar.settings']")
    if (settingsSlot) {
      let footer = settingsSlot.parentElement
      while (footer && footer !== sidebar) {
        if (footer.querySelector("[data-slot='sidebar.footer.action']")) {
          footer.dataset.aemeathSidebarFooter = ''
          decoratedElements.add(footer)
          const existingStatus = footer.querySelector("[data-skin-chrome='agent-status']")
          if (existingStatus !== null) {
            agentStatus = existingStatus
          } else {
            agentStatus = createAgentStatus()
            ownedNodes.add(agentStatus)
            footer.append(agentStatus)
          }
          break
        }
        footer = footer.parentElement
      }
    }

    if (!sidebar.querySelector("[data-skin-chrome='sidebar-signature']")) {
      const brand = sidebar.querySelector("[class*='_logoRow'] [class*='_brand']")
      if (brand !== null) {
        const signature = createSidebarSignature()
        ownedNodes.add(signature)
        brand.append(signature)
      }
    }

    if (!sidebar.querySelector("[data-skin-chrome='sidebar-corners']")) {
      const corners = createHudCorners()
      ownedNodes.add(corners)
      sidebar.prepend(corners)
    }
  }

  // Sidebar width → --aemeath-sidebar-width (trim offsets) and a size bucket.
  const applySidebarWidth = (width) => {
    if (width <= 0) return
    body.style.setProperty('--aemeath-sidebar-width', `${Math.round(width * 100) / 100}px`)
    body.dataset.aemeathSidebarSize = width <= 120 ? 'rail' : width <= 220 ? 'narrow' : 'wide'
  }

  const ensureSidebarObserved = () => {
    const sidebar = document.querySelector(SIDEBAR_COLUMN_SELECTOR)
    if (!resizeObserver || sidebar === observedSidebar) return
    if (!sidebar) {
      if (observedSidebar) resizeObserver.unobserve(observedSidebar)
      observedSidebar = undefined
      return
    }
    if (observedSidebar) resizeObserver.unobserve(observedSidebar)
    observedSidebar = sidebar
    resizeObserver.observe(sidebar)
  }

  // Projected conversation state: bottom trim retracts while a chat is open.
  const syncChatState = () => {
    body.toggleAttribute('data-aemeath-chat-active', document.querySelector(ACTIVE_CHAT_SELECTOR) !== null)
  }

  /** Project stable host DOM state into the character and composer core. */
  const syncAgentState = () => {
    const input = document.querySelector('[data-composer-card] textarea[data-phase]')
    const phase = input?.getAttribute('data-phase')
    const nextState = phase === 'adjudicating' || phase === 'submitting'
      ? 'accessing'
      : document.querySelector(AGENT_RUNNING_SELECTOR) !== null
        ? 'running'
        : 'online'
    const completed = (currentAgentState === 'running' || currentAgentState === 'accessing')
      && nextState === 'online'
    currentAgentState = nextState
    body.dataset.aemeathAgentState = nextState
    if (agentStatus?.isConnected) agentStatus.textContent = AGENT_STATUS_TEXT[nextState]
    if (!completed) return
    body.dataset.aemeathCompleted = ''
    if (completionTimer !== undefined) window.clearTimeout(completionTimer)
    completionTimer = window.setTimeout(() => {
      delete body.dataset.aemeathCompleted
      completionTimer = undefined
    }, 820)
  }

  // Composer heart: structurally bound to the input box. The node lives as a
  // child of the composer card and the stylesheet pins it to `bottom: 100%`,
  // so the browser keeps it glued to the card's top edge through every phase
  // transition, resize and reflow — no JS positioning, no tracking lag.
  const composerHeart = document.createElement('div')
  composerHeart.dataset.skinChrome = 'composer-heart'
  composerHeart.dataset.skinOwner = SKIN_OWNER
  composerHeart.setAttribute('aria-hidden', 'true')
  ownedNodes.add(composerHeart)

  // Conversation companion: the character mark floats at the top-right of the
  // conversation panel, above the wallpaper but below dialogs.
  conversationMark = document.createElement('button')
  conversationMark.type = 'button'
  conversationMark.dataset.skinChrome = 'conversation-mark'
  conversationMark.dataset.skinOwner = SKIN_OWNER
  conversationMark.setAttribute('aria-label', 'Open Aemeath theme controls')
  conversationMark.setAttribute('aria-expanded', 'false')
  ownedNodes.add(conversationMark)
  body.append(conversationMark)

  const controls = createAssistantPanel()
  assistantPanel = controls.panel
  ownedNodes.add(assistantPanel)
  body.append(assistantPanel)

  const setAssistantOpen = (open) => {
    body.toggleAttribute('data-aemeath-assistant-open', open)
    conversationMark.setAttribute('aria-expanded', String(open))
    assistantPanel.hidden = !open
  }
  conversationMark.addEventListener('click', () => {
    setAssistantOpen(conversationMark.getAttribute('aria-expanded') !== 'true')
  })
  controls.intensity.addEventListener('input', () => {
    body.style.setProperty('--aemeath-theme-intensity', controls.intensity.value)
  })
  controls.dim.addEventListener('click', () => {
    const enabled = controls.dim.getAttribute('aria-pressed') !== 'true'
    controls.dim.setAttribute('aria-pressed', String(enabled))
    body.toggleAttribute('data-aemeath-dim', enabled)
  })
  controls.particles.addEventListener('click', () => {
    const enabled = controls.particles.getAttribute('aria-pressed') !== 'true'
    controls.particles.setAttribute('aria-pressed', String(enabled))
    body.toggleAttribute('data-aemeath-particles-off', !enabled)
  })
  onDocumentPointerDown = (event) => {
    if (conversationMark.getAttribute('aria-expanded') !== 'true') return
    if (event.target instanceof Node && (conversationMark.contains(event.target) || assistantPanel.contains(event.target))) return
    setAssistantOpen(false)
  }
  onDocumentKeyDown = (event) => {
    if (event.key === 'Escape') setAssistantOpen(false)
  }
  document.addEventListener('pointerdown', onDocumentPointerDown)
  document.addEventListener('keydown', onDocumentKeyDown)

  const decorateComposer = () => {
    const card = document.querySelector(COMPOSER_CARD_SELECTOR)
    if (!card) return
    if (card.querySelector("[data-skin-chrome='composer-heart']")) return
    card.append(composerHeart)
  }

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver((entries) => {
      const entry = entries.at(-1)
      if (!entry) return
      applySidebarWidth(entry.contentRect.width)
    })
  }

  decorateSidebar()
  ensureSidebarObserved()
  syncChatState()
  decorateComposer()
  syncAgentState()

  const initialSidebar = document.querySelector(SIDEBAR_COLUMN_SELECTOR)
  if (initialSidebar) applySidebarWidth(initialSidebar.getBoundingClientRect().width)

  const isSkinChrome = (node) => (
    node instanceof Element && node.getAttribute('data-skin-owner') === SKIN_OWNER
  )

  // Re-decorate when the sidebar or the composer card mounts / remounts;
  // re-project the chat state when the phase machine flips.
  observer = new MutationObserver((records) => {
    let sidebarChanged = false
    let phaseChanged = false
    let composerChanged = false
    let agentStateChanged = false
    for (const record of records) {
      if (record.type === 'attributes') {
        if (record.attributeName === 'data-phase') {
          phaseChanged = true
          agentStateChanged = true
        }
        continue
      }
      const appNodes = [...record.addedNodes, ...record.removedNodes]
        .filter(node => node instanceof Element && !isSkinChrome(node))
      if (appNodes.length > 0) agentStateChanged = true
      if (appNodes.some(node => (
        node.matches(SIDEBAR_COLUMN_SELECTOR)
        || node.querySelector(SIDEBAR_COLUMN_SELECTOR) !== null
        || (record.target instanceof Element && record.target.closest(SIDEBAR_COLUMN_SELECTOR) !== null)
      ))) {
        sidebarChanged = true
      }
      if (appNodes.some(node => (
        node.matches("[data-phase='hero'], [data-phase='active']")
        || node.matches('[data-composer-card]')
        || node.querySelector('[data-composer-card]') !== null
      ))) {
        phaseChanged = true
        composerChanged = true
      }
    }
    if (phaseChanged) syncChatState()
    if (composerChanged) decorateComposer()
    if (sidebarChanged) {
      decorateSidebar()
      ensureSidebarObserved()
      const sidebar = document.querySelector(SIDEBAR_COLUMN_SELECTOR)
      if (sidebar) applySidebarWidth(sidebar.getBoundingClientRect().width)
    }
    if (agentStateChanged) syncAgentState()
  })
  observer.observe(body, {
    attributes: true,
    attributeFilter: ['data-phase'],
    childList: true,
    subtree: true,
  })

  // Bottom trim: the pink signal line; the stylesheet retracts it while a
  // conversation is active so it never collides with the bottom composer.
  const bottomTrim = document.createElement('div')
  bottomTrim.dataset.skinChrome = 'bottom-trim'
  bottomTrim.dataset.skinOwner = SKIN_OWNER
  bottomTrim.setAttribute('aria-hidden', 'true')
  ownedNodes.add(bottomTrim)
  body.append(bottomTrim)

  const favicon = document.createElement('link')
  favicon.rel = 'icon'
  favicon.type = 'image/webp'
  favicon.href = RASTER_HEART_MARK
  favicon.dataset.skinChrome = 'favicon'
  favicon.dataset.skinOwner = SKIN_OWNER
  ownedNodes.add(favicon)
  document.head.append(favicon)

  document.title = SKIN_TITLE
}
