/**
 * A dependency-free syntax highlighter for fenced code blocks.
 *
 * Docs pages carry FHIR JSON, Lua mapping templates, Go handlers, shell and
 * HTTP snippets, so a full grammar engine would be a lot of weight for a
 * handful of languages. Each language is instead a short ordered rule list:
 * the scanner walks the source once and the first rule that matches at the
 * cursor wins, which keeps strings and comments from being re-tokenised as
 * keywords the way naive find-and-replace highlighters do.
 */

export type TokenKind =
  | 'comment'
  | 'string'
  | 'number'
  | 'keyword'
  | 'type'
  | 'func'
  | 'prop'
  | 'var'
  | 'meta'
  | 'punct'
  | 'ins'
  | 'del';

interface Rule {
  kind: TokenKind;
  re: RegExp;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// shared fragments ---------------------------------------------------------
const DQ_STRING = /"(?:[^"\\\n]|\\.)*"?/;
const SQ_STRING = /'(?:[^'\\\n]|\\.)*'?/;
const NUMBER = /-?\b\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?\b|-?\b0[xX][\da-fA-F]+\b/;
const HASH_COMMENT = /#.*/;
const SLASH_COMMENT = /\/\/.*/;
const BLOCK_COMMENT = /\/\*[\s\S]*?\*\//;

const words = (list: string[]) => new RegExp(`\\b(?:${list.join('|')})\\b`);

const JS_KEYWORDS = words([
  'abstract', 'as', 'async', 'await', 'break', 'case', 'catch', 'class', 'const', 'continue',
  'declare', 'default', 'delete', 'do', 'else', 'enum', 'export', 'extends', 'finally', 'for',
  'from', 'function', 'get', 'if', 'implements', 'import', 'in', 'instanceof', 'interface', 'let',
  'new', 'of', 'private', 'protected', 'public', 'readonly', 'return', 'satisfies', 'set', 'static',
  'super', 'switch', 'this', 'throw', 'try', 'type', 'typeof', 'var', 'void', 'while', 'yield',
  'true', 'false', 'null', 'undefined',
]);

const GO_KEYWORDS = words([
  'break', 'case', 'chan', 'const', 'continue', 'default', 'defer', 'else', 'fallthrough', 'for',
  'func', 'go', 'goto', 'if', 'import', 'interface', 'map', 'package', 'range', 'return', 'select',
  'struct', 'switch', 'type', 'var', 'nil', 'true', 'false',
]);

const GO_TYPES = words([
  'any', 'bool', 'byte', 'complex64', 'complex128', 'error', 'float32', 'float64', 'int', 'int8',
  'int16', 'int32', 'int64', 'rune', 'string', 'uint', 'uint8', 'uint16', 'uint32', 'uint64',
  'uintptr',
]);

const LUA_KEYWORDS = words([
  'and', 'break', 'do', 'else', 'elseif', 'end', 'false', 'for', 'function', 'goto', 'if', 'in',
  'local', 'nil', 'not', 'or', 'repeat', 'return', 'then', 'true', 'until', 'while',
]);

const LUA_BUILTINS = words([
  'ipairs', 'pairs', 'tonumber', 'tostring', 'type', 'select', 'string', 'table', 'math', 'os',
  'print', 'error', 'assert', 'pcall', 'require',
]);

const SHELL_KEYWORDS = words([
  'if', 'then', 'else', 'elif', 'fi', 'for', 'while', 'until', 'do', 'done', 'case', 'esac',
  'function', 'return', 'in', 'select', 'time', 'export', 'local', 'source', 'set', 'unset',
]);

const SQL_KEYWORDS =
  /\b(?:ADD|ALL|ALTER|AND|AS|ASC|BEGIN|BETWEEN|BY|CASE|COLUMN|COMMIT|CONFLICT|CREATE|CROSS|DEFAULT|DELETE|DESC|DISTINCT|DO|DROP|ELSE|END|EXISTS|FROM|FULL|GROUP|HAVING|IN|INDEX|INNER|INSERT|INTO|IS|JOIN|LEFT|LIKE|LIMIT|NOT|NULL|OFFSET|ON|OR|ORDER|OUTER|PRIMARY|REFERENCES|RETURNING|RIGHT|ROLLBACK|SELECT|SET|TABLE|THEN|UNION|UNIQUE|UPDATE|VALUES|VIEW|WHEN|WHERE|WITH)\b/i;

