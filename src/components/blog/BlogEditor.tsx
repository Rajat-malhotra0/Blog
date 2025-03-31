'use client';

import React, { useCallback, useMemo } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { $generateHtmlFromNodes } from '@lexical/html';
import { EditorState, LexicalEditor } from 'lexical';

import { ToolbarPlugin } from './plugins/ToolbarPlugin';

interface BlogEditorProps {
  onContentChange: (content: string) => void;
  initialContent?: string;
}

// Create inner component for better memoization
const BlogEditorInner: React.FC<BlogEditorProps> = ({
  onContentChange,
  initialContent,
}) => {
  const handleEditorChange = useCallback(
    (editorStateParam: EditorState, editor: LexicalEditor) => {
      editorStateParam.read(() => {
        const htmlString = $generateHtmlFromNodes(editor);
        onContentChange(htmlString);
      });
    },
    [onContentChange]
  );

  // Use useMemo for the initial config to prevent recreation
  const initialConfig = useMemo(() => ({
    namespace: 'BlogEditor',
    theme: {
      root: 'p-4 border border-gray-300 rounded-md min-h-[300px] focus:outline-none',
      link: 'cursor-pointer text-blue-500 underline',
      heading: {
        h1: 'text-3xl font-bold mb-2',
        h2: 'text-2xl font-bold mb-2',
        h3: 'text-xl font-bold mb-2',
      },
      list: {
        ul: 'list-disc list-inside mb-2',
        ol: 'list-decimal list-inside mb-2',
      },
    },
    onError: (error: Error) => {
      console.error('Lexical Error:', error);
    },
    nodes: [
      HeadingNode, QuoteNode, ListNode, ListItemNode,
      TableNode, TableCellNode, TableRowNode,
      CodeNode, CodeHighlightNode, AutoLinkNode, LinkNode,
    ],
  }), []);

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="editor-container border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800">
        <ToolbarPlugin />
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="editor-input p-4 min-h-[300px] focus:outline-none text-black dark:text-white" />
            }
            placeholder={
              <div className="editor-placeholder text-gray-400 dark:text-gray-500 absolute top-4 left-4 select-none pointer-events-none">
                Start typing your blog post...
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />
        <OnChangePlugin onChange={handleEditorChange} ignoreSelectionChange={true} />
      </div>
    </LexicalComposer>
  );
};

// Export a memoized version of the component
const BlogEditor = React.memo(BlogEditorInner);

export default BlogEditor;