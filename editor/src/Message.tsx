import type { ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { FileText, FilePlus, Pencil, Terminal, Search, FolderOpen, Bot, Wrench } from 'lucide-react'
import type { ChatMessage, ToolIcon } from './types'

const ICONS: Record<ToolIcon, ReactNode> = {
  read:   <FileText  size={12} />,
  write:  <FilePlus  size={12} />,
  edit:   <Pencil    size={12} />,
  bash:   <Terminal  size={12} />,
  search: <Search    size={12} />,
  folder: <FolderOpen size={12} />,
  bot:    <Bot       size={12} />,
  wrench: <Wrench    size={12} />,
}

interface Props {
  message: ChatMessage
}

export default function Message({ message }: Props): ReactNode {
  if (message.role === 'tool') {
    return (
      <div className="msg msg-tool">
        {message.icon ? ICONS[message.icon] : null}
        <span>{message.text}</span>
      </div>
    )
  }

  if (message.role === 'assistant') {
    return (
      <div className="msg msg-assistant msg-markdown">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {message.text}
        </ReactMarkdown>
      </div>
    )
  }

  return (
    <div className={`msg msg-${message.role}`}>
      {message.text}
    </div>
  )
}
