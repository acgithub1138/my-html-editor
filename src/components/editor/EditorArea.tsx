import { useRef, useCallback, useEffect, useState, forwardRef, useImperativeHandle } from "react";

export interface EditorAreaHandle {
  execCommand: (command: string, value?: string) => void;
  getHTML: () => string;
  setHTML: (html: string) => void;
  getActiveFormats: () => Set<string>;
}

interface EditorAreaProps {
  onChange?: (html: string) => void;
  onSelectionChange?: () => void;
  placeholder?: string;
  initialContent?: string;
}

const EditorArea = forwardRef<EditorAreaHandle, EditorAreaProps>(
  ({ onChange, onSelectionChange, placeholder = "Start writing...", initialContent }, ref) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isEmpty, setIsEmpty] = useState(true);

    useEffect(() => {
      if (editorRef.current && initialContent) {
        editorRef.current.innerHTML = initialContent;
        setIsEmpty(false);
      }
    }, []);

    const checkEmpty = useCallback(() => {
      if (editorRef.current) {
        const text = editorRef.current.textContent || "";
        setIsEmpty(text.trim().length === 0);
      }
    }, []);

    useImperativeHandle(ref, () => ({
      execCommand: (command: string, value?: string) => {
        editorRef.current?.focus();
        if (command === "code") {
          // Wrap selection in <code> tag
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const code = document.createElement("code");
            range.surroundContents(code);
          }
        } else if (command === "formatBlock" && value) {
          document.execCommand("formatBlock", false, `<${value}>`);
        } else if (command === "createLink" && value) {
          document.execCommand("createLink", false, value);
        } else if (command === "insertImage" && value) {
          document.execCommand("insertImage", false, value);
        } else {
          document.execCommand(command, false, value);
        }
        checkEmpty();
        onChange?.(editorRef.current?.innerHTML || "");
      },
      getHTML: () => editorRef.current?.innerHTML || "",
      setHTML: (html: string) => {
        if (editorRef.current) {
          editorRef.current.innerHTML = html;
          checkEmpty();
        }
      },
      getActiveFormats: () => {
        const formats = new Set<string>();
        if (document.queryCommandState("bold")) formats.add("bold");
        if (document.queryCommandState("italic")) formats.add("italic");
        if (document.queryCommandState("underline")) formats.add("underline");
        if (document.queryCommandState("strikeThrough")) formats.add("strikeThrough");
        if (document.queryCommandState("insertUnorderedList")) formats.add("insertUnorderedList");
        if (document.queryCommandState("insertOrderedList")) formats.add("insertOrderedList");

        const block = document.queryCommandValue("formatBlock");
        if (block) formats.add(block.toLowerCase().replace(/[<>]/g, ""));

        return formats;
      },
    }));

    const handleInput = useCallback(() => {
      checkEmpty();
      onChange?.(editorRef.current?.innerHTML || "");
    }, [onChange, checkEmpty]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      // Tab to indent
      if (e.key === "Tab") {
        e.preventDefault();
        document.execCommand("insertHTML", false, "&nbsp;&nbsp;&nbsp;&nbsp;");
      }
    }, []);

    return (
      <div className="relative flex-1 overflow-auto bg-editor-surface">
        {isEmpty && (
          <div className="absolute top-6 left-8 text-muted-foreground pointer-events-none select-none">
            {placeholder}
          </div>
        )}
        <div
          ref={editorRef}
          className="editor-content min-h-full outline-none px-8 py-6 text-foreground"
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onMouseUp={onSelectionChange}
          onKeyUp={onSelectionChange}
          spellCheck
        />
      </div>
    );
  }
);

EditorArea.displayName = "EditorArea";

export default EditorArea;
