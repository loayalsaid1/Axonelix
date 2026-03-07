import { forwardRef, useMemo, useRef } from "react"
import { type Editor } from "@tiptap/react"

// --- Hooks ---
import { useMenuNavigation } from "@/hooks/use-menu-navigation"
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint"
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Icons ---
import { BanIcon } from "@/components/tiptap-icons/ban-icon"

// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button, ButtonGroup } from "@/components/tiptap-ui-primitive/button"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/tiptap-ui-primitive/popover"
import { Separator } from "@/components/tiptap-ui-primitive/separator"
import {
  Card,
  CardBody,
  CardItemGroup,
} from "@/components/tiptap-ui-primitive/card"

// --- Tiptap UI ---
import type {
  TextColor,
  UseTextColorConfig,
} from "@/components/tiptap-ui/text-color-button"
import {
  TextColorButton,
  pickTextColorsByValue,
  useTextColor,
} from "@/components/tiptap-ui/text-color-button"

export interface TextColorPopoverContentProps {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * Optional colors to use in the text color popover.
   * If not provided, defaults to a predefined set of colors.
   */
  colors?: TextColor[]
}

export interface TextColorPopoverProps
  extends Omit<ButtonProps, "type">,
    Pick<
      UseTextColorConfig,
      "editor" | "hideWhenUnavailable" | "onApplied"
    > {
  /**
   * Optional colors to use in the text color popover.
   * If not provided, defaults to a predefined set of colors.
   */
  colors?: TextColor[]
}

export const TextColorPopoverButton = forwardRef<
  HTMLButtonElement,
  ButtonProps
>(({ className, children, ...props }, ref) => (
  <Button
    type="button"
    className={className}
    data-style="ghost"
    data-appearance="default"
    role="button"
    tabIndex={-1}
    aria-label="Text color"
    tooltip="Text color"
    ref={ref}
    {...props}
  >
    {children ?? (
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
      </span>
    )}
  </Button>
))

TextColorPopoverButton.displayName = "TextColorPopoverButton"

export function TextColorPopoverContent({
  editor,
  colors = pickTextColorsByValue([
    "var(--tt-color-text-blue)",
    "var(--tt-color-text-green)",
    "var(--tt-color-text-red)",
    "var(--tt-color-text-purple)",
    "var(--tt-color-text-yellow)",
    "var(--tt-color-text-orange)",
  ]),
}: TextColorPopoverContentProps) {
  const { handleRemoveTextColor } = useTextColor({ editor })
  const isMobile = useIsBreakpoint()
  const containerRef = useRef<HTMLDivElement>(null)

  const menuItems = useMemo(
    () => [...colors, { label: "Remove color", value: "none" }],
    [colors]
  )

  const { selectedIndex } = useMenuNavigation({
    containerRef,
    items: menuItems,
    orientation: "both",
    onSelect: (item) => {
      if (!containerRef.current) return false
      const highlightedElement = containerRef.current.querySelector(
        '[data-highlighted="true"]'
      ) as HTMLElement
      if (highlightedElement) highlightedElement.click()
      if (item.value === "none") handleRemoveTextColor()
      return true
    },
    autoSelectFirstItem: false,
  })

  return (
    <Card
      ref={containerRef}
      tabIndex={0}
      style={isMobile ? { boxShadow: "none", border: 0 } : {}}
    >
      <CardBody style={isMobile ? { padding: 0 } : {}}>
        <CardItemGroup orientation="horizontal">
          <ButtonGroup orientation="horizontal">
            {colors.map((color, index) => (
              <TextColorButton
                key={color.value}
                editor={editor}
                textColor={color.value}
                label={color.label}
                aria-label={color.label}
                tabIndex={index === selectedIndex ? 0 : -1}
                data-highlighted={selectedIndex === index}
              />
            ))}
          </ButtonGroup>
          <Separator />
          <ButtonGroup orientation="horizontal">
            <Button
              onClick={handleRemoveTextColor}
              aria-label="Remove text color"
              tooltip="Remove text color"
              tabIndex={selectedIndex === colors.length ? 0 : -1}
              type="button"
              role="menuitem"
              data-highlighted={selectedIndex === colors.length}
            >
              <BanIcon className="tiptap-button-icon" />
            </Button>
          </ButtonGroup>
        </CardItemGroup>
      </CardBody>
    </Card>
  )
}

export function TextColorPopover({
  editor: editorProp,
  hideWhenUnavailable = false,
  onApplied,
  colors,
  ...props
}: TextColorPopoverProps) {
  const { editor: editorContext } = useTiptapEditor()
  const editor = editorProp ?? editorContext
  const { isVisible } = useTextColor({ editor, hideWhenUnavailable })

  if (!isVisible) return null

  return (
    <Popover>
      <PopoverTrigger asChild>
        <TextColorPopoverButton {...props} />
      </PopoverTrigger>
      <PopoverContent sideOffset={8} align="start">
        <TextColorPopoverContent editor={editor} colors={colors} />
      </PopoverContent>
    </Popover>
  )
}
