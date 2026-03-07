import type { JSX } from "react";
import { Button } from "../../tiptap-ui-primitive/button";
import { Editor, useCurrentEditor, useEditorState } from "@tiptap/react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "../../tiptap-ui-primitive/dropdown-menu";
import { Card, CardBody } from "../../tiptap-ui-primitive/card";

export default function TableRowMenu(): JSX.Element {
	const { editor } = useCurrentEditor();
	const editorState = useEditorState({
		editor,
		selector: ({ editor }: { editor: Editor | null }) => {
			if (!editor) return null;

			return {
				isInTable: editor.isActive('table'),
				canAddRowBefore: editor.can().addRowBefore(),
				canAddRowAfter: editor.can().addRowAfter(),
				canDeleteRow: editor.can().deleteRow(),
			}
		},
	});

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					data-style="secondary"
					tooltip="Row Operations"
					disabled={!editorState?.isInTable}
				>
					➕ Rows
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuGroup>
					<Card>
						<CardBody>
							<div className="flex flex-col gap-1">
								<DropdownMenuItem asChild>
									<Button
										data-style="ghost"
										onClick={() => editor?.chain().focus().addRowBefore().run()}
										disabled={!editorState?.canAddRowBefore}
									>
										⬆️ Add Row Before
									</Button>
								</DropdownMenuItem>

								<DropdownMenuItem asChild>
									<Button
										data-style="ghost"
										onClick={() => editor?.chain().focus().addRowAfter().run()}
										disabled={!editorState?.canAddRowAfter}
									>
										⬇️ Add Row After
									</Button>
								</DropdownMenuItem>

								<DropdownMenuItem asChild>
									<Button
										data-style="ghost"
										onClick={() => editor?.chain().focus().deleteRow().run()}
										disabled={!editorState?.canDeleteRow}
									>
										🗑️ Delete Row
									</Button>
								</DropdownMenuItem>
							</div>
						</CardBody>
					</Card>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
