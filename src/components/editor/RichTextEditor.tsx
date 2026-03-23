import { useRef, useState, useCallback } from "react";
import { TooltipProvider } from "../ui/tooltip";
import EditorToolbar from "./EditorToolbar";
import EditorArea, { EditorAreaHandle } from "./EditorArea";
import StatusBar from "./StatusBar";

export interface RichTextEditorProps {
  initialContent?: string;
  onChange?: (html: string) => void;
}

const RichTextEditor = ({ initialContent, onChange }: RichTextEditorProps) => {
  const editorRef = useRef<EditorAreaHandle>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const updateCounts = useCallback((html: string) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    const text = div.textContent || "";
    setCharCount(text.length);
    setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
  }, []);

  const handleCommand = useCallback((command: string, value?: string) => {
    editorRef.current?.execCommand(command, value);
    setTimeout(() => {
      const formats = editorRef.current?.getActiveFormats() || new Set();
      setActiveFormats(formats);
    }, 10);
  }, []);

  const handleSelectionChange = useCallback(() => {
    const formats = editorRef.current?.getActiveFormats() || new Set();
    setActiveFormats(formats);
  }, []);

  const handleChange = useCallback((html: string) => {
    updateCounts(html);
    onChange?.(html);
  }, [onChange, updateCounts]);

  const handleToggleSource = useCallback(() => {
    editorRef.current?.toggleSource();
  }, []);

  const handleInsertTable = useCallback((rows: number, cols: number) => {
    editorRef.current?.insertTable(rows, cols);
  }, []);

  const handleInsertImage = useCallback((url: string, width: string, height: string, alt?: string, title?: string) => {
    editorRef.current?.insertImageWithSize(url, width, height, alt, title);
  }, []);

  const handleSaveSelection = useCallback(() => {
    editorRef.current?.saveSelection();
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  const handleToggleDark = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`flex flex-col border border-border rounded-lg overflow-hidden shadow-sm bg-editor-surface ${
        isFullscreen ? "fixed inset-0 z-[100] rounded-none" : "h-full"
      } ${isDark ? "dark" : ""}`}
    >
      <EditorToolbar
        onCommand={handleCommand}
        activeFormats={activeFormats}
        isSourceMode={isSourceMode}
        onToggleSource={handleToggleSource}
        onInsertTable={handleInsertTable}
        onInsertImage={handleInsertImage}
        onSaveSelection={handleSaveSelection}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        isDark={isDark}
        onToggleDark={handleToggleDark}
      />
      <EditorArea
        ref={editorRef}
        onChange={handleChange}
        onSelectionChange={handleSelectionChange}
        initialContent={initialContent}
        onSourceModeChange={setIsSourceMode}
      />
      <StatusBar wordCount={wordCount} charCount={charCount} isSourceMode={isSourceMode} />
    </div>
  );
};

export default RichTextEditor;
