"use client"

import { useCallback } from "react"
import { type Editor, useEditorState } from "@tiptap/react"
import { useHotkeys } from "react-hotkeys-hook"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint"

// --- Lib ---
import {
  isMarkInSchema,
  isNodeTypeSelected,
} from "@/lib/tiptap-utils"

export const TEXT_COLOR_SHORTCUT_KEY = "mod+shift+c"
export const TEXT_COLORS = [
  {
    label: "Gray text",
    value: "var(--tt-color-text-gray)",
    border: "var(--tt-color-text-gray-contrast)",
  },
  {
    label: "Brown text",
    value: "var(--tt-color-text-brown)",
    border: "var(--tt-color-text-brown-contrast)",
  },
  {
    label: "Orange text",
    value: "var(--tt-color-text-orange)",
    border: "var(--tt-color-text-orange-contrast)",
  },
  {
    label: "Yellow text",
    value: "var(--tt-color-text-yellow)",
    border: "var(--tt-color-text-yellow-contrast)",
  },
  {
    label: "Green text",
    value: "var(--tt-color-text-green)",
    border: "var(--tt-color-text-green-contrast)",
  },
  {
    label: "Blue text",
    value: "var(--tt-color-text-blue)",
    border: "var(--tt-color-text-blue-contrast)",
  },
  {
    label: "Purple text",
    value: "var(--tt-color-text-purple)",
    border: "var(--tt-color-text-purple-contrast)",
  },
  {
    label: "Pink text",
    value: "var(--tt-color-text-pink)",
    border: "var(--tt-color-text-pink-contrast)",
  },
  {
    label: "Red text",
    value: "var(--tt-color-text-red)",
    border: "var(--tt-color-text-red-contrast)",
  },
]
export type TextColor = (typeof TEXT_COLORS)[number]

/**
 * Configuration for the text color functionality
 */
export interface UseTextColorConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * The color to apply when setting the text color.
   */
  textColor?: string
  /**
   * Optional label to display alongside the icon.
   */
  label?: string
  /**
   * Whether the button should hide when the mark is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean
  /**
   * Called when the text color is applied.
   */
  onApplied?: ({
    color,
    label,
  }: {
    color: string
    label: string
  }) => void
}

export function pickTextColorsByValue(values: string[]) {
  const colorMap = new Map(
    TEXT_COLORS.map((color) => [color.value, color])
  )
  return values
    .map((value) => colorMap.get(value))
    .filter((color): color is (typeof TEXT_COLORS)[number] => !!color)
}

/**
 * Checks if text color can be applied based on the current editor state
 */
export function canSetTextColor(
  editor: Editor | null
): boolean {
  if (!editor || !editor.isEditable) return false

  if (
    !isMarkInSchema("textStyle", editor) ||
    isNodeTypeSelected(editor, ["image", "codeBlock"])
  )
    return false

  return editor.can().setColor("test")
}

/**
 * Checks if text color is currently active
 */
export function isTextColorActive(
  editor: Editor | null,
  textColor?: string
): boolean {
  if (!editor || !editor.isEditable) return false

  return textColor
    ? editor.isActive("textStyle", { color: textColor })
    : editor.isActive("textStyle")
}

/**
 * Removes text color
 */
export function removeTextColor(
  editor: Editor | null
): boolean {
  if (!editor || !editor.isEditable) return false
  if (!canSetTextColor(editor)) return false

  editor.chain().focus().unsetColor().run()
  return true
}

/**
 * Hook to use text color functionality
 */
export function useTextColor({
  editor: editorProp,
  textColor,
  label,
  hideWhenUnavailable = false,
  onApplied,
}: UseTextColorConfig = {}) {
  const { editor: editorContext } = useTiptapEditor()
  const editor = editorProp ?? editorContext
  const isMobile = useIsBreakpoint()

  // Use useEditorState for automatic reactivity - cleaner than manual event listeners
  const editorState = useEditorState({
    editor,
    selector: ({ editor }) => {
      if (!editor) {
        return {
          isActive: false,
          canApply: false,
          isVisible: false,
        }
      }

      const isActive = isTextColorActive(editor, textColor)
      const canApply = canSetTextColor(editor)
      const isVisible = !hideWhenUnavailable || canApply

      return { isActive, canApply, isVisible }
    },
  })

  const { isActive, canApply, isVisible } = editorState || {
    isActive: false,
    canApply: false,
    isVisible: false,
  }

  const handleSetTextColor = useCallback(
    (color: string, colorLabel?: string) => {
      if (!editor || !canSetTextColor(editor)) return

      editor.chain().focus().setColor(color).run()

      onApplied?.({
        color,
        label: colorLabel || label || "Text color",
      })
    },
    [editor, label, onApplied]
  )

  const handleRemoveTextColor = useCallback(() => {
    if (!editor) return
    removeTextColor(editor)
  }, [editor])

  const handleToggleTextColor = useCallback(() => {
    if (!editor || !textColor) return

    if (isActive) {
      removeTextColor(editor)
    } else {
      handleSetTextColor(textColor, label)
    }
  }, [editor, textColor, isActive, handleSetTextColor, label])

  // Keyboard shortcut
  useHotkeys(
    TEXT_COLOR_SHORTCUT_KEY,
    (event) => {
      event.preventDefault()
      handleToggleTextColor()
    },
    {
      enabled: !isMobile && !!editor && !!textColor,
      enableOnFormTags: true,
      enableOnContentEditable: true,
    },
    [handleToggleTextColor, editor, textColor, isMobile]
  )

  return {
    editor,
    isActive,
    canApply,
    isVisible,
    textColor,
    handleSetTextColor,
    handleRemoveTextColor,
    handleToggleTextColor,
  }
}
