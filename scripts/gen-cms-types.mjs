#!/usr/bin/env node
/**
 * Generates `lib/cms-types.ts` from the Strapi schema JSON in `../cms`.
 *
 * The schemas are version-controlled, so the frontend's view of the content
 * model is derived from them rather than hand-maintained: rename a field in
 * Strapi, re-run this, and `tsc` points at every render site that broke.
 *
 *   node scripts/gen-cms-types.mjs           # write lib/cms-types.ts
 *   node scripts/gen-cms-types.mjs --check   # fail if the file is stale (CI)
 *
 * `CMS_DIR` overrides the CMS location (default: ../cms).
 */
import fs from 'node:fs';
import path from 'node:path';
import { GLOBAL, LANDING, PAGES, COLLECTIONS, SECTION_POPULATE } from './cms-map.mjs';

const ROOT = path.join(import.meta.dirname, '..');
const CMS = process.env.CMS_DIR ?? path.join(ROOT, '..', 'cms');
const OUT = path.join(ROOT, 'lib', 'cms-types.ts');
const CHECK = process.argv.includes('--check');

// --- read the schemas --------------------------------------------------------

/** uid ("elements.link") → schema */
function readComponents() {
  const dir = path.join(CMS, 'src', 'components');
  const out = new Map();
  if (!fs.existsSync(dir)) return out;
  for (const category of fs.readdirSync(dir)) {
    const catDir = path.join(dir, category);
    if (!fs.statSync(catDir).isDirectory()) continue;
    for (const file of fs.readdirSync(catDir)) {
      if (!file.endsWith('.json')) continue;
      const uid = `${category}.${file.replace(/\.json$/, '')}`;
      out.set(uid, JSON.parse(fs.readFileSync(path.join(catDir, file), 'utf8')));
    }
  }
  return out;
}

/** uid ("landing-page") → schema */
function readContentTypes() {
  const dir = path.join(CMS, 'src', 'api');
  const out = new Map();
  if (!fs.existsSync(dir)) return out;
  for (const api of fs.readdirSync(dir)) {
    const ctDir = path.join(dir, api, 'content-types');
    if (!fs.existsSync(ctDir)) continue;
    for (const ct of fs.readdirSync(ctDir)) {
      const file = path.join(ctDir, ct, 'schema.json');
      if (!fs.existsSync(file)) continue;
      const schema = JSON.parse(fs.readFileSync(file, 'utf8'));
      out.set(schema.info?.singularName ?? ct, schema);
    }
  }
  return out;
}

const components = readComponents();
const contentTypes = readContentTypes();

if (components.size === 0 || contentTypes.size === 0) {
  if (CHECK && fs.existsSync(OUT)) {
    // The build must not depend on the CMS project being checked out next to
    // this one: the committed lib/cms-types.ts is the contract, and drift is
    // caught wherever the schemas are available (the CMS repo's own CI).
    console.log(`– No Strapi schemas under ${path.relative(ROOT, CMS)}; skipping the lib/cms-types.ts drift check`);
    process.exit(0);
  }
  console.error(`✖ No Strapi schemas found under ${CMS}.`);
  console.error('  Set CMS_DIR, or restore the CMS with: git checkout -- cms');
  process.exit(1);
}

// --- naming ------------------------------------------------------------------

const pascal = (s) => s.replace(/(^|[-_.])(\w)/g, (_, __, c) => c.toUpperCase());
const componentName = (uid) => pascal(uid.replace('.', '-'));
const typeName = (uid) => pascal(uid);

// --- Strapi attribute → TypeScript ------------------------------------------

const SCALARS = {
  string: 'string', text: 'string', richtext: 'string', email: 'string',
  password: 'string', uid: 'string', date: 'string', datetime: 'string',
  time: 'string', timestamp: 'string',
  integer: 'number', biginteger: 'number', float: 'number', decimal: 'number',
  boolean: 'boolean',
  json: 'unknown',
};

function tsType(attr, ctx) {
  if (attr.type === 'enumeration') {
    return attr.enum.map((v) => JSON.stringify(v)).join(' | ');
  }
  if (attr.type === 'component') {
    const name = componentName(attr.component);
    if (!components.has(attr.component)) {
      throw new Error(`${ctx}: references unknown component "${attr.component}"`);
    }
    return attr.repeatable ? `${name}[]` : name;
  }
  if (attr.type === 'dynamiczone') {
    return `(${attr.components.map(componentName).join(' | ')})[]`;
  }
  if (attr.type === 'media') return null; // handled by the sync
  if (attr.type === 'relation') {
    // A populated relation arrives as the target entity (or a list of them);
    // an unpopulated one is absent, so the field is always optional.
    const target = String(attr.target ?? '').replace(/^api::/, '').split('.')[0];
    if (!target || !contentTypes.has(target)) return null;
    const many = /Many$/.test(String(attr.relation ?? ''));
    return many ? `${typeName(target)}[]` : typeName(target);
  }
  const scalar = SCALARS[attr.type];
  if (!scalar) throw new Error(`${ctx}: unsupported Strapi type "${attr.type}"`);
  return scalar;
}

/**
 * `strip()` in sync-content.mjs drops Strapi bookkeeping fields and null values,
 * so anything not `required` is genuinely absent from the snapshot — modelled as
 * an optional property rather than `| null`.
 */
