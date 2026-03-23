import { useRef, useCallback, useEffect, useState, forwardRef, useImperativeHandle } from "react";

export interface EditorAreaHandle {
  execCommand: (command: string, value?: string) => void;
  getHTML: () => string;
  setHTML: (html: string) => void;
  getActiveFormats: () => Set<string>;
  insertTable: (rows: number, cols: number) => void;
  insertImageWithSize: (url: string, width: string, height: string) => void;
  isSourceMode: boolean;
  toggleSource: () => void;
  saveSelection: () => void;
}

interface EditorAreaProps {
  onChange?: (html: string) => void;
  onSelectionChange?: () => void;
  placeholder?: string;
  initialContent?: string;
  onSourceModeChange?: (isSource: boolean) => void;
}

const EditorArea = forwardRef<EditorAreaHandle, EditorAreaProps>(
  ({ onChange, onSelectionChange, placeholder = "Start writing...", initialContent, onSourceModeChange }, ref) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const sourceRef = useRef<HTMLTextAreaElement>(null);
    const [isEmpty, setIsEmpty] = useState(true);
    const [sourceMode, setSourceMode] = useState(false);
    const [sourceValue, setSourceValue] = useState("");
    // Stores the HTML to load into the visual editor when it remounts
    const pendingHTMLRef = useRef<string | null>(null);
    const savedRangeRef = useRef<Range | null>(null);

    const saveSelection = useCallback(() => {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        savedRangeRef.current = sel.getRangeAt(0).cloneRange();
      }
    }, []);

    const restoreSelection = useCallback(() => {
      const range = savedRangeRef.current;
      if (range) {
        editorRef.current?.focus();
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    }, []);

    // On first mount or when switching back to visual, load content into the div
    useEffect(() => {
      if (!sourceMode && editorRef.current) {
        const html = pendingHTMLRef.current ?? initialContent ?? "";
        if (html) {
          editorRef.current.innerHTML = html;
          const text = editorRef.current.textContent || "";
          setIsEmpty(text.trim().length === 0);
          onChange?.(html);
        }
        pendingHTMLRef.current = null;
      }
    }, [sourceMode]); // intentionally only depends on sourceMode

    const checkEmpty = useCallback(() => {
      if (editorRef.current) {
        const text = editorRef.current.textContent || "";
        setIsEmpty(text.trim().length === 0);
      }
    }, []);

    const toggleSource = useCallback(() => {
      if (sourceMode) {
        // Switching back to visual — stash edited HTML so the useEffect above picks it up
        pendingHTMLRef.current = sourceValue;
      } else {
        // Switching to source — grab current visual HTML
        const html = editorRef.current?.innerHTML || "";
        setSourceValue(formatHTML(html));
      }
      const newMode = !sourceMode;
      setSourceMode(newMode);
      onSourceModeChange?.(newMode);
    }, [sourceMode, sourceValue, onSourceModeChange]);

    useImperativeHandle(ref, () => ({
      isSourceMode: sourceMode,
      toggleSource,
      execCommand: (command: string, value?: string) => {
        if (sourceMode) return;
        editorRef.current?.focus();
        if (command === "code") {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const code = document.createElement("code");
            range.surroundContents(code);
          }
        } else if (command === "fontSize" && value) {
          // Apply real pt size via span style instead of execCommand's 1-7 scale
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
            const range = selection.getRangeAt(0);
            const span = document.createElement("span");
            span.style.fontSize = `${value}pt`;
            range.surroundContents(span);
          }
        } else if (command === "fontName" && value) {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
            const range = selection.getRangeAt(0);
            const span = document.createElement("span");
            span.style.fontFamily = value;
            range.surroundContents(span);
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
      getHTML: () => {
        if (sourceMode) return sourceValue;
        return editorRef.current?.innerHTML || "";
      },
      setHTML: (html: string) => {
        if (editorRef.current) {
          editorRef.current.innerHTML = html;
          checkEmpty();
        }
        if (sourceMode) {
          setSourceValue(html);
        }
      },
      getActiveFormats: () => {
        const formats = new Set<string>();
        if (sourceMode) return formats;
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
      insertTable: (rows: number, cols: number) => {
        if (sourceMode) return;
        editorRef.current?.focus();
        let html = '<table><thead><tr>';
        for (let c = 0; c < cols; c++) {
          html += `<th>Header ${c + 1}</th>`;
        }
        html += '</tr></thead><tbody>';
        for (let r = 0; r < rows - 1; r++) {
          html += '<tr>';
          for (let c = 0; c < cols; c++) {
            html += '<td>&nbsp;</td>';
          }
          html += '</tr>';
        }
        html += '</tbody></table><p><br></p>';
        document.execCommand("insertHTML", false, html);
        onChange?.(editorRef.current?.innerHTML || "");
      },
      insertImageWithSize: (url: string, width: string, height: string) => {
        if (sourceMode) return;
        editorRef.current?.focus();
        const w = width ? (width.includes('%') ? width : `${width}px`) : '';
        const h = height ? (height.includes('%') ? height : `${height}px`) : '';
        let style = '';
        if (w) style += `width:${w};`;
        if (h) style += `height:${h};`;
        const img = `<img src="${url}"${style ? ` style="${style}"` : ''} alt="" />`;
        document.execCommand("insertHTML", false, img);
        onChange?.(editorRef.current?.innerHTML || "");
      },
    }));

    const handleInput = useCallback(() => {
      checkEmpty();
      onChange?.(editorRef.current?.innerHTML || "");
    }, [onChange, checkEmpty]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        document.execCommand("insertHTML", false, "&nbsp;&nbsp;&nbsp;&nbsp;");
      }
    }, []);

    const handleSourceChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setSourceValue(e.target.value);
    }, []);

    if (sourceMode) {
      return (
        <div className="relative flex-1 overflow-auto bg-editor-gutter">
          <textarea
            ref={sourceRef}
            value={sourceValue}
            onChange={handleSourceChange}
            className="w-full h-full min-h-full p-6 font-mono text-sm bg-editor-gutter text-foreground outline-none resize-none"
            spellCheck={false}
            autoFocus
          />
        </div>
      );
    }

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

function formatHTML(html: string): string {
  let formatted = '';
  let indent = 0;
  const tokens = html.replace(/>\s*</g, '>\n<').split('\n');
  for (const token of tokens) {
    const trimmed = token.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('</')) {
      indent = Math.max(0, indent - 1);
    }
    formatted += '  '.repeat(indent) + trimmed + '\n';
    if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>') && !trimmed.includes('</')) {
      const tag = trimmed.match(/^<(\w+)/)?.[1]?.toLowerCase();
      const voidTags = ['br', 'hr', 'img', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'];
      if (tag && !voidTags.includes(tag)) {
        indent++;
      }
    }
  }
  return formatted.trimEnd();
}

EditorArea.displayName = "EditorArea";

export default EditorArea;
