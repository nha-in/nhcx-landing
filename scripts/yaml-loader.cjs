/**
 * Webpack loader for content/site.yaml: parses the YAML at build time and
 * hands the bundle a plain object, so server and client components read the
 * same words with no parser in the browser. Wired up in next.config.mjs.
 *
 * `site.yaml?pmjay` imports one top-level section, so a page's client code
 * carries its own words and no other page's. A missing section fails the
 * build rather than rendering blanks.
 */
// Webpack loads a loader with require(), so this file is CommonJS.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const yaml = require('js-yaml');

module.exports = function yamlLoader(source) {
  this.cacheable?.();
  const data = yaml.load(source, { filename: this.resourcePath });
  const section = this.resourceQuery ? this.resourceQuery.slice(1) : '';
  if (!section) return `export default ${JSON.stringify(data)};`;
  if (!data || !(section in data)) throw new Error(`${this.resourcePath} has no "${section}" section`);
  return `export default ${JSON.stringify(data[section])};`;
};
