// See how to use: https://codepen.io/xyzanon/pen/qQRgNX

// Event logging

// Define what event types we listen to,
// i.e. if e.g. mouseover can trigger dom changes we listen to those also
const trackedEvents = ['click']

// This is where we store all events that we catch
const eventLog = {}

const lastEventToHistory = (eventName, log) => {
  log.eventHistory = log.eventHistory || []
  log.eventHistory.push({
    eventName,
    index: log[eventName].length - 1,
  })
}

// Initialise log with wanted event listener hooks
const initialiseEventLog = (eventName) => {
  if (trackedEvents.includes(eventName)) {
    eventLog[eventName] = eventLog[eventName] || []
    lastEventToHistory(eventName, eventLog)
  }
}

// Log an event in right event type array
// so logs per event type
const logEvent = (eventName, event) => {
  if (trackedEvents.includes(eventName)) {
    eventLog[eventName].push(event)
    lastEventToHistory(eventName, eventLog)
    console.info('Tracked event logged', eventName, eventLog)
  }
}

// Log all dom modifying events, with only index as reference, in chronological
// order to each other (can be in different event type arrays)
const logDomModifyingEvents = () => {
  eventLog.domModifyingEvents = eventLog.domModifyingEvents || []
  eventLog.domModifyingEvents.push({
    historyIndex: eventLog.eventHistory.length,
    // same as index + 1, next item is the right event reference
  })
}

// Hijack all addEventListeners in window

// Override for adding event listeners
const oldAddEventListener = EventTarget.prototype.addEventListener
EventTarget.prototype.addEventListener = (eventName, eventHandler) => {
  initialiseEventLog(eventName)
  oldAddEventListener.call(
    this, eventName, (event) => {
      logEvent(eventName, event)
      eventHandler(event)
    }
  )
}

// Get x path, give element get path
const getXPath = (element) => {
  if (element.id !== '') return `id("${element.id}")`
  if (element === document.body) return element.tagName

  let ix = 0
  const siblings = element.parentNode.childNodes
  // const sibling of siblings
  for (let i = 0; i < siblings.length; i += 1) {
    const sibling = siblings[i]
    if (sibling === element) return `${getXPath(element.parentNode)}/${element.tagName}[${ix + 1}]`
    if (sibling.nodeType === 1 && sibling.tagName === element.tagName) ix += 1
  }
  return null // never reaches this
}

// Reverse x path, get element
const getElementByXPath = path => new XPathEvaluator().evaluate(
  path,
  document.documentElement,
  null,
  XPathResult.FIRST_ORDERED_NODE_TYPE,
  null
).singleNodeValue

// Observer for dom
const startObservingDomChange = () => {
  // Create new observer
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((m) => {
      const entry = {
        mutation: m,
        el: m.target,
        value: m.target,
        oldValue: m.oldValue,
        addedNodes: m.addedNodes,
        removedNodes: m.removedNodes,
      }

      console.log('🤖', 'Recording mutation', entry, JSON.stringify(eventLog))
      logDomModifyingEvents()

      observer.disconnect()
      startObservingDomChange()
    })
  })

  const targetNode = document.querySelector('.feedback-target-container')
  const config = {
    attributes: false,
    childList: true,
    subtree: true,
  }
  observer.observe(targetNode, config)
}


// This is needed for recreating the clicks that has triggered the dom changes
const simulateEvents = (trace) => {
  if (trace) {
    console.log('📲', 'Simulate events from trace', trace)
    trace.forEach(
      (step) => {
        getElementByXPath(step).click()
      }
    )
  }
}

// Get what was actually clicked to modify the dom, save those paths to those elements
const getEventTrace = () => {
  const l = eventLog
  if (!l.domModifyingEvents) return null
  const events = l.domModifyingEvents.map(
    (dme) => {
      const historyObject = l.eventHistory[dme.historyIndex]
      // Get what key to find correct event type array
      const eventLogKey = historyObject.eventName
      // Get index in that array for correct event object
      const eventLogArrayIndex = historyObject.index
      const event = l[eventLogKey][eventLogArrayIndex]
      return getXPath(event.path[0])
    }
  )
  return events
}

/*
*
* DEMO USAGE BELOW
*
* */

// Tagging

const localStorageKey = 'swp1-tagging-concept' // TODO: demo

// TODO: mock api load -> fetch
const getCommentsArray = () => JSON.parse(localStorage.getItem(localStorageKey)) || []

const attributeName = 'data-comment-count'

// This writes the comments to the dom
const loadTags = () => {
  const items = getCommentsArray()
  console.log('💾', 'getCommentsArray in loadTags =>  items', items)
  items.forEach((item) => {
    let el = getElementByXPath(item.path)
    if (!el) {
      // Element is not in DOM
      // Simulate events
      simulateEvents(item.trace)
      el = getElementByXPath(item.path)
    }
    if (el) {
      let value = el.getAttribute(attributeName) || 0
      el.setAttribute(attributeName, ++value)
      let title = el.getAttribute('title') || ''
      title = title.length ? `${title}, ` : title
      el.setAttribute('title', title + item.comment)
    }
  })
}

// new tag is added, remove all add new
const refreshTags = () => {
  ['title', attributeName].forEach((a) => {
    document.querySelectorAll(`[${a}]`).forEach(el => el.removeAttribute(a))
  })
  loadTags()
}

// TODO: mock api save -> fetch
const saveTag = (el) => {
  const path = getXPath(el)
  const comment = prompt('Add comment')
  const trace = getEventTrace()
  console.log('🛤️', 'Tagged element path', path, 'trace for events', trace)
  const items = getCommentsArray()
  // Add to array
  items.push({
    path,
    trace,
    comment,
  })
  // Store
  localStorage.setItem(
    localStorageKey,
    JSON.stringify(items)
  )
  // Refresh view
  refreshTags()
}

// Listeners

// Clicks

// This is state
let markingMode = false

const toggleMarkingMode = () => {
  document
    .querySelector('.feedback-target-container')
    .classList.toggle('marking-mode')
  markingMode = !markingMode
}

// Helper, safezone is a class that makes that element non markable,
// this is usable if dev wants to limit what can be commented
// also the feedbacker root (and all children) should be "blacklisted"
const isMarkable = el => !el.classList.contains('safezone') && !['html', 'body'].includes(el.tagName)

document.body.addEventListener('click', (event) => {
  if (markingMode) {
    if (isMarkable(event.target)) {
      saveTag(event.target)
      toggleMarkingMode()
    }
  }
})

// Used in hover
const markableToggle = (el) => {
  if (isMarkable(el)) {
    if (markingMode) el.classList.toggle('highlighted')
    else el.classList.remove('highlighted')
  }
}

// Hovers

// Add the highlight
document.body.addEventListener('mouseover', event => markableToggle(event.target))

// Remove the highlight
document.body.addEventListener('mouseout', event => markableToggle(event.target))

// Init

// This means that we always render the old comments on load and
// then immediately listen to what user does in UI
const init = () => {
  loadTags()
  startObservingDomChange()
}

init()
