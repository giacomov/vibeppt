import { describe, it, expect } from 'vitest'
import { isAutoApprovedBash, fileWriteSandboxDecision } from './plugin'

const CWD = '/repo'

describe('isAutoApprovedBash — allows bare npm run invocations', () => {
  it.each([
    'npm run build',
    'npm run dev',
    '  npm run build  ',
    'npm  run  build',
    'npm run export -- --deck=foo --format=png',
    'npm run export -- --deck=foo --slides=1,3-5,8',
    'npm run build > /tmp/out.log',
    'npm run build >> /tmp/out.log',
    'npm run build 2> /tmp/err.log',
    'npm run build 2>&1',
    'npm run build > out.log 2>&1',
    'npm run build &> /tmp/all.log',
    'npm run build < /dev/null',
    'npm run warm-cache',
    'npm run format-check',
  ])('allows: %j', (cmd) => {
    expect(isAutoApprovedBash(cmd)).toBe(true)
  })
})

describe('isAutoApprovedBash — allows bare ls invocations', () => {
  it.each([
    'ls',
    'ls -la',
    'ls /tmp',
    'ls -lah /tmp',
    '  ls  ',
    'ls > /tmp/out.log',
    'ls 2>&1',
    'ls /tmp /var',
  ])('allows: %j', (cmd) => {
    expect(isAutoApprovedBash(cmd)).toBe(true)
  })
})

describe('isAutoApprovedBash — allows piping to head/tail with safe args', () => {
  it.each([
    'npm run build | head',
    'npm run build | head -20',
    'npm run build | head -n 20',
    'npm run build | tail',
    'npm run build | tail -50',
    'npm run build | tail -n 50',
    'npm run build|head -20',                         // no spaces around pipe
    'npm run build  |  head  -20',                    // extra spaces
    'ls -la | head -5',
    'ls /tmp | tail -10',
    'npm run export -- --deck=foo --format=png | tail -100',
  ])('allows: %j', (cmd) => {
    expect(isAutoApprovedBash(cmd)).toBe(true)
  })
})

describe('isAutoApprovedBash — blocks pipes to anything other than head/tail', () => {
  it.each([
    'npm run build | grep error',
    'npm run build | tee log.txt',
    'npm run build | cat',
    'npm run build | wc -l',
    'ls | xargs rm',                                  // also caught by rm guard, but pipe target alone blocks
    'npm run build | head -20 | tail -5',             // chained pipes — only one allowed
    'npm run build | head | grep foo',                // pipe target has further pipe
    'npm run build | head; ls',                       // chain after head
    'npm run build | head && ls',
    'npm run build | head $(whoami)',                 // substitution in head args
    'npm run build | head `whoami`',
    'npm run build | head > /tmp/x',                  // redirect after head not supported (keeps regex tight)
  ])('blocks: %j', (cmd) => {
    expect(isAutoApprovedBash(cmd)).toBe(false)
  })
})

describe('isAutoApprovedBash — blocks non-allowlisted prefixes', () => {
  it.each([
    '',
    '   ',
    'rm -rf /',
    'npm install',
    'npm test',
    'npm ci',
    'npx tsc --noEmit',
    'sudo npm run build',
    'echo npm run build',
    'npmrun build',
    'npm-run build',
    'npm runx build',
    'lsof -i',
    'lsblk',
    'sudo ls',
    'echo ls',
  ])('blocks: %j', (cmd) => {
    expect(isAutoApprovedBash(cmd)).toBe(false)
  })
})

describe('isAutoApprovedBash — blocks shell chaining and substitution (CRITICAL)', () => {
  it.each([
    'npm run build && echo done',
    'npm run build || echo failed',
    'npm run build; echo done',
    'npm run build ; echo done',
    'npm run build | grep error',
    'npm run build |tee log',
    'npm run build &',
    'npm run build & echo hi',
    'npm run build `whoami`',
    'npm run build $(whoami)',
    'npm run build "$(date)"',
    'npm run build > /tmp/x && cat /etc/passwd',
    'npm run build\nls',
    'npm run build\rls',
    'ls && echo done',
    'ls; echo done',
    'ls | grep foo',
    'ls $(pwd)',
    'ls `pwd`',
  ])('blocks: %j', (cmd) => {
    expect(isAutoApprovedBash(cmd)).toBe(false)
  })
})

