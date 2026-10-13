import test from 'node:test';
import assert from 'node:assert/strict';
import { connect } from './client.mjs';
import { sha } from './core.mjs';

function fixture() {
  const files = new Map([['.htaccess', Buffer.from('original')]]), mutations = [];
  const config = { username: 'user', domain: 'example.test', fileOrigin: 'https://files.example.test' };
  const session = { url: config.fileOrigin + '/rest/abcdef/api/tus/public_html', auth_key: 'not-a-real-secret', rest_auth_key: 'test' };
  const fetcher = async (input, options = {}) => {
    const url = new URL(input), method = options.method || 'GET';
    if (url.hostname === 'developers.hostinger.com') return Response.json(session);
    const match = url.pathname.match(/\/api\/(resources|raw|tus)\/public_html\/(.+)$/), kind = match[1], path = match[2];
    if (method !== 'GET') mutations.push({ path, method });
    if (method === 'POST') { files.set(path, Buffer.alloc(0)); return new Response(null, { status: 201 }); }
    if (method === 'PATCH' && kind === 'tus') { files.set(path, Buffer.concat([files.get(path), options.body])); return new Response(null, { status: 204, headers: { 'upload-offset': String(files.get(path).length) } }); }
    if (method === 'PATCH') { files.set('.htaccess', files.get(path)); files.delete(path); return new Response(null, { status: 200 }); }
    if (!files.has(path)) return new Response(null, { status: 404 });
    if (kind === 'raw') return new Response(files.get(path));
    return Response.json({ path: '/public_html/' + path, isSymlink: false, isDir: false, size: files.get(path).length });
  };
  return { files, mutations, config, fetcher, session };
}
test('route replacement verifies expected hash before any mutation and candidate before rename', async () => {
  const f = fixture(), client = await connect(f.config, 'test-token', f.fetcher);
  await assert.rejects(client.replace('.htaccess', Buffer.from('new'), sha('wrong'), 'test'));
  assert.equal(f.mutations.length, 0);
  await client.replace('.htaccess', Buffer.from('new'), sha('original'), 'test');
  assert.equal(f.files.get('.htaccess').toString(), 'new');
  assert.deepEqual(f.mutations.map(m => m.method), ['POST', 'PATCH', 'PATCH']);
});
test('external route edits during upload are preserved', async () => {
  const f = fixture();
  const client = await connect(f.config, 'test-token', async (url, options) => {
    const response = await f.fetcher(url, options);
    if (options?.method === 'PATCH' && String(url).includes('/tus/')) f.files.set('.htaccess', Buffer.from('someone else'));
    return response;
  });
  await assert.rejects(client.replace('.htaccess', Buffer.from('new'), sha('original'), 'test'));
  assert.equal(f.files.get('.htaccess').toString(), 'someone else');
  assert.equal(f.mutations.length, 2);
});
test('reads retry a lost connection a bounded number of times; a lost delete is reconciled, never resent', async () => {
  const lost = () => Object.assign(new TypeError('fetch failed'), { cause: { code: 'ECONNRESET' } });
  const f = fixture(); let drops = 1;
  const client = await connect(f.config, 'test-token', async (url, options = {}) => {
    if (String(url).includes('/raw/') && drops-- > 0) throw lost();
    return f.fetcher(url, options);
  }, { retryDelayMs: 0 });
  assert.equal((await client.read('.htaccess')).toString(), 'original');
  let attempts = 0, serverErrors = 0;
  const broken = await connect(f.config, 'test-token', async (url, options = {}) => {
    if (String(url).includes('/raw/')) { attempts++; throw lost(); }
    return f.fetcher(url, options);
  }, { retryDelayMs: 0 });
  await assert.rejects(broken.read('.htaccess'), /fetch failed/); assert.equal(attempts, 3);
  const failing = await connect(f.config, 'test-token', async (url, options = {}) => {
    if (String(url).includes('/raw/')) { serverErrors++; return new Response(null, { status: 500 }); }
    return f.fetcher(url, options);
  }, { retryDelayMs: 0 });
  await assert.rejects(failing.read('.htaccess'), /read HTTP 500/); assert.equal(serverErrors, 1);
  for (const ranOnServer of [true, false]) {
    const g = fixture(); g.files.set('synaiq-release-a', Buffer.alloc(0)); let deletes = 0;
    const c = await connect(g.config, 'test-token', async (url, options = {}) => {
      if (options.method === 'DELETE') { deletes++; if (ranOnServer) g.files.delete('synaiq-release-a'); throw lost(); }
      return g.fetcher(url, options);
    }, { retryDelayMs: 0 });
    if (ranOnServer) await c.removeRelease('synaiq-release-a');
    else await assert.rejects(c.removeRelease('synaiq-release-a'), /fetch failed/);
    assert.equal(deletes, 1);
  }
});
test('session redirects, unsafe upload paths and broad deletion targets are rejected', async () => {
  const f = fixture(); f.session.url = 'https://untrusted.example/rest/abcdef/api/tus/public_html';
  await assert.rejects(connect(f.config, 'test-token', f.fetcher));
  const g = fixture(), client = await connect(g.config, 'test-token', g.fetcher);
  await assert.rejects(client.upload('.htaccess', Buffer.from('bad')));
  for (const name of ['public_html', '../synaiq-release-a', 'wp-content', 'synaiq-release-a/..']) await assert.rejects(client.removeRelease(name));
  assert.equal(g.mutations.length, 0);
});
