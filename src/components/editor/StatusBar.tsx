interface StatusBarProps {
  wordCount: number;
  charCount: number;
}

const StatusBar = ({ wordCount, charCount }: StatusBarProps) => (
  <div className="flex items-center justify-between px-4 py-1.5 bg-toolbar border-t border-border text-xs text-muted-foreground font-mono">
    <div className="flex gap-4">
      <span>{wordCount} words</span>
      <span>{charCount} characters</span>
    </div>
    <span>HTML</span>
  </div>
);

export default StatusBar;
