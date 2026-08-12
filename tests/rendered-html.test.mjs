import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  }, { waitUntil() {}, passThroughOnException() {} });
}

test("server-renders the direct personal search and group-planning entry paths", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<html[^>]*lang="zh-Hant"/i);
  assert.match(html, /我想出去/);
  assert.match(html, /我們想出去/);
  assert.match(html, /直接開始搜尋/);
  assert.match(html, /不用登入/);
  assert.match(html, /票價與購買由外部航班平台提供/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/);
});
