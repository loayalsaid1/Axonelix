"use client"

import { forwardRef, type ButtonHTMLAttributes } from "react"

// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button"

// --- Hooks ---
import { useTextColor, type UseTextColorConfig } from "./use-text-color"

export interface TextColorButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type">,
    UseTextColorConfig {
  /**
   * Custom icon to render instead of the default icon
   */
  icon?: React.ReactNode
}

export const TextColorButton = forwardRef<
  HTMLButtonElement,
  TextColorButtonProps
>(
  (
    {
      editor: editorProp,
      textColor,
      label,
      hideWhenUnavailable = false,
      onApplied,
      icon,
      className,
      ...props
    },
    ref
  ) => {
    const {
      editor,
      isActive,
      canApply,
      isVisible,
      handleToggleTextColor,
    } = useTextColor({
      editor: editorProp,
      textColor,
      label,
      hideWhenUnavailable,
      onApplied,
    })

    if (!isVisible) return null

    return (
      <Button
        ref={ref}
        type="button"
        className={className}
        data-style="ghost"
        data-appearance={isActive ? "active" : "default"}
        onClick={handleToggleTextColor}
        disabled={!canApply || !editor?.isEditable}
        aria-label={label || "Text color"}
        tooltip={label || "Text color"}
        role="button"
        tabIndex={-1}
        {...props}
      >
        {icon ? (
          icon
        ) : (
          <span
            className="tiptap-button-text-color-icon"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "1em",
              height: "1em",
              position: "relative",
            }}
          >
            <span
              style={{
                fontSize: "1em",
                fontWeight: "bold",
                lineHeight: 1,
              }}
            >
              A
            </span>
            {textColor && (
              <span
                style={{
                  position: "absolute",
                  bottom: "-2px",
                  left: 0,
                  right: 0,
                  height: "3px",
                  backgroundColor: textColor,
                  borderRadius: "1px",
                }}
              />
            )}
          </span>
        )}
      </Button>
    )
  }
)

TextColorButton.displayName = "TextColorButton"
