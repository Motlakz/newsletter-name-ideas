"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { Markdown } from 'tiptap-markdown'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Code,
  Heading1,
  Heading2,
  Heading3,
  CodepenIcon,
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Toggle } from "@/components/ui/toggle"
import { useEffect, useState } from 'react'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export default function RichTextEditor({ content, onChange, placeholder = 'Write something...' }: RichTextEditorProps) {
    const [isMounted, setIsMounted] = useState(false)

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
                    class: 'text-primary underline',
                },
            }),
            Markdown.configure({
                transformPastedText: true,
                transformCopiedText: true,
            }),
        ],
        content,
        onUpdate: ({ editor }) => {
            // Get content as Markdown
            const markdown = editor.storage.markdown.getMarkdown()
            onChange(markdown)
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose dark:prose-invert focus:outline-none max-w-none',
                'data-placeholder': placeholder,
            },
        },
        enableCoreExtensions: true,
        immediatelyRender: false,
    })

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted || !editor) {
        return (
        <div className="border rounded-lg overflow-hidden">
            <div className="border-b bg-muted/50 p-2 h-[42px]" />
            <div className="p-4 min-h-[400px]" />
        </div>
        )
    }

    const HeadingButtons = () => (
        <div className="flex gap-1">
        <Toggle
            size="sm"
            pressed={editor.isActive('heading', { level: 1 })}
            onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
            <Heading1 className="h-4 w-4" />
        </Toggle>
        <Toggle
            size="sm"
            pressed={editor.isActive('heading', { level: 2 })}
            onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
            <Heading2 className="h-4 w-4" />
        </Toggle>
        <Toggle
            size="sm"
            pressed={editor.isActive('heading', { level: 3 })}
            onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
            <Heading3 className="h-4 w-4" />
        </Toggle>
        </div>
    )

    return (
        <div className="border rounded-lg overflow-hidden">
        <div className="border-b bg-muted/50 p-2 flex flex-wrap gap-2">
            <HeadingButtons />
            <div className="h-6 w-px bg-border" />
            <Toggle
            size="sm"
            pressed={editor.isActive('bold')}
            onPressedChange={() => editor.chain().focus().toggleBold().run()}
            >
            <Bold className="h-4 w-4" />
            </Toggle>
            <Toggle
            size="sm"
            pressed={editor.isActive('italic')}
            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
            >
            <Italic className="h-4 w-4" />
            </Toggle>
            <div className="h-6 w-px bg-border" />
            <Toggle
            size="sm"
            pressed={editor.isActive('bulletList')}
            onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
            >
            <List className="h-4 w-4" />
            </Toggle>
            <Toggle
            size="sm"
            pressed={editor.isActive('orderedList')}
            onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
            >
            <ListOrdered className="h-4 w-4" />
            </Toggle>
            <div className="h-6 w-px bg-border" />
            <Toggle
            size="sm"
            pressed={editor.isActive('blockquote')}
            onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
            >
            <Quote className="h-4 w-4" />
            </Toggle>
            <Toggle
            size="sm"
            pressed={editor.isActive('code')}
            onPressedChange={() => editor.chain().focus().toggleCode().run()}
            >
            <Code className="h-4 w-4" />
            </Toggle>
            <Toggle
            size="sm"
            pressed={editor.isActive('codeBlock')}
            onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
            >
            <CodepenIcon className="h-4 w-4" />
            </Toggle>
            <Button
            size="sm"
            variant="ghost"
            onClick={() => {
                const url = window.prompt('Enter URL')
                if (url) {
                editor.chain().focus().setLink({ href: url }).run()
                }
            }}
            className={editor.isActive('link') ? 'bg-muted' : ''}
            >
            <LinkIcon className="h-4 w-4" />
            </Button>
            <div className="h-6 w-px bg-border" />
            <Button
            size="sm"
            variant="ghost"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            >
            <Undo className="h-4 w-4" />
            </Button>
            <Button
            size="sm"
            variant="ghost"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            >
            <Redo className="h-4 w-4" />
            </Button>
        </div>
        <EditorContent editor={editor} className="p-4" />
        </div>
    )
}
