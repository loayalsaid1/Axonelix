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
import { AnyExtension, JSONContent } from "@tiptap/core"
import Heading from "@tiptap/extension-heading"
import CustomHeading from "../tiptap-extension/custom-heading-extention"
import HorizontalRule from "@tiptap/extension-horizontal-rule"
import Callout from "../tiptap-extension/callout-extension"
import { FontSize, TextStyleKit } from "@tiptap/extension-text-style"
import ExtraFontSizeCommands from "../tiptap-extension/extra-font-size-commands-extension"
import QuestionTemplate from "../tiptap-extension/question-template-extension"
import { TableKit } from "@tiptap/extension-table"

import "@/styles/tiptap/_variables.scss";
import "@/styles/tiptap/_keyframe-animations.scss";

import "@/styles/tiptap/simple-editor.scss";
import "@/styles/tiptap/custom-tiptap-styles.css";

import { renderToReactElement } from "@tiptap/static-renderer/pm/react"
import { useMemo } from "react"


const extensions: AnyExtension[] = [
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
  Image,
  Typography,
  Superscript,
  Subscript,
  Selection,
  Callout,
  TextStyleKit.configure({ fontSize: false }),
  FontSize,
  ExtraFontSizeCommands,
  QuestionTemplate,
  TableKit
	.configure({
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


export default function EditorPreview({ content }: { content: JSONContent | null }) {
  // I think this may be a noop thing sinse this is a server componet, but, if this is somehow used a client component, 
  // this will prevent unnecessary re-renders of the rendered content when the content prop doesn't change
  // I guess
  const renderedContent = useMemo(() => {
    if (!content) return null
    return renderToReactElement({ content, extensions })
  }, [content])

  if (!content) {
    return null
  }

  return (
    <div className="max-w-5xl m-4 shadow-2xl shadow-black editor-wrapper">
      <div className="simple-editor-wrapper">
        <div className="max-w-5xl p-6 prose tiptap ProseMirror simple-editor-content">
          {renderedContent}
        </div>
      </div>
    </div>
  )
}
