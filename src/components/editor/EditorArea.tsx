import React, { useRef, useCallback, useEffect, useState, forwardRef, useImperativeHandle } from "react";
import TableContextMenu from "./TableContextMenu";
import TablePropertiesDialog, { CellPropertiesDialog, RowPropertiesDialog } from "./TablePropertiesDialog";

export interface EditorAreaHandle {
  execCommand: (command: string, value?: string) => void;
  getHTML: () => string;
  setHTML: (html: string) => void;
  getActiveFormats: () => Set<string>;
  insertTable: (rows: number, cols: number) => void;
  insertImageWithSize: (url: string, width: string, height: string, alt?: string, title?: string) => void;
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
    const pendingHTMLRef = useRef<string | null>(null);
    const savedRangeRef = useRef<Range | null>(null);

    // Context menu state
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
    const contextCellRef = useRef<HTMLElement | null>(null);
    const contextRowRef = useRef<HTMLTableRowElement | null>(null);
    const contextTableRef = useRef<HTMLTableElement | null>(null);

    // Property dialog state
    const [dialog, setDialog] = useState<"table" | "cell" | "row" | null>(null);

    // Resize state
    const resizeRef = useRef<{
      type: "col" | "row";
      table: HTMLTableElement;
      index: number;
      startPos: number;
      startSizes: number[];
    } | null>(null);

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

    const emitChange = useCallback(() => {
      onChange?.(editorRef.current?.innerHTML || "");
    }, [onChange]);

