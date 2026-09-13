/*
 * Copies text to the clipboard, and says whether it worked.
 *
 * The Clipboard API only exists on a secure page (https, or localhost). Opened
 * over plain http on a network address, such as a phone on the office wifi
 * or a static export behind a plain-http server, it is missing, so this falls
 * back to the older select-and-copy command, which browsers still honour
 * there. Focus goes back to wherever it was.
 */
export async function copyText(text: string): Promise<boolean> {
  if (typeof window !== 'undefined' && window.isSecureContext && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      /* fall through to the older command */
    }
  }
  if (typeof document === 'undefined') return false;
  const active = document.activeElement as HTMLElement | null;
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  Object.assign(area.style, { position: 'fixed', top: '0', left: '0', width: '1px', height: '1px', opacity: '0', pointerEvents: 'none' });
  document.body.appendChild(area);
  try {
    area.select();
    area.setSelectionRange(0, text.length);
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    area.remove();
    active?.focus?.();
  }
}
