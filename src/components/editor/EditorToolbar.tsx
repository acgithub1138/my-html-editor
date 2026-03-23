import {
  Bold, Italic, Underline, Strikethrough, List, ListOrdered,
  Quote, Code, Heading1, Heading2, Heading3, Link, Image,
  Undo2, Redo2, Minus, AlignLeft, AlignCenter, AlignRight,
  RemoveFormatting, Type
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
}

const EditorToolbar = ({ onCommand, activeFormats }: EditorToolbarProps) => {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

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

  const handleImageInsert = useCallback(() => {
    const url = prompt("Enter image URL:");
    if (url) {
      onCommand("insertImage", url);
    }
  }, [onCommand]);

  const iconSize = 16;

  return (
    <div className="bg-toolbar border-b border-border">
      <div className="flex items-center gap-0.5 px-2 py-1.5 flex-wrap">
        <ToolbarButton icon={<Undo2 size={iconSize} />} label="Undo (Ctrl+Z)" onClick={() => onCommand("undo")} />
        <ToolbarButton icon={<Redo2 size={iconSize} />} label="Redo (Ctrl+Y)" onClick={() => onCommand("redo")} />

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
        <ToolbarButton icon={<Code size={iconSize} />} label="Inline Code" onClick={() => onCommand("code")} />

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
        <ToolbarButton icon={<Image size={iconSize} />} label="Insert Image" onClick={handleImageInsert} />
        <ToolbarButton icon={<RemoveFormatting size={iconSize} />} label="Clear Formatting" onClick={() => onCommand("removeFormat")} />
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
    </div>
  );
};

export default EditorToolbar;
