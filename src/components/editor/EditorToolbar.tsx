import {
  Bold, Italic, Underline, Strikethrough, List, ListOrdered,
  Quote, Code, Heading1, Heading2, Heading3, Link, Image,
  Undo2, Redo2, Minus, AlignLeft, AlignCenter, AlignRight,
  RemoveFormatting, Type, Table, Paintbrush, PaintBucket
} from "lucide-react";
import { useCallback, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}

const ToolbarButton = ({ icon, label, onClick, active }: ToolbarButtonProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          onClick();
        }}
        className={`p-1.5 rounded transition-colors ${
          active
            ? "bg-toolbar-active text-toolbar-active-foreground"
            : "text-toolbar-foreground hover:bg-toolbar-hover"
        }`}
        aria-label={label}
      >
        {icon}
      </button>
    </TooltipTrigger>
    <TooltipContent side="bottom" className="text-xs">{label}</TooltipContent>
  </Tooltip>
);

interface EditorToolbarProps {
  onCommand: (command: string, value?: string) => void;
  activeFormats: Set<string>;
  isSourceMode: boolean;
  onToggleSource: () => void;
  onInsertTable: (rows: number, cols: number) => void;
  onInsertImage: (url: string, width: string, height: string) => void;
  onSaveSelection: () => void;
}

