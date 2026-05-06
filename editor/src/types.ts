export type MessageRole = 'user' | 'assistant' | 'tool' | 'error'

export interface AskUserQuestionOption {
  label: string
  description: string
}

export interface AskUserQuestionItem {
  question: string
  header?: string
  options: AskUserQuestionOption[]
  multiSelect: boolean
}

export interface PendingApproval {
  id: string
  toolName: string
  input: Record<string, unknown>
  explanation?: string
}

export type ToolIcon = 'read' | 'write' | 'edit' | 'bash' | 'search' | 'folder' | 'bot' | 'wrench'

export interface ChatMessage {
  id: string
  role: MessageRole
  text: string
  icon?: ToolIcon  // only for role === 'tool'
}

// SDK SSE event shapes (subset we care about)

export interface TextBlock {
  type: 'text'
  text: string
}

export interface ToolUseBlock {
  type: 'tool_use'
  id: string
  name: string
  input: Record<string, unknown>
}

export interface AssistantSDKMessage {
  type: 'assistant'
  session_id: string
  message: {
    role: 'assistant'
    content: Array<TextBlock | ToolUseBlock>
  }
}

export interface ErrorEvent {
  type: 'error'
  message: string
}

export interface PermissionRequestEvent {
  type: 'permission_request'
  id: string
  toolName: string
  input: Record<string, unknown>
  explanation?: string
}

export type SlideContext =
  | { screen: 'picker' }
  | { screen: 'deck'; deckName: string; deckTitle: string; slideIndex: number; slideTotal: number; slideTitle: string | null }

export type StreamEvent =
  | AssistantSDKMessage
  | ErrorEvent
  | PermissionRequestEvent
  | { type: string; [key: string]: unknown }
