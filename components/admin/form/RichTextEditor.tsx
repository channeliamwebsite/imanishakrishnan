"use client";

import { useRef, useState } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import {
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Images,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Underline,
  Undo2,
} from "lucide-react";
import type { MediaAsset } from "@/types/content";
import { cn } from "@/lib/cn";
import { ACCEPT_ATTRIBUTE, uploadImage } from "@/lib/cms/media";
import { useAdminAuth } from "../AdminAuth";
import { Notice } from "../ui";
import { MediaPicker } from "./ImageField";

/**
 * Article body editor (TipTap). Produces HTML limited to the formats on the toolbar; the public
 * article page sanitises it again before rendering (lib/content/html.ts).
 */

function ToolButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()} // keep the editor selection
      onClick={onClick}
      className={cn(
        "grid size-8 place-items-center rounded text-foreground/80 hover:bg-foreground/5 disabled:opacity-40",
        active && "bg-burgundy/10 text-burgundy",
      )}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor, onImage, onLibrary, uploading }: { editor: Editor; onImage: () => void; onLibrary: () => void; uploading: boolean }) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      link: e.isActive("link"),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  function setLink() {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link address (https://…, /page or mailto:…). Leave empty to remove the link.", previous ?? "https://");
    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    if (!/^(https?:\/\/|\/|mailto:)/i.test(url.trim())) {
      window.alert("Links must start with https://, / or mailto:");
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-background/60 px-2 py-1">
      <ToolButton label="Heading" active={s.h2} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        <Heading2 className="size-4" />
      </ToolButton>
      <ToolButton label="Subheading" active={s.h3} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        <Heading3 className="size-4" />
      </ToolButton>
      <span className="mx-1 h-5 w-px bg-border" />
      <ToolButton label="Bold" active={s.bold} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold className="size-4" />
      </ToolButton>
      <ToolButton label="Italic" active={s.italic} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic className="size-4" />
      </ToolButton>
      <ToolButton label="Underline" active={s.underline} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <Underline className="size-4" />
      </ToolButton>
      <ToolButton label="Link" active={s.link} onClick={setLink}>
        <Link2 className="size-4" />
      </ToolButton>
      <span className="mx-1 h-5 w-px bg-border" />
      <ToolButton label="Bulleted list" active={s.bullet} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List className="size-4" />
      </ToolButton>
      <ToolButton label="Numbered list" active={s.ordered} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered className="size-4" />
      </ToolButton>
      <ToolButton label="Quote" active={s.quote} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote className="size-4" />
      </ToolButton>
      <ToolButton label="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <Minus className="size-4" />
      </ToolButton>
      <span className="mx-1 h-5 w-px bg-border" />
      <ToolButton label={uploading ? "Uploading image…" : "Upload image"} disabled={uploading} onClick={onImage}>
        <ImagePlus className="size-4" />
      </ToolButton>
      <ToolButton label="Image from library" onClick={onLibrary}>
        <Images className="size-4" />
      </ToolButton>
      <span className="mx-1 h-5 w-px bg-border" />
      <ToolButton label="Undo" disabled={!s.canUndo} onClick={() => editor.chain().focus().undo().run()}>
        <Undo2 className="size-4" />
      </ToolButton>
      <ToolButton label="Redo" disabled={!s.canRedo} onClick={() => editor.chain().focus().redo().run()}>
        <Redo2 className="size-4" />
      </ToolButton>
    </div>
  );
}

export function RichTextEditor({
  label,
  value,
  onChange,
  folder,
  error,
}: {
  label: string;
  value: string;
  onChange: (html: string) => void;
  folder: string;
  error?: string;
}) {
  const { getIdToken, identity } = useAdminAuth();
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        link: { openOnClick: false, autolink: true, protocols: ["mailto"], HTMLAttributes: { rel: "noopener noreferrer" } },
      }),
      Image.configure({ inline: false }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "prose-editorial type-body min-h-[18rem] px-4 py-3 text-foreground focus:outline-none",
        "aria-label": label,
      },
    },
    onUpdate: ({ editor: e }) => onChange(e.isEmpty ? "" : e.getHTML()),
  });

  function insertImage(asset: MediaAsset) {
    const alt = window.prompt("Describe the image (alt text):", asset.alt ?? "") ?? "";
    editor?.chain().focus().setImage({ src: asset.url, alt: alt.trim() }).run();
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      insertImage(await uploadImage(file, { folder, idToken: await getIdToken(), by: identity }));
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  return (
    <div className="space-y-1.5">
      <p className="font-sans text-sm font-semibold text-foreground">{label}</p>
      <div className={cn("overflow-hidden rounded-md border bg-white", error ? "border-red-400" : "border-border")}>
        {editor && (
          <Toolbar editor={editor} uploading={uploading} onImage={() => fileInput.current?.click()} onLibrary={() => setPicking(true)} />
        )}
        <EditorContent editor={editor} className="[&_img]:my-4 [&_img]:max-w-full [&_img]:rounded" />
      </div>
      <input ref={fileInput} type="file" accept={ACCEPT_ATTRIBUTE} className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
      {uploadError && <Notice tone="error">{uploadError}</Notice>}
      {error && <p className="font-sans text-xs font-semibold text-red-700">{error}</p>}
      {picking && (
        <MediaPicker
          onClose={() => setPicking(false)}
          onPick={(asset) => {
            setPicking(false);
            insertImage(asset);
          }}
        />
      )}
    </div>
  );
}
