/* content/site.yaml is parsed at build time (scripts/yaml-loader.cjs).
   Import one section of it as `@/content/site.yaml?<section>`; each copy
   module in lib/ gives its section a type. */
declare module '@/content/site.yaml?*' {
  const section: unknown;
  export default section;
}