describe('fileWriteSandboxDecision — passes through non-fs-write tools', () => {
  it.each(['Read', 'Glob', 'Grep', 'Bash', 'TodoWrite', 'mcp__vibe__file_picker'])(
    'returns null for %j',
    (tool) => {
      expect(fileWriteSandboxDecision(tool, { file_path: '/anywhere' }, CWD, 'deck')).toBeNull()
    },
  )
})

describe('fileWriteSandboxDecision — with active deck, only that deck folder is writable', () => {
  const allow = (path: string) =>
    expect(fileWriteSandboxDecision('Write', { file_path: path }, CWD, 'foo')).toEqual({
      behavior: 'allow',
    })
  const deny = (path: string) => {
    const d = fileWriteSandboxDecision('Write', { file_path: path }, CWD, 'foo')
    expect(d?.behavior).toBe('deny')
  }

  it('allows files inside the active deck', () => {
    allow('presentations/foo/title.tsx')
    allow('/repo/presentations/foo/sub/dir/file.tsx')
    allow('presentations/foo')
  })

  it('blocks other decks', () => {
    deny('presentations/bar/slide.tsx')
    deny('/repo/presentations/bar/title.tsx')
  })

  it('blocks the rest of the repo', () => {
    deny('src/templates/Foo.tsx')
    deny('CLAUDE.md')
    deny('/repo/src/index.css')
  })

  it('blocks path traversal escapes', () => {
    deny('presentations/foo/../../etc/passwd')
    deny('/etc/passwd')
    deny('../../etc/passwd')
    deny('/Users/someone/escape.txt')
  })
})

describe('fileWriteSandboxDecision — with no active deck, presentations/ is the boundary', () => {
  it('allows creating new deck folders inside presentations/', () => {
    expect(
      fileWriteSandboxDecision('Write', { file_path: 'presentations/new-deck/title.tsx' }, CWD, null),
    ).toEqual({ behavior: 'allow' })
    expect(
      fileWriteSandboxDecision('Write', { file_path: '/repo/presentations/new-deck/deck.ts' }, CWD, null),
    ).toEqual({ behavior: 'allow' })
  })

  it('blocks writes outside presentations/', () => {
    const d = fileWriteSandboxDecision('Write', { file_path: 'src/anything.ts' }, CWD, null)
    expect(d?.behavior).toBe('deny')
  })
})

describe('fileWriteSandboxDecision — covers all FS_WRITE_TOOLS', () => {
  it.each(['Write', 'Edit', 'MultiEdit'])('checks %s via file_path', (tool) => {
    expect(
      fileWriteSandboxDecision(tool, { file_path: 'presentations/foo/x.tsx' }, CWD, 'foo'),
    ).toEqual({ behavior: 'allow' })
    const d = fileWriteSandboxDecision(tool, { file_path: 'src/x.ts' }, CWD, 'foo')
    expect(d?.behavior).toBe('deny')
  })

  it('checks NotebookEdit via notebook_path', () => {
    expect(
      fileWriteSandboxDecision('NotebookEdit', { notebook_path: 'presentations/foo/x.ipynb' }, CWD, 'foo'),
    ).toEqual({ behavior: 'allow' })
    const d = fileWriteSandboxDecision('NotebookEdit', { notebook_path: 'src/x.ipynb' }, CWD, 'foo')
    expect(d?.behavior).toBe('deny')
  })

  it('denies when neither file_path nor notebook_path is present', () => {
    const d = fileWriteSandboxDecision('Write', {}, CWD, 'foo')
    expect(d?.behavior).toBe('deny')
  })
})

describe('isAutoApprovedBash — blocks anything mentioning `rm` as a word (CRITICAL)', () => {
  it.each([
    'npm run build rm -rf /',
    'npm run build\trm -rf /',
    'npm run build -- rm /tmp/x',
    'npm run rm-old-builds',
    'npm run cleanup --use=rm',
    'ls rm',
    'ls /tmp/rm',
    'ls -- rm',
  ])('blocks: %j', (cmd) => {
    expect(isAutoApprovedBash(cmd)).toBe(false)
  })
})
