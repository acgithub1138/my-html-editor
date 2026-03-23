import RichTextEditor from "@/components/editor/RichTextEditor";
import { FileText } from "lucide-react";

const Index = () => {
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 px-6 py-3 border-b border-border bg-toolbar">
        <div className="flex items-center gap-2 text-primary">
          <FileText size={22} strokeWidth={2.5} />
          <h1 className="text-lg font-semibold tracking-tight" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
            Compose
          </h1>
        </div>
        <span className="text-xs text-muted-foreground ml-2">Rich Text Editor</span>
      </header>

      {/* Editor */}
      <main className="flex-1 p-4 md:p-8 overflow-hidden">
        <div className="max-w-4xl mx-auto h-full">
          <RichTextEditor
            initialContent="<h1>Welcome to Compose</h1><p>A beautiful rich text editor built for creators. Start typing to create something amazing.</p><h2>Features</h2><ul><li><strong>Rich formatting</strong> — bold, italic, underline, and more</li><li><strong>Headings</strong> — three levels of hierarchy</li><li><strong>Lists</strong> — ordered and unordered</li><li><strong>Code blocks</strong> — for technical content</li><li><strong>Links &amp; images</strong> — embed media easily</li></ul><blockquote>The best writing tool is the one that gets out of your way.</blockquote><p>Try selecting text and using the toolbar above, or use keyboard shortcuts like <code>Ctrl+B</code> for bold.</p>"
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
