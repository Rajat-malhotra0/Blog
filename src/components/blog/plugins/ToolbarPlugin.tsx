'use client';

import { $getNodeByKey, COMMAND_PRIORITY_NORMAL, createCommand, LexicalCommand, LexicalEditor } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  $getRoot,
  $createParagraphNode
} from 'lexical';

import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
  ListNode
} from '@lexical/list';
import { $isHeadingNode, $createHeadingNode, HeadingTagType } from '@lexical/rich-text';
import { $isElementNode, $isParagraphNode } from 'lexical';
import { $setBlocksType } from '@lexical/selection';
import React, { useCallback, useEffect, useState } from 'react';


export const FORMAT_HEADING_COMMAND: LexicalCommand<HeadingTagType | null> = createCommand();

// Define icon components for better visual representation
const BoldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
    <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
  </svg>
);

const ItalicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="4" x2="10" y2="4"></line>
    <line x1="14" y1="20" x2="5" y2="20"></line>
    <line x1="15" y1="4" x2="9" y2="20"></line>
  </svg>
);

const UnderlineIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path>
    <line x1="4" y1="21" x2="20" y2="21"></line>
  </svg>
);

const BulletListIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"></line>
    <line x1="8" y1="12" x2="21" y2="12"></line>
    <line x1="8" y1="18" x2="21" y2="18"></line>
    <line x1="3" y1="6" x2="3.01" y2="6"></line>
    <line x1="3" y1="12" x2="3.01" y2="12"></line>
    <line x1="3" y1="18" x2="3.01" y2="18"></line>
  </svg>
);

const NumberedListIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="10" y1="6" x2="21" y2="6"></line>
    <line x1="10" y1="12" x2="21" y2="12"></line>
    <line x1="10" y1="18" x2="21" y2="18"></line>
    <path d="M4 6h1v4"></path>
    <path d="M4 10h2"></path>
    <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path>
  </svg>
);

