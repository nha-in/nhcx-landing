'use client';

import { useState } from 'react';
import type { DevToolsCopy } from '@/lib/site-copy';

/**
 * "Run it": the commands that take an archive to a listening adapter.
 *
 * Dark, because it is a terminal and reads as one. The steps differ only in
 * shell, so the shell is a choice rather than three blocks of prose — bash for
 * macOS and Linux, PowerShell and Command Prompt for Windows, whose archive is
 * a zip and whose binary needs its extension. The three scripts and their
 * labels are `devtools.quickStart` in content/site.json; `{name}` in a line
 * stands for `nhcx-adapter_<version>` and is filled in here, because the
 * version comes from the synced GitHub release rather than from an editor.
 *
 * Highlighting is done here rather than by a library: these are four commands
 * in a known shape, so a dozen lines of tokeniser beat shipping a grammar. The
 * Copy button copies the plain text, never the markup.
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

export default function QuickStart({ copy, version }: { copy: DevToolsCopy['quickStart']; version: string }) {
  const [shell, setShell] = useState(copy.shells[0]?.key ?? '');
  const [copied, setCopied] = useState(false);

  const chosen = copy.shells.find((s) => s.key === shell) ?? copy.shells[0];
  const code = chosen.lines.join('\n').replaceAll('{name}', `nhcx-adapter_${version}`);
  // Command Prompt has no inline comment a line can carry and still be pasted.
  const comments = chosen.key !== 'cmd';

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard permission is the browser's call; the text is selectable */
    }
  }

  return (
    <div className="term">
      <div className="term-bar">
        <h3 className="term-title">{copy.title}</h3>
        <div className="term-shells" role="group" aria-label={copy.shellGroupLabel}>
          {copy.shells.map((option) => (
            <button
              key={option.key}
              type="button"
              className={`term-shell${shell === option.key ? ' on' : ''}`}
              aria-pressed={shell === option.key}
              onClick={() => setShell(option.key)}
            >
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
