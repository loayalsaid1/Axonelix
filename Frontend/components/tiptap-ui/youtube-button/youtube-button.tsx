import { forwardRef, useCallback, useState } from "react"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button } from "@/components/tiptap-ui-primitive/button"

// --- Icons ---
import { YoutubeIcon } from "@/components/tiptap-icons/youtube-icon"

// --- Tiptap ---
import type { Editor } from "@tiptap/react"

export interface YoutubeButtonProps extends Omit<ButtonProps, "type"> {
  editor?: Editor | null
  text?: string
}

/**
 * Button component for inserting YouTube videos in a Tiptap editor.
 */
export const YoutubeButton = forwardRef<HTMLButtonElement, YoutubeButtonProps>(
  ({ editor: providedEditor, text, onClick, children, ...buttonProps }, ref) => {
    const { editor } = useTiptapEditor(providedEditor)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event)
        if (event.defaultPrevented) return

        // Prompt user for YouTube URL
        const url = prompt("Enter YouTube URL:")
        
        if (url && editor) {
          editor.chain().focus().setYoutubeVideo({ src: url }).run()
        }
      },
      [editor, onClick]
    )

    if (!editor) {
      return null
    }

    const canInsert = editor.isEditable

    return (
      <Button
        type="button"
        data-style="ghost"
        role="button"
        tabIndex={-1}
        disabled={!canInsert}
        data-disabled={!canInsert}
        aria-label="Insert YouTube Video"
        tooltip="Insert YouTube Video"
        onClick={handleClick}
        {...buttonProps}
        ref={ref}
      >
        {children ?? (
          <>
            <YoutubeIcon className="tiptap-button-icon" />
            {text && <span className="tiptap-button-text">{text}</span>}
          </>
        )}
      </Button>
    )
  }
)

YoutubeButton.displayName = "YoutubeButton"
