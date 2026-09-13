'use client';

import { useState } from 'react';
import type { QuickStartCopy } from '@/lib/devtools-copy';
import { copyText } from '@/lib/copy-text';

/*
 * "Run it": the commands that take an archive to a listening adapter, for
 * the shell the reader has. `{name}` in a line stands for
 * `nhcx-adapter_<version>` and is filled in here. The highlighting is a dozen
 * lines of tokeniser rather than a library, and Copy copies the plain text.
 * Carried over from the previous site.
 */

type Kind = 'cmd' | 'sub' | 'flag' | 'path' | 'comment' | 'plain';
type Token = { text: string; kind: Kind };

/** First word is the program, `-x` is a flag, anything with a dot or slash is a path. */
function tokenize(line: string, comments: boolean): Token[] {
  const hash = comments ? line.indexOf('#') : -1;
  const body = hash >= 0 ? line.slice(0, hash) : line;
  const comment = hash >= 0 ? line.slice(hash) : '';
  const tokens: Token[] = [];
  let words = 0;
  for (const part of body.split(/(\s+)/)) {
    if (!part) continue;
    if (/^\s+$/.test(part)) {
      tokens.push({ text: part, kind: 'plain' });
      continue;
    }
    words += 1;
    if (words === 1) tokens.push({ text: part, kind: 'cmd' });
    else if (part.startsWith('-')) tokens.push({ text: part, kind: 'flag' });
    else if (/[./\\]/.test(part)) tokens.push({ text: part, kind: 'path' });
    else tokens.push({ text: part, kind: 'sub' });
  }
  if (comment) tokens.push({ text: comment, kind: 'comment' });
  return tokens;
}

export default function QuickStart({ copy, version }: { copy: QuickStartCopy; version: string }) {
  const [shell, setShell] = useState(copy.shells[0]?.key ?? '');
  const [copied, setCopied] = useState(false);

  const chosen = copy.shells.find((s) => s.key === shell) ?? copy.shells[0];
  const code = chosen.lines.join('\n').split('{name}').join(`nhcx-adapter_${version}`);
  // Command Prompt has no inline comment a line can carry and still be pasted.
  const comments = chosen.key !== 'cmd';

  async function copyCode() {
    if (await copyText(code)) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  }

  return (
    <div className="term">
      <div className="term-bar">
        <h3 className="term-title">{copy.title}</h3>
        <div className="term-shells" role="group" aria-label={copy.shellGroupLabel}>
          {copy.shells.map((option) => (
            <button key={option.key} type="button" className={`term-shell${shell === option.key ? ' on' : ''}`} aria-pressed={shell === option.key} onClick={() => setShell(option.key)}>
              {option.label}
              <span>{option.note}</span>
            </button>
          ))}
        </div>
        <button type="button" className="term-copy" onClick={copyCode}>
          {copied ? copy.copiedLabel : copy.copyLabel}
        </button>
      </div>
      <pre className="term-code">
        <code>
          {code.split('\n').map((line, index) => (
            <span key={index} className="term-line">
              {tokenize(line, comments).map((token, at) => (
                <span key={at} className={token.kind === 'plain' ? undefined : `tk-${token.kind}`}>
                  {token.text}
                </span>
              ))}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
