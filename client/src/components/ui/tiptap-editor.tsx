import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button } from '@/components/ui/button';
import { Bold, Italic, List, Quote, Heading1, Heading2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

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
        </div>
      )}
      
      <EditorContent 
        editor={editor} 
        className="prose-journal"
      />
    </div>
  );
}
