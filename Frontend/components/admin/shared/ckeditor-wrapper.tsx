'use client';

import React from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  ClassicEditor,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Subscript,
  Superscript,
  Essentials,
  Paragraph,
  Heading,
  List,
  Link,
  Table,
  TableToolbar,
  TableProperties,
  TableCellProperties,
  BlockQuote,
  Undo,
  SourceEditing,
  Alignment,
  Font,
  Image,
  ImageToolbar,
  ImageCaption,
  ImageStyle,
  ImageResize,
  ImageTextAlternative,
  ImageInsert,
  GeneralHtmlSupport,
  MediaEmbed,
  HtmlEmbed,
} from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';

interface CKEditorWrapperProps {
  data: string;
  onChange: (data: string) => void;
}

export default function CKEditorWrapper({ data, onChange }: CKEditorWrapperProps) {
  return (
    <div className="ckeditor-container w-full min-w-0 max-w-full border rounded-md bg-background prose dark:prose-invert max-w-none [&_.ck-editor]:w-full [&_.ck-editor]:max-w-full [&_.ck-toolbar]:flex-wrap [&_.ck-toolbar\_\_items]:flex-wrap [&_.ck-toolbar]:max-w-full [&_.ck-editor\_\_editable]:min-h-60 [&_.ck-editor\_\_editable]:p-4 [&_.ck-editor\_\_editable]:max-w-full [&_.ck-content]:max-w-full [&_.ck-content]:break-words [&_.ck-content_img]:max-w-full [&_.ck-content_img]:h-auto [&_.ck-content_table]:max-w-full [&_.ck-content_table]:overflow-x-auto">
      <CKEditor
        editor={ClassicEditor}
        config={{
          licenseKey: 'GPL',
          plugins: [
            Essentials,
            Paragraph,
            Heading,
            Bold,
            Italic,
            Underline,
            Strikethrough,
            Subscript,
            Superscript,
            List,
            Link,
            Table,
            TableToolbar,
            TableProperties,
            TableCellProperties,
            BlockQuote,
            Undo,
            SourceEditing,
            Alignment,
            Font,
            Image,
            ImageToolbar,
            ImageCaption,
            ImageStyle,
            ImageResize,
            ImageTextAlternative,
            ImageInsert,
            GeneralHtmlSupport,
            MediaEmbed,
            HtmlEmbed,
          ],
          toolbar: {
            items: [
              'undo', 'redo', '|',
              'heading', '|',
              'bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript', '|',
              'fontSize', 'fontColor', 'fontBackgroundColor', '|',
              'alignment', '|',
              'bulletedList', 'numberedList', '|',
              'link', 'insertTable', 'insertImage', 'blockQuote', '|',
              'mediaEmbed', 'htmlEmbed', '|',
              'sourceEditing',
            ],
            shouldNotGroupWhenFull: true,
          },
          htmlSupport: {
            allow: [
              {
                name: /.*/,
                attributes: true,
                classes: true,
                styles: true,
              },
            ],
          },
          image: {
            toolbar: [
              'imageTextAlternative',
              'toggleImageCaption',
              'imageStyle:inline',
              'imageStyle:block',
              'imageStyle:side',
              '|',
              'resizeImage',
            ],
          },
          table: {
            contentToolbar: [
              'tableColumn',
              'tableRow',
              'mergeTableCell',
              'tableProperties',
              'tableCellProperties',
            ],
          },
        }}
        data={data || ''}
        onChange={(_, editor) => {
          const htmlData = editor.getData();
          onChange(htmlData);
        }}
      />
    </div>
  );
}
