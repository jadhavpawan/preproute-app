"use client";

import { useEffect, useRef } from "react";
import type { LucideIcon } from "lucide-react";
import { Italic, Bold, Underline, Strikethrough, Link2, ImagePlus } from "lucide-react";

interface RichTextEditorProps {
  value: string; // HTML string
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

function ToolbarButton({
  icon: Icon,
  onClick,
  light,
  title,
}: {
  icon: LucideIcon;
  onClick: () => void;
  light?: boolean;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()} // keep selection/focus inside the editor
      onClick={onClick}
      className={`rounded p-1.5 ${
        light ? "text-text-secondary hover:bg-white" : "text-icon-gray hover:bg-surface-gray"
      }`}
    >
      <Icon className="h-4 w-4" strokeWidth={1.75} />
    </button>
  );
}

export function RichTextEditor({ value, onChange, placeholder, minHeight = "176px" }: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep the DOM in sync when the value changes from outside (e.g. switching
  // to a different question). We avoid clobbering it on every keystroke by
  // only writing when it actually differs from what's on screen.
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== (value || "")) {
      ref.current.innerHTML = value || "";
    }
  }, [value]);

  function exec(command: string, arg?: string) {
    ref.current?.focus();
    document.execCommand(command, false, arg);
    onChange(ref.current?.innerHTML ?? "");
  }

  function handleInsertLink() {
    const url = window.prompt("Link URL (include https://)");
    if (url) exec("createLink", url);
  }

  function handleImageFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      ref.current?.focus();
      document.execCommand("insertImage", false, reader.result as string);
      onChange(ref.current?.innerHTML ?? "");
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="overflow-hidden rounded border border-tint-blue border-hairline">
      <div className="flex h-12 w-full items-center justify-between border-b border-border-light bg-white px-lg">
        <div className="flex items-center gap-1">
          <ToolbarButton icon={Italic} title="Italic" onClick={() => exec("italic")} />
          <ToolbarButton icon={Bold} title="Bold" onClick={() => exec("bold")} />
          <ToolbarButton icon={Underline} title="Underline" onClick={() => exec("underline")} />
          <ToolbarButton icon={Strikethrough} title="Strikethrough" onClick={() => exec("strikeThrough")} />
          <ToolbarButton icon={Link2} title="Insert link" onClick={handleInsertLink} />
        </div>
        <div className="flex items-center gap-1 rounded bg-surface-blue p-1">
          <ToolbarButton
            icon={ImagePlus}
            title="Insert image"
            light
            onClick={() => fileInputRef.current?.click()}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageFile(file);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(ref.current?.innerHTML ?? "")}
        data-placeholder={placeholder}
        style={{ minHeight }}
        className="prose-sm max-w-none p-lg text-small-body text-text-secondary focus:outline-none [&_img]:my-2 [&_img]:max-w-full [&_img]:rounded empty:before:text-text-tertiary empty:before:content-[attr(data-placeholder)]"
      />
    </div>
  );
}
