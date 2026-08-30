#!/usr/bin/env node
/**
 * Pulls all landing content from the Strapi CMS into a local snapshot:
 *   - content/snapshot.json      (all text/structure)
 *   - public/uploads/*           (any media referenced by the content)
 *
 * The Next.js build renders purely from the snapshot, so the static export is
 * deterministic and self-contained.
 *
 *   npm run sync                 # best effort: keep the last good content on failure
 *   npm run sync -- --strict     # fail the command if any endpoint is bad (CI)
 *   npm run sync -- --fallback   # also refresh the committed content/fallback.json
 *
 * Every endpoint comes from scripts/cms-map.mjs, the shared Strapi contract.
 * A snapshot is only written once *all* endpoints validate — a partial pull is
 * never allowed to overwrite working content, because an unpublished single
 * type answers `200 {"data": null}` and would otherwise ship as a blank page.
 *
 * Env: STRAPI_URL (default http://localhost:1337), STRAPI_TOKEN (optional).
 */
import fs from 'node:fs';
import path from 'node:path';
import { ENDPOINTS, GLOBAL, PAGE_SIZE } from './cms-map.mjs';

const STRAPI_URL = (process.env.STRAPI_URL || 'http://localhost:1337').replace(/\/$/, '');
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || '';
const ROOT = path.join(import.meta.dirname, '..');
const STRICT = process.argv.includes('--strict');
const WRITE_FALLBACK = process.argv.includes('--fallback');

// --- minimal qs stringifier for Strapi's nested populate syntax ---------------
function flatten(obj, prefix = '', out = {}) {
  for (const [key, value] of Object.entries(obj)) {
    const k = prefix ? `${prefix}[${key}]` : key;
    if (Array.isArray(value)) value.forEach((v, i) => flatten({ [i]: v }, k, out));
    else if (value && typeof value === 'object') flatten(value, k, out);
    else out[k] = String(value);
  }
  return out;
}
const qs = (params) => new URLSearchParams(flatten(params)).toString();

async function fetchJson(pathname, params) {
  const url = `${STRAPI_URL}${pathname}${params ? `?${qs(params)}` : ''}`;
  const headers = { Accept: 'application/json' };
  if (STRAPI_TOKEN) headers.Authorization = `Bearer ${STRAPI_TOKEN}`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const hint =
      res.status === 403
        ? ' — the public role is missing read access, or STRAPI_TOKEN is unset'
        : res.status === 404
          ? ' — content type not found; is the CMS on the expected schema version?'
          : '';
    throw new Error(`${res.status} ${res.statusText}${hint}`);
  }
  return (await res.json()).data;
}

/** Drops Strapi bookkeeping fields and empty values, matching lib/cms-types.ts. */
function strip(entity) {
  if (Array.isArray(entity)) return entity.map(strip);
  if (entity && typeof entity === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(entity)) {
      if (['id', 'documentId', 'createdAt', 'updatedAt', 'publishedAt', 'locale'].includes(k)) continue;
      // Unset Strapi fields come back as null; the generated types model them
      // as optional, so omit them rather than carrying nulls into the snapshot.
      if (v === null) continue;
      out[k] = strip(v);
    }
    return out;
  }
  return entity;
}

async function downloadMedia(media, fallback) {
  if (!media?.url) return fallback;
  const url = media.url.startsWith('http') ? media.url : `${STRAPI_URL}${media.url}`;
  const dest = path.join(ROOT, 'public', 'uploads', path.basename(media.url));
  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`  ⚠ media ${media.url} → ${res.status}, using ${fallback}`);
    return fallback;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  return `/uploads/${path.basename(media.url)}`;
}

/** Params for one endpoint, from its manifest entry. */
function paramsFor(endpoint) {
  const params = {};
  if (endpoint.populate) params.populate = endpoint.populate;
  if (endpoint.sort) params.sort = endpoint.sort;
  if (endpoint.kind === 'collection') params.pagination = { pageSize: PAGE_SIZE };
  return Object.keys(params).length ? params : undefined;
}

/**
 * Rejects the shapes that render as an empty page rather than an error:
 * a null single type (unpublished in Strapi), a non-array collection, and an
 * empty collection the site depends on.
 */
