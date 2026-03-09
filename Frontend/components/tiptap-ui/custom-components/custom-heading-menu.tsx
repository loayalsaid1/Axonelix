import type { JSX } from "react";
import { Button, ButtonGroup } from "../../tiptap-ui-primitive/button";
import { Editor, useCurrentEditor, useEditorState } from "@tiptap/react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "../../tiptap-ui-primitive/dropdown-menu";
import { Card, CardBody } from "../../tiptap-ui-primitive/card";
import { HeadingIcon } from "../../tiptap-icons/heading-icon";

export default function CustomHeadingMenu(): JSX.Element {
	const { editor } = useCurrentEditor();
	const editorState = useEditorState({
		editor,
		selector: ({ editor }: { editor: Editor | null }) => {
			if (!editor) return null;

			return {
				canToggleLevel1: editor.can().toggleCustomHeading({ level: 1 }),
				isLevel1Active: editor.isActive('customHeading', { level: 1 }),
				canToggleLevel2: editor.can().toggleCustomHeading({ level: 2 }),
				isLevel2Active: editor.isActive('customHeading', { level: 2 }),
				canToggleLevel3: editor.can().toggleCustomHeading({ level: 3 }),
				isLevel3Active: editor.isActive('customHeading', { level: 3 }),
				canToggleLevel4: editor.can().toggleCustomHeading({ level: 4 }),
				isLevel4Active: editor.isActive('customHeading', { level: 4 }),
			}
		},
	});

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					data-style="secondary"
					tooltip="Custom Headers">
					<HeadingIcon className="tiptap-button-icon" />
					Custom
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start"  >
				<DropdownMenuGroup>
					<Card>
						<CardBody>
							<ButtonGroup orientation="vertical" >

								<DropdownMenuItem asChild>
									<Button
										data-style="ghost"
										onClick={() => editor?.chain().focus().toggleCustomHeading({ level: 1 }).run()}
										disabled={!editorState?.canToggleLevel1}
										data-active={editorState?.isLevel1Active}
									>
										<span className="text-xl mr-2">📖</span>
										Chapter Title
									</Button>
								</DropdownMenuItem>

								<DropdownMenuItem asChild>
									<Button
										data-style="ghost"
										onClick={() => editor?.chain().focus().toggleCustomHeading({ level: 2 }).run()}
										disabled={!editorState?.canToggleLevel2}
										data-active={editorState?.isLevel2Active}
									>
										<span className="text-xl mr-2">📑</span>
										Section Title
									</Button>
								</DropdownMenuItem>

								<DropdownMenuItem asChild>
									<Button
										data-style="ghost"
										onClick={() => editor?.chain().focus().toggleCustomHeading({ level: 3 }).run()}
										disabled={!editorState?.canToggleLevel3}
										data-active={editorState?.isLevel3Active}
									>
										<span className="text-xl mr-2">📄</span>
										Subtitle {'   '}
									</Button>
								</DropdownMenuItem>

								<DropdownMenuItem asChild>
									<Button
										data-style="ghost"
										onClick={() => editor?.chain().focus().toggleCustomHeading({ level: 4 }).run()}
										disabled={!editorState?.canToggleLevel4}
										data-active={editorState?.isLevel4Active}
									>
										<span className="text-xl mr-2 ">🏷️</span>
										Section Badge
									</Button>
								</DropdownMenuItem>

							</ButtonGroup>
						</CardBody>
					</Card>

				</DropdownMenuGroup>
			</DropdownMenuContent>

		</DropdownMenu>
	)
}
