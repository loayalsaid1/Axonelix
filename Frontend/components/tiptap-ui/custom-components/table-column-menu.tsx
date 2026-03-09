import type { JSX } from "react";
import { Button } from "../../tiptap-ui-primitive/button";
import { Editor, useCurrentEditor, useEditorState } from "@tiptap/react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "../../tiptap-ui-primitive/dropdown-menu";
import { Card, CardBody } from "../../tiptap-ui-primitive/card";

export default function TableColumnMenu(): JSX.Element {
	const { editor } = useCurrentEditor();
	const editorState = useEditorState({
		editor,
		selector: ({ editor }: { editor: Editor | null }) => {
			if (!editor) return null;

			return {
				isInTable: editor.isActive('table'),
				canAddColumnBefore: editor.can().addColumnBefore(),
				canAddColumnAfter: editor.can().addColumnAfter(),
				canDeleteColumn: editor.can().deleteColumn(),
			}
		},
	});

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					data-style="secondary"
					tooltip="Column Operations"
					disabled={!editorState?.isInTable}
				>
					➕ Columns
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
										onClick={() => editor?.chain().focus().addColumnBefore().run()}
										disabled={!editorState?.canAddColumnBefore}
									>
										⬅️ Add Column Before
									</Button>
								</DropdownMenuItem>

								<DropdownMenuItem asChild>
									<Button
										data-style="ghost"
										onClick={() => editor?.chain().focus().addColumnAfter().run()}
										disabled={!editorState?.canAddColumnAfter}
									>
										➡️ Add Column After
									</Button>
								</DropdownMenuItem>

								<DropdownMenuItem asChild>
									<Button
										data-style="ghost"
										onClick={() => editor?.chain().focus().deleteColumn().run()}
										disabled={!editorState?.canDeleteColumn}
									>
										🗑️ Delete Column
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
