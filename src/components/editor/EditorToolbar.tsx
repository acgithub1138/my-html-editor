import {
  Bold, Italic, Underline, Strikethrough, List, ListOrdered,
  Quote, Code, Link, Image,
  Undo2, Redo2, AlignLeft, AlignCenter, AlignRight,
  RemoveFormatting, Table, Paintbrush, PaintBucket,
  Maximize2, Minimize2, Sun, Moon, ChevronDown
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
  onInsertImage: (url: string, width: string, height: string, alt?: string, title?: string) => void;
  onSaveSelection: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isDark: boolean;
  onToggleDark: () => void;
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

const ImageDialog = ({ onInsert, onClose }: { onInsert: (url: string, w: string, h: string, alt?: string, title?: string) => void; onClose: () => void }) => {
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [title, setTitle] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [lockRatio, setLockRatio] = useState(true);

  const inputClass = "w-full px-2 py-1.5 text-sm border border-border rounded bg-editor-surface text-foreground outline-none focus:ring-1 focus:ring-ring";

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-[70]" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[71] bg-popover border border-border rounded-lg shadow-xl w-[440px] max-w-[90vw]">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h3 className="text-base font-semibold text-foreground">Insert/Edit Image</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg leading-none">×</button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Source</label>
            <input className={inputClass} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." autoFocus />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Alternative description</label>
            <input className={inputClass} value={alt} onChange={(e) => setAlt(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Image title</label>
            <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Width</label>
              <input className={inputClass} value={width} onChange={(e) => setWidth(e.target.value)} placeholder="e.g. 300 or 50%" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Height</label>
              <input className={inputClass} value={height} onChange={(e) => setHeight(e.target.value)} placeholder="e.g. 200 or auto" />
            </div>
            <button
              onClick={() => setLockRatio(!lockRatio)}
              className={`p-1.5 mb-0.5 rounded border transition-colors ${lockRatio ? "border-primary text-primary" : "border-border text-muted-foreground"}`}
              title="Lock aspect ratio"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {lockRatio ? (
                  <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>
                ) : (
                  <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></>
                )}
              </svg>
            </button>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={onClose} className="px-4 py-1.5 text-sm rounded border border-border text-foreground hover:bg-accent transition-colors">Cancel</button>
            <button
              onClick={() => { if (url) { onInsert(url, width, height, alt, title); onClose(); } }}
              className="px-4 py-1.5 text-sm rounded bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const COLORS = [
  "#000000", "#434343", "#666666", "#999999", "#B7B7B7", "#CCCCCC", "#D9D9D9", "#EFEFEF", "#F3F3F3", "#FFFFFF",
  "#980000", "#FF0000", "#FF9900", "#FFFF00", "#00FF00", "#00FFFF", "#4A86E8", "#0000FF", "#9900FF", "#FF00FF",
  "#E6B8AF", "#F4CCCC", "#FCE5CD", "#FFF2CC", "#D9EAD3", "#D0E0E3", "#C9DAF8", "#CFE2F3", "#D9D2E9", "#EAD1DC",
  "#DD7E6B", "#EA9999", "#F9CB9C", "#FFE599", "#B6D7A8", "#A2C4C9", "#A4C2F4", "#9FC5E8", "#B4A7D6", "#D5A6BD",
  "#CC4125", "#E06666", "#F6B26B", "#FFD966", "#93C47D", "#76A5AF", "#6D9EEB", "#6FA8DC", "#8E7CC3", "#C27BA0",
  "#A61C00", "#CC0000", "#E69138", "#F1C232", "#6AA84F", "#45818E", "#3C78D8", "#3D85C6", "#674EA7", "#A64D79",
  "#85200C", "#990000", "#B45F06", "#BF9000", "#38761D", "#134F5C", "#1155CC", "#0B5394", "#351C75", "#741B47",
];

const ColorPickerButton = ({
  icon,
  label,
  onColorSelect,
  onOpen,
}: {
  icon: React.ReactNode;
  label: string;
  onColorSelect: (color: string) => void;
  onOpen: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [customColor, setCustomColor] = useState("#000000");

  return (
    <div className="relative flex items-center">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              onOpen();
              setOpen(!open);
            }}
            className="p-1.5 rounded-l transition-colors text-toolbar-foreground hover:bg-toolbar-hover flex items-center gap-0"
            aria-label={label}
          >
            {icon}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">{label}</TooltipContent>
      </Tooltip>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          onOpen();
          setOpen(!open);
        }}
        className="p-0.5 rounded-r transition-colors text-toolbar-foreground hover:bg-toolbar-hover"
      >
        <ChevronDown size={10} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 p-2 bg-popover border border-border rounded-md shadow-lg z-50 w-[220px]">
          <div className="text-xs text-muted-foreground mb-1.5">{label}</div>
          <div className="grid grid-cols-10 gap-0.5">
            {COLORS.map((color) => (
              <button
                key={color}
                className="w-5 h-5 rounded-sm border border-border/50 hover:scale-125 transition-transform cursor-pointer"
                style={{ backgroundColor: color }}
                onClick={() => {
                  onColorSelect(color);
                  setOpen(false);
                }}
                title={color}
              />
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-border flex items-center gap-2">
            <input
              type="color"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="w-7 h-7 border border-border rounded cursor-pointer bg-transparent p-0"
            />
            <input
              type="text"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="flex-1 px-2 py-1 text-xs border border-border rounded bg-editor-surface text-foreground outline-none"
              placeholder="#000000"
            />
            <button
              onClick={() => {
                onColorSelect(customColor);
                setOpen(false);
              }}
              className="px-2 py-1 text-xs rounded bg-primary text-primary-foreground hover:opacity-90"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Dropdown button with chevron for list type variants
const DropdownButton = ({
  icon,
  label,
  onClick,
  active,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative flex items-center">
      <ToolbarButton icon={icon} label={label} onClick={onClick} active={active} />
      <button
        onMouseDown={(e) => { e.preventDefault(); setOpen(!open); }}
        className="p-0.5 rounded-r transition-colors text-toolbar-foreground hover:bg-toolbar-hover"
      >
        <ChevronDown size={10} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-50 py-1 min-w-[160px]">
          <div onClick={() => setOpen(false)}>{children}</div>
        </div>
      )}
    </div>
  );
};

const EditorToolbar = ({ onCommand, activeFormats, isSourceMode, onToggleSource, onInsertTable, onInsertImage, onSaveSelection, isFullscreen, onToggleFullscreen, isDark, onToggleDark }: EditorToolbarProps) => {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [linkTarget, setLinkTarget] = useState("");
  const [linkUrlError, setLinkUrlError] = useState("");
  const [showTablePicker, setShowTablePicker] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);

  const isValidUrl = (url: string): boolean => {
    if (!url.trim()) return false;
    try {
      // Allow relative URLs starting with / or #
      if (url.startsWith("/") || url.startsWith("#") || url.startsWith("mailto:") || url.startsWith("tel:")) return true;
      new URL(url);
      return true;
    } catch {
      // Try with https:// prefix
      try {
        new URL("https://" + url);
        return true;
      } catch {
        return false;
      }
    }
  };

  const handleLinkOpen = useCallback(() => {
    onSaveSelection();
    const sel = window.getSelection();
    const selectedText = sel && !sel.isCollapsed ? sel.toString() : "";

    // Check if selection is inside an existing link
    let existingUrl = "";
    let existingTitle = "";
    let existingTarget = "";
    if (sel && sel.rangeCount > 0) {
      const node = sel.anchorNode;
      const anchor = (node instanceof HTMLElement ? node : node?.parentElement)?.closest("a") as HTMLAnchorElement | null;
      if (anchor) {
        existingUrl = anchor.href || "";
        existingTitle = anchor.title || "";
        existingTarget = anchor.target || "";
      }
    }

    setLinkUrl(existingUrl);
    setLinkText(selectedText);
    setLinkTitle(existingTitle);
    setLinkTarget(existingTarget);
    setLinkUrlError("");
    setShowLinkDialog(true);
  }, [onSaveSelection]);

  const handleLinkInsert = useCallback(() => {
    if (!linkUrl.trim()) {
      setLinkUrlError("URL is required");
      return;
    }
    if (!isValidUrl(linkUrl)) {
      setLinkUrlError("Please enter a valid URL");
      return;
    }

    // Normalize URL — add https:// if no protocol
    let finalUrl = linkUrl.trim();
    if (!/^(https?:\/\/|mailto:|tel:|\/|#)/.test(finalUrl)) {
      finalUrl = "https://" + finalUrl;
    }

    onCommand("createLink", finalUrl);

    // After creating the link, set title and target on the <a> element
    setTimeout(() => {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const node = sel.anchorNode;
        const anchor = (node instanceof HTMLElement ? node : node?.parentElement)?.closest("a") as HTMLAnchorElement | null;
        if (anchor) {
          if (linkTitle) anchor.title = linkTitle;
          if (linkTarget) anchor.target = linkTarget;
        }
      }
    }, 0);

    setShowLinkDialog(false);
    setLinkUrl("");
    setLinkText("");
    setLinkTitle("");
    setLinkTarget("");
    setLinkUrlError("");
  }, [linkUrl, linkTitle, linkTarget, onCommand]);

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
      {/* Row 1: B I U, undo/redo, font, size, table, text color, cell color, link, clear */}
      <div className="flex items-center gap-0.5 px-2 py-1 flex-wrap">
        <ToolbarButton icon={<Bold size={iconSize} />} label="Bold (Ctrl+B)" onClick={() => onCommand("bold")} active={activeFormats.has("bold")} />
        <ToolbarButton icon={<Italic size={iconSize} />} label="Italic (Ctrl+I)" onClick={() => onCommand("italic")} active={activeFormats.has("italic")} />
        <ToolbarButton icon={<Underline size={iconSize} />} label="Underline (Ctrl+U)" onClick={() => onCommand("underline")} active={activeFormats.has("underline")} />

        <Separator orientation="vertical" className="h-5 mx-1" />

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

        {/* Font Size (includes H1-H3) */}
        <select
          className={selectClass + " w-[72px]"}
          onChange={(e) => {
            const val = e.target.value;
            if (!val) return;
            if (val.startsWith("h")) {
              onCommand("formatBlock", val);
            } else {
              onCommand("fontSize", val);
            }
            e.target.value = "";
          }}
          defaultValue=""
          onMouseDown={() => onSaveSelection()}
        >
          <option value="" disabled>Size</option>
          <optgroup label="Headings">
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
          </optgroup>
          <optgroup label="Font Size">
            {fontSizes.map((s) => (
              <option key={s} value={String(s)}>{s}pt</option>
            ))}
          </optgroup>
        </select>

        <Separator orientation="vertical" className="h-5 mx-1" />

        {/* Table */}
        <div className="relative">
          <ToolbarButton icon={<Table size={iconSize} />} label="Insert Table" onClick={() => setShowTablePicker(!showTablePicker)} />
          {showTablePicker && (
            <TablePicker onInsert={onInsertTable} onClose={() => setShowTablePicker(false)} />
          )}
        </div>

        <Separator orientation="vertical" className="h-5 mx-1" />

        {/* Text Color with dropdown arrow */}
        <ColorPickerButton
          icon={<Paintbrush size={iconSize} />}
          label="Text Color"
          onColorSelect={(color) => onCommand("foreColor", color)}
          onOpen={onSaveSelection}
        />

        {/* Cell Background with dropdown arrow */}
        <ColorPickerButton
          icon={<PaintBucket size={iconSize} />}
          label="Cell Background"
          onColorSelect={(color) => onCommand("cellBgColor", color)}
          onOpen={onSaveSelection}
        />

        <Separator orientation="vertical" className="h-5 mx-1" />

        <ToolbarButton icon={<Link size={iconSize} />} label="Insert Link" onClick={handleLinkOpen} />
        <ToolbarButton icon={<RemoveFormatting size={iconSize} />} label="Clear Formatting" onClick={() => onCommand("removeFormat")} />
      </div>

      {/* Row 2: image, source, alignment, lists, fullscreen, contrast */}
      <div className="flex items-center gap-0.5 px-2 py-1 border-t border-border/50 flex-wrap">
        <ToolbarButton icon={<Image size={iconSize} />} label="Insert Image" onClick={() => setShowImageDialog(!showImageDialog)} />
        <ToolbarButton
          icon={<Code size={iconSize} />}
          label={isSourceMode ? "Visual Editor" : "HTML Source"}
          onClick={onToggleSource}
          active={isSourceMode}
        />

        <Separator orientation="vertical" className="h-5 mx-1" />

        <ToolbarButton icon={<AlignLeft size={iconSize} />} label="Align Left" onClick={() => onCommand("justifyLeft")} />
        <ToolbarButton icon={<AlignCenter size={iconSize} />} label="Align Center" onClick={() => onCommand("justifyCenter")} />
        <ToolbarButton icon={<AlignRight size={iconSize} />} label="Align Right" onClick={() => onCommand("justifyRight")} />

        <Separator orientation="vertical" className="h-5 mx-1" />

        {/* Bullet list with dropdown */}
        <DropdownButton
          icon={<List size={iconSize} />}
          label="Bullet List"
          onClick={() => onCommand("insertUnorderedList")}
          active={activeFormats.has("insertUnorderedList")}
        >
          <button className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-accent" onMouseDown={(e) => { e.preventDefault(); onCommand("insertUnorderedList"); }}>
            <List size={14} /> Bullet list
          </button>
          <button className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-accent" onMouseDown={(e) => { e.preventDefault(); onCommand("formatBlock", "blockquote"); }}>
            <Quote size={14} /> Blockquote
          </button>
        </DropdownButton>

        {/* Ordered list with dropdown */}
        <DropdownButton
          icon={<ListOrdered size={iconSize} />}
          label="Numbered List"
          onClick={() => onCommand("insertOrderedList")}
          active={activeFormats.has("insertOrderedList")}
        >
          <button className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-accent" onMouseDown={(e) => { e.preventDefault(); onCommand("insertOrderedList"); }}>
            <ListOrdered size={14} /> Numbered list
          </button>
        </DropdownButton>

        <Separator orientation="vertical" className="h-5 mx-1" />

        <ToolbarButton icon={isFullscreen ? <Minimize2 size={iconSize} /> : <Maximize2 size={iconSize} />} label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"} onClick={onToggleFullscreen} active={isFullscreen} />
        <ToolbarButton icon={isDark ? <Sun size={iconSize} /> : <Moon size={iconSize} />} label={isDark ? "Light Mode" : "Dark Mode"} onClick={onToggleDark} />
      </div>

      {showLinkDialog && (
        <>
          <div className="fixed inset-0 bg-black/30 z-[70]" onClick={() => setShowLinkDialog(false)} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[71] bg-popover border border-border rounded-lg shadow-xl w-[400px] max-w-[90vw]">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <h3 className="text-base font-semibold text-foreground">Insert Link</h3>
              <button onClick={() => setShowLinkDialog(false)} className="text-muted-foreground hover:text-foreground text-lg leading-none">×</button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">URL</label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLinkInsert()}
                  className="w-full px-2 py-1.5 text-sm border border-border rounded bg-background text-foreground outline-none focus:ring-1 focus:ring-ring"
                  autoFocus
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 px-5 py-3 border-t border-border">
              <button onClick={() => setShowLinkDialog(false)} className="px-4 py-1.5 text-sm rounded border border-border text-foreground hover:bg-accent transition-colors">Cancel</button>
              <button onClick={handleLinkInsert} className="px-4 py-1.5 text-sm rounded bg-primary text-primary-foreground hover:opacity-90 transition-opacity">Insert</button>
            </div>
          </div>
        </>
      )}

      {showImageDialog && (
        <ImageDialog onInsert={onInsertImage} onClose={() => setShowImageDialog(false)} />
      )}
    </div>
  );
};

export default EditorToolbar;
