/**
 * Webpack loader for content/*.yaml: parses the YAML at build time and hands
 * the bundle a plain object, so server and client components read the same
 * content with no parser in the browser. Wired up in next.config.mjs.
 */
const yaml = require('js-yaml');

module.exports = function yamlLoader(source) {
  this.cacheable?.();
  const data = yaml.load(source, { filename: this.resourcePath });
  return `export default ${JSON.stringify(data)};`;
};
