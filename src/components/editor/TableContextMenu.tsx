import { useState } from "react";
import { Link, Trash2, Grid3X3, TableProperties, Rows3, Columns3, MergeIcon, SplitSquareHorizontal } from "lucide-react";

interface Position {
  x: number;
  y: number;
}

interface TableContextMenuProps {
  position: Position;
  onClose: () => void;
  onAction: (action: string) => void;
  canMerge?: boolean;
  canSplit?: boolean;
}

const MenuItem = ({ label, icon, onClick, disabled, hasSubmenu }: { label: string; icon?: React.ReactNode; onClick?: () => void; disabled?: boolean; hasSubmenu?: boolean }) => (
  <button
    className={`flex items-center gap-2 w-full px-3 py-1.5 text-sm text-left transition-colors ${
      disabled ? "text-muted-foreground/50 cursor-not-allowed" : "text-foreground hover:bg-accent"
    }`}
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
  >
    <span className="w-4 h-4 flex items-center justify-center">{icon}</span>
    <span className="flex-1">{label}</span>
    {hasSubmenu && <span className="text-muted-foreground">›</span>}
  </button>
);

const SubMenu = ({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <MenuItem label={label} icon={icon} hasSubmenu onClick={() => setOpen(!open)} />
      {open && (
        <div className="absolute left-full top-0 ml-0.5 min-w-[180px] bg-popover border border-border rounded-md shadow-lg z-[60] py-1">
          {children}
        </div>
      )}
    </div>
  );
};

const Divider = () => <div className="h-px bg-border my-1" />;

const TableContextMenu = ({ position, onClose, onAction, canMerge, canSplit }: TableContextMenuProps) => {
  const handle = (action: string) => {
    onAction(action);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-[49]" onClick={onClose} onContextMenu={(e) => { e.preventDefault(); onClose(); }} />
      <div
        className="fixed z-50 min-w-[180px] bg-popover border border-border rounded-md shadow-lg py-1"
        style={{ left: position.x, top: position.y }}
      >
        <MenuItem label="Link..." icon={<Link size={14} />} onClick={() => handle("link")} />
        <Divider />
        <SubMenu label="Cell" icon={<Grid3X3 size={14} />}>
          <MenuItem label="Cell properties" icon={<TableProperties size={14} />} onClick={() => handle("cellProperties")} />
          <MenuItem label="Merge cells" icon={<MergeIcon size={14} />} onClick={() => handle("mergeCells")} disabled={!canMerge} />
          <MenuItem label="Split cell" icon={<SplitSquareHorizontal size={14} />} onClick={() => handle("splitCell")} disabled={!canSplit} />
        </SubMenu>
        <SubMenu label="Row" icon={<Rows3 size={14} />}>
          <MenuItem label="Insert row before" onClick={() => handle("insertRowBefore")} />
          <MenuItem label="Insert row after" onClick={() => handle("insertRowAfter")} />
          <MenuItem label="Delete row" onClick={() => handle("deleteRow")} />
          <Divider />
          <MenuItem label="Row properties" icon={<TableProperties size={14} />} onClick={() => handle("rowProperties")} />
        </SubMenu>
        <SubMenu label="Column" icon={<Columns3 size={14} />}>
          <MenuItem label="Insert column before" onClick={() => handle("insertColumnBefore")} />
          <MenuItem label="Insert column after" onClick={() => handle("insertColumnAfter")} />
          <MenuItem label="Delete column" onClick={() => handle("deleteColumn")} />
          <Divider />
          <MenuItem label="Column properties" icon={<TableProperties size={14} />} onClick={() => handle("columnProperties")} />
        </SubMenu>
        <Divider />
        <MenuItem label="Table properties" icon={<TableProperties size={14} />} onClick={() => handle("tableProperties")} />
        <MenuItem label="Delete table" icon={<Trash2 size={14} />} onClick={() => handle("deleteTable")} />
      </div>
    </>
  );
};

export default TableContextMenu;
