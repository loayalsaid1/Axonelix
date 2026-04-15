import { useCallback, useMemo, useState } from "react"
import { useCurrentEditor, useEditorState } from "@tiptap/react"

import { ChevronDownIcon } from "@/components/tiptap-icons/chevron-down-icon"
import { Button, ButtonGroup } from "@/components/tiptap-ui-primitive/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/tiptap-ui-primitive/dropdown-menu"
import { Card, CardBody } from "@/components/tiptap-ui-primitive/card"

export type TextDirectionValue = "ltr" | "rtl" | "auto" | undefined

interface TextDirectionMenuProps {
  globalDirection: TextDirectionValue
  onGlobalDirectionChange: (direction: TextDirectionValue) => void
  portal?: boolean
}

export default function TextDirectionMenu({
  globalDirection,
  onGlobalDirectionChange,
  portal = false,
}: TextDirectionMenuProps) {
  const { editor } = useCurrentEditor()
  const [isOpen, setIsOpen] = useState(false)

  const selectionEmpty = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => {
      if (!currentEditor) return true
      return currentEditor.state.selection.empty
    },
  })

  const triggerLabel = useMemo(() => {
    if (!selectionEmpty) return "Direction"
    if (!globalDirection) return "Direction"
    return `Direction (${globalDirection.toUpperCase()})`
  }, [globalDirection, selectionEmpty])

  const setDirection = useCallback((direction: Exclude<TextDirectionValue, undefined>) => {
    if (!editor) return

    if (selectionEmpty) {
      const fullDocRange = { from: 0, to: editor.state.doc.content.size }
      editor.chain().focus().setTextDirection(direction, fullDocRange).run()
      onGlobalDirectionChange(direction)
      return
    }

    editor.chain().focus().setTextDirection(direction).run()
  }, [editor, onGlobalDirectionChange, selectionEmpty])

  const unsetDirection = useCallback(() => {
    if (!editor) return

    if (selectionEmpty) {
      const fullDocRange = { from: 0, to: editor.state.doc.content.size }
      editor.chain().focus().unsetTextDirection(fullDocRange).run()
      onGlobalDirectionChange(undefined)
      return
    }

    editor.chain().focus().unsetTextDirection().run()
  }, [editor, onGlobalDirectionChange, selectionEmpty])

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          data-style="ghost"
          data-active-state={
            globalDirection || editor?.isActive({ dir: "rtl" }) || editor?.isActive({ dir: "ltr" })
              ? "on"
              : "off"
          }
          aria-label="Text direction options"
          tooltip="Text direction"
        >
          {triggerLabel}
          <ChevronDownIcon className="tiptap-button-dropdown-small" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" portal={portal}>
        <Card>
          <CardBody>
            <ButtonGroup>
              <DropdownMenuItem asChild>
                <Button
                  data-style="ghost"
                  data-active-state={globalDirection === undefined ? "on" : "off"}
                  onClick={unsetDirection}
                >
                  None / Unset
                </Button>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Button
                  data-style="ghost"
                  data-active-state={selectionEmpty && globalDirection === "ltr" ? "on" : "off"}
                  onClick={() => setDirection("ltr")}
                >
                  Set LTR
                </Button>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Button
                  data-style="ghost"
                  data-active-state={selectionEmpty && globalDirection === "rtl" ? "on" : "off"}
                  onClick={() => setDirection("rtl")}
                >
                  Set RTL
                </Button>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Button
                  data-style="ghost"
                  data-active-state={selectionEmpty && globalDirection === "auto" ? "on" : "off"}
                  onClick={() => setDirection("auto")}
                >
                  Set Auto
                </Button>
              </DropdownMenuItem>
            </ButtonGroup>
          </CardBody>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
