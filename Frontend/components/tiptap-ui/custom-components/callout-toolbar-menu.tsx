import type { JSX } from "react";
import { Button, ButtonGroup } from "../../tiptap-ui-primitive/button";
import { Editor, useCurrentEditor, useEditorState } from "@tiptap/react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "../../tiptap-ui-primitive/dropdown-menu";
import { Card, CardBody } from "../../tiptap-ui-primitive/card";

export default function CalloutToolbarMenu(): JSX.Element {
	const { editor } = useCurrentEditor();
	const editorState = useEditorState({
		editor,
		selector: ({ editor }: { editor: Editor | null }) => {
			if (!editor) return null;

			return {
				canToggleInfo: editor.can().toggleCallout('info'),
				isInfoActive: editor.isActive('callout', { type: 'info' }),
				canToggleNote: editor.can().toggleCallout('note'),
				isNoteActive: editor.isActive('callout', { type: 'note' }),
				canToggleWarning: editor.can().toggleCallout('warning'),
				isWarningActive: editor.isActive('callout', { type: 'warning' }),
				canToggleError: editor.can().toggleCallout('error'),
				isErrorActive: editor.isActive('callout', { type: 'error' }),
				canToggleSuccess: editor.can().toggleCallout('success'),
				isSuccessActive: editor.isActive('callout', { type: 'success' }),
				canToggleClinical: editor.can().toggleCallout('clinical'),
				isClinicalActive: editor.isActive('callout', { type: 'clinical' }),
			}
		},
	});

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					data-style="secondary	">
					Callouts
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuGroup>
					<Card>
						<CardBody>
							<ButtonGroup>

								<DropdownMenuItem asChild>
									<Button
										data-style="ghost"
										onClick={() => editor?.chain().focus().toggleCallout('info').run()}
										disabled={!editorState?.canToggleInfo}
										data-active={editorState?.isInfoActive}
									>
										ℹ️ Info
									</Button>
								</DropdownMenuItem>

								<DropdownMenuItem asChild>
									<Button
										data-style="ghost"
										onClick={() => editor?.chain().focus().toggleCallout('note').run()}
										disabled={!editorState?.canToggleNote}
										data-active={editorState?.isNoteActive}
									>
										💡 Note
									</Button>
								</DropdownMenuItem>

								<DropdownMenuItem asChild>
									<Button
										data-style="ghost"
										onClick={() => editor?.chain().focus().toggleCallout('warning').run()}
										disabled={!editorState?.canToggleWarning}
										data-active={editorState?.isWarningActive}
									>
										⚠️ Warning
									</Button>
								</DropdownMenuItem>

								<DropdownMenuItem asChild>
									<Button
										data-style="ghost"
										onClick={() => editor?.chain().focus().toggleCallout('error').run()}
										disabled={!editorState?.canToggleError}
										data-active={editorState?.isErrorActive}
									>
										❌ Error
									</Button>
								</DropdownMenuItem>

								<DropdownMenuItem asChild>
									<Button
										data-style="ghost"
										onClick={() => editor?.chain().focus().toggleCallout('success').run()}
										disabled={!editorState?.canToggleSuccess}
										data-active={editorState?.isSuccessActive}
									>
										✅ Success
									</Button>
								</DropdownMenuItem>

								<DropdownMenuItem asChild>
									<Button
										data-style="ghost"
										onClick={() => editor?.chain().focus().toggleCallout('clinical').run()}
										disabled={!editorState?.canToggleClinical}
										data-active={editorState?.isClinicalActive}
									>
										🩺 Clinical
									</Button>
								</DropdownMenuItem>
							</ButtonGroup>
						</CardBody>
					</Card>

				</DropdownMenuGroup>
			</DropdownMenuContent>

		</DropdownMenu >

	)
}
