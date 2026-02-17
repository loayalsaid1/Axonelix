import { Node, mergeAttributes } from "@tiptap/core"

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    questionTemplate: {
      /**
       * Insert a question template
       */
      insertQuestionTemplate: () => ReturnType
    }
  }
}

/**
 * QuestionSection - Individual section within the template
 */
export const QuestionSection = Node.create({
  name: 'questionSection',

  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      title: {
        default: 'Section Title',
        parseHTML: element => element.getAttribute('data-title'),
        renderHTML: attributes => ({
          'data-title': attributes.title,
        }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-question-section]',
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-question-section': '',
        'class': 'question-section',
      }),
      [
        'div',
        {
          'data-question-section-header': '',
          'class': 'question-section-header',
          'contenteditable': 'true',
        },
        node.attrs.title,
      ],
      [
        'div',
        { 
          'data-question-section-content': '',
          'class': 'question-section-content' 
        },
        0,
      ],
    ]
  },
})

/**
 * QuestionTemplate - Container for all sections
 */
export const QuestionTemplate = Node.create({
  name: 'questionTemplate',

  group: 'block',
  content: 'questionSection+',
  defining: true,
  isolating: true,

  addExtensions() {
    return [QuestionSection];
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-question-template]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-question-template': '',
        'class': 'question-template',
      }),
      0,
    ]
  },

  addCommands() {
    return {
      insertQuestionTemplate: () => ({ commands, state }) => {
        const { schema } = state;

        // Create the sections
        const sections = [
          {
            title: '📌 The Correct Answer:',
            content: schema.nodes.paragraph.create(),
          },
          {
            title: '📚 Full Topic Text From Source:',
            content: schema.nodes.paragraph.create(),
          },
          {
            title: '👨‍⚕️ Doctor\'s Explanation:',
            content: schema.nodes.paragraph.create(),
          },
          {
            title: '❌ Why other options are incorrect:',
            content: schema.nodes.paragraph.create(),
          },
          {
            title: '🔍 Context:',
            content: schema.nodes.paragraph.create(),
          },
        ];

        // Create question sections with content
        const sectionNodes = sections.map(section => 
          schema.nodes.questionSection.create(
            { title: section.title },
            [section.content]
          )
        );

        // Create the template node
        const templateNode = schema.nodes.questionTemplate.create(
          {},
          sectionNodes
        );

        // Insert the template
        return commands.insertContent(templateNode.toJSON());
      },
    }
  },
})

export default QuestionTemplate
