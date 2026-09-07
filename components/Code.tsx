import { Fragment } from 'react';

/**
 * The two code panels the designed pages show, coloured here rather than in
 * the content.
 *
 * The samples used to be hand-marked JSX, one <span> per token, which meant a
 * comma could not be changed without editing a component. They are plain text
 * in content/site.json now and the colour is derived: these are JSON bundles
 * and shell sessions in a known shape, so a small tokeniser beats shipping a
 * grammar, and an editor writes what they mean rather than what it looks like.
 *
 * Both are decorative — a reader is not meant to type them in — so the
 * markup carries no language hints beyond the classes styles/landing.css
 * colours: `n` line number, `k` key, `s` string, `v` value.
 */

/** `"resourceType"` before a colon is a key, any other quoted run is a string. */
function json(line: string) {
  const out: React.ReactNode[] = [];
  const re = /"(?:[^"\\]|\\.)*"|\b\d+(?:\.\d+)?\b/g;
  let at = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    if (m.index > at) out.push(line.slice(at, m.index));
    const token = m[0];
    const isKey = token.startsWith('"') && /^\s*:/.test(line.slice(m.index + token.length));
    out.push(
      <span key={m.index} className={token.startsWith('"') ? (isKey ? 'k' : 's') : 'v'}>
        {token}
      </span>,
    );
    at = m.index + token.length;
  }
  if (at < line.length) out.push(line.slice(at));
  return out;
}

/** A JSON sample with line numbers down the gutter. */
export function CodeJson({ code }: { code: string }) {
  const lines = code.split('\n');
  return (
    <pre className="lp-code">
      {lines.map((line, i) => (
        <Fragment key={i}>
          <span className="n">{i + 1}</span>
          {json(line)}
          {i < lines.length - 1 ? '\n' : ''}
        </Fragment>
      ))}
    </pre>
  );
}

/**
 * A shell session: a line beginning `$` is a command, one beginning `✓` is a
 * result, and `backticks` mark the value inside a line worth picking out.
 */
export function CodeShell({ lines }: { lines: string[] }) {
  return (
    <pre className="lp-code">
      {lines.map((line, i) => {
        const lead = line.startsWith('$ ') ? 'k' : line.startsWith('✓ ') ? 's' : null;
        const rest = lead ? line.slice(1) : line;
        return (
          <Fragment key={i}>
            {lead && <span className={lead}>{line[0]}</span>}
            {rest.split(/`([^`]+)`/).map((piece, at) =>
              at % 2 ? (
                <span key={at} className="v">
                  {piece}
                </span>
              ) : (
                <Fragment key={at}>{piece}</Fragment>
              ),
            )}
            {i < lines.length - 1 ? '\n' : ''}
          </Fragment>
        );
      })}
    </pre>
  );
}
