import { mergeAttributes, Node } from "@tiptap/core"
import Blockquote from "@tiptap/extension-blockquote"

export type CalloutType = "info" | "warning" | "success" | "error" | "note" | "clinical"

export interface CalloutOptions {
  /**
   * HTML attributes to apply to the callout element
   * @default {}
   */
  HTMLAttributes: Record<string, unknown>
  
  /**
   * Default callout type
   * @default "info"
   */
  defaultType: CalloutType
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    callout: {
      /**
       * Toggle callout formatting
       */
      toggleCallout: (type?: CalloutType) => ReturnType
      /**
       * Set callout type
       */
      setCalloutType: (type: CalloutType) => ReturnType
    }
  }
}

const calloutConfig: Record<CalloutType, { icon: string; label: string }> = {
  info: { icon: 'ℹ️', label: 'Note' },
  warning: { icon: '⚠️', label: 'Warning' },
  success: { icon: '✅', label: 'Success' },
  error: { icon: '❌', label: 'Error' },
  note: { icon: '💡', label: 'Note' },
  clinical: { icon: '🩺', label: 'Clinical Correlation' },
};

export const CalloutHeader = Node.create({
  name: 'calloutHeader',

  group: 'block',
  content: 'inline*',
  // selectable: false,
  draggable: false,
  // atom: true,

  addAttributes() {
    return {
      type: { 
        default: 'info',
        parseHTML: element => element.getAttribute('data-type') || 'info',
        renderHTML: attributes => ({
          'data-type': attributes.type,
        }),
      },
      icon: { 
        default: calloutConfig.info.icon,
        parseHTML: element => element.getAttribute('data-icon') || calloutConfig.info.icon,
        renderHTML: attributes => ({
          'data-icon': attributes.icon,
        }),
      },
      label: { 
        default: calloutConfig.info.label,
        parseHTML: element => element.getAttribute('data-label') || calloutConfig.info.label,
        renderHTML: attributes => ({
          'data-label': attributes.label,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-callout-header]',
        getAttrs: element => {
          if (typeof element === 'string') return false;
          return {
            type: element.getAttribute('data-type') || 'info',
            icon: element.getAttribute('data-icon') || calloutConfig.info.icon,
            label: element.getAttribute('data-label') || calloutConfig.info.label,
          };
        },
      },
    ];
  },

  renderHTML({ node }) {
    return [
      'div',
      {
        'data-callout-header': '',
        'data-type': node.attrs.type,
        'data-icon': node.attrs.icon,
        'data-label': node.attrs.label,
        'class': 'callout-header',
      },
      0
    ];
  },
});
/**
 * Callout extension - extends Blockquote to provide styled callout blocks
 * Supports different callout types (info, warning, success, error, note) with custom styling
 */
export const Callout = Blockquote.extend<CalloutOptions>({
  name: "callout",

  addExtensions() {
    return [CalloutHeader];
  },

  addOptions() {
    return {
      ...this.parent?.(),
      HTMLAttributes: {},
      defaultType: "info",
    }
  },

  content: 'calloutHeader? block+',

  addAttributes() {
    return {
      ...this.parent?.(),
      type: {
        default: this.options.defaultType,
        parseHTML: (element) => {
          return element.getAttribute("data-type") || this.options.defaultType
        },
        renderHTML: (attributes) => {
          return {
            "data-type": attributes.type,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: "blockquote[data-callout]",
        priority: 51, // Higher than blockquote's default priority
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    const type = node.attrs.type || this.options.defaultType

    return [
      "blockquote",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-callout": "",
        "data-type": type,
      }),
      0,
    ]
  },

  addCommands() {
    /**
     * Note: Using optional parameter instead of default value in function signature
     * to avoid TypeScript 'this' type annotation issues when using default parameters.
     * The default value is set inside the function body instead.
     */
    return {
      toggleCallout:
        (type?: CalloutType) =>
        ({ commands, editor, chain }) => {
          type = type || this.options.defaultType
          
          // If already in a callout
          if (editor.isActive(this.name)) {
            // If it's the same type, unwrap it
            if (editor.isActive(this.name, { type })) {
              return commands.lift(this.name)
            }
            // If it's a different type, update the type and header
            return chain()
              .updateAttributes(this.name, { type })
              .command(({ tr, state, dispatch }) => {
                if (!dispatch) return true;
                
                const { $from } = state.selection;
                // Find the callout node by traversing up
                let depth = $from.depth;
                let calloutNode = null;
                let calloutPos = null;
                
                for (let d = depth; d >= 0; d--) {
                  const node = $from.node(d);
                  if (node.type.name === this.name) {
                    calloutNode = node;
                    calloutPos = $from.start(d) - 1;
                    break;
                  }
                }

                if (calloutNode && calloutPos !== null) {
                  const contentStart = calloutPos + 1;
                  
                  // Check if first child is a calloutHeader and remove it
                  if (calloutNode.firstChild && calloutNode.firstChild.type.name === 'calloutHeader') {
                    tr.delete(contentStart, contentStart + calloutNode.firstChild.nodeSize);
                  }

                  // Insert new calloutHeader node at the beginning
                  const config = calloutConfig[type as CalloutType];
                  const headerNode = state.schema.nodes.calloutHeader.create({ 
                    type, 
                    icon: config.icon,
                    label: config.label
                  }, 
                  state.schema.text(`${config.icon} ${config.label}`)
                );
                  tr.insert(contentStart, headerNode);
                }

                return true;
              })
              .run();
          }
          
          // Otherwise, wrap in callout with specified type and add header
          return chain()
            .wrapIn(this.name, { type })
            .command(({ tr, state, dispatch }) => {
              if (!dispatch) return true;
              
              const { $from } = state.selection;
              // Find the callout node by traversing up
              let depth = $from.depth;
              let calloutNode = null;
              let calloutPos = null;
              
              for (let d = depth; d >= 0; d--) {
                const node = $from.node(d);
                if (node.type.name === this.name) {
                  calloutNode = node;
                  calloutPos = $from.start(d) - 1;
                  break;
                }
              }

              if (calloutNode && calloutPos !== null) {
                const contentStart = calloutPos + 1;
                
                // Insert calloutHeader node at the beginning
                const config = calloutConfig[type as CalloutType];
                const headerNode = state.schema.nodes.calloutHeader.create({ 
                  type, 
                  icon: config.icon,
                  label: config.label
                }, 
                state.schema.text(`${config.icon} ${config.label}`)
              );
                tr.insert(contentStart, headerNode);
              }

              return true;
            })
            .run();
        },

      setCalloutType:
        (type: CalloutType) =>
        ({ commands, chain }) => {
          return chain()
            .updateAttributes(this.name, { type })
            .command(({ tr, state, dispatch }) => {
              if (!dispatch) return true;
              
              const { $from } = state.selection;
              // Find the callout node by traversing up
              let depth = $from.depth;
              let calloutNode = null;
              let calloutPos = null;
              
              for (let d = depth; d >= 0; d--) {
                const node = $from.node(d);
                if (node.type.name === this.name) {
                  calloutNode = node;
                  calloutPos = $from.start(d) - 1;
                  break;
                }
              }

              if (calloutNode && calloutPos !== null) {
                const contentStart = calloutPos + 1;
                
                // Check if first child is a calloutHead  er and remove it
                if (calloutNode.firstChild && calloutNode.firstChild.type.name === 'calloutHeader') {
                  tr.delete(contentStart, contentStart + calloutNode.firstChild.nodeSize);
                }

                // Insert new calloutHeader node at the beginning
                const config = calloutConfig[type];
                const headerNode = state.schema.nodes.calloutHeader.create({ 
                  type, 
                  icon: config.icon,
                  label: config.label
                }, 
                state.schema.text(`${config.icon} ${config.label}`)
              );
                tr.insert(contentStart, headerNode);
              }

              return true;
            })
            .run();
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-c": () => this.editor.commands.toggleCallout(),
      // Exit callout on Enter if at the end and empty
      Enter: ({ editor }) => {
        const { state } = editor
        const { selection } = state
        const { $from } = selection

        // Check if we're in a callout
        if ($from.parent.type.name !== this.name) {
          return false
        }

        // Check if the callout is empty
        if ($from.parent.content.size === 0) {
          return editor.commands.lift(this.name)
        }

        // Check if we're at the end of the callout and the last node is empty
        const isAtEnd = $from.parentOffset === $from.parent.nodeSize - 2
        const lastChild = $from.parent.lastChild

        if (isAtEnd && lastChild && lastChild.content.size === 0) {
          return editor.commands.lift(this.name)
        }

        return false
      },
    }
  },
})

export default Callout
