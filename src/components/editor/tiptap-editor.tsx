import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { cn } from '@/lib/utils'
import './tiptap-editor.css'

interface TiptapEditorProps {
  content?: string
  onChange?: (content: string) => void
  className?: string
  editable?: boolean
  placeholder?: string
}

export function TiptapEditor({
  content = '',
  onChange,
  className,
  editable = true,
  placeholder = 'Start typing...',
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
          HTMLAttributes: {
            class: 'ordered-list'
          },
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
          HTMLAttributes: {
            class: 'bullet-list'
          },
        },
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert focus:outline-none max-w-none',
        'data-placeholder': placeholder,
      },
    },
    autofocus: 'end',
  })

  return (
    <div className={cn('w-full', className)}>
      <EditorContent editor={editor} />
    </div>
  )
} 