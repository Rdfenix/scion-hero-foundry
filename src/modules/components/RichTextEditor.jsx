import React, { useRef, useMemo, useId } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { $getRoot, $isTextNode, $createParagraphNode } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

const CustomContentEditable = ({ placeholder, onBlurCallback }) => {
  const [editor] = useLexicalComposerContext();

  return (
    <ContentEditable
      className="rich-text-editor__content"
      aria-placeholder={placeholder}
      placeholder={
        <div className="rich-text-editor__placeholder">{placeholder}</div>
      }
      onBlur={() => {
        editor.getEditorState().read(() => {
          const html = $generateHtmlFromNodes(editor);
          onBlurCallback(html);
        });
      }}
    />
  );
};

const RichTextEditor = ({
  value = "",
  placeholder = "",
  className = "",
  onChange = () => {},
  onBlur = () => {},
}) => {
  const initialValue = useRef(value);
  const editorId = useId(); // Gera um ID único para cada editor na tela

  // 2. USEMEMO E NAMESPACE ÚNICO: Evita que as configurações sejam recriadas
  const initialConfig = useMemo(
    () => ({
      namespace: `ScionRichText-${editorId}`, // Garante que múltiplos editores não entrem em conflito
      theme: {},
      onError(error) {
        console.error(error);
      },
      editorState: (editor) => {
        if (!initialValue.current) return;

        editor.update(() => {
          const parser = new DOMParser();
          const dom = parser.parseFromString(initialValue.current, "text/html");
          const nodes = $generateNodesFromDOM(editor, dom);
          const root = $getRoot();

          root.clear();

          const textNodes = nodes.filter($isTextNode);
          const otherNodes = nodes.filter((node) => !$isTextNode(node));

          if (textNodes.length > 0) {
            const paragraph = $createParagraphNode();
            paragraph.append(...textNodes);
            root.append(paragraph);
          }

          root.append(...otherNodes);
        });
      },
    }),
    [editorId],
  );

  const handleChange = (editorState, editor) => {
    editorState.read(() => {
      const html = $generateHtmlFromNodes(editor);
      onChange(html);
    });
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className={`rich-text-editor ${className}`}>
        <RichTextPlugin
          contentEditable={
            <CustomContentEditable
              placeholder={placeholder}
              onBlurCallback={onBlur}
            />
          }
          ErrorBoundary={LexicalErrorBoundary}
        />

        <HistoryPlugin />

        <OnChangePlugin onChange={handleChange} />
      </div>
    </LexicalComposer>
  );
};

export default RichTextEditor;