function emitInterface(name, schema, { discriminator, extra = {}, doc } = {}) {
  const lines = [];
  if (doc) lines.push(`/** ${doc} */`);
  lines.push(`export interface ${name} {`);
  if (discriminator) lines.push(`  __component: ${JSON.stringify(discriminator)};`);
  for (const [field, attr] of Object.entries(schema.attributes ?? {})) {
    const ts = tsType(attr, `${name}.${field}`);
    if (ts === null) continue; // media/relation: replaced by the sync
    const optional = attr.required && attr.type !== 'relation' ? '' : '?';
    const repeatable = attr.type === 'component' && attr.repeatable;
    // Repeatable components always come back as an array, empty at worst.
    lines.push(`  ${field}${repeatable ? '' : optional}: ${ts};`);
  }
  for (const [field, ts] of Object.entries(extra)) lines.push(`  ${field}: ${ts};`);
  lines.push('}');
  return lines.join('\n');
}

// --- assemble ----------------------------------------------------------------

const blocks = [];

blocks.push(`// AUTO-GENERATED by scripts/gen-cms-types.mjs — do not edit by hand.
// Source: Strapi schemas in ../cms/src/{components,api}.
// Regenerate with \`npm run gen:types\`; \`npm run check:types\` fails on drift.
/* eslint-disable */
`);

// Components, dependency order is irrelevant for interfaces.
blocks.push('// ─── Components ──────────────────────────────────────────────────────────────');
for (const uid of [...components.keys()].sort()) {
  const schema = components.get(uid);
  const isSection = uid.startsWith('sections.');
  blocks.push(
    emitInterface(componentName(uid), schema, {
      discriminator: isSection ? uid : undefined,
      doc: schema.info?.description,
    }),
  );
}

// Content types.
blocks.push('// ─── Content types ───────────────────────────────────────────────────────────');
const mediaExtras = {};
for (const spec of Object.values(GLOBAL.media ?? {})) mediaExtras[spec.key] = 'string';

for (const uid of [...contentTypes.keys()].sort()) {
  const schema = contentTypes.get(uid);
  const extra = uid === GLOBAL.uid ? mediaExtras : {};
  blocks.push(emitInterface(typeName(uid), schema, { extra, doc: schema.info?.description }));
}

// The dynamic zone as a discriminated union, plus a UID literal type.
const sectionUids = contentTypes.get(LANDING.uid)?.attributes?.sections?.components ?? [];
blocks.push(`// ─── Landing sections ────────────────────────────────────────────────────────

/** Every component the landing dynamic zone accepts, as a discriminated union. */
export type Section = ${sectionUids.map(componentName).join(' | ')};

/** The \`__component\` UID of any landing section. */
export type SectionUid = Section['__component'];`);

// The snapshot shape, derived from the manifest.
const pageEntries = PAGES.map((p) => `    ${p.key}: ${typeName(p.uid)};`).join('\n');
const collectionEntries = COLLECTIONS.map((c) => `    ${c.key}: ${typeName(c.uid)}[];`).join('\n');

blocks.push(`// ─── Snapshot ────────────────────────────────────────────────────────────────

/**
 * The shape of \`content/snapshot.json\` (and its committed baseline,
 * \`content/fallback.json\`), assembled by \`scripts/sync-content.mjs\`.
 */
export interface SiteContent {
  global: ${typeName(GLOBAL.uid)};
  landing: ${typeName(LANDING.uid)};
  pages: {
${pageEntries}
  };
  collections: {
${collectionEntries}
  };
}`);

// A runtime list the sync script and the validator both check against.
blocks.push(`/** Keys the snapshot must contain, mirrored from scripts/cms-map.mjs. */
export const PAGE_KEYS = [${PAGES.map((p) => JSON.stringify(p.key)).join(', ')}] as const;
export const COLLECTION_KEYS = [${COLLECTIONS.map((c) => JSON.stringify(c.key)).join(', ')}] as const;
export const SECTION_UIDS = [${sectionUids.map((u) => JSON.stringify(u)).join(', ')}] as const;`);

const output = blocks.join('\n\n') + '\n';

// Populate-coverage check: a component in the dynamic zone with component-typed
// fields but no populate entry syncs as an empty section on the live site.
const missingPopulate = sectionUids.filter((uid) => {
  const schema = components.get(uid);
  const needs = Object.values(schema?.attributes ?? {}).some((a) => a.type === 'component');
  return needs && !SECTION_POPULATE[uid];
});
if (missingPopulate.length) {
  console.error(`✖ Sections missing a populate entry in scripts/cms-map.mjs: ${missingPopulate.join(', ')}`);
  console.error('  Without it Strapi returns the section with all nested fields empty.');
  process.exit(1);
}

if (CHECK) {
  const current = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  if (current !== output) {
    console.error('✖ lib/cms-types.ts is out of date with the Strapi schemas.');
    console.error('  Run `npm run gen:types` and commit the result.');
    process.exit(1);
  }
  console.log('✔ lib/cms-types.ts matches the Strapi schemas');
} else {
  fs.writeFileSync(OUT, output);
  console.log(
    `✔ Generated lib/cms-types.ts — ${components.size} components, ${contentTypes.size} content types`,
  );
}
