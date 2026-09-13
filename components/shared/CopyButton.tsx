'use client';

import { useState } from 'react';
import { copyText } from '@/lib/copy-text';

/* Copies a line of text, and says so for a moment. Works on plain http too (lib/copy-text.ts). */
export default function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [state, setState] = useState<'idle' | 'done' | 'failed'>('idle');
  const copy = async () => {
    setState((await copyText(text)) ? 'done' : 'failed');
    window.setTimeout(() => setState('idle'), 1600);
  };
  return (
    <button type="button" className="copy-btn" onClick={copy} aria-live="polite">
      {state === 'done' ? 'Copied' : state === 'failed' ? 'Select and copy' : label}
    </button>
  );
}