const PY_KEYWORDS = words([
  'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue', 'def', 'del', 'elif',
  'else', 'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda',
  'None', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'True', 'False', 'try', 'while',
  'with', 'yield',
]);

const PUNCT = /[{}[\]()<>.,;:=+\-*/%!?&|^~]+/;
const IDENT_CALL = /\b[A-Za-z_$][\w$]*(?=\s*\()/;

const RULES: Record<string, Rule[]> = {
  json: [
    { kind: 'prop', re: /"(?:[^"\\]|\\.)*"(?=\s*:)/ },
    { kind: 'string', re: DQ_STRING },
    { kind: 'keyword', re: /\b(?:true|false|null)\b/ },
    { kind: 'number', re: NUMBER },
    { kind: 'punct', re: /[{}[\],:]/ },
  ],
  javascript: [
    { kind: 'comment', re: BLOCK_COMMENT },
    { kind: 'comment', re: SLASH_COMMENT },
    { kind: 'string', re: /`(?:[^`\\]|\\.)*`?/ },
    { kind: 'string', re: DQ_STRING },
    { kind: 'string', re: SQ_STRING },
    { kind: 'keyword', re: JS_KEYWORDS },
    { kind: 'func', re: IDENT_CALL },
    { kind: 'type', re: /\b[A-Z][\w$]*\b/ },
    { kind: 'number', re: NUMBER },
    { kind: 'punct', re: PUNCT },
  ],
  go: [
    { kind: 'comment', re: BLOCK_COMMENT },
    { kind: 'comment', re: SLASH_COMMENT },
    { kind: 'string', re: /`[^`]*`?/ },
    { kind: 'string', re: DQ_STRING },
    { kind: 'string', re: /'(?:[^'\\]|\\.)'/ },
    { kind: 'keyword', re: GO_KEYWORDS },
    { kind: 'type', re: GO_TYPES },
    { kind: 'func', re: IDENT_CALL },
    { kind: 'number', re: NUMBER },
    { kind: 'punct', re: PUNCT },
  ],
  lua: [
    { kind: 'comment', re: /--\[\[[\s\S]*?\]\]/ },
    { kind: 'comment', re: /--.*/ },
    { kind: 'string', re: /\[\[[\s\S]*?\]\]/ },
    { kind: 'string', re: DQ_STRING },
    { kind: 'string', re: SQ_STRING },
    { kind: 'keyword', re: LUA_KEYWORDS },
    { kind: 'type', re: LUA_BUILTINS },
    { kind: 'func', re: IDENT_CALL },
    { kind: 'number', re: NUMBER },
    { kind: 'punct', re: PUNCT },
  ],
  shell: [
    { kind: 'comment', re: HASH_COMMENT },
    { kind: 'meta', re: /^\s*\$ /m },
    { kind: 'string', re: DQ_STRING },
    { kind: 'string', re: SQ_STRING },
    { kind: 'var', re: /\$\{[^}]*\}|\$[A-Za-z_]\w*/ },
    { kind: 'keyword', re: SHELL_KEYWORDS },
    { kind: 'type', re: /(?<=^|\s)--?[A-Za-z][\w-]*/ },
    { kind: 'number', re: NUMBER },
    { kind: 'punct', re: /[|&;()<>]/ },
  ],
  http: [
    { kind: 'keyword', re: /^(?:GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\b/m },
    { kind: 'meta', re: /\bHTTP\/[\d.]+\b/ },
    { kind: 'prop', re: /^[A-Za-z][A-Za-z0-9-]*(?=:)/m },
    { kind: 'string', re: /\bhttps?:\/\/\S+/ },
    { kind: 'number', re: NUMBER },
  ],
  yaml: [
    { kind: 'comment', re: HASH_COMMENT },
    { kind: 'prop', re: /^[ \t]*-?[ \t]*[\w.$-]+(?=\s*:)/m },
    { kind: 'string', re: DQ_STRING },
    { kind: 'string', re: SQ_STRING },
    { kind: 'keyword', re: /\b(?:true|false|null|yes|no|on|off)\b/i },
    { kind: 'meta', re: /^---$|^\s*-\s/m },
    { kind: 'number', re: NUMBER },
  ],
  sql: [
    { kind: 'comment', re: /--.*/ },
    { kind: 'comment', re: BLOCK_COMMENT },
    { kind: 'string', re: SQ_STRING },
    { kind: 'string', re: DQ_STRING },
    { kind: 'keyword', re: SQL_KEYWORDS },
    { kind: 'func', re: IDENT_CALL },
    { kind: 'number', re: NUMBER },
    { kind: 'punct', re: PUNCT },
  ],
  python: [
    { kind: 'comment', re: HASH_COMMENT },
    { kind: 'string', re: /"""[\s\S]*?"""|'''[\s\S]*?'''/ },
    { kind: 'string', re: DQ_STRING },
    { kind: 'string', re: SQ_STRING },
    { kind: 'keyword', re: PY_KEYWORDS },
    { kind: 'func', re: IDENT_CALL },
    { kind: 'number', re: NUMBER },
    { kind: 'punct', re: PUNCT },
  ],
  xml: [
    { kind: 'comment', re: /<!--[\s\S]*?-->/ },
    { kind: 'keyword', re: /<\/?[A-Za-z][\w:-]*|\/?>/ },
    { kind: 'prop', re: /\b[A-Za-z_][\w:-]*(?==)/ },
    { kind: 'string', re: DQ_STRING },
    { kind: 'string', re: SQ_STRING },
  ],
  ini: [
    { kind: 'comment', re: /[#;].*/ },
    { kind: 'meta', re: /^\[.*\]$/m },
    { kind: 'prop', re: /^[ \t]*[\w.-]+(?=\s*=)/m },
    { kind: 'string', re: DQ_STRING },
    { kind: 'number', re: NUMBER },
  ],
};

// Aliases keep the fence label the author typed while reusing one rule set.
const ALIASES: Record<string, string> = {
  js: 'javascript', jsx: 'javascript', ts: 'javascript', tsx: 'javascript',
  typescript: 'javascript', mjs: 'javascript', cjs: 'javascript',
  golang: 'go',
  sh: 'shell', bash: 'shell', zsh: 'shell', console: 'shell', shellsession: 'shell', dotenv: 'shell',
  yml: 'yaml',
  html: 'xml', svg: 'xml', vue: 'xml',
  py: 'python',
  postgres: 'sql', postgresql: 'sql', mysql: 'sql',
  toml: 'ini', conf: 'ini', properties: 'ini',
  jsonc: 'json', json5: 'json',
};

/** The languages that get real tokens; anything else renders escaped. */
export function isHighlightable(lang: string): boolean {
  const key = ALIASES[lang.toLowerCase()] ?? lang.toLowerCase();
  return key === 'diff' || key in RULES;
}

function span(kind: TokenKind, text: string): string {
  return `<span class="tok-${kind}">${escapeHtml(text)}</span>`;
}

function tokenize(code: string, rules: Rule[]): string {
  // Sticky copies so a rule can only match at the cursor, never ahead of it.
  const compiled = rules.map((rule) => ({
    kind: rule.kind,
    re: new RegExp(rule.re.source, rule.re.flags.replace(/[gy]/g, '') + 'y'),
  }));

  let out = '';
  let i = 0;
  let plain = '';

  while (i < code.length) {
    let matched = false;
    for (const rule of compiled) {
      rule.re.lastIndex = i;
      const m = rule.re.exec(code);
      if (m && m[0].length > 0) {
        if (plain) {
          out += escapeHtml(plain);
          plain = '';
        }
        out += span(rule.kind, m[0]);
        i += m[0].length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      plain += code[i];
      i += 1;
    }
  }
  if (plain) out += escapeHtml(plain);
  return out;
}

/** Diffs are line-oriented, so they bypass the token scanner entirely. */
function highlightDiff(code: string): string {
  return code
    .split('\n')
    .map((line) => {
      if (/^\+/.test(line) && !/^\+\+\+/.test(line)) return span('ins', line);
      if (/^-/.test(line) && !/^---/.test(line)) return span('del', line);
      if (/^@@/.test(line)) return span('meta', line);
      if (/^(?:diff|index|---|\+\+\+)/.test(line)) return span('comment', line);
      return escapeHtml(line);
    })
    .join('\n');
}

/**
 * Highlight `code` as `lang`, returning HTML with the source escaped. Unknown
 * languages come back escaped but unstyled rather than throwing, so a fence
 * label nobody implemented never breaks a page.
 */
export function highlight(code: string, lang?: string): string {
  const key = (lang || '').toLowerCase().trim();
  if (!key) return escapeHtml(code);
  if (key === 'diff' || key === 'patch') return highlightDiff(code);

  const rules = RULES[ALIASES[key] ?? key];
  if (!rules) return escapeHtml(code);

  try {
    return tokenize(code, rules);
  } catch {
    // A pathological snippet must still render, just without colour.
    return escapeHtml(code);
  }
}
