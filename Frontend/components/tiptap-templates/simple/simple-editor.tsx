"use client"
import { renderToReactElement } from '@tiptap/static-renderer/pm/react'


import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react"
import { type AnyExtension, EditorContent, EditorContext, Extension, type JSONContent, useEditor } from "@tiptap/react"

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit"
import { Image } from "@tiptap/extension-image"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { Selection } from "@tiptap/extensions"
import Youtube from "@tiptap/extension-youtube"

// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button"
import { Spacer } from "@/components/tiptap-ui-primitive/spacer"
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar"

// --- Tiptap Node ---
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension"
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss"
import "@/components/tiptap-node/code-block-node/code-block-node.scss"
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss"
import "@/components/tiptap-node/list-node/list-node.scss"
import "@/components/tiptap-node/image-node/image-node.scss"
import "@/components/tiptap-node/heading-node/heading-node.scss"
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss"

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu"
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button"
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu"
import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button"
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button"
import { YoutubeButton } from "@/components/tiptap-ui/youtube-button"
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from "@/components/tiptap-ui/color-highlight-popover"
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from "@/components/tiptap-ui/link-popover"
import { MarkButton } from "@/components/tiptap-ui/mark-button"
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button"
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button"

// --- Icons ---
import { ArrowLeftIcon } from "@/components/tiptap-icons/arrow-left-icon"
import { HighlighterIcon } from "@/components/tiptap-icons/highlighter-icon"
import { LinkIcon } from "@/components/tiptap-icons/link-icon"

// --- Hooks ---
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint"

// --- Components ---
import { ThemeToggle } from "@/components/tiptap-templates/simple/theme-toggle"

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils"

// --- Styles ---
import "@/styles/tiptap/_variables.scss";
import "@/styles/tiptap/_keyframe-animations.scss";

import "@/styles/tiptap/simple-editor.scss";
import "@/styles/tiptap/custom-tiptap-styles.css";

import content from "@/components/tiptap-templates/simple/data/content.json"
import { useCurrentEditor } from "@tiptap/react"
import { Callout } from "@/components/tiptap-extension/callout-extension"
import CalloutToolbarMenu from "@/components/tiptap-ui/custom-components/callout-toolbar-menu"
import { TextColorPopover } from "@/components/tiptap-ui/text-color-popover"
import { TextStyle, TextStyleKit } from "@tiptap/extension-text-style"
import FontSizeToolbarButtons from "@/components/tiptap-ui/custom-components/FontSizeToolbarButtons"
import FontSize from "@tiptap/extension-text-style/font-size"
import ExtraFontSizeCommands from "@/components/tiptap-extension/extra-font-size-commands-extension"
import CustomHeadingMenu from "@/components/tiptap-ui/custom-components/custom-heading-menu"
import Heading from "@tiptap/extension-heading"
import CustomHeading from "@/components/tiptap-extension/custom-heading-extention"
import QuestionTemplate from "@/components/tiptap-extension/question-template-extension"
import { TableKit } from "@tiptap/extension-table"
import TableInsertMenu from "@/components/tiptap-ui/custom-components/table-insert-menu"
import TableRowMenu from "@/components/tiptap-ui/custom-components/table-row-menu"
import TableColumnMenu from "@/components/tiptap-ui/custom-components/table-column-menu"
import TableCellMenu from "@/components/tiptap-ui/custom-components/table-cell-menu"
import HtmlAssistantCard, { type HtmlInsertMode } from "@/components/tiptap-ui/custom-components/html-assistant-card"


