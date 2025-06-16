import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';

import {
  Bold,
  Italic,
  List,
  Quote,
  Heading1,
  Heading2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo2,
  Redo2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
}

export function TiptapEditor({
  content,
  onChange,
  placeholder = "Start writing...",
  editable = true,
  className
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[150px] font-serif text-lg leading-relaxed',
        placeholder,
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false); // Prevent infinite loop
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={cn("w-full", className)}>
      {editable && (
        <div className="border-b border-accent/10 pb-3 mb-6 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            className="h-8 px-2"
          >
            <Undo2 className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            className="h-8 px-2"
          >
            <Redo2 className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(
              "h-8 px-2",
              editor.isActive('bold') && "bg-accent/20"
            )}
          >
            <Bold className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(
              "h-8 px-2",
              editor.isActive('italic') && "bg-accent/20"
            )}
          >
            <Italic className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={cn(
              "h-8 px-2",
              editor.isActive('heading', { level: 1 }) && "bg-accent/20"
            )}
          >
            <Heading1 className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={cn(
              "h-8 px-2",
              editor.isActive('heading', { level: 2 }) && "bg-accent/20"
            )}
          >
            <Heading2 className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn(
              "h-8 px-2",
              editor.isActive('bulletList') && "bg-accent/20"
            )}
          >
            <List className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={cn(
              "h-8 px-2",
              editor.isActive('blockquote') && "bg-accent/20"
            )}
          >
            <Quote className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={cn(
              "h-8 px-2",
              editor.isActive({ textAlign: 'left' }) && "bg-accent/20"
            )}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={cn(
              "h-8 px-2",
              editor.isActive({ textAlign: 'center' }) && "bg-accent/20"
            )}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={cn(
              "h-8 px-2",
              editor.isActive({ textAlign: 'right' }) && "bg-accent/20"
            )}
          >
            <AlignRight className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={cn(
              "h-8 px-2",
              editor.isActive({ textAlign: 'justify' }) && "bg-accent/20"
            )}
          >
            <AlignJustify className="h-4 w-4" />
          </Button>

        </div>
      )}

      <EditorContent
        editor={editor}
        className="prose-journal"
      />
    </div>
  );
}
