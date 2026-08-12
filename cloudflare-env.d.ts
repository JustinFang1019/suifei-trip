// Binding augmentation for the Vite-plugin configuration in vite.config.ts.
// Keep this synchronized with .openai/hosting.json.
declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
  }
}
