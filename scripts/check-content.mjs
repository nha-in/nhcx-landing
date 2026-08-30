#!/usr/bin/env node
/**
 * Validates content/*.json against the Strapi contract in scripts/cms-map.mjs
 * and the schemas in ../cms. Catches the drift the type system cannot see,
 * because the snapshot is JSON read at runtime:
 *
 *   - a page or collection key the frontend expects but the snapshot lacks
 *   - a landing section whose `__component` no longer exists in the CMS
 *   - a required schema field missing from the content
 *
 *   node scripts/check-content.mjs [file...]   # defaults to fallback + snapshot
 */
import fs from 'node:fs';
import path from 'node:path';
import { GLOBAL, PAGES, COLLECTIONS } from './cms-map.mjs';

const ROOT = path.join(import.meta.dirname, '..');
const CMS = process.env.CMS_DIR ?? path.join(ROOT, '..', 'cms');

function schemaFor(uid) {
  const dir = path.join(CMS, 'src', 'api');
  if (!fs.existsSync(dir)) return null;
  for (const api of fs.readdirSync(dir)) {
    const file = path.join(dir, api, 'content-types', api, 'schema.json');
    if (!fs.existsSync(file)) continue;
    const schema = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (schema.info?.singularName === uid) return schema;
  }
  return null;
}

function componentUids() {
  const dir = path.join(CMS, 'src', 'components');
  const out = new Set();
  if (!fs.existsSync(dir)) return out;
  for (const cat of fs.readdirSync(dir)) {
    const catDir = path.join(dir, cat);
    if (!fs.statSync(catDir).isDirectory()) continue;
    for (const f of fs.readdirSync(catDir)) {
      if (f.endsWith('.json')) out.add(`${cat}.${f.replace(/\.json$/, '')}`);
    }
  }
  return out;
}

const KNOWN_SECTIONS = componentUids();

/** Fields the schema marks required but the content omits. */
function missingRequired(uid, entity, label) {
  const schema = schemaFor(uid);
  if (!schema || !entity) return [];
  const media = Object.keys(GLOBAL.media ?? {});
  return Object.entries(schema.attributes)
    .filter(([field, attr]) => {
      if (!attr.required) return false;
      if (uid === GLOBAL.uid && media.includes(field)) return false; // becomes logoUrl
      return entity[field] === undefined;
    })
    .map(([field]) => `${label}.${field} is required by the "${uid}" schema but absent`);
}

function checkFile(file) {
  const name = path.relative(ROOT, file);
  const content = JSON.parse(fs.readFileSync(file, 'utf8'));
  const errors = [];

  if (!content.global) errors.push('global is missing');
  else errors.push(...missingRequired(GLOBAL.uid, content.global, 'global'));
  if (content.global && typeof content.global.logoUrl !== 'string') {
    errors.push('global.logoUrl is missing — the sync did not resolve the logo media');
  }

  const sections = content.landing?.sections;
  if (!Array.isArray(sections) || sections.length === 0) {
    errors.push('landing.sections is missing or empty');
  } else {
    for (const [i, section] of sections.entries()) {
      if (!KNOWN_SECTIONS.has(section.__component)) {
        errors.push(`landing.sections[${i}] uses "${section.__component}", which no CMS component defines`);
      }
    }
  }

  for (const page of PAGES) {
    const value = content.pages?.[page.key];
    if (!value || typeof value !== 'object') errors.push(`pages.${page.key} is missing`);
    else errors.push(...missingRequired(page.uid, value, `pages.${page.key}`));
  }

  for (const collection of COLLECTIONS) {
    const value = content.collections?.[collection.key];
    if (!Array.isArray(value)) errors.push(`collections.${collection.key} is missing or not an array`);
    else if (collection.required && value.length === 0) {
      errors.push(`collections.${collection.key} is empty`);
    }
  }

  if (errors.length) {
    console.error(`✖ ${name}`);
    for (const e of errors) console.error(`    ${e}`);
    return false;
  }
  const count = sections.length;
  console.log(`✔ ${name} — ${count} sections, ${PAGES.length} pages, ${COLLECTIONS.length} collections`);
  return true;
}

const args = process.argv.slice(2);
const files = (args.length ? args : ['content/fallback.json', 'content/snapshot.json'])
  .map((f) => path.resolve(ROOT, f))
  .filter((f) => fs.existsSync(f));

if (files.length === 0) {
  console.error('✖ No content files to check.');
  process.exit(1);
}
process.exit(files.map(checkFile).every(Boolean) ? 0 : 1);