const TablePicker = ({ onInsert, onClose }: { onInsert: (r: number, c: number) => void; onClose: () => void }) => {
  const [hoverRow, setHoverRow] = useState(0);
  const [hoverCol, setHoverCol] = useState(0);
  const maxRows = 8;
  const maxCols = 8;

  return (
    <div className="absolute top-full left-0 mt-1 p-2 bg-popover border border-border rounded-md shadow-lg z-50">
      <div className="text-xs text-muted-foreground mb-1.5 text-center">{hoverRow} × {hoverCol}</div>
      <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${maxCols}, 1fr)` }}>
        {Array.from({ length: maxRows * maxCols }, (_, i) => {
          const r = Math.floor(i / maxCols) + 1;
          const c = (i % maxCols) + 1;
          return (
            <div
              key={i}
              className={`w-5 h-5 border rounded-sm cursor-pointer transition-colors ${
                r <= hoverRow && c <= hoverCol
                  ? "bg-primary/30 border-primary/50"
                  : "bg-muted border-border"
              }`}
              onMouseEnter={() => { setHoverRow(r); setHoverCol(c); }}
              onClick={() => { onInsert(r, c); onClose(); }}
            />
          );
        })}
      </div>
    </div>
  );
};

const ImageDialog = ({ onInsert, onClose }: { onInsert: (url: string, w: string, h: string) => void; onClose: () => void }) => {
  const [url, setUrl] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");

  return (
    <div className="flex items-center gap-2 px-3 py-2 border-t border-border bg-toolbar flex-wrap">
      <input
        type="url"
        placeholder="Image URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="flex-1 min-w-[200px] px-2 py-1 text-sm border border-border rounded bg-editor-surface text-foreground outline-none focus:ring-1 focus:ring-ring"
        autoFocus
      />
      <input
        type="text"
        placeholder="Width (e.g. 300 or 50%)"
        value={width}
        onChange={(e) => setWidth(e.target.value)}
        className="w-36 px-2 py-1 text-sm border border-border rounded bg-editor-surface text-foreground outline-none focus:ring-1 focus:ring-ring"
      />
      <input
        type="text"
        placeholder="Height (e.g. 200 or auto)"
        value={height}
        onChange={(e) => setHeight(e.target.value)}
        className="w-36 px-2 py-1 text-sm border border-border rounded bg-editor-surface text-foreground outline-none focus:ring-1 focus:ring-ring"
      />
      <button
        onClick={() => { if (url) { onInsert(url, width, height); onClose(); } }}
        className="px-3 py-1 text-sm rounded bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
      >
        Insert
      </button>
      <button
        onClick={onClose}
        className="px-3 py-1 text-sm rounded text-muted-foreground hover:bg-toolbar-hover transition-colors"
      >
        Cancel
      </button>
    </div>
  );
};

const EditorToolbar = ({ onCommand, activeFormats, isSourceMode, onToggleSource, onInsertTable, onInsertImage, onSaveSelection }: EditorToolbarProps) => {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showTablePicker, setShowTablePicker] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);

  const handleLink = useCallback(() => {
    if (showLinkInput) {
      if (linkUrl) {
        onCommand("createLink", linkUrl);
      }
      setShowLinkInput(false);
      setLinkUrl("");
    } else {
      setShowLinkInput(true);
    }
  }, [showLinkInput, linkUrl, onCommand]);

  const iconSize = 16;

  const webSafeFonts = [
    "Arial", "Arial Black", "Courier New", "Georgia", "Helvetica",
    "Impact", "Lucida Console", "Lucida Sans Unicode", "Palatino Linotype",
    "Tahoma", "Times New Roman", "Trebuchet MS", "Verdana", "Comic Sans MS",
  ];

  const fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 32, 36, 40, 44, 48];

  const selectClass = "h-7 px-1.5 text-xs border border-border rounded bg-editor-surface text-foreground outline-none focus:ring-1 focus:ring-ring cursor-pointer";

  return (
    <div className="bg-toolbar border-b border-border">
      <div className="flex items-center gap-0.5 px-2 py-1.5 flex-wrap">
        <ToolbarButton icon={<Undo2 size={iconSize} />} label="Undo (Ctrl+Z)" onClick={() => onCommand("undo")} />
        <ToolbarButton icon={<Redo2 size={iconSize} />} label="Redo (Ctrl+Y)" onClick={() => onCommand("redo")} />

        <Separator orientation="vertical" className="h-5 mx-1" />

        {/* Font Family */}
        <select
          className={selectClass + " w-[130px]"}
          onChange={(e) => { if (e.target.value) onCommand("fontName", e.target.value); }}
          defaultValue=""
          onMouseDown={() => onSaveSelection()}
        >
          <option value="" disabled>Font</option>
          {webSafeFonts.map((f) => (
            <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
          ))}
        </select>

        {/* Font Size */}
        <select
          className={selectClass + " w-[65px]"}
          onChange={(e) => {
            if (e.target.value) {
              // fontSize command uses 1-7 scale, so we use inline style via insertHTML instead
              onCommand("fontSize", e.target.value);
            }
          }}
          defaultValue=""
          onMouseDown={() => onSaveSelection()}
        >
          <option value="" disabled>Size</option>
          {fontSizes.map((s) => (
            <option key={s} value={String(s)}>{s}pt</option>
          ))}
        </select>

        <Separator orientation="vertical" className="h-5 mx-1" />

        <ToolbarButton icon={<Type size={iconSize} />} label="Paragraph" onClick={() => onCommand("formatBlock", "p")} />
        <ToolbarButton icon={<Heading1 size={iconSize} />} label="Heading 1" onClick={() => onCommand("formatBlock", "h1")} active={activeFormats.has("h1")} />
        <ToolbarButton icon={<Heading2 size={iconSize} />} label="Heading 2" onClick={() => onCommand("formatBlock", "h2")} active={activeFormats.has("h2")} />
        <ToolbarButton icon={<Heading3 size={iconSize} />} label="Heading 3" onClick={() => onCommand("formatBlock", "h3")} active={activeFormats.has("h3")} />

        <Separator orientation="vertical" className="h-5 mx-1" />

        <ToolbarButton icon={<Bold size={iconSize} />} label="Bold (Ctrl+B)" onClick={() => onCommand("bold")} active={activeFormats.has("bold")} />
        <ToolbarButton icon={<Italic size={iconSize} />} label="Italic (Ctrl+I)" onClick={() => onCommand("italic")} active={activeFormats.has("italic")} />
        <ToolbarButton icon={<Underline size={iconSize} />} label="Underline (Ctrl+U)" onClick={() => onCommand("underline")} active={activeFormats.has("underline")} />
        <ToolbarButton icon={<Strikethrough size={iconSize} />} label="Strikethrough" onClick={() => onCommand("strikeThrough")} active={activeFormats.has("strikeThrough")} />

        <Separator orientation="vertical" className="h-5 mx-1" />

        <ToolbarButton icon={<AlignLeft size={iconSize} />} label="Align Left" onClick={() => onCommand("justifyLeft")} />
        <ToolbarButton icon={<AlignCenter size={iconSize} />} label="Align Center" onClick={() => onCommand("justifyCenter")} />
        <ToolbarButton icon={<AlignRight size={iconSize} />} label="Align Right" onClick={() => onCommand("justifyRight")} />

        <Separator orientation="vertical" className="h-5 mx-1" />

        <ToolbarButton icon={<List size={iconSize} />} label="Bullet List" onClick={() => onCommand("insertUnorderedList")} active={activeFormats.has("insertUnorderedList")} />
        <ToolbarButton icon={<ListOrdered size={iconSize} />} label="Numbered List" onClick={() => onCommand("insertOrderedList")} active={activeFormats.has("insertOrderedList")} />
        <ToolbarButton icon={<Quote size={iconSize} />} label="Blockquote" onClick={() => onCommand("formatBlock", "blockquote")} active={activeFormats.has("blockquote")} />
        <ToolbarButton icon={<Minus size={iconSize} />} label="Horizontal Rule" onClick={() => onCommand("insertHorizontalRule")} />

        <Separator orientation="vertical" className="h-5 mx-1" />

        <ToolbarButton icon={<Link size={iconSize} />} label="Insert Link" onClick={handleLink} />
        <ToolbarButton icon={<Image size={iconSize} />} label="Insert Image" onClick={() => setShowImageDialog(!showImageDialog)} />
        <div className="relative">
          <ToolbarButton icon={<Table size={iconSize} />} label="Insert Table" onClick={() => setShowTablePicker(!showTablePicker)} />
          {showTablePicker && (
            <TablePicker onInsert={onInsertTable} onClose={() => setShowTablePicker(false)} />
          )}
        </div>
        <ToolbarButton icon={<RemoveFormatting size={iconSize} />} label="Clear Formatting" onClick={() => onCommand("removeFormat")} />

        <Separator orientation="vertical" className="h-5 mx-1" />

        <ToolbarButton
          icon={<Code size={iconSize} />}
          label={isSourceMode ? "Visual Editor" : "HTML Source"}
          onClick={onToggleSource}
          active={isSourceMode}
        />
      </div>

      {showLinkInput && (
        <div className="flex items-center gap-2 px-3 py-2 border-t border-border bg-toolbar">
          <input
            type="url"
            placeholder="https://example.com"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLink()}
            className="flex-1 px-2 py-1 text-sm border border-border rounded bg-editor-surface text-foreground outline-none focus:ring-1 focus:ring-ring"
            autoFocus
          />
          <button
            onClick={handleLink}
            className="px-3 py-1 text-sm rounded bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Insert
          </button>
          <button
            onClick={() => { setShowLinkInput(false); setLinkUrl(""); }}
            className="px-3 py-1 text-sm rounded text-muted-foreground hover:bg-toolbar-hover transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {showImageDialog && (
        <ImageDialog onInsert={onInsertImage} onClose={() => setShowImageDialog(false)} />
      )}
    </div>
  );
};

export default EditorToolbar;
