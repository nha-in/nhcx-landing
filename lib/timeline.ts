/**
 * Timeouts that are cancelled together: the scheduler behind the site's
 * scripted demos (the AI Skill terminal, the PM-JAY claim window). `at`
 * queues a step, `clear` drops every step still waiting.
 */
export function timeline() {
  let ids: number[] = [];
  return {
    at(ms: number, fn: () => void) {
      ids.push(window.setTimeout(fn, ms));
    },
    clear() {
      ids.forEach((id) => window.clearTimeout(id));
      ids = [];
    },
  };
}