const extensions = [
  StarterKit.configure({
    horizontalRule: false,
    link: {
      openOnClick: false,
      enableClickSelection: true,
    },
    heading: false,
  }),
  Heading,
  CustomHeading,
  HorizontalRule,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  TaskList,
  TaskItem.configure({ nested: true }),
  Highlight.configure({ multicolor: true }),
  Image.configure({
    resize: {
      enabled: true,
      alwaysPreserveAspectRatio: true,
    }
  }),
  Typography,
  Superscript,
  Subscript,
  Selection,
  ImageUploadNode.configure({
    accept: "image/*",
    maxSize: MAX_FILE_SIZE,
    limit: 3,
    upload: handleImageUpload,
    onError: (error) => console.error("Upload failed:", error),
  }),
  Callout,
  TextStyleKit.configure({ fontSize: false }),
  FontSize,
  ExtraFontSizeCommands,
  QuestionTemplate,
  TableKit.configure({
    table: { resizable: true },
  }),
  Youtube.configure({
    controls: true,
    nocookie: true,
    width: 640,
    height: 360,
    HTMLAttributes: {
      class: 'youtube-video-container',
    },
  }),
]

const headingIconMap: Record<number, string> = {
  1: "📖",
  2: "📝",
  3: "✚",
  4: "▶",
}

const calloutLabelMap: Record<string, string> = {
  info: "Note",
  warning: "Warning",
  success: "Success",
  error: "Error",
  note: "Note",
  clinical: "Clinical Correlation",
}

const calloutIconMap: Record<string, string> = {
  info: "ℹ️",
  warning: "⚠️",
  success: "✅",
  error: "❌",
  note: "💡",
  clinical: "🩺",
}

function stripWhitespaceTextNodes(html: string): string {
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

function normalizeIncomingHtml(rawHtml: string): string {
  const html = rawHtml.trim()
  if (!html || typeof document === "undefined") return html

  const container = document.createElement("div")
  container.innerHTML = stripWhitespaceTextNodes(html)

  const headings = container.querySelectorAll("h1[data-custom-heading],h2[data-custom-heading],h3[data-custom-heading],h4[data-custom-heading]")
  headings.forEach((heading) => {
    const inferredLevel = Number(heading.tagName.replace("H", "")) || 1
    const level = Number(heading.getAttribute("data-level") || inferredLevel)
    heading.setAttribute("data-level", String(level))

    const icon = headingIconMap[level] || headingIconMap[1]
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

    const icon = calloutIconMap[type] || calloutIconMap.info
    const label = calloutLabelMap[type] || calloutLabelMap.info
    headerNode.setAttribute("data-type", type)
    headerNode.setAttribute("data-icon", headerNode.getAttribute("data-icon") || icon)
    headerNode.setAttribute("data-label", headerNode.getAttribute("data-label") || label)

    if (!headerNode.textContent?.trim()) {
      headerNode.textContent = `${icon} ${label}`
    }
  })
  return container.innerHTML
}

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  isMobile,
}: {
  onHighlighterClick: () => void
  onLinkClick: () => void
  isMobile: boolean
}) => {
  const { editor } = useCurrentEditor()
  return (
    <>
      {/* <Spacer />
      <Button
        onClick={() => editor?.chain().focus().toggleCallout("note").run()}
      >test1</Button> */}
      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <CalloutToolbarMenu />
        <HeadingDropdownMenu levels={[1, 2, 3, 4]} portal={isMobile} />
        <CustomHeadingMenu />
        <ListDropdownMenu
          types={["bulletList", "orderedList", "taskList"]}
          portal={isMobile}
        />
        <BlockquoteButton />
        <CodeBlockButton />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
        <TextColorPopover editor={editor} />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ImageUploadButton text="Add" />
        <YoutubeButton text="YouTube" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <FontSizeToolbarButtons />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <Button
          data-style="secondary"
          onClick={() => editor?.chain().focus().insertQuestionTemplate().run()}
          tooltip="Insert Question Template"
        >
          📝 Q&A Template
        </Button>
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <TableInsertMenu />
        <TableRowMenu />
        <TableColumnMenu />
        <TableCellMenu />
      </ToolbarGroup>
      <ToolbarSeparator />
      <Spacer />

      {isMobile && <ToolbarSeparator />}

      <ToolbarGroup>
        <ThemeToggle />
      </ToolbarGroup>
    </>
  )
}

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: "highlighter" | "link"
  onBack: () => void
}) => (
  <>
    <ToolbarGroup>
      <Button data-style="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? (
      <ColorHighlightPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
)


