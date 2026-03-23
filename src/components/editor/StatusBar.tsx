interface StatusBarProps {
  wordCount: number;
  charCount: number;
  isSourceMode?: boolean;
}

const StatusBar = ({ wordCount, charCount, isSourceMode }: StatusBarProps) => (
  <div className="flex items-center justify-between px-4 py-1.5 bg-toolbar border-t border-border text-xs text-muted-foreground font-mono">
    <div className="flex gap-4">
      <span>{wordCount} words</span>
      <span>{charCount} characters</span>
    </div>
    <span className={isSourceMode ? "text-toolbar-active font-semibold" : ""}>
      {isSourceMode ? "⟨/⟩ HTML Source" : "Visual"}
    </span>
  </div>
);

export default StatusBar;
