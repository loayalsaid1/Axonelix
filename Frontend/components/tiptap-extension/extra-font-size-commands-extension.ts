import { Extension } from "@tiptap/core"
import { FontSize } from "@tiptap/extension-text-style/font-size"

export interface ExtraFontSizeOptions {
  /**
   * Step size for increase/decrease
   * @default 2
   */
  step: number

  /**
   * Minimum font size
   * @default 8
   */
  minSize: number

  /**
   * Maximum font size
   * @default 96
   */
  maxSize: number

  /**
   * Default font size
   * @default 16
   */
  defaultSize: number
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    extraFontSizeCommands: {
      /**
       * Increase font size by step
       */
      increaseFontSize: () => ReturnType
      /**
       * Decrease font size by step
       */
      decreaseFontSize: () => ReturnType
    }
  }
}

/**
 * ExtraFontSizeCommands - adds increase/decrease commands for font size
 */
const ExtraFontSizeCommands = Extension.create<ExtraFontSizeOptions>({
  name: "extraFontSizeCommands",
  addOptions() {
    return {
      step: 2,
      minSize: 8,
      maxSize: 96,
      defaultSize: 16,
    }
  },
  addCommands() {
    return {
      increaseFontSize:
        () =>
          ({ commands, editor }) => {
            // Get current font size from the textStyle attributes
            const currentAttrs = editor.getAttributes('textStyle')
            const currentFontSize = currentAttrs?.fontSize || `${this.options.defaultSize}px`
            const currentSize = parseInt(currentFontSize)

            // Calculate new size
            const newSize = Math.min(currentSize + this.options.step, this.options.maxSize)

            return commands?.setFontSize(`${newSize}px`)
          },

      decreaseFontSize:
        () =>
          ({ commands, editor }) => {
            // Get current font size from the textStyle attributes
            const currentAttrs = editor.getAttributes('textStyle')
            const currentFontSize = currentAttrs?.fontSize || `${this.options.defaultSize}px`
            const currentSize = parseInt(currentFontSize)

            // Calculate new size
            const newSize = Math.max(currentSize - this.options.step, this.options.minSize)

            return commands?.setFontSize(`${newSize}px`)
          },
    }
  }
})

export default ExtraFontSizeCommands
