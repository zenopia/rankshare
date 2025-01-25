import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ListOrdered, List } from 'lucide-react'
import { useState, useEffect } from 'react'
import './tiptap-editor.css'

interface TiptapEditorProps {
  content?: string
  onChange?: (content: string) => void
  onListTypeChange?: (type: ListType) => void
  defaultListType?: ListType
  className?: string
  editable?: boolean
  placeholder?: string
}

export type ListType = 'ordered' | 'bullet' | 'task'

export function TiptapEditor({
  content = '',
  onChange,
  onListTypeChange,
  defaultListType = 'ordered',
  className,
  editable = true,
  placeholder = 'Start typing...',
}: TiptapEditorProps) {
  const [currentListType, setCurrentListType] = useState<ListType>(defaultListType)

  const getListTag = (type: ListType) => {
    switch (type) {
      case 'bullet':
        return 'ul';
      case 'ordered':
      case 'task':
        return 'ol';
      default:
        return 'ol';
    }
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Keep paragraph but disable other block nodes
        horizontalRule: false,
        heading: false,
        blockquote: false,
        codeBlock: false,
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
    ],
    content,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      // Check if editor is completely empty (no list structure)
      if (editor.isEmpty) {
        editor
          .chain()
          .setContent(`<${getListTag(currentListType)}><li><p>${placeholder}</p></li></${getListTag(currentListType)}>`)
          .focus()
          .run()
      }

      // Only call onChange if we have a handler
      if (onChange) {
        onChange(editor.getHTML())
      }
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert focus:outline-none max-w-none',
        'data-placeholder': placeholder,
      },
      handleKeyDown: (view, event) => {
        const { state } = view
        const { selection } = state
        const { empty, $head } = selection

        // Handle Backspace key
        if (event.key === 'Backspace' && empty) {
          // If we're at the start of a list item
          if ($head.parentOffset === 0) {
            const listNode = $head.node(-2) // Get the parent list node
            const listItemNode = $head.node(-1) // Get the current list item node
            
            // If this is the last item in the list and it's empty
            if (listNode.childCount === 1 && listItemNode.textContent === '') {
              return true // Prevent deletion to keep at least one item
            }
          }
        }

        return false
      },
    },
    onCreate: ({ editor }) => {
      // First set empty content if needed
      if (!content) {
        editor.commands.setContent(`<li><p>${placeholder}</p></li>`)
      }
      
      // Ensure we're starting with a clean slate
      editor.commands.liftListItem('listItem')
      
      // Then set the correct list type
      if (defaultListType === 'bullet') {
        editor.commands.toggleBulletList()
      } else {
        editor.commands.toggleOrderedList()
      }

      if (!content) {
        editor.commands.focus()
      }
    },
    autofocus: 'end',
  })

  useEffect(() => {
    if (editor && defaultListType) {
      const content = editor.getHTML()
      const hasItems = content.includes('<li>')

      if (hasItems) {
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = content
        const items = Array.from(tempDiv.querySelectorAll('li'))
        const itemsContent = items.map(item => item.textContent || placeholder).filter(text => text.trim())

        editor
          .chain()
          .setContent(
            `<${getListTag(defaultListType)}>` +
            itemsContent.map(text => `<li><p>${text}</p></li>`).join('') +
            `</${getListTag(defaultListType)}>`
          )
          .run()
      }
      setCurrentListType(defaultListType)
    }
  }, [editor, defaultListType]);

  const setListType = (type: ListType) => {
    if (!editor) return

    setCurrentListType(type)
    if (onListTypeChange) {
      onListTypeChange(type)
    }

    // First ensure we're in a list
    if (editor.isEmpty) {
      editor.chain().setContent(`<li><p>${placeholder}</p></li>`).focus().run()
    }
    
    // Toggle the appropriate list type
    if (type === 'bullet') {
      editor.chain().toggleBulletList().run()
    } else {
      editor.chain().toggleOrderedList().run()
    }
  }

  const isListType = (type: ListType): boolean => {
    if (!editor) return type === currentListType
    return type === currentListType
  }

  return (
    <div className={cn('w-full space-y-2', className)}>
      <div className="flex items-center gap-1 pb-2 border-b">
        <Button
          variant={isListType('ordered') ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setListType('ordered' as ListType)}
          type="button"
          className="gap-2"
        >
          <ListOrdered className="h-4 w-4" />
          <span className="hidden sm:inline">Numbered</span>
        </Button>
        <Button
          variant={isListType('bullet') ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setListType('bullet' as ListType)}
          type="button"
          className="gap-2"
        >
          <List className="h-4 w-4" />
          <span className="hidden sm:inline">Bullet</span>
        </Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
} 