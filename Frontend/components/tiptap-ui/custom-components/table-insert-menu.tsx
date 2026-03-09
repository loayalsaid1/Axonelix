import type { JSX } from "react";
import { Button } from "../../tiptap-ui-primitive/button";
import { Editor, useCurrentEditor, useEditorState } from "@tiptap/react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "../../tiptap-ui-primitive/dropdown-menu";
import { Card, CardBody } from "../../tiptap-ui-primitive/card";

export default function TableInsertMenu(): JSX.Element {
	const { editor } = useCurrentEditor();
	const editorState = useEditorState({
		editor,
		selector: ({ editor }: { editor: Editor | null }) => {
			if (!editor) return null;

			return {
				canInsertTable: editor.can().insertTable(),
			}
		},
	});

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					data-style="secondary"
					tooltip="Insert Table"
				>
					📊 Table
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
										onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
										disabled={!editorState?.canInsertTable}
									>
										📊 3x3 Table (with header)
									</Button>
								</DropdownMenuItem>

								<DropdownMenuItem asChild>
									<Button
										data-style="ghost"
										onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: false }).run()}
										disabled={!editorState?.canInsertTable}
									>
										📋 3x3 Table (no header)
									</Button>
								</DropdownMenuItem>

								<DropdownMenuItem asChild>
									<Button
										data-style="ghost"
										onClick={() => editor?.chain().focus().insertTable({ rows: 5, cols: 5, withHeaderRow: true }).run()}
										disabled={!editorState?.canInsertTable}
									>
										📊 5x5 Table (with header)
									</Button>
								</DropdownMenuItem>

								<DropdownMenuItem asChild>
									<Button
										data-style="ghost"
										onClick={() => editor?.chain().focus().insertTable({ rows: 2, cols: 4, withHeaderRow: true }).run()}
										disabled={!editorState?.canInsertTable}
									>
										📊 2x4 Table (with header)
									</Button>
								</DropdownMenuItem>

								<DropdownMenuItem asChild>
									<Button
										data-style="ghost"
										onClick={() => editor?.chain().focus().insertTable({ rows: 4, cols: 2, withHeaderRow: true }).run()}
										disabled={!editorState?.canInsertTable}
									>
										📊 4x2 Table (with header)
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
