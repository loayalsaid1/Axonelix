import type { JSX } from "react";
import { Button } from "../../tiptap-ui-primitive/button";
import { Editor, useCurrentEditor, useEditorState } from "@tiptap/react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "../../tiptap-ui-primitive/dropdown-menu";
import { Card, CardBody } from "../../tiptap-ui-primitive/card";

export default function TableCellMenu(): JSX.Element {
	const { editor } = useCurrentEditor();
	const editorState = useEditorState({
		editor,
		selector: ({ editor }: { editor: Editor | null }) => {
			if (!editor) return null;

			return {
				isInTable: editor.isActive('table'),
				canMergeCells: editor.can().mergeCells(),
				canSplitCell: editor.can().splitCell(),
				canToggleHeaderCell: editor.can().toggleHeaderCell(),
				canToggleHeaderColumn: editor.can().toggleHeaderColumn(),
				canToggleHeaderRow: editor.can().toggleHeaderRow(),
				canDeleteTable: editor.can().deleteTable(),
			}
		},
	});

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					data-style="secondary"
					tooltip="Cell & Table Operations"
					disabled={!editorState?.isInTable}
				>
					🔧 Cell/Table
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
										onClick={() => editor?.chain().focus().mergeCells().run()}
										disabled={!editorState?.canMergeCells}
									>
										🔗 Merge Cells
									</Button>
								</DropdownMenuItem>

								<DropdownMenuItem asChild>
									<Button
										data-style="ghost"
										onClick={() => editor?.chain().focus().splitCell().run()}
										disabled={!editorState?.canSplitCell}
									>
										✂️ Split Cell
									</Button>
								</DropdownMenuItem>

								<div className="h-px bg-gray-200 my-1"></div>

								<DropdownMenuItem asChild>
									<Button
										data-style="ghost"
										onClick={() => editor?.chain().focus().toggleHeaderCell().run()}
										disabled={!editorState?.canToggleHeaderCell}
									>
										🔤 Toggle Header Cell
									</Button>
								</DropdownMenuItem>

								<DropdownMenuItem asChild>
									<Button
										data-style="ghost"
										onClick={() => editor?.chain().focus().toggleHeaderRow().run()}
										disabled={!editorState?.canToggleHeaderRow}
									>
										↔️ Toggle Header Row
									</Button>
								</DropdownMenuItem>

								<DropdownMenuItem asChild>
									<Button
										data-style="ghost"
										onClick={() => editor?.chain().focus().toggleHeaderColumn().run()}
										disabled={!editorState?.canToggleHeaderColumn}
									>
										↕️ Toggle Header Column
									</Button>
								</DropdownMenuItem>

								<div className="h-px bg-gray-200 my-1"></div>

								<DropdownMenuItem asChild>
									<Button
										data-style="ghost"
										onClick={() => editor?.chain().focus().deleteTable().run()}
										disabled={!editorState?.canDeleteTable}
									>
										🗑️ Delete Table
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
