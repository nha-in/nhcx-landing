/* content/*.yaml is parsed at build time (scripts/yaml-loader.cjs); each
   copy module in lib/ gives its part of the file a type. */
declare module '*.yaml' {
  const content: Record<string, unknown>;
  export default content;
}
