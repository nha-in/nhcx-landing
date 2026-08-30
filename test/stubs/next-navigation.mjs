// Stand-in for next/navigation in the smoke test: the real module only
// resolves inside the Next runtime. A page that calls notFound() outside a
// route it can serve should fail the test loudly.
export function notFound() {
  throw new Error('notFound() called');
}
