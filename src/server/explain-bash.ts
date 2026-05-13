import { query } from '@anthropic-ai/claude-agent-sdk'

export async function explainBashCommand(command: string): Promise<string> {
  const chunks: string[] = []
  for await (const msg of query({
    prompt: `Explain what this bash command does in 2-3 plain sentences.
Be specific about files or paths affected, what will be created/deleted/modified,
and any risks. Do not suggest alternatives. Just explain it.

Command: ${command}`,
    options: {
      permissionMode: 'dontAsk',
      allowedTools: [],
      maxTurns: 1,
    },
  })) {
    if (msg.type === 'assistant') {
      for (const block of msg.message.content) {
        if ('text' in block) chunks.push(block.text)
      }
    }
  }
  return chunks.join('').trim() || 'Could not generate explanation.'
}