    // Table resize by dragging borders
    useEffect(() => {
      const editor = editorRef.current;
      if (!editor || sourceMode) return;

      const getResizeTarget = (e: MouseEvent): { type: "col" | "row"; table: HTMLTableElement; index: number } | null => {
        const target = e.target as HTMLElement;
        const cell = target.closest("td, th") as HTMLTableCellElement | null;
        if (!cell) return null;
        const table = cell.closest("table") as HTMLTableElement | null;
        if (!table) return null;

        const rect = cell.getBoundingClientRect();
        const threshold = 5;

        // Check right edge for column resize
        if (Math.abs(e.clientX - rect.right) < threshold) {
          const row = cell.parentElement as HTMLTableRowElement;
          const cellIndex = Array.from(row.cells).indexOf(cell);
          return { type: "col", table, index: cellIndex };
        }
        // Check bottom edge for row resize
        if (Math.abs(e.clientY - rect.bottom) < threshold) {
          const row = cell.parentElement as HTMLTableRowElement;
          const rows = Array.from(table.rows);
          const rowIndex = rows.indexOf(row);
          return { type: "row", table, index: rowIndex };
        }
        return null;
      };

      const onMouseDown = (e: MouseEvent) => {
        const target = getResizeTarget(e);
        if (!target) return;
        e.preventDefault();

        if (target.type === "col") {
          // Get current column widths
          const firstRow = target.table.rows[0];
          if (!firstRow) return;
          const sizes = Array.from(firstRow.cells).map(c => c.getBoundingClientRect().width);
          resizeRef.current = { type: "col", table: target.table, index: target.index, startPos: e.clientX, startSizes: sizes };
        } else {
          const sizes = Array.from(target.table.rows).map(r => r.getBoundingClientRect().height);
          resizeRef.current = { type: "row", table: target.table, index: target.index, startPos: e.clientY, startSizes: sizes };
        }
      };

      const onMouseMove = (e: MouseEvent) => {
        // Update cursor on hover
        const target = getResizeTarget(e);
        if (target && !resizeRef.current) {
          editor.style.cursor = target.type === "col" ? "col-resize" : "row-resize";
        } else if (!resizeRef.current) {
          editor.style.cursor = "";
        }

        if (!resizeRef.current) return;
        const r = resizeRef.current;

        if (r.type === "col") {
          const delta = e.clientX - r.startPos;
          const newWidth = Math.max(20, r.startSizes[r.index] + delta);
          // Apply width to all cells in that column
          for (const row of Array.from(r.table.rows)) {
            const cell = row.cells[r.index] as HTMLTableCellElement | undefined;
            if (cell) cell.style.width = `${newWidth}px`;
          }
        } else {
          const delta = e.clientY - r.startPos;
          const row = r.table.rows[r.index];
          if (row) {
            const newHeight = Math.max(16, r.startSizes[r.index] + delta);
            row.style.height = `${newHeight}px`;
          }
        }
      };

      const onMouseUp = () => {
        if (resizeRef.current) {
          resizeRef.current = null;
          editor.style.cursor = "";
          emitChange();
        }
      };

      editor.addEventListener("mousedown", onMouseDown);
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);

      return () => {
        editor.removeEventListener("mousedown", onMouseDown);
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };
    }, [sourceMode, emitChange]);

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
    }, [sourceMode]);

    const checkEmpty = useCallback(() => {
      if (editorRef.current) {
        const text = editorRef.current.textContent || "";
        setIsEmpty(text.trim().length === 0);
      }
    }, []);

    const toggleSource = useCallback(() => {
      if (sourceMode) {
        pendingHTMLRef.current = sourceValue;
      } else {
        const html = editorRef.current?.innerHTML || "";
        setSourceValue(formatHTML(html));
      }
      const newMode = !sourceMode;
      setSourceMode(newMode);
      onSourceModeChange?.(newMode);
    }, [sourceMode, sourceValue, onSourceModeChange]);

    // Context menu handler
    const handleContextMenu = useCallback((e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      const cell = target.closest("td, th") as HTMLElement | null;
      if (!cell) return; // Only show for table cells

      e.preventDefault();
      contextCellRef.current = cell;
      contextRowRef.current = cell.closest("tr") as HTMLTableRowElement;
      contextTableRef.current = cell.closest("table") as HTMLTableElement;
      setContextMenu({ x: e.clientX, y: e.clientY });
    }, []);

    // Table context menu actions
    const handleTableAction = useCallback((action: string) => {
      const cell = contextCellRef.current as HTMLTableCellElement | null;
      const row = contextRowRef.current;
      const table = contextTableRef.current;
      if (!table) return;

      switch (action) {
        case "insertRowBefore":
        case "insertRowAfter": {
          if (!row) break;
          const newRow = row.cloneNode(false) as HTMLTableRowElement;
          newRow.style.height = "";
          for (let i = 0; i < row.cells.length; i++) {
            const td = document.createElement("td");
            td.innerHTML = "&nbsp;";
            td.style.cssText = row.cells[i].style.cssText;
            td.style.backgroundColor = "";
            newRow.appendChild(td);
          }
          if (action === "insertRowBefore") row.parentNode?.insertBefore(newRow, row);
          else row.parentNode?.insertBefore(newRow, row.nextSibling);
          break;
        }
        case "deleteRow": {
          if (!row) break;
          if (table.rows.length <= 1) { table.remove(); break; }
          row.remove();
          break;
        }
        case "insertColumnBefore":
        case "insertColumnAfter": {
          if (!cell) break;
          const colIdx = Array.from(row!.cells).indexOf(cell);
          for (const r of Array.from(table.rows)) {
            const td = document.createElement("td");
            td.innerHTML = "&nbsp;";
            const ref = r.cells[action === "insertColumnBefore" ? colIdx : colIdx + 1];
            r.insertBefore(td, ref || null);
          }
          break;
        }
        case "deleteColumn": {
          if (!cell || !row) break;
          const idx = Array.from(row.cells).indexOf(cell);
          if (row.cells.length <= 1) { table.remove(); break; }
          for (const r of Array.from(table.rows)) {
            r.cells[idx]?.remove();
          }
          break;
        }
        case "deleteTable":
          table.remove();
          break;
        case "tableProperties":
          setDialog("table");
          return;
        case "cellProperties":
          setDialog("cell");
          return;
        case "rowProperties":
          setDialog("row");
          return;
        case "link": {
          const url = prompt("Enter URL:");
          if (url) {
            editorRef.current?.focus();
            document.execCommand("createLink", false, url);
          }
          break;
        }
      }
      emitChange();
    }, [emitChange]);

    // Dialog save handlers
    const handleSaveTableProps = useCallback((props: { width: string; height: string; cellSpacing: string; cellPadding: string; borderWidth: string; alignment: string; borderStyle: string; borderColor: string; backgroundColor: string }) => {
      const table = contextTableRef.current;
      if (!table) return;
      table.style.width = props.width || "";
      table.style.height = props.height || "";
      table.setAttribute("cellspacing", props.cellSpacing || "0");
      table.setAttribute("cellpadding", props.cellPadding || "0");
      table.setAttribute("border", props.borderWidth || "0");
      if (props.alignment) table.setAttribute("align", props.alignment);
      else table.removeAttribute("align");
      table.style.borderStyle = props.borderStyle || "";
      table.style.borderColor = props.borderColor || "";
      table.style.backgroundColor = props.backgroundColor || "";
      setDialog(null);
      emitChange();
    }, [emitChange]);

    const handleSaveCellProps = useCallback((props: { width: string; height: string; hAlign: string; vAlign: string }) => {
      const cell = contextCellRef.current;
      if (!cell) return;
      cell.style.width = props.width || "";
      cell.style.height = props.height || "";
      if (props.hAlign) cell.setAttribute("align", props.hAlign);
      else cell.removeAttribute("align");
      if (props.vAlign) cell.style.verticalAlign = props.vAlign;
      else cell.style.verticalAlign = "";
      setDialog(null);
      emitChange();
    }, [emitChange]);

    const handleSaveRowProps = useCallback((props: { rowType: string; alignment: string; height: string }) => {
      const row = contextRowRef.current;
      const table = contextTableRef.current;
      if (!row || !table) return;
      row.style.height = props.height || "";
      if (props.alignment) row.setAttribute("align", props.alignment);
      else row.removeAttribute("align");
      // Move row to correct section
      if (props.rowType === "header") {
        let thead = table.querySelector("thead");
        if (!thead) { thead = document.createElement("thead"); table.insertBefore(thead, table.firstChild); }
        thead.appendChild(row);
      } else if (props.rowType === "footer") {
        let tfoot = table.querySelector("tfoot");
        if (!tfoot) { tfoot = document.createElement("tfoot"); table.appendChild(tfoot); }
        tfoot.appendChild(row);
      } else {
        let tbody = table.querySelector("tbody");
        if (!tbody) { tbody = document.createElement("tbody"); table.appendChild(tbody); }
        tbody.appendChild(row);
      }
      setDialog(null);
      emitChange();
    }, [emitChange]);

    useImperativeHandle(ref, () => ({
      isSourceMode: sourceMode,
      toggleSource,
      saveSelection,
      execCommand: (command: string, value?: string) => {
        if (sourceMode) return;

        if (command === "fontSize" || command === "fontName" || command === "code" || command === "foreColor" || command === "cellBgColor") {
          restoreSelection();
        } else {
          editorRef.current?.focus();
        }

        if (command === "code") {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
            const range = selection.getRangeAt(0);
            const code = document.createElement("code");
            range.surroundContents(code);
          }
        } else if (command === "fontSize" && value) {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
            const range = selection.getRangeAt(0);
            const contents = range.extractContents();
            const span = document.createElement("span");
            span.style.fontSize = `${value}pt`;
            span.appendChild(contents);
            range.insertNode(span);
            selection.removeAllRanges();
          }
        } else if (command === "fontName" && value) {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
            const range = selection.getRangeAt(0);
            const contents = range.extractContents();
            const span = document.createElement("span");
            span.style.fontFamily = value;
            span.appendChild(contents);
            range.insertNode(span);
            selection.removeAllRanges();
          }
        } else if (command === "foreColor" && value) {
          restoreSelection();
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
            const range = selection.getRangeAt(0);
            const contents = range.extractContents();
            const span = document.createElement("span");
            span.style.color = value;
            span.appendChild(contents);
            range.insertNode(span);
            selection.removeAllRanges();
          }
        } else if (command === "cellBgColor" && value) {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const node = selection.anchorNode;
            const cell = (node instanceof HTMLElement ? node : node?.parentElement)?.closest("td, th") as HTMLElement | null;
            if (cell) cell.style.backgroundColor = value;
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
        if (sourceMode) setSourceValue(html);
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
        let html = '<table border="1" style="border-collapse:collapse;width:100%"><tbody>';
        for (let r = 0; r < rows; r++) {
          html += '<tr>';
          for (let c = 0; c < cols; c++) {
            html += '<td style="border:1px solid hsl(220 13% 90%);padding:4px">&nbsp;</td>';
          }
          html += '</tr>';
        }
        html += '</tbody></table><p><br></p>';
        document.execCommand("insertHTML", false, html);
        onChange?.(editorRef.current?.innerHTML || "");
      },
      insertImageWithSize: (url: string, width: string, height: string, alt?: string, title?: string) => {
        if (sourceMode) return;
        editorRef.current?.focus();
        const w = width ? (width.includes('%') ? width : `${width}px`) : '';
        const h = height ? (height.includes('%') ? height : `${height}px`) : '';
        let style = '';
        if (w) style += `width:${w};`;
        if (h) style += `height:${h};`;
        const altAttr = alt ? ` alt="${alt}"` : ' alt=""';
        const titleAttr = title ? ` title="${title}"` : '';
        const img = `<img src="${url}"${altAttr}${titleAttr}${style ? ` style="${style}"` : ''} />`;
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

    // Get current properties for dialogs
    const getTableProps = () => {
      const t = contextTableRef.current;
      if (!t) return { width: "", height: "", cellSpacing: "", cellPadding: "", borderWidth: "", alignment: "", borderStyle: "", borderColor: "", backgroundColor: "" };
      return {
        width: t.style.width || t.getAttribute("width") || "",
        height: t.style.height || "",
        cellSpacing: t.getAttribute("cellspacing") || "",
        cellPadding: t.getAttribute("cellpadding") || "",
        borderWidth: t.getAttribute("border") || "",
        alignment: t.getAttribute("align") || "",
        borderStyle: t.style.borderStyle || "",
        borderColor: t.style.borderColor || "",
        backgroundColor: t.style.backgroundColor || "",
      };
    };

    const getCellProps = () => {
      const c = contextCellRef.current;
      if (!c) return { width: "", height: "", hAlign: "", vAlign: "" };
      return {
        width: c.style.width || "",
        height: c.style.height || "",
        hAlign: c.getAttribute("align") || "",
        vAlign: c.style.verticalAlign || "",
      };
    };

    const getRowProps = () => {
      const r = contextRowRef.current;
      if (!r) return { rowType: "body", alignment: "", height: "" };
      const parent = r.parentElement?.tagName.toLowerCase();
      const rowType = parent === "thead" ? "header" : parent === "tfoot" ? "footer" : "body";
      return {
        rowType,
        alignment: r.getAttribute("align") || "",
        height: r.style.height || "",
      };
    };

    if (sourceMode) {
      const highlightRef = React.createRef<HTMLDivElement>();
      const syncScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
        if (highlightRef.current) {
          highlightRef.current.scrollTop = e.currentTarget.scrollTop;
          highlightRef.current.scrollLeft = e.currentTarget.scrollLeft;
        }
      };
      return (
        <div className="relative flex-1 overflow-hidden bg-editor-gutter">
          <div
            ref={highlightRef}
            className="absolute inset-0 p-6 font-mono text-sm whitespace-pre-wrap break-words pointer-events-none overflow-hidden leading-[1.5]"
            aria-hidden
            dangerouslySetInnerHTML={{ __html: highlightHTML(sourceValue) + "\n" }}
          />
          <textarea
            ref={sourceRef}
            value={sourceValue}
            onChange={handleSourceChange}
            onScroll={syncScroll}
            className="relative w-full h-full min-h-full p-6 font-mono text-sm bg-transparent text-transparent outline-none resize-none leading-[1.5]"
            spellCheck={false}
            autoFocus
            style={{ caretColor: "hsl(var(--foreground))" }}
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
          onContextMenu={handleContextMenu}
          spellCheck
        />
        {contextMenu && (
          <TableContextMenu
            position={contextMenu}
            onClose={() => setContextMenu(null)}
            onAction={handleTableAction}
          />
        )}
        {dialog === "table" && (
          <TablePropertiesDialog initial={getTableProps()} onSave={handleSaveTableProps} onClose={() => setDialog(null)} />
        )}
        {dialog === "cell" && (
          <CellPropertiesDialog initial={getCellProps()} onSave={handleSaveCellProps} onClose={() => setDialog(null)} />
        )}
        {dialog === "row" && (
          <RowPropertiesDialog initial={getRowProps()} onSave={handleSaveRowProps} onClose={() => setDialog(null)} />
        )}
      </div>
    );
  }
);

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function highlightHTML(source: string): string {
  // Tokenize and highlight HTML source
  return source.replace(
    /(<!--[\s\S]*?-->)|(<\/?)([\w-]+)((?:\s+[\w-]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*))?)*)\s*(\/?>)|(&\w+;)/g,
    (match, comment, openBracket, tagName, attrs, closeBracket, entity) => {
      if (comment) {
        return `<span style="color:hsl(var(--syntax-comment))">${escapeHtml(comment)}</span>`;
      }
      if (entity) {
        return `<span style="color:hsl(var(--syntax-entity))">${escapeHtml(entity)}</span>`;
      }
      if (tagName) {
        let result = `<span style="color:hsl(var(--syntax-tag))">${escapeHtml(openBracket)}${escapeHtml(tagName)}</span>`;
        if (attrs) {
          result += attrs.replace(
            /([\w-]+)(\s*=\s*)(\"[^\"]*\"|\'[^\']*\')/g,
            (_: string, attr: string, eq: string, val: string) =>
              `<span style="color:hsl(var(--syntax-attr))">${escapeHtml(attr)}</span>${escapeHtml(eq)}<span style="color:hsl(var(--syntax-string))">${escapeHtml(val)}</span>`
          );
        }
        result += `<span style="color:hsl(var(--syntax-tag))">${escapeHtml(closeBracket)}</span>`;
        return result;
      }
      return escapeHtml(match);
    }
  );
}

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
