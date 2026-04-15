"use client"
import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react"
import { EditorContent, EditorContext, type JSONContent, useEditor } from "@tiptap/react"

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit"
import { Image } from "@tiptap/extension-image"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { generateJSON } from "@tiptap/core"
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
import { TextStyleKit } from "@tiptap/extension-text-style"
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
import TextDirectionMenu, { type TextDirectionValue } from "@/components/tiptap-ui/custom-components/text-direction-menu"

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

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  isMobile,
  globalDirection,
  setGlobalDirection,
}: {
  onHighlighterClick: () => void
  onLinkClick: () => void
  isMobile: boolean
  globalDirection: TextDirectionValue
  setGlobalDirection: (direction: TextDirectionValue) => void
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
        <TextDirectionMenu
          globalDirection={globalDirection}
          onGlobalDirectionChange={setGlobalDirection}
          portal={isMobile}
        />
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
  const [globalDirection, setGlobalDirection] = useState<TextDirectionValue>("auto")
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
  }, [initialContent, showPreviewContent])

  const editor = useEditor({
    immediatelyRender: false,
    textDirection: globalDirection,
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
    if (!editor) return

    const dom = editor.view.dom as HTMLElement
    if (globalDirection) {
      dom.setAttribute("dir", globalDirection)
      return
    }

    dom.removeAttribute("dir")
  }, [editor, globalDirection])

  const effectiveMobileView = isMobile ? mobileView : "main"

  const insertHTML = useCallback((html: string, mode: HtmlInsertMode = "append") => {
    if (!editor) return false

    const rawHtml = html.trim()
    if (!rawHtml) return false
    // const cleanedHtml = stripWhitespaceTextNodes(rawHtml)
    // const normalizedHtml = normalizeIncomingHtml(cleanedHtml)

    const json = generateJSON(rawHtml, extensions)

    if (mode === "replace") {
      return editor
        .chain()
        .focus()
        .setContent(json)
        .run()
    }

    const position = mode === "prepend" ? 0 : editor.state.doc.content.size
    return editor
      .chain()
      .focus()
      .insertContentAt(position, json)
      .run()
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
            {effectiveMobileView === "main" ? (
              <MainToolbarContent
                onHighlighterClick={() => setMobileView("highlighter")}
                onLinkClick={() => setMobileView("link")}
                isMobile={isMobile}
                globalDirection={globalDirection}
                setGlobalDirection={setGlobalDirection}
              />
            ) : (
              <MobileToolbarContent
                type={effectiveMobileView === "highlighter" ? "highlighter" : "link"}
                onBack={() => setMobileView("main")}
              />
            )}
          </Toolbar>

          <EditorContent
            editor={editor}
            role="presentation"
            className="simple-editor-content max-h-[90vh]"
          />
        </div>
      </div>

      {showHtmlAssistant && (
        <div className="editor-wrapper  m-x-4 mt-4">
          <HtmlAssistantCard onInsert={insertHTML} />
        </div>
      )}
    </EditorContext.Provider>
  )
}
