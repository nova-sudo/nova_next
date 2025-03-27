"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import TitleIcon from "@mui/icons-material/Title";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import CodeIcon from "@mui/icons-material/Code";
import LinkIcon from "@mui/icons-material/Link";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { useState } from "react";

interface TiptapEditorProps {
  content: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  height?: string;
}

const MenuButton = ({
  onClick,
  isActive,
  icon,
  tooltip,
}: {
  onClick: () => void;
  isActive?: boolean;
  icon: React.ReactNode;
  tooltip: string;
}) => (
  <button
    onClick={onClick}
    className={`p-2 rounded-md transition-all duration-200 ease-in-out relative group
      ${isActive ? "bg-red-100 text-red-600" : "hover:bg-gray-100 text-gray-700"}`}
    type="button"
    title={tooltip}
  >
    {icon}
    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
      {tooltip}
    </span>
  </button>
);

const convertHtmlToMarkdown = (html: string): string => {
  let markdown = html
    // Clean up newlines and spaces
    .replace(/\n\s+/g, "\n")
    .replace(/\s+\n/g, "\n")
    .replace(/\n+/g, "\n")
    .trim();

  // Handle paragraphs with proper spacing
  markdown = markdown.replace(
    /<p[^>]*>(.*?)<\/p>/g,
    (_match: string, content: string) => {
      // Don't add extra newlines for empty paragraphs
      if (content.trim() === "<br>" || content.trim() === "") {
        return "\n";
      }
      return `${content.trim()}\n\n`;
    },
  );

  // Handle headings
  markdown = markdown
    .replace(
      /<h1[^>]*>(.*?)<\/h1>/g,
      (_match: string, content: string) => `# ${content}\n\n`,
    )
    .replace(
      /<h2[^>]*>(.*?)<\/h2>/g,
      (_match: string, content: string) => `## ${content}\n\n`,
    )
    .replace(
      /<h3[^>]*>(.*?)<\/h3>/g,
      (_match: string, content: string) => `### ${content}\n\n`,
    );

  // Handle inline formatting
  markdown = markdown
    .replace(
      /<strong[^>]*>(.*?)<\/strong>/g,
      (_match: string, content: string) => `**${content}**`,
    )
    .replace(
      /<em[^>]*>(.*?)<\/em>/g,
      (_match: string, content: string) => `*${content}*`,
    )
    .replace(
      /<code[^>]*>(.*?)<\/code>/g,
      (_match: string, content: string) => `\`${content}\``,
    );

  // Handle code blocks
  markdown = markdown.replace(
    /<pre><code[^>]*>(.*?)<\/code><\/pre>/g,
    (_match: string, content: string) => `\`\`\`\n${content}\n\`\`\`\n\n`,
  );

  // Handle blockquotes
  markdown = markdown.replace(
    /<blockquote[^>]*>(.*?)<\/blockquote>/g,
    (_match: string, content: string) => {
      // Split content into lines and prefix each with >
      return (
        content
          .split("\n")
          .map((line: string) => `> ${line.trim()}`)
          .join("\n") + "\n\n"
      );
    },
  );

  // Handle links
  markdown = markdown.replace(
    /<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/g,
    (_match: string, url: string, text: string) => `[${text}](${url})`,
  );

  // Handle lists
  markdown = markdown
    .replace(/<ul[^>]*>(.*?)<\/ul>/g, (_match: string, content: string) => {
      return (
        content
          .split(/<li[^>]*>/)
          .filter(Boolean)
          .map((item: string) => `- ${item.replace(/<\/li>/, "").trim()}`)
          .join("\n") + "\n\n"
      );
    })
    .replace(/<ol[^>]*>(.*?)<\/ol>/g, (_match: string, content: string) => {
      return (
        content
          .split(/<li[^>]*>/)
          .filter(Boolean)
          .map(
            (item: string, index: number) =>
              `${index + 1}. ${item.replace(/<\/li>/, "").trim()}`,
          )
          .join("\n") + "\n\n"
      );
    });

  // Clean up any remaining HTML tags
  markdown = markdown.replace(/<br\s*\/?>/g, "\n").replace(/<[^>]+>/g, "");

  // Fix extra newlines
  markdown = markdown.replace(/\n\n+/g, "\n\n").trim();

  return markdown;
};