export function ToolbarPlugin(): React.ReactElement {
  const [editor] = useLexicalComposerContext();

  // Text formatting states
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  // Block formatting states
  const [blockType, setBlockType] = useState<string>('paragraph');
  const [isNumberedList, setIsNumberedList] = useState(false);
  const [isBulletList, setIsBulletList] = useState(false);

  useEffect(() => {
    // Register a command handler for heading formatting
    return editor.registerCommand(
      FORMAT_HEADING_COMMAND,
      (headingTag) => {
        if (headingTag) {
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createHeadingNode(headingTag));
            }
          });
        } else {
          // null heading tag means convert to paragraph
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createParagraphNode());
            }
          });
        }
        return true;
      },
      COMMAND_PRIORITY_NORMAL
    );
  }, [editor]);


  // Update formatting state based on selection and node type
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;

        // Check text formatting
        setIsBold(selection.hasFormat('bold'));
        setIsItalic(selection.hasFormat('italic'));
        setIsUnderline(selection.hasFormat('underline'));

        // Get the anchor node (where cursor is)
        const anchorNode = selection.anchor.getNode();

        // Start with direct parent for node type checks
        let nodeToCheck = anchorNode;

        // If text node, get parent; text nodes can't be paragraphs or headings directly
        if (nodeToCheck.getType() === 'text') {
          nodeToCheck = nodeToCheck.getParent() || nodeToCheck;
        }

        // Determine block type
        if ($isHeadingNode(nodeToCheck)) {
          setBlockType(nodeToCheck.getTag());
        } else if ($isParagraphNode(nodeToCheck)) {
          setBlockType('paragraph');
        } else {
          // For other elements, try parent
          const parent = nodeToCheck.getParent();
          if (parent) {
            if ($isHeadingNode(parent)) {
              setBlockType(parent.getTag());
            } else if ($isParagraphNode(parent)) {
              setBlockType('paragraph');
            } else {
              setBlockType('paragraph'); // Default
            }
          } else {
            setBlockType('paragraph'); // Default
          }
        }

        // List detection logic - initialize it here after we have nodeToCheck
        let parentList = null;

        // Check if current node is in a list
        let currentNode = nodeToCheck;
        while (currentNode !== null) {
          if ($isListNode(currentNode)) {
            parentList = currentNode;
            break;
          }

          const parent = currentNode.getParent();
          if (parent === null) break;
          currentNode = parent;
        }

        // Set list states
        if (parentList) {
          const listType = parentList.getListType();
          setIsNumberedList(listType === 'number');
          setIsBulletList(listType === 'bullet');
        } else {
          setIsNumberedList(false);
          setIsBulletList(false);
        }
      });
    });
  }, [editor]);

  // Text formatting handlers
  const toggleBold = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
  }, [editor]);

  const toggleItalic = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
  }, [editor]);

  const toggleUnderline = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
  }, [editor]);

  // List formatting handlers
  const toggleBulletList = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (isBulletList) {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    }
  }, [editor, isBulletList]);

  const toggleNumberedList = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (isNumberedList) {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    }
  }, [editor, isNumberedList]);

  // Heading handlers
  const toggleHeading = useCallback((e: React.MouseEvent, headingSize: HeadingTagType) => {
    e.preventDefault();

    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      // If already this heading type, convert to paragraph
      if (blockType === headingSize) {
        $setBlocksType(selection, () => $createParagraphNode());
      } else {
        // Otherwise convert to the specified heading
        $setBlocksType(selection, () => $createHeadingNode(headingSize));
      }
    });
  }, [editor, blockType]);

  // Styling classes
  const buttonBaseClass = "flex items-center justify-center p-2 rounded-md transition-colors duration-200 mr-1";

  // Get button class based on active state
  const getButtonClass = (isActive: boolean) => {
    return `${buttonBaseClass} ${isActive
      ? "bg-blue-100 text-blue-700 border border-blue-300 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700"
      : "border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
      }`;
  };

  return (
    <div className="toolbar p-2 border-b border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex flex-wrap gap-1">
      <div className="formatting-group flex mr-2">
        <button
          type="button"
          onClick={toggleBold}
          className={getButtonClass(isBold)}
          aria-label="Bold"
          title="Bold"
        >
          <BoldIcon />
        </button>

        <button
          type="button"
          onClick={toggleItalic}
          className={getButtonClass(isItalic)}
          aria-label="Italic"
          title="Italic"
        >
          <ItalicIcon />
        </button>

        <button
          type="button"
          onClick={toggleUnderline}
          className={getButtonClass(isUnderline)}
          aria-label="Underline"
          title="Underline"
        >
          <UnderlineIcon />
        </button>
      </div>

      <div className="heading-group flex mr-2">
        <button
          type="button"
          onClick={(e) => toggleHeading(e, 'h1')}
          className={getButtonClass(blockType === 'h1')}
          aria-label="Heading 1"
          title="Heading 1"
        >
          H1
        </button>

        <button
          type="button"
          onClick={(e) => toggleHeading(e, 'h2')}
          className={getButtonClass(blockType === 'h2')}
          aria-label="Heading 2"
          title="Heading 2"
        >
          H2
        </button>

        <button
          type="button"
          onClick={(e) => toggleHeading(e, 'h3')}
          className={getButtonClass(blockType === 'h3')}
          aria-label="Heading 3"
          title="Heading 3"
        >
          H3
        </button>
      </div>

      <div className="list-group flex">
        <button
          type="button"
          onClick={toggleBulletList}
          className={getButtonClass(isBulletList)}
          aria-label="Bullet List"
          title="Bullet List"
        >
          <BulletListIcon />
        </button>

        <button
          type="button"
          onClick={toggleNumberedList}
          className={getButtonClass(isNumberedList)}
          aria-label="Numbered List"
          title="Numbered List"
        >
          <NumberedListIcon />
        </button>
      </div>
    </div>
  );
}

