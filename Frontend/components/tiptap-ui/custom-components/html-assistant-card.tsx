"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export type HtmlInsertMode = "replace" | "append" | "prepend"

interface HtmlAssistantCardProps {
  onInsert: (html: string, mode: HtmlInsertMode) => boolean
}

const rulesForAi = [
  "Custom heading node:",
  "- Use h1..h4 with data-custom-heading and data-level='1..4'.",
  "- Optional icon label: span[data-custom-heading-icon][data-level][data-icon].",
  "- Keep heading icon span as the first child in heading when possible.",
  "Callout node:",
  "- Use blockquote[data-callout][data-type='info|warning|success|error|note|clinical'].",
  "- Optional header child: div[data-callout-header][data-type][data-icon][data-label].",
  "- Header text is recommended (for example: 'ℹ️ Note').",
  "Question template node:",
  "- Wrapper: div[data-question-template].",
  "- Section: div[data-question-section][data-title], with internal content container.",
  "Image upload placeholder node:",
  "- div[data-type='image-upload'].",
  "Horizontal rule wrapper:",
  "- div[data-type='horizontalRule'] containing hr.",
  "Formatting notes:",
  "- Avoid excessive indentation/newlines between tags when generating HTML.",
  "- Text alignment and font size are preserved through inline style attributes.",
  "- Tables, lists, paragraphs, links, images, youtube embeds, highlights, and code blocks follow standard Tiptap HTML mappings.",
]

export default function HtmlAssistantCard({ onInsert }: HtmlAssistantCardProps) {
  const [htmlSnippet, setHtmlSnippet] = useState("")
  const [insertMode, setInsertMode] = useState<HtmlInsertMode>("append")

  const rulesText = useMemo(() => rulesForAi.join("\n"), [])

  const handleInsert = () => {
    if (!htmlSnippet.trim()) {
      toast.error("Please add HTML before inserting")
      return
    }

    const inserted = onInsert(htmlSnippet, insertMode)
    if (!inserted) {
      toast.error("Failed to insert HTML. Please check the markup.")
      return
    }

    toast.success(`HTML inserted (${insertMode})`)
  }

  const handleCopyRules = async () => {
    try {
      await navigator.clipboard.writeText(rulesText)
      toast.success("HTML rules copied for AI prompts")
    } catch {
      toast.error("Could not copy rules")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI HTML Assistant</CardTitle>
        <CardDescription>
          Supported HTML contract for this editor and quick insertion controls.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <details className="rounded-md border p-3">
          <summary className="cursor-pointer text-sm font-medium">Accepted HTML Rules (Comprehensive)</summary>
          <div className="mt-3 rounded-md bg-muted/40 p-3">
            <pre className="whitespace-pre-wrap wrap-break-word text-xs leading-5">{rulesText}</pre>
          </div>
          <div className="mt-3 flex justify-end">
            <Button type="button" variant="outline" size="sm" onClick={handleCopyRules}>
              Copy Rules For AI
            </Button>
          </div>
        </details>

        <div className="space-y-2">
          <Label htmlFor="editor-html-snippet">HTML Snippet</Label>
          <Textarea
            id="editor-html-snippet"
            value={htmlSnippet}
            onChange={(e) => setHtmlSnippet(e.target.value)}
            placeholder="Paste trusted HTML snippet"
            rows={8}
            className="font-mono text-xs"
          />
        </div>

        <div className="space-y-2">
          <Label>Insert Mode</Label>
          <RadioGroup
            value={insertMode}
            onValueChange={(value) => setInsertMode(value as HtmlInsertMode)}
            className="grid grid-cols-1 gap-3 sm:grid-cols-3"
          >
            <Label className="flex cursor-pointer items-center gap-2 rounded-md border p-3">
              <RadioGroupItem value="replace" id="editor-insert-mode-replace" />
              Replace all content
            </Label>
            <Label className="flex cursor-pointer items-center gap-2 rounded-md border p-3">
              <RadioGroupItem value="prepend" id="editor-insert-mode-prepend" />
              Prepend to top
            </Label>
            <Label className="flex cursor-pointer items-center gap-2 rounded-md border p-3">
              <RadioGroupItem value="append" id="editor-insert-mode-append" />
              Append to bottom
            </Label>
          </RadioGroup>
        </div>

        <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={handleInsert}>
            Insert HTML
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
