import { useState } from "react";

interface TableProps {
  width: string;
  height: string;
  cellSpacing: string;
  cellPadding: string;
  borderWidth: string;
  alignment: string;
  borderStyle: string;
  borderColor: string;
  backgroundColor: string;
}

interface TablePropertiesDialogProps {
  initial: TableProps;
  onSave: (props: TableProps) => void;
  onClose: () => void;
}

const inputClass = "w-full px-2 py-1.5 text-sm border border-border rounded bg-editor-surface text-foreground outline-none focus:ring-1 focus:ring-ring";
const selectClass = "w-full px-2 py-1.5 text-sm border border-border rounded bg-editor-surface text-foreground outline-none focus:ring-1 focus:ring-ring";
const colorInputClass = "w-8 h-8 border border-border rounded cursor-pointer bg-editor-surface";

const TabButton = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1 text-sm font-medium rounded-t transition-colors ${
      active ? "border border-b-0 border-primary text-primary bg-popover" : "text-muted-foreground hover:text-foreground"
    }`}
  >
    {label}
  </button>
);

const TablePropertiesDialog = ({ initial, onSave, onClose }: TablePropertiesDialogProps) => {
  const [props, setProps] = useState<TableProps>(initial);
  const [tab, setTab] = useState<"general" | "advanced">("general");

  return (
    <DialogShell title="Table Properties" onClose={onClose}>
      <div className="flex gap-1 mb-3">
        <TabButton label="General" active={tab === "general"} onClick={() => setTab("general")} />
        <TabButton label="Advanced" active={tab === "advanced"} onClick={() => setTab("advanced")} />
      </div>
      {tab === "general" ? (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Width">
            <input className={inputClass} value={props.width} onChange={(e) => setProps({ ...props, width: e.target.value })} />
          </Field>
          <Field label="Height">
            <input className={inputClass} value={props.height} onChange={(e) => setProps({ ...props, height: e.target.value })} />
          </Field>
          <Field label="Cell spacing">
            <input className={inputClass} value={props.cellSpacing} onChange={(e) => setProps({ ...props, cellSpacing: e.target.value })} />
          </Field>
          <Field label="Cell padding">
            <input className={inputClass} value={props.cellPadding} onChange={(e) => setProps({ ...props, cellPadding: e.target.value })} />
          </Field>
          <Field label="Border width">
            <input className={inputClass} value={props.borderWidth} onChange={(e) => setProps({ ...props, borderWidth: e.target.value })} />
          </Field>
          <Field label="Alignment">
            <select className={selectClass} value={props.alignment} onChange={(e) => setProps({ ...props, alignment: e.target.value })}>
              <option value="">None</option>
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </Field>
        </div>
      ) : (
        <div className="space-y-3">
          <Field label="Border style">
            <select className={selectClass} value={props.borderStyle} onChange={(e) => setProps({ ...props, borderStyle: e.target.value })}>
              <option value="">Select...</option>
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
              <option value="double">Double</option>
              <option value="groove">Groove</option>
              <option value="ridge">Ridge</option>
              <option value="inset">Inset</option>
              <option value="outset">Outset</option>
              <option value="none">None</option>
              <option value="hidden">Hidden</option>
            </select>
          </Field>
          <Field label="Border color">
            <div className="flex items-center gap-2">
              <input type="color" className={colorInputClass} value={props.borderColor || "#000000"} onChange={(e) => setProps({ ...props, borderColor: e.target.value })} />
              <input className={inputClass} value={props.borderColor} onChange={(e) => setProps({ ...props, borderColor: e.target.value })} placeholder="#000000" />
            </div>
          </Field>
          <Field label="Background color">
            <div className="flex items-center gap-2">
              <input type="color" className={colorInputClass} value={props.backgroundColor || "#ffffff"} onChange={(e) => setProps({ ...props, backgroundColor: e.target.value })} />
              <input className={inputClass} value={props.backgroundColor} onChange={(e) => setProps({ ...props, backgroundColor: e.target.value })} placeholder="#ffffff" />
            </div>
          </Field>
        </div>
      )}
      <DialogButtons onSave={() => onSave(props)} onClose={onClose} />
    </DialogShell>
  );
};

// Cell Properties
interface CellProps {
  width: string;
  height: string;
  hAlign: string;
  vAlign: string;
}

interface CellPropertiesDialogProps {
  initial: CellProps;
  onSave: (props: CellProps) => void;
  onClose: () => void;
}

export const CellPropertiesDialog = ({ initial, onSave, onClose }: CellPropertiesDialogProps) => {
  const [props, setProps] = useState<CellProps>(initial);

  return (
    <DialogShell title="Cell Properties" onClose={onClose}>
      <div className="space-y-3">
        <Field label="Width">
          <input className={inputClass} value={props.width} onChange={(e) => setProps({ ...props, width: e.target.value })} />
        </Field>
        <Field label="Height">
          <input className={inputClass} value={props.height} onChange={(e) => setProps({ ...props, height: e.target.value })} />
        </Field>
        <Field label="Horizontal align">
          <select className={selectClass} value={props.hAlign} onChange={(e) => setProps({ ...props, hAlign: e.target.value })}>
            <option value="">None</option>
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </Field>
        <Field label="Vertical align">
          <select className={selectClass} value={props.vAlign} onChange={(e) => setProps({ ...props, vAlign: e.target.value })}>
            <option value="">None</option>
            <option value="top">Top</option>
            <option value="middle">Middle</option>
            <option value="bottom">Bottom</option>
          </select>
        </Field>
      </div>
      <DialogButtons onSave={() => onSave(props)} onClose={onClose} />
    </DialogShell>
  );
};

// Row Properties
interface RowProps {
  rowType: string;
  alignment: string;
  height: string;
}

interface RowPropertiesDialogProps {
  initial: RowProps;
  onSave: (props: RowProps) => void;
  onClose: () => void;
}

export const RowPropertiesDialog = ({ initial, onSave, onClose }: RowPropertiesDialogProps) => {
  const [props, setProps] = useState<RowProps>(initial);

  return (
    <DialogShell title="Row Properties" onClose={onClose}>
      <div className="space-y-3">
        <Field label="Row type">
          <select className={selectClass} value={props.rowType} onChange={(e) => setProps({ ...props, rowType: e.target.value })}>
            <option value="body">Body</option>
            <option value="header">Header</option>
            <option value="footer">Footer</option>
          </select>
        </Field>
        <Field label="Alignment">
          <select className={selectClass} value={props.alignment} onChange={(e) => setProps({ ...props, alignment: e.target.value })}>
            <option value="">None</option>
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </Field>
        <Field label="Height">
          <input className={inputClass} value={props.height} onChange={(e) => setProps({ ...props, height: e.target.value })} />
        </Field>
      </div>
      <DialogButtons onSave={() => onSave(props)} onClose={onClose} />
    </DialogShell>
  );
};

// Shared UI pieces
const DialogShell = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
  <>
    <div className="fixed inset-0 bg-black/30 z-[70]" onClick={onClose} />
    <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[71] bg-popover border border-border rounded-lg shadow-xl w-[400px] max-w-[90vw]">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg leading-none">×</button>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  </>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
    {children}
  </div>
);

const DialogButtons = ({ onSave, onClose }: { onSave: () => void; onClose: () => void }) => (
  <div className="flex justify-end gap-2 mt-4">
    <button onClick={onClose} className="px-4 py-1.5 text-sm rounded border border-border text-foreground hover:bg-accent transition-colors">Cancel</button>
    <button onClick={onSave} className="px-4 py-1.5 text-sm rounded bg-primary text-primary-foreground hover:opacity-90 transition-opacity">Save</button>
  </div>
);

// Image Properties
interface ImageProps {
  src: string;
  alt: string;
  title: string;
  width: string;
  height: string;
}

export const ImagePropertiesDialog = ({ initial, onSave, onClose }: { initial: ImageProps; onSave: (props: ImageProps) => void; onClose: () => void }) => {
  const [props, setProps] = useState<ImageProps>(initial);

  return (
    <DialogShell title="Image Properties" onClose={onClose}>
      <div className="space-y-3">
        <Field label="Source">
          <input className={inputClass} value={props.src} onChange={(e) => setProps({ ...props, src: e.target.value })} />
        </Field>
        <Field label="Alternative description">
          <input className={inputClass} value={props.alt} onChange={(e) => setProps({ ...props, alt: e.target.value })} />
        </Field>
        <Field label="Image title">
          <input className={inputClass} value={props.title} onChange={(e) => setProps({ ...props, title: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Width">
            <input className={inputClass} value={props.width} onChange={(e) => setProps({ ...props, width: e.target.value })} placeholder="e.g. 300px or 50%" />
          </Field>
          <Field label="Height">
            <input className={inputClass} value={props.height} onChange={(e) => setProps({ ...props, height: e.target.value })} placeholder="e.g. 200px or auto" />
          </Field>
        </div>
      </div>
      <DialogButtons onSave={() => onSave(props)} onClose={onClose} />
    </DialogShell>
  );
};

export default TablePropertiesDialog;
