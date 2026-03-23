# Compose Rich Editor

A feature-rich, embeddable React rich text editor — similar to TinyMCE but built as a modern React component.

## Installation

Install from GitHub:

```bash
npm install github:YOUR_USERNAME/YOUR_REPO_NAME
```

Or after publishing to npm:

```bash
npm install compose-rich-editor
```

## Requirements

- React 18+ (peer dependency)
- Tailwind CSS 3+ in your project (the editor uses Tailwind classes)

## Setup

### 1. Add CSS variables to your project

Add these CSS variables to your global CSS (e.g. `index.css`). The editor uses these for theming:

```css
:root {
  --background: 40 20% 98%;
  --foreground: 220 20% 10%;
  --popover: 0 0% 100%;
  --popover-foreground: 220 20% 10%;
  --primary: 220 65% 48%;
  --primary-foreground: 0 0% 100%;
  --muted: 220 14% 96%;
  --muted-foreground: 220 10% 46%;
  --accent: 220 14% 92%;
  --accent-foreground: 220 20% 10%;
  --destructive: 0 72% 51%;
  --destructive-foreground: 0 0% 100%;
  --border: 220 13% 90%;
  --input: 220 13% 90%;
  --ring: 220 65% 48%;
  --radius: 0.375rem;

  /* Editor-specific tokens */
  --toolbar: 220 14% 97%;
  --toolbar-foreground: 220 20% 25%;
  --toolbar-active: 220 65% 48%;
  --toolbar-active-foreground: 0 0% 100%;
  --toolbar-hover: 220 14% 92%;
  --editor-surface: 0 0% 100%;
  --editor-gutter: 220 14% 96%;
  --syntax-tag: 220 70% 45%;
  --syntax-attr: 30 70% 40%;
  --syntax-string: 150 60% 35%;
  --syntax-comment: 220 10% 55%;
  --syntax-entity: 340 65% 45%;
}

/* Dark mode */
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --popover: 222.2 84% 4.9%;
  --popover-foreground: 210 40% 98%;
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 47.4% 11.2%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 212.7 26.8% 83.9%;
  --toolbar: 220 20% 14%;
  --toolbar-foreground: 220 10% 80%;
  --toolbar-active: 220 60% 55%;
  --toolbar-active-foreground: 0 0% 100%;
  --toolbar-hover: 220 20% 20%;
  --editor-surface: 222 20% 8%;
  --editor-gutter: 222 20% 10%;
  --syntax-tag: 210 60% 60%;
  --syntax-attr: 35 60% 60%;
  --syntax-string: 150 50% 55%;
  --syntax-comment: 220 10% 50%;
  --syntax-entity: 340 55% 60%;
}
```

### 2. Add Tailwind colors to your `tailwind.config`

```ts
// tailwind.config.ts
colors: {
  border: "hsl(var(--border))",
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
  primary: {
    DEFAULT: "hsl(var(--primary))",
    foreground: "hsl(var(--primary-foreground))",
  },
  muted: {
    DEFAULT: "hsl(var(--muted))",
    foreground: "hsl(var(--muted-foreground))",
  },
  accent: {
    DEFAULT: "hsl(var(--accent))",
    foreground: "hsl(var(--accent-foreground))",
  },
  popover: {
    DEFAULT: "hsl(var(--popover))",
    foreground: "hsl(var(--popover-foreground))",
  },
  destructive: {
    DEFAULT: "hsl(var(--destructive))",
    foreground: "hsl(var(--destructive-foreground))",
  },
  toolbar: {
    DEFAULT: "hsl(var(--toolbar))",
    foreground: "hsl(var(--toolbar-foreground))",
    active: "hsl(var(--toolbar-active))",
    "active-foreground": "hsl(var(--toolbar-active-foreground))",
    hover: "hsl(var(--toolbar-hover))",
  },
  editor: {
    surface: "hsl(var(--editor-surface))",
    gutter: "hsl(var(--editor-gutter))",
  },
}
```

### 3. Add editor content styles

Add these styles to your CSS for proper content rendering:

```css
.editor-content {
  font-family: system-ui, sans-serif;
  line-height: 1.7;
}
.editor-content h1 { font-size: 2.25rem; font-weight: 700; margin-bottom: 0.75rem; }
.editor-content h2 { font-size: 1.75rem; font-weight: 600; margin-bottom: 0.5rem; }
.editor-content h3 { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem; }
.editor-content blockquote {
  border-left: 3px solid hsl(var(--primary));
  padding-left: 1rem;
  color: hsl(var(--muted-foreground));
  font-style: italic;
}
.editor-content table { width: 100%; border-collapse: collapse; }
.editor-content th, .editor-content td {
  border: 1px solid hsl(var(--border));
  padding: 0.5rem 0.75rem;
}
.editor-content a { color: hsl(var(--primary)); text-decoration: underline; }
.editor-content img { max-width: 100%; }
.editor-content ul { list-style-type: disc; padding-left: 1.5rem; }
.editor-content ol { list-style-type: decimal; padding-left: 1.5rem; }
```

## Usage

```tsx
import { RichTextEditor } from "compose-rich-editor";

function App() {
  return (
    <div style={{ height: "500px" }}>
      <RichTextEditor
        initialContent="<p>Hello World</p>"
        onChange={(html) => console.log(html)}
      />
    </div>
  );
}
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `initialContent` | `string` | Initial HTML content |
| `onChange` | `(html: string) => void` | Called when content changes |

## Features

- **Rich formatting** — Bold, italic, underline, strikethrough
- **Headings** — H1, H2, H3
- **Lists** — Ordered and unordered with variants
- **Tables** — Insert, resize, merge/split cells, row/column/cell properties
- **Images** — Insert with dimensions, alt text, title
- **Links** — Insert with URL validation, target, title
- **Colors** — Text color and cell background with color picker
- **Font** — Family and size selection
- **Source editing** — Full HTML source view with syntax highlighting
- **Fullscreen** — Toggle fullscreen editing mode
- **Dark mode** — Built-in light/dark toggle
- **Undo/Redo** — Custom history stack
- **Word/character count** — Status bar

## License

MIT