function validate(endpoint, data) {
  if (endpoint.kind === 'single') {
    if (data === null || data === undefined) {
      return `returned no data — the "${endpoint.uid}" single type is not published`;
    }
    if (typeof data !== 'object' || Array.isArray(data)) return 'returned a non-object';
    if (Object.keys(data).length === 0) return 'returned an empty object';
  } else {
    if (!Array.isArray(data)) return 'returned a non-array';
    if (endpoint.required && data.length === 0) {
      return `returned 0 entries — nothing is published in "${endpoint.uid}"`;
    }
  }
  return null;
}

async function main() {
  console.log(`→ Syncing content from ${STRAPI_URL}`);

  const results = [];
  for (const endpoint of ENDPOINTS) {
    try {
      const data = await fetchJson(endpoint.path, paramsFor(endpoint));
      const problem = validate(endpoint, data);
      results.push({ endpoint, data, problem });
      const count = Array.isArray(data) ? ` (${data.length})` : '';
      console.log(
        problem
          ? `  ✖ ${endpoint.key.padEnd(16)} ${endpoint.path} — ${problem}`
          : `  ✔ ${endpoint.key.padEnd(16)} ${endpoint.path}${count}`,
      );
    } catch (err) {
      results.push({ endpoint, data: null, problem: err.message });
      console.log(`  ✖ ${endpoint.key.padEnd(16)} ${endpoint.path} — ${err.message}`);
    }
  }

  const failed = results.filter((r) => r.problem);
  if (failed.length) {
    // Refusing to write is the point: a half-good snapshot silently replaces
    // working content and the failure only surfaces as a blank section later.
    const summary = `${failed.length} of ${results.length} endpoint(s) failed: ${failed
      .map((f) => f.endpoint.key)
      .join(', ')}`;
    if (STRICT) throw new Error(summary);
    console.warn(`\n⚠ ${summary}`);
    console.warn('  Snapshot NOT written — building with the previous snapshot or');
    console.warn('  the committed content/fallback.json instead.');
    return;
  }

  // Assemble the snapshot in the shape lib/cms-types.ts declares.
  const snapshot = { global: null, landing: null, pages: {}, collections: {} };
  for (const { endpoint, data } of results) {
    const value = strip(data);
    if (endpoint.slot === 'root') snapshot[endpoint.key] = value;
    else snapshot[endpoint.slot][endpoint.key] = value;
  }

  // Media attributes become local paths under public/uploads/.
  const globalRaw = results.find((r) => r.endpoint.key === GLOBAL.key).data;
  for (const [field, spec] of Object.entries(GLOBAL.media ?? {})) {
    snapshot.global[spec.key] = await downloadMedia(globalRaw[field], spec.fallback);
    delete snapshot.global[field];
  }

  const dest = path.join(ROOT, 'content', 'snapshot.json');
  const body = JSON.stringify(snapshot, null, 2) + '\n';
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  // Write via a temp file so an interrupted sync cannot leave truncated JSON.
  fs.writeFileSync(`${dest}.tmp`, body);
  fs.renameSync(`${dest}.tmp`, dest);
  console.log(`\n✔ Wrote content/snapshot.json (${results.length} endpoints)`);

  const sections = snapshot.landing.sections ?? [];
  console.log(`  landing sections: ${sections.map((s) => s.__component).join(', ')}`);
  if (sections.some((s) => s.__component === 'sections.integration-kit')) {
    console.warn('  ⚠ This CMS still holds sections.integration-kit. It renders fine,');
    console.warn('    but restart the CMS to run the v3 migration to sections.devtools.');
  }

  if (WRITE_FALLBACK) {
    fs.writeFileSync(path.join(ROOT, 'content', 'fallback.json'), body);
    console.log('✔ Refreshed content/fallback.json from this snapshot');
  }
}

main().catch((err) => {
  if (STRICT) {
    console.error(`\n✖ sync failed: ${err.message}`);
    process.exit(1);
  }
  console.warn(`\n⚠ Could not sync from Strapi (${err.message}).`);
  console.warn('  Building with the last snapshot or bundled fallback content instead.');
  process.exit(0);
});
