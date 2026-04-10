const HEADING_ICON_MAP: Record<number, string> = {
  1: "📖",
  2: "📝",
  3: "✚",
  4: "▶",
}

const CALLOUT_LABEL_MAP: Record<string, string> = {
  info: "Note",
  warning: "Warning",
  success: "Success",
  error: "Error",
  note: "Note",
  clinical: "Clinical Correlation",
}

const CALLOUT_ICON_MAP: Record<string, string> = {
  info: "ℹ️",
  warning: "⚠️",
  success: "✅",
  error: "❌",
  note: "💡",
  clinical: "🩺",
}

export function stripWhitespaceTextNodes(html: string): string {
  if (!html || typeof document === "undefined") return html

  const container = document.createElement("div")
  container.innerHTML = html

  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT)
  const nodesToRemove: Text[] = []

  while (walker.nextNode()) {
    const textNode = walker.currentNode as Text
    if (textNode.textContent?.trim()) continue

    const parentTag = textNode.parentElement?.tagName.toLowerCase()
    if (parentTag === "pre" || parentTag === "code" || parentTag === "textarea") {
      continue
    }

    nodesToRemove.push(textNode)
  }

  nodesToRemove.forEach((node) => node.remove())
  return container.innerHTML
}

export function normalizeIncomingHtml(rawHtml: string): string {
  const html = rawHtml.trim()
  if (!html || typeof document === "undefined") return html

  const container = document.createElement("div")
  container.innerHTML = stripWhitespaceTextNodes(html)

  const headings = container.querySelectorAll("h1[data-custom-heading],h2[data-custom-heading],h3[data-custom-heading],h4[data-custom-heading]")
  headings.forEach((heading) => {
    const inferredLevel = Number(heading.tagName.replace("H", "")) || 1
    const level = Number(heading.getAttribute("data-level") || inferredLevel)
    heading.setAttribute("data-level", String(level))

    const icon = HEADING_ICON_MAP[level] || HEADING_ICON_MAP[1]
    let iconNode = heading.querySelector(":scope > span[data-custom-heading-icon]") as HTMLElement | null

    if (!iconNode) {
      iconNode = document.createElement("span")
      iconNode.setAttribute("data-custom-heading-icon", "")
      heading.insertBefore(iconNode, heading.firstChild)
    }

    iconNode.setAttribute("data-level", String(level))
    if (!iconNode.getAttribute("data-icon")) {
      iconNode.setAttribute("data-icon", icon)
    }
  })

  const callouts = container.querySelectorAll("blockquote[data-callout]")
  callouts.forEach((callout) => {
    const type = callout.getAttribute("data-type") || "info"
    callout.setAttribute("data-type", type)

    let headerNode = callout.querySelector(":scope > div[data-callout-header]") as HTMLElement | null
    if (!headerNode) {
      headerNode = document.createElement("div")
      headerNode.setAttribute("data-callout-header", "")
      callout.insertBefore(headerNode, callout.firstChild)
    }

    const icon = CALLOUT_ICON_MAP[type] || CALLOUT_ICON_MAP.info
    const label = CALLOUT_LABEL_MAP[type] || CALLOUT_LABEL_MAP.info
    headerNode.setAttribute("data-type", type)
    headerNode.setAttribute("data-icon", headerNode.getAttribute("data-icon") || icon)
    headerNode.setAttribute("data-label", headerNode.getAttribute("data-label") || label)

    if (!headerNode.textContent?.trim()) {
      headerNode.textContent = `${icon} ${label}`
    }
  })

  return container.innerHTML
}