// function ReadOnlyInstance({ content, extensions }: {
//   content: JSONContent,
//   extensions: AnyExtension[]
// }) {
//   const editor = useEditor({
//     editable: false,
//     extensions: extensions,
//     content,
//     editorProps: {
//       attributes: {
//         class: "simple-editor",
//       },
//     },
//   })

//   useEffect(() => {
//     if (editor && content) {
//       editor.commands.setContent(content)
//     }
//   }, [content, editor])
//   return (

//     <div className="editor-wrapper max-w-4xl m-x-4 ">
//       <div className="simple-editor-wrapper">
//         <EditorContent
//           editor={editor}
//           role="presentation"
//           className="simple-editor-content max-h-[90vh]"
//         />
//       </div>
//     </div>

//   )
// }

interface SimpleEditorRefHandler {
  getJSON: () => JSONContent | null
  insertHTML?: (html: string, mode?: HtmlInsertMode) => boolean
}

interface SimpleEditorProps {
  ref?: React.Ref<SimpleEditorRefHandler>,
  initialContent?: JSONContent,
  showPreviewContent?: boolean
  showHtmlAssistant?: boolean
}
export function SimpleEditor({
  ref,
  showPreviewContent = false,
  initialContent = undefined,
  showHtmlAssistant = true,
}: SimpleEditorProps) {
  const isMobile = useIsBreakpoint()
  const [mobileView, setMobileView] = useState<"main" | "highlighter" | "link">(
    "main"
  )
  const toolbarRef = useRef<HTMLDivElement>(null)
  const editorInitialContent = useMemo(() => {
    if (initialContent) {
      return initialContent
    } else if (showPreviewContent) {
      return content as JSONContent
    } else {
      return <p>Start Typing...</p>
    }
  }, [initialContent, showPreviewContent, content])

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
        class: "simple-editor",
      },
    },
    extensions,
    content: editorInitialContent
  })

  useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main")
    }
  }, [isMobile, mobileView])

  const insertHTML = useCallback((html: string, mode: HtmlInsertMode = "append") => {
    if (!editor) return false

    const rawHtml = html.trim()
    if (!rawHtml) return false
    const cleanedHtml = stripWhitespaceTextNodes(rawHtml)
    const normalizedHtml = normalizeIncomingHtml(cleanedHtml)

    const applyInsert = (payload: string) => {
      if (mode === "replace") {
        return editor
          .chain()
          .focus()
          .clearContent()
          .insertContent(payload)
          .run()
      }

      const position = mode === "prepend" ? 0 : editor.state.doc.content.size
      return editor
        .chain()
        .focus()
        .insertContentAt(position, payload)
        .run()
    }

    // First path: native parser on cleaned HTML to avoid whitespace-only gap nodes.
    const insertedRaw = applyInsert(cleanedHtml)
    if (insertedRaw) return true

    // Fallback path: normalize custom-node HTML markers and remove noisy gaps.
    return applyInsert(normalizedHtml)
  }, [editor])

  useImperativeHandle(ref, () => ({
    getJSON: () => editor?.getJSON() ?? null,
    insertHTML,
  }), [editor, insertHTML])

  return (
    <EditorContext.Provider value={{ editor }}>
      <div className="editor-wrapper  m-x-4 ">
        <div className="simple-editor-wrapper">
          <Toolbar ref={toolbarRef}>
            {mobileView === "main" ? (
              <MainToolbarContent
                onHighlighterClick={() => setMobileView("highlighter")}
                onLinkClick={() => setMobileView("link")}
                isMobile={isMobile}
              />
            ) : (
              <MobileToolbarContent
                type={mobileView === "highlighter" ? "highlighter" : "link"}
                onBack={() => setMobileView("main")}
              />
            )}
          </Toolbar>

          {showHtmlAssistant && (
            <div className="px-4 pb-4">
              <HtmlAssistantCard onInsert={insertHTML} />
            </div>
          )}

          <EditorContent
            editor={editor}
            role="presentation"
            className="simple-editor-content max-h-[90vh]"
          />
        </div>
      </div>
    </EditorContext.Provider>
  )
}
