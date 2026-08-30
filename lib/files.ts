import fs from 'node:fs';
import path from 'node:path';

/**
 * The downloads section — any file the programme wants to hand out: a PDF
 * circular, a spreadsheet template, a sample bundle, an archive.
 *
 * What is listed, in what order, with what title and description, is
 * `content/downloads.json` (see content/downloads.example.json for the shape):
 *
 *     {
 *       "groups": [
 *         {
 *           "title": "Templates",
 *           "description": "Optional line under the group heading.",
 *           "items": [
 *             { "title": "Claim form", "description": "…", "file": "templates/claim-form.xlsx" },
 *             { "title": "NHCX specification", "description": "…", "url": "https://…/spec.pdf", "type": "PDF", "size": "2.1 MB" }
 *           ]
 *         }
 *       ]
 *     }
 *
 * An item is either a `file` — a path under `public/files/`, which `next build`
 * emits verbatim; its type, size and date are read from the file — or a `url`
 * to something hosted elsewhere, where `type` and `size` are whatever the
 * editor writes. A `file` that does not exist fails the build: a dead download
 * link is worse than a build error. Everything is read at build time.
 */

export interface DownloadItem {
  title: string;
  description?: string;
  /** Public URL, e.g. `/files/templates/claim-form.xlsx` (before the base path) or an external address. */
  url: string;
  /** True for a `url` item; false for a file served from public/files. */
  external: boolean;
  /** File extension without the dot, lower-case; '' when unknown. */
  ext: string;
  /** What a reader recognises the type by: "PDF", "Excel spreadsheet"… */
  kind: string;
  /** Human-readable size, e.g. `1.4 MB`; '' when unknown. */
  size: string;
  /** Last modified, ISO 8601; undefined for external items. */
  modified?: string;
  /** That date as `23 Aug 2026`. */
  modifiedLabel?: string;
}

export interface DownloadGroup {
  key: string;
  title: string;
  description?: string;
  items: DownloadItem[];
}

interface RawItem {
  title?: string;
  description?: string;
  file?: string;
  url?: string;
  type?: string;
  size?: string;
}

interface RawGroup {
  title?: string;
  description?: string;
  items?: RawItem[];
}

interface RawManifest {
  groups?: RawGroup[];
}

const FILES_DIR = ['public', 'files'];
const MANIFEST = ['content', 'downloads.json'];

const KINDS: Record<string, string> = {
  pdf: 'PDF',
  doc: 'Word document',
  docx: 'Word document',
  odt: 'OpenDocument text',
  xls: 'Excel spreadsheet',
  xlsx: 'Excel spreadsheet',
  ods: 'OpenDocument spreadsheet',
  csv: 'CSV',
  ppt: 'PowerPoint',
  pptx: 'PowerPoint',
  txt: 'Plain text',
  md: 'Markdown',
  json: 'JSON',
  xml: 'XML',
  yaml: 'YAML',
  yml: 'YAML',
  zip: 'ZIP archive',
  gz: 'Archive',
  tgz: 'Archive',
  '7z': 'Archive',
  rar: 'Archive',
  png: 'Image',
  jpg: 'Image',
  jpeg: 'Image',
  svg: 'Image',
  gif: 'Image',
  mp4: 'Video',
  mp3: 'Audio',
  jar: 'Java archive',
  exe: 'Windows executable',
  dmg: 'macOS disk image',
  pem: 'Certificate',
  crt: 'Certificate',
  cer: 'Certificate',
};

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(bytes < 10 * 1024 * 1024 ? 1 : 0)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function dateLabel(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Extension of a file name or of a URL's last path segment; '' for a page like `https://host/#/docs`. */
function extOf(name: string): string {
  let last = name;
  if (/^https?:\/\//i.test(name)) {
    try {
      last = new URL(name).pathname.split('/').pop() ?? '';
    } catch {
      last = '';
    }
  }
  const ext = last.match(/\.([A-Za-z0-9]{1,5})$/)?.[1] ?? '';
  return ext.toLowerCase();
}

function kindOf(ext: string, declared?: string): string {
  if (declared?.trim()) return declared.trim();
  return KINDS[ext] ?? (ext ? ext.toUpperCase() : 'File');
}

/** `Sample bundles` → `sample-bundles`, for the group's anchor. */
function slug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'group';
}

function readManifest(): RawManifest {
  const file = path.join(process.cwd(), ...MANIFEST);
  if (!fs.existsSync(file)) return {};
  const parsed = JSON.parse(fs.readFileSync(file, 'utf8')) as RawManifest;
  return parsed && typeof parsed === 'object' ? parsed : {};
}

function resolveItem(raw: RawItem, where: string): DownloadItem {
  const title = raw.title?.trim();
  if (!title) throw new Error(`content/downloads.json: ${where} has no title`);
  const description = raw.description?.trim() || undefined;

  if (raw.file) {
    const rel = raw.file.replace(/^\/+/, '');
    const abs = path.join(process.cwd(), ...FILES_DIR, rel);
    if (!abs.startsWith(path.join(process.cwd(), ...FILES_DIR) + path.sep) || !fs.existsSync(abs) || !fs.statSync(abs).isFile()) {
      throw new Error(`content/downloads.json: "${title}" points at public/files/${rel}, which does not exist`);
    }
    const stat = fs.statSync(abs);
    const ext = extOf(rel);
    return {
      title,
      description,
      url: `/files/${rel.split('/').map(encodeURIComponent).join('/')}`,
      external: false,
      ext,
      kind: kindOf(ext, raw.type),
      size: raw.size?.trim() || formatBytes(stat.size),
      modified: stat.mtime.toISOString(),
      modifiedLabel: dateLabel(stat.mtime),
    };
  }

  if (raw.url) {
    const ext = extOf(raw.url);
    return {
      title,
      description,
      url: raw.url.trim(),
      external: true,
      ext,
      kind: kindOf(ext, raw.type),
      size: raw.size?.trim() ?? '',
    };
  }

  throw new Error(`content/downloads.json: "${title}" has neither a "file" nor a "url"`);
}

/** The groups and items of content/downloads.json, in authored order. */
export function getDownloadGroups(): DownloadGroup[] {
  const manifest = readManifest();
  const groups: DownloadGroup[] = [];
  const seen = new Set<string>();
  (manifest.groups ?? []).forEach((group, gi) => {
    const title = group.title?.trim() || 'Documents';
    let key = slug(title);
    while (seen.has(key)) key = `${key}-${gi}`;
    seen.add(key);
    const items = (group.items ?? []).map((item, ii) => resolveItem(item, `groups[${gi}].items[${ii}]`));
    if (items.length) groups.push({ key, title, description: group.description?.trim() || undefined, items });
  });
  return groups;
}
