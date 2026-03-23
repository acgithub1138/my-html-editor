

## Problem

When clicking the Source button, the textarea shows plain text content (no HTML tags visible) instead of the raw HTML markup with `<h1>`, `<p>`, `<ul>` etc.

## Root Cause Investigation

The `toggleSource` function at line 208-218 reads `editorRef.current?.innerHTML` and passes it through `formatHTML()`. Both functions look correct in isolation. The most likely cause is that `innerHTML` is returning stripped/text-only content at the moment it's called, possibly due to a timing issue or a side effect from recent changes (undo/redo history, image/table selection click handlers).

## Plan

### 1. Add diagnostic logging to `toggleSource`
Add `console.log` of `editorRef.current?.innerHTML` right before `formatHTML` is called, so we can see exactly what the editor returns. This will confirm whether the issue is in `innerHTML` or in `formatHTML`.

### 2. Fix the source value population
Based on the diagnostic, apply one of these fixes:
- **If `innerHTML` is empty/text-only**: The issue is that the editor content is being lost. Add a content-tracking ref (`lastHTMLRef`) that updates on every `handleInput` call, and use it as a fallback in `toggleSource`.
- **If `innerHTML` has tags but `formatHTML` strips them**: Fix the `formatHTML` regex/logic.

### 3. Defensive fallback in `toggleSource`
Add a `lastHTMLRef` that always stores the latest editor HTML on input changes. In `toggleSource`, use `editorRef.current?.innerHTML || lastHTMLRef.current || initialContent` to ensure we always have valid HTML to show.

```text
toggleSource flow:
  sourceMode=false → read innerHTML → formatHTML → setSourceValue → sourceMode=true
  sourceMode=true  → save sourceValue to pendingHTML → sourceMode=false → useEffect restores HTML
```

### File to edit
- `src/components/editor/EditorArea.tsx` — add `lastHTMLRef`, update `handleInput` to track HTML, update `toggleSource` to use fallback