const TiptapEditor = ({
  content,
  onChange,
  readOnly = false,
  height = "200px",
}: TiptapEditorProps) => {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add content validation
  const validateContent = (content: string) => {
    const MAX_CONTENT_SIZE = 250 * 1024 * 1024; // 250MB in bytes
    const contentSize = new Blob([content]).size;

    if (contentSize > MAX_CONTENT_SIZE) {
      setError(
        `Content size (${Math.round(contentSize / 1024 / 1024)}MB) exceeds the limit of 250MB`,
      );
      return false;
    }

    setError(null);
    return true;
  };

  const handleContentChange = ({ editor }: { editor: any }) => {
    const html = editor.getHTML();
    const markdown = convertHtmlToMarkdown(html);

    if (validateContent(markdown)) {
      onChange(markdown);
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 hover:text-blue-600 underline",
        },
      }),
      Image.configure({
        inline: true,
        HTMLAttributes: {
          class: "rounded-lg shadow-md max-w-full",
        },
      }),
    ],
    content: content || "",
    editable: !readOnly && !isPreviewMode,
    onUpdate: handleContentChange,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none max-w-none",
      },
    },
  });

  if (!editor) {
    return null;
  }

  const menuItems = [
    {
      icon: <FormatBoldIcon fontSize="small" />,
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive("bold"),
      tooltip: "Bold",
    },
    {
      icon: <FormatItalicIcon fontSize="small" />,
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive("italic"),
      tooltip: "Italic",
    },
    {
      icon: <TitleIcon fontSize="small" />,
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive("heading", { level: 2 }),
      tooltip: "Heading",
    },
    {
      icon: <FormatListBulletedIcon fontSize="small" />,
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive("bulletList"),
      tooltip: "Bullet List",
    },
    {
      icon: <FormatListNumberedIcon fontSize="small" />,
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive("orderedList"),
      tooltip: "Numbered List",
    },
    {
      icon: <FormatQuoteIcon fontSize="small" />,
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive("blockquote"),
      tooltip: "Quote",
    },
    {
      icon: <CodeIcon fontSize="small" />,
      action: () => editor.chain().focus().toggleCode().run(),
      isActive: editor.isActive("code"),
      tooltip: "Code",
    },
    {
      icon: <LinkIcon fontSize="small" />,
      action: () => {
        const url = window.prompt("Enter the URL");
        if (url) {
          editor.chain().focus().setLink({ href: url }).run();
        }
      },
      isActive: editor.isActive("link"),
      tooltip: "Add Link",
    },
  ];

  const togglePreviewMode = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  return (
    <div className="tiptap-editor-container" style={{ minHeight: height }}>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg mb-2">
          {error}
        </div>
      )}
      <div
        className={`border rounded-lg shadow-sm ${readOnly ? "bg-gray-50" : "bg-white"}`}
      >
        {!readOnly && (
          <div className="border-b px-3 py-2 flex gap-1 flex-wrap items-center justify-between bg-white rounded-t-lg">
            <div className="flex gap-1 flex-wrap items-center">
              {menuItems.map((item, index) => (
                <MenuButton
                  key={index}
                  onClick={item.action}
                  isActive={item.isActive}
                  icon={item.icon}
                  tooltip={item.tooltip}
                />
              ))}
            </div>
            <MenuButton
              onClick={togglePreviewMode}
              isActive={isPreviewMode}
              icon={
                isPreviewMode ? (
                  <EditIcon fontSize="small" />
                ) : (
                  <VisibilityIcon fontSize="small" />
                )
              }
              tooltip={isPreviewMode ? "Edit Mode" : "Preview Mode"}
            />
          </div>
        )}
        <div className="px-4 py-3">
          {isPreviewMode ? (
            <div className="markdown-preview prose">
              <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                {convertHtmlToMarkdown(editor.getHTML())}
              </ReactMarkdown>
            </div>
          ) : (
            <EditorContent editor={editor} />
          )}
        </div>
      </div>
    </div>
  );
};

export default TiptapEditor;
