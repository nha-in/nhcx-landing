'use client';

import { useState } from 'react';

/**
 * "Run it": the commands that take an archive to a listening adapter.
 *
 * Dark, because it is a terminal and reads as one. The steps differ only in
 * shell, so the shell is a choice rather than three blocks of prose — bash for
 * macOS and Linux, PowerShell and Command Prompt for Windows, whose archive is
 * a zip and whose binary needs its extension.
 *
 * Highlighting is done here rather than by a library: these are four commands
 * in a known shape, so a dozen lines of tokeniser beat shipping a grammar. The
 * Copy button copies the plain text, never the markup.
 */

type Shell = 'bash' | 'powershell' | 'cmd';

const SHELLS: Array<{ key: Shell; label: string; note: string }> = [
  { key: 'bash', label: 'bash', note: 'macOS · Linux' },
  { key: 'powershell', label: 'PowerShell', note: 'Windows' },
  { key: 'cmd', label: 'Command Prompt', note: 'Windows' },
];

function script(shell: Shell, version: string): string {
  const name = `nhcx-adapter_${version}`;
  if (shell === 'powershell') {
    return [
      `Expand-Archive ${name}_windows_amd64.zip -DestinationPath .`,
      `Set-Location ${name}_windows_amd64`,
      '.\\nhcx-adapter.exe config edit    # writes config.json',
      '.\\nhcx-adapter.exe serve          # checks, then listens',
      '.\\nhcx-adapter.exe ledger follow  # the traffic, live',
    ].join('\n');
  }
  if (shell === 'cmd') {
    // No inline comments: in cmd a trailing `rem` needs its own `&` clause,
    // and a line that cannot be pasted as-is is worse than an unannotated one.
    return [
      `tar -xf ${name}_windows_amd64.zip`,
      `cd ${name}_windows_amd64`,
      'nhcx-adapter.exe config edit',
      'nhcx-adapter.exe serve',
      'nhcx-adapter.exe ledger follow',
    ].join('\n');
  }
  return [
    `tar xzf ${name}_<os>_<arch>.tar.gz`,
    `cd ${name}_<os>_<arch>`,
    './nhcx-adapter config edit    # writes config.json',
    './nhcx-adapter serve          # checks, then listens',
    './nhcx-adapter ledger follow  # the traffic, live',
  ].join('\n');
}

type Kind = 'cmd' | 'sub' | 'flag' | 'path' | 'comment' | 'plain';
type Token = { text: string; kind: Kind };

/** First word is the program, `-x` is a flag, anything with a dot or slash is a path. */
function tokenize(line: string, shell: Shell): Token[] {
  const hash = shell === 'cmd' ? -1 : line.indexOf('#');
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

export default function QuickStart({ version }: { version: string }) {
  const [shell, setShell] = useState<Shell>('bash');
  const [copied, setCopied] = useState(false);
  const code = script(shell, version);

  async function copy() {
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
        <h3 className="term-title">Run it</h3>
        <div className="term-shells" role="group" aria-label="Shell">
          {SHELLS.map((option) => (
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
        <button type="button" className="term-copy" onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="term-code">
        <code>
          {code.split('\n').map((line, index) => (
            <span key={index} className="term-line">
              {tokenize(line, shell).map((token, at) => (
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
