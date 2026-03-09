import { useEffect, type JSX } from "react";
import { Button, ButtonGroup } from "@/components/tiptap-ui-primitive/button";
import { Editor, useCurrentEditor, useEditorState } from "@tiptap/react";
import { FontSizeDecreaseIcon } from "@/components/tiptap-icons/font-size-decrease-icon";
import { FontSizeIncreaseIcon } from "@/components/tiptap-icons/font-size-increase-icon";

export default function FontSizeToolbarButtons(): JSX.Element {
	const { editor } = useCurrentEditor();
	const editorState = useEditorState({
		editor,
		selector: ({ editor }: { editor: Editor | null }) => {
			if (!editor) return null;

			return {
				fontSize: editor.getAttributes('fontSize')?.fontSize || '16px',
				canSetFontSize: editor.can().setFontSize("30px"),
				canUnsetFontSize: editor.can().unsetFontSize(),
			}
		},
	});
	return (
		<>
			<ButtonGroup orientation="horizontal">
				<Button
					data-style="ghost"
					tooltip="Increase font size"
					onClick={() => editor?.chain().focus().increaseFontSize().run()}
					disabled={!editorState?.canSetFontSize}
				>
					<FontSizeIncreaseIcon className="tiptap-button-icon" />
				</Button>
				<Button
					tooltip="Decrease font size"
					data-style="ghost"
					onClick={() => editor?.chain().focus().decreaseFontSize().run()}
					disabled={!editorState?.canSetFontSize}
				>
					<FontSizeDecreaseIcon className="tiptap-button-icon" />
				</Button>
				<Button
					data-style="ghost"
					tooltip="Reset font size"
					onClick={() => editor?.chain().focus().unsetFontSize().run()}
					disabled={!editorState?.canUnsetFontSize}
				>
					Reset
				</Button>
			</ButtonGroup>

		</>
	)
}
