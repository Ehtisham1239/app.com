"use client";

import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TableKit } from "@tiptap/extension-table";
import {
  Bold, Columns3, Heading2, Heading3, Italic, Link2, List, ListOrdered,
  Quote, Redo2, Rows3, Table, Trash2, Undo2, Unlink
} from "lucide-react";
import { clsx } from "clsx";

// Rich text editor for page, post and course bodies (stored as HTML, sanitised before display).
// TableKit keeps real table structure in the saved HTML instead of flattening cells into paragraphs.
export function RichText({ value, onChange, placeholder }) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true }
      }),
      TableKit.configure({
        table: { resizable: true, cellMinWidth: 120 }
      })
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "rich-content min-h-[14rem] px-4 py-3 text-[0.97rem] leading-relaxed",
        "aria-label": placeholder || "Content"
      }
    },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  });

  // keep in sync when the record loads after the editor
  useEffect(() => {
    if (editor && value !== undefined && value !== editor.getHTML() && !editor.isFocused) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) return <div className="adm-input h-56 animate-pulse bg-leaf-50" />;
  const btn = (active, onClick, Icon, label) => (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      aria-label={label}
      title={label}
      className={clsx("rounded-md p-1.5 transition-colors", active ? "bg-mushaf-900 text-white" : "text-ink-soft hover:bg-leaf-50 hover:text-ink")}
    >
      <Icon className="size-4" />
    </button>
  );
  const setLink = () => {
    const prev = editor.getAttributes("link").href || "";
    const url = window.prompt("Link address (https://… or /page)", prev);
    if (url === null) return;
    if (!url) editor.chain().focus().unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };
  return (
    <div className="overflow-hidden rounded-xl border-[1.5px] border-line-strong bg-white focus-within:border-leaf-600">
      <div className="flex flex-wrap gap-0.5 border-b border-line bg-paper px-2 py-1.5">
        {btn(editor.isActive("heading", { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), Heading2, "Heading")}
        {btn(editor.isActive("heading", { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), Heading3, "Sub-heading")}
        {btn(editor.isActive("bold"), () => editor.chain().focus().toggleBold().run(), Bold, "Bold")}
        {btn(editor.isActive("italic"), () => editor.chain().focus().toggleItalic().run(), Italic, "Italic")}
        {btn(editor.isActive("bulletList"), () => editor.chain().focus().toggleBulletList().run(), List, "Bulleted list")}
        {btn(editor.isActive("orderedList"), () => editor.chain().focus().toggleOrderedList().run(), ListOrdered, "Numbered list")}
        {btn(editor.isActive("blockquote"), () => editor.chain().focus().toggleBlockquote().run(), Quote, "Quote")}
        {btn(editor.isActive("link"), setLink, Link2, "Add link")}
        {editor.isActive("link") && btn(false, () => editor.chain().focus().unsetLink().run(), Unlink, "Remove link")}
        <span className="mx-1 w-px bg-line" />
        {btn(editor.isActive("table"), () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(), Table, "Insert 3 × 3 table")}
        {editor.isActive("table") && (
          <>
            {btn(false, () => editor.chain().focus().addRowAfter().run(), Rows3, "Add row below")}
            {btn(false, () => editor.chain().focus().addColumnAfter().run(), Columns3, "Add column after")}
            {btn(false, () => editor.chain().focus().deleteTable().run(), Trash2, "Delete table")}
          </>
        )}
        <span className="mx-1 w-px bg-line" />
        {btn(false, () => editor.chain().focus().undo().run(), Undo2, "Undo")}
        {btn(false, () => editor.chain().focus().redo().run(), Redo2, "Redo")}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
