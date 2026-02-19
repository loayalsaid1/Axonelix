import { Node } from "@tiptap/core";
import Heading from "@tiptap/extension-heading";


type HeadingNumber = 1 | 2 | 3 | 4;

interface CustomHeadingOptions {
	level: HeadingNumber;
}

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		customHeading: {
			toggleCustomHeading: (options: CustomHeadingOptions) => ReturnType;
		}
	}
}
const iconMap: Record<HeadingNumber, string> = {
	1: '📖',
	2: '📝',
	3: '✚',
	4: '▶',
};
export const HeadingLabel = Node.create({
	name: 'headingLabel',

	inline: true,
	group: 'inline',
	atom: true,
	selectable: true, // Allow selection so users can delete it if needed
	draggable: false,

	addAttributes() {
		return {
			level: { 
				default: 1,
				parseHTML: element => parseInt(element.getAttribute('data-level') || '1'),
				renderHTML: attributes => ({
					'data-level': attributes.level,
				}),
			},
			icon: { 
				default: iconMap[1],
				parseHTML: element => element.getAttribute('data-icon') || iconMap[1],
				renderHTML: attributes => ({
					'data-icon': attributes.icon,
				}),
			},
		};
	},

	parseHTML() {
		return [
			{
				tag: 'span[data-custom-heading-icon]',
				getAttrs: element => {
					if (typeof element === 'string') return false;
					return {
						level: parseInt(element.getAttribute('data-level') || '1'),
						icon: element.getAttribute('data-icon') || iconMap[1],
					};
				},
			},
		];
	},

	renderHTML({ node }) {
		return [
			'span',
			{
				'data-custom-heading-icon': '',
				'data-level': node.attrs.level,
				'data-icon': node.attrs.icon,
				'class': 'heading-icon-label',
			},
			node.attrs.icon + ' ', // Icon with space
		];
	},
});

const CustomHeading = Heading.extend({
	name: "customHeading",
	levels: [1, 2, 3, 4],

	addExtensions() {
		return [HeadingLabel];
	},

	addAttributes() {
		return {
			...this.parent?.(),
			level: {
				default: 1,
				parseHTML: element => parseInt(element.getAttribute('data-level') || '1'),
				renderHTML: attributes => ({
					'data-level': attributes.level,
				}),
			},
		};
	},

	parseHTML() {
		return this.options.levels.map((level: number) => ({
			tag: `h${level}[data-custom-heading]`,
			attrs: { level },
			priority: 100,
		}));
	},

	renderHTML({ node, HTMLAttributes }) {
		const level = node.attrs.level;
		return [`h${level}`, { "data-custom-heading": "", "data-level": level, ...HTMLAttributes }, 0];
	},

	content: "inline*",

	addCommands() {
		return {
			toggleCustomHeading:
				({ level = 1 }) => ({ commands, editor, chain, state }) => {
					if (editor.isActive("customHeading", { level })) {
						return commands.setParagraph();
					}

					const allIcons = Object.values(iconMap);
					const icon = iconMap[level] || '';

					// Set the heading and manage icons
					return chain()
						.setNode(this.name, { level })
						.command(({ tr, state }) => {
							const { $from } = state.selection;
							const node = $from.parent;

							if (node.type.name === this.name) {
								const nodeStart = $from.start();
								
								// Check if first node is a headingLabel and remove it
								if (node.firstChild && node.firstChild.type.name === 'headingLabel') {
									tr.delete(nodeStart, nodeStart + node.firstChild.nodeSize);
								}

								// Insert new headingLabel node at the beginning
								const labelNode = state.schema.nodes.headingLabel.create({ 
									level, 
									icon 
								});
								tr.insert(nodeStart, labelNode);
							}

							return true;
						})
						.run();
				}
		}
	}
})


export default CustomHeading;
