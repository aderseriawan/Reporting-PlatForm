"use client";

import dynamic from "next/dynamic";

const TinyMCEEditor = dynamic(
  async () => {
    const mod = await import("@tinymce/tinymce-react");
    return mod.Editor;
  },
  { ssr: false }
);

type RichTextEditorProps = {
  value: string;
  onChange: (next: string) => void;
  height?: number;
};

export function RichTextEditor({ value, onChange, height = 280 }: RichTextEditorProps) {
  return (
    <div className="tinymce-shell">
      <TinyMCEEditor
        tinymceScriptSrc="/tinymce/tinymce.min.js"
        value={value}
        onEditorChange={onChange}
        init={{
          height,
          menubar: false,
          branding: false,
          promotion: false,
          plugins:
            "advlist autolink lists link image charmap preview searchreplace visualblocks code media table help wordcount",
          toolbar:
            "undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | image link | removeformat | help",
          content_style:
            "body { font-family: Manrope, Segoe UI, sans-serif; font-size: 14px; color: #111827; }",
        }}
      />
    </div>
  );
}
